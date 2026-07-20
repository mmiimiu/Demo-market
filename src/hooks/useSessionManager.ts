/**
 * useSessionManager
 * Multi-device session management using localStorage.
 * Sessions are stored under key: primerent_sessions
 * 
 * Each session contains:
 *   - id, device, browser, location, lastActive, type, current
 * 
 * Usage:
 *   - Call createSessionOnLogin() after successful login
 *   - Call revokeSession(id) to remove a device
 *   - Call revokeAllOtherSessions() to log out all other devices
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface DeviceSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  type: 'desktop' | 'mobile' | 'tablet';
  current: boolean;
  createdAt: string;
}

const SESSIONS_KEY  = 'primerent_sessions';
const CURRENT_SID   = 'primerent_current_session_id';

// ── Helpers ──────────────────────────────────────────────────────────────────

function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/.test(ua)) return 'tablet';
  if (/iphone|android|mobile/.test(ua)) return 'mobile';
  return 'desktop';
}

function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'Unknown Browser';
  const ua = navigator.userAgent;
  if (ua.includes('Edg'))     return 'Microsoft Edge';
  if (ua.includes('Chrome'))  return 'Chrome Browser';
  if (ua.includes('Firefox')) return 'Firefox Browser';
  if (ua.includes('Safari'))  return 'Safari Browser';
  if (ua.includes('LINE'))    return 'LINE App Webview';
  return 'Unknown Browser';
}

function detectDevice(): string {
  if (typeof navigator === 'undefined') return 'Unknown Device';
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua))                            return 'iPhone';
  if (/iPad/.test(ua))                              return 'iPad';
  if (/Android/.test(ua) && /Mobile/.test(ua))      return 'Android Phone';
  if (/Android/.test(ua))                           return 'Android Tablet';
  if (/Windows/.test(ua))                           return 'Windows PC';
  if (/Mac/.test(ua))                               return 'Mac';
  return 'Unknown Device';
}

function generateId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatLastActive(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)    return 'กำลังใช้งานตอนนี้';
  if (hours < 1)   return `ใช้งานเมื่อ ${mins} นาทีที่แล้ว`;
  if (days < 1)    return `ใช้งานเมื่อ ${hours} ชั่วโมงที่แล้ว`;
  return `ใช้งานเมื่อ ${days} วันที่แล้ว`;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSessionManager() {
  const [sessions, setSessions] = useState<DeviceSession[]>([]);

  const loadSessions = useCallback(() => {
    // For test simulation, every page refresh always restores the default mock sessions (including iPad Pro & Samsung S24)
    const curId = generateId();
    const mockList: DeviceSession[] = [
      {
        id: curId,
        device: detectDevice(),
        browser: detectBrowser(),
        location: 'กรุงเทพมหานคร, ประเทศไทย',
        lastActive: 'กำลังใช้งานตอนนี้',
        type: detectDeviceType(),
        current: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'mock_sess_2',
        device: 'iPad Pro',
        browser: 'Safari Browser',
        location: 'เชียงใหม่, ประเทศไทย',
        lastActive: 'ใช้งานเมื่อ 2 ชั่วโมงที่แล้ว',
        type: 'tablet',
        current: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'mock_sess_3',
        device: 'Samsung Galaxy S24',
        browser: 'Chrome Browser',
        location: 'ชลบุรี, ประเทศไทย',
        lastActive: 'ใช้งานเมื่อ 1 วันที่แล้ว',
        type: 'mobile',
        current: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ];
    
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(mockList));
    localStorage.setItem(CURRENT_SID, curId);
    setSessions(mockList);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /** Call this right after a successful login response */
  const createSessionOnLogin = useCallback(() => {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const existing: DeviceSession[] = raw ? JSON.parse(raw) : [];

    const newSession: DeviceSession = {
      id: generateId(),
      device: detectDevice(),
      browser: detectBrowser(),
      location: 'ประเทศไทย', // placeholder — in production resolve from IP
      lastActive: 'กำลังใช้งานตอนนี้',
      type: detectDeviceType(),
      current: true,
      createdAt: new Date().toISOString(),
    };

    // Mark all previous as non-current
    const updated = [...existing.map(s => ({ ...s, current: false })), newSession];
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    localStorage.setItem(CURRENT_SID, newSession.id);
    setSessions(updated);

    return newSession.id;
  }, []);

  /** Revoke a session by id */
  const revokeSession = useCallback((sessionId: string) => {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return;
    const filtered = (JSON.parse(raw) as DeviceSession[]).filter(s => s.id !== sessionId);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
    setSessions(filtered);
  }, []);

  /** Revoke all sessions except current */
  const revokeAllOtherSessions = useCallback(() => {
    const currentId = localStorage.getItem(CURRENT_SID);
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return 0;
    const all: DeviceSession[] = JSON.parse(raw);
    const kept = all.filter(s => s.id === currentId);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(kept));
    setSessions(kept);
    return all.length - kept.length;
  }, []);

  const resetToDefaultSessions = useCallback(() => {
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(CURRENT_SID);
    loadSessions();
  }, [loadSessions]);

  return { sessions, loadSessions, createSessionOnLogin, revokeSession, revokeAllOtherSessions, resetToDefaultSessions };
}
