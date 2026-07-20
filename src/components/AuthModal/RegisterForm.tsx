/**
 * RegisterForm component
 * Handles user registration with email/phone
 *
 * Client-side protections added:
 *  - Double-submit guard (isLoading flag)
 *  - 15s cooldown timer with countdown display after each attempt
 *  - Client-side duplicate-email check via localStorage role registry
 *  - Clear error / success messaging (Thai + English)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface RegisterFormProps {
  text: {
    title: string;
    subtitle: string;
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    agreeTerms: string;
    registerBtn: string;
    hasAccount: string;
    loginBtn: string;
    orContinueWith: string;
    line: string;
    google: string;
  };
  onLogin: () => void;
  onClose: () => void;
}

const COOLDOWN_SEC = 15; // must match server COOLDOWN_MS / 1000

export default function RegisterForm({ text, onLogin, onClose }: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'renter' | 'owner' | 'agent'>('renter');

  // ── Cooldown state ───────────────────────────────────────────────────────
  const [cooldown, setCooldown] = useState(0); // seconds remaining
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Error / success message ──────────────────────────────────────────────
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Client-side email duplicate check (localStorage registry) ────────────
  const isEmailAlreadyRegistered = (baseEmail: string): boolean => {
    const rolesMap = JSON.parse(localStorage.getItem('prime_registered_roles') || '{}');
    return baseEmail.toLowerCase().trim() in rolesMap;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // ── Guard: cooldown active ───────────────────────────────────────────
    if (cooldown > 0) {
      setErrorMsg(`กรุณารอ ${cooldown} วินาทีก่อนสมัครใหม่อีกครั้ง (Please wait ${cooldown}s)`);
      return;
    }

    // ── Guard: double-submit ─────────────────────────────────────────────
    if (isLoading) return;

    // ── Validation ───────────────────────────────────────────────────────
    if (password !== confirmPassword) {
      setErrorMsg('รหัสผ่านไม่ตรงกัน (Passwords do not match)');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('กรุณายอมรับข้อกำหนดการใช้งานก่อน (Please agree to the terms of service)');
      return;
    }

    // ── Client-side duplicate email guard ────────────────────────────────
    if (email && isEmailAlreadyRegistered(email)) {
      setErrorMsg(
        'อีเมลนี้ถูกลงทะเบียนแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ (Email already registered. Please log in instead.)'
      );
      return;
    }

    setIsLoading(true);

    try {
      // Convert user@domain.com to user+role@domain.com internally to support multiple roles
      const formattedEmail = email.includes('+') ? email : email.replace('@', `+${selectedRole}@`);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'email',
          full_name: fullName,
          email: formattedEmail,
          phone,
          password,
          role: selectedRole
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Save current active user role to local storage
        localStorage.setItem('primerent_user_role', selectedRole);

        // Track registered roles for this base email to support login profile picker
        const baseEmail = email.toLowerCase().trim();
        const rolesKey = 'prime_registered_roles';
        const rolesMap = JSON.parse(localStorage.getItem(rolesKey) || '{}');
        const existing = rolesMap[baseEmail] || [];
        if (!existing.includes(selectedRole)) {
          existing.push(selectedRole);
          rolesMap[baseEmail] = existing;
          localStorage.setItem(rolesKey, JSON.stringify(rolesMap));
        }

        if (data.user) {
          localStorage.setItem('prime_mock_user', JSON.stringify(data.user));
        }

        localStorage.setItem('primerent_show_welcome_notification', 'true');
        setSuccessMsg('สมัครสมาชิกสำเร็จ! (Registration Success!)');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      } else {
        const err = await response.json();
        const serverMsg: string = err.error || 'Registration failed';

        // Start client-side cooldown to match server cooldown
        if (response.status === 429) {
          const retryAfter = err.retryAfter ?? COOLDOWN_SEC;
          startCooldown(retryAfter);
        }

        setErrorMsg(serverMsg);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMsg('เกิดข้อผิดพลาดของเครือข่าย กรุณาลองใหม่ (Network or server error)');
    } finally {
      setIsLoading(false);
      // Start cooldown after every attempt (success or fail)
      if (cooldown === 0) startCooldown(COOLDOWN_SEC);
    }
  };

  const isSubmitDisabled = isLoading || cooldown > 0;

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{text.title}</h2>
        <p className="text-slate-500">{text.subtitle}</p>
      </div>

      {/* ── Error banner ───────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <span className="mt-0.5">⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Success banner ─────────────────────────────────────────────── */}
      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
          <span className="mt-0.5">✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selection Segment */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700">เลือกประเภทบัญชีสมัครสมาชิก (Register As)</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'renter', label: 'ผู้เช่า (Renter)' },
              { id: 'owner', label: 'เจ้าของ (Owner)' },
              { id: 'agent', label: 'เอเจ้นท์ (Agent)' }
            ].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id as any)}
                className={`py-2 px-1 text-[10px] font-black rounded-xl border-2 transition-all ${
                  selectedRole === role.id
                    ? 'border-orange-500 bg-orange-50/10 text-orange-600 ring-1 ring-orange-500'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">{text.fullName}</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{text.email}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{text.phone}</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{text.password}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{text.confirmPassword}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={agreeTerms}
            onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm text-slate-600">
            {text.agreeTerms}
          </Label>
        </div>

        {/* ── Submit button with cooldown countdown ─────────────────────── */}
        <Button
          type="submit"
          id="register-submit-btn"
          className="w-full"
          disabled={isSubmitDisabled}
        >
          {isLoading
            ? 'กำลังดำเนินการ...'
            : cooldown > 0
              ? `⏳ รอ ${cooldown} วินาที... (Wait ${cooldown}s)`
              : text.registerBtn}
        </Button>

        {/* ── Cooldown progress bar ─────────────────────────────────────── */}
        {cooldown > 0 && (
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-orange-400 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${(cooldown / COOLDOWN_SEC) * 100}%` }}
            />
          </div>
        )}
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/50 backdrop-blur-md rounded-xl text-slate-500">{text.orContinueWith}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="outline" type="button" disabled>
            {text.line}
          </Button>
          <Button variant="outline" type="button" disabled>
            {text.google}
          </Button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        {text.hasAccount}{' '}
        <button
          type="button"
          onClick={onLogin}
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          {text.loginBtn}
        </button>
      </p>
    </div>
  );
}
