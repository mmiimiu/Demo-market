/**
 * POST /api/auth/register
 * User registration endpoint
 *
 * Security layers:
 *  1. Per-IP cooldown         — 15s between attempts (was 10s)
 *  2. Hourly attempt cap      — max 5 registration attempts per IP per hour
 *  3. Bot-mitigation delay    — 1.5s artificial processing delay (unchanged)
 *  4. Email duplicate guard   — reject already-registered e-mails
 *  5. Double-submit guard     — per-IP in-flight lock
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth/core';
import type { RegisterRequest } from '@/lib/types/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RateLimitEntry {
  lastAttempt: number;
  attempts: number[];     // timestamps of each attempt in the past hour
  inFlight: boolean;      // double-submit guard
}

// ─── In-memory stores ─────────────────────────────────────────────────────────
// Note: These are per-process. In production use Redis or similar.

/** Per-IP rate-limit data */
const rateLimitMap = new Map<string, RateLimitEntry>();

/** Simple email registry to detect duplicate registrations (mock layer) */
const registeredEmails = new Set<string>();

// ─── Constants ───────────────────────────────────────────────────────────────

const COOLDOWN_MS = 15_000;       // 15-second cooldown between attempts
const HOURLY_LIMIT = 5;           // max attempts per IP per hour
const HOUR_MS = 60 * 60 * 1000;  // 1 hour in ms
const BOT_DELAY_MS = 1_500;       // artificial processing delay

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEntry(ip: string): RateLimitEntry {
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { lastAttempt: 0, attempts: [], inFlight: false });
  }
  return rateLimitMap.get(ip)!;
}

function pruneOldAttempts(entry: RateLimitEntry, now: number): void {
  entry.attempts = entry.attempts.filter(t => now - t < HOUR_MS);
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  const now = Date.now();
  const entry = getEntry(ip);

  // ── Guard 1: Double-submit lock ──────────────────────────────────────────
  if (entry.inFlight) {
    return NextResponse.json(
      { error: 'คำขอกำลังดำเนินการอยู่ กรุณารอสักครู่ (Request already in progress)' },
      { status: 429 }
    );
  }

  // ── Guard 2: Per-IP cooldown (15s) ───────────────────────────────────────
  if (now - entry.lastAttempt < COOLDOWN_MS) {
    const waitSec = Math.ceil((COOLDOWN_MS - (now - entry.lastAttempt)) / 1000);
    return NextResponse.json(
      {
        error: `สมัครสมาชิกถี่เกินไป กรุณารอ ${waitSec} วินาที (Too many attempts. Wait ${waitSec}s)`,
        retryAfter: waitSec,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(waitSec) },
      }
    );
  }

  // ── Guard 3: Hourly attempt cap (5 per hour) ─────────────────────────────
  pruneOldAttempts(entry, now);
  if (entry.attempts.length >= HOURLY_LIMIT) {
    const oldestInWindow = entry.attempts[0];
    const resetInSec = Math.ceil((HOUR_MS - (now - oldestInWindow)) / 1000);
    return NextResponse.json(
      {
        error: `เกินขีดจำกัดการสมัครต่อชั่วโมง กรุณาลองใหม่ใน ${Math.ceil(resetInSec / 60)} นาที (Hourly limit reached)`,
        retryAfter: resetInSec,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(resetInSec) },
      }
    );
  }

  // ── Mark in-flight ───────────────────────────────────────────────────────
  entry.inFlight = true;
  entry.lastAttempt = now;
  entry.attempts.push(now);

  try {
    // ── Guard 4: Bot-mitigation delay (1.5s) — unchanged ────────────────
    await new Promise(resolve => setTimeout(resolve, BOT_DELAY_MS));

    const body: RegisterRequest = await request.json();

    // ── Validation: required fields ──────────────────────────────────────
    if (!body.full_name) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!body.email && !body.phone && !body.line_id && !body.google_id) {
      return NextResponse.json(
        { error: 'At least one contact method is required' },
        { status: 400 }
      );
    }

    // ── Guard 5: Duplicate email check ───────────────────────────────────
    if (body.email) {
      const normalizedEmail = body.email.toLowerCase().trim();
      if (registeredEmails.has(normalizedEmail)) {
        return NextResponse.json(
          { error: 'อีเมลนี้ถูกลงทะเบียนแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ (Email already registered. Please log in instead.)' },
          { status: 409 }
        );
      }
    }

    // ── Register user ────────────────────────────────────────────────────
    const authResponse = await registerUser(body);

    // Track email after successful registration
    if (body.email) {
      registeredEmails.add(body.email.toLowerCase().trim());
    }

    return NextResponse.json(authResponse, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  } finally {
    // ── Always release in-flight lock ────────────────────────────────────
    entry.inFlight = false;
  }
}
