'use client';

import React from 'react';
import { Mail, Lock, Type, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrength } from './PasswordStrength';

interface SignupFormProps {
  lang: 'th' | 'en' | 'cn';
  displayName: string;
  setDisplayName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onLineSignup?: () => void;
  onGoogleSignup?: () => void;
}

export function SignupForm({
  lang,
  displayName,
  setDisplayName,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  onSubmit,
  onLineSignup,
  onGoogleSignup,
}: SignupFormProps) {
  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <Label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
          {isTh ? 'ชื่อ-นามสกุล' : isCn ? '姓名' : 'Full Name'}
        </Label>
        <div className="relative">
          <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <Input
            placeholder={isTh ? 'สมชาย ใจดี' : 'John Doe'}
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            className="h-11 pl-10 rounded-xl border-gray-100 text-sm font-medium focus-visible:ring-[#E51D53]/20"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <Label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
          {isTh ? 'อีเมล' : isCn ? '电子邮件' : 'Email'}
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <Input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="h-11 pl-10 rounded-xl border-gray-100 text-sm font-medium focus-visible:ring-[#E51D53]/20"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <Label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
          {isTh ? 'รหัสผ่าน' : isCn ? '密码' : 'Password'}
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="h-11 pl-10 rounded-xl border-gray-100 text-sm font-medium focus-visible:ring-[#E51D53]/20"
          />
        </div>

        <PasswordStrength password={password} lang={lang} />
      </div>

      {error && (
        <div className="flex items-center gap-2 border border-red-200 bg-red-50 p-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs font-bold text-red-600">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-[#E51D53] hover:bg-[#D41B4D] font-black text-sm mt-2">
        {loading
          ? (isTh ? 'กำลังดำเนินการ...' : isCn ? '正在处理...' : 'Processing...')
          : (isTh ? 'สร้างบัญชี' : isCn ? '创建账户' : 'Create Account')}
      </Button>

      {/* OAuth Signup - LINE Prominence */}
      <div className="mt-4 space-y-2">
        <Button
          type="button"
          onClick={onLineSignup}
          className="w-full h-10 rounded-xl font-bold border-[#06C755]/20 gap-2.5 text-sm hover:bg-green-50 text-[#06C755]"
        >
          <div className="w-4 h-4 bg-[#06C755] flex items-center justify-center text-white text-[9px] font-black rounded">L</div>
          {isTh ? 'สมัครด้วย LINE (แนะนำ)' : isCn ? '使用 LINE 注册（推荐）' : 'Sign up with LINE (Recommended)'}
        </Button>
        <Button
          type="button"
          onClick={onGoogleSignup}
          variant="outline"
          className="w-full h-10 rounded-xl font-bold border-gray-100 gap-2.5 text-sm hover:bg-gray-50"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
          {isTh ? 'ดำเนินการต่อด้วย Google' : isCn ? '继续使用 Google' : 'Continue with Google'}
        </Button>
      </div>
    </form>
  );
}
