import React from 'react';
import { Mail, Lock, Type, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Language } from '@/lib/types';

interface RegisterFormProps {
  lang: Language;
  displayName: string;
  setDisplayName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSignup: () => void;
  onLineSignup: () => void;
}

export default function RegisterForm({
  lang, displayName, setDisplayName, email, setEmail,
  password, setPassword, loading, error, onSubmit, onGoogleSignup, onLineSignup,
}: RegisterFormProps) {
  const isTh = lang === 'th';
  const strength = [/[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/, /.{8,}/].filter(r => r.test(password)).length;
  const strengthColor = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][strength - 1] ?? 'bg-gray-200';

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <Label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
            {isTh ? 'ชื่อ-นามสกุล' : 'Full Name'}
          </Label>
          <div className="relative">
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <Input placeholder={isTh ? 'สมชาย ใจดี' : 'John Doe'} value={displayName}
              onChange={e => setDisplayName(e.target.value)} required
              className="h-11 pl-10 rounded-xl border-gray-100 text-sm font-medium" />
          </div>
        </div>
        <div>
          <Label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
            {isTh ? 'อีเมล' : 'Email'}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <Input type="email" placeholder="email@example.com" value={email}
              onChange={e => setEmail(e.target.value)} required
              className="h-11 pl-10 rounded-xl border-gray-100 text-sm font-medium" />
          </div>
        </div>
        <div>
          <Label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
            {isTh ? 'รหัสผ่าน' : 'Password'}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required className="h-11 pl-10 rounded-xl border-gray-100 text-sm font-medium" />
          </div>
          {password && (
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${strength >= n ? strengthColor : 'bg-gray-100'}`} />
              ))}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />{error}
          </p>
        )}
        <Button type="submit" disabled={loading}
          className="w-full h-11 rounded-xl bg-[#E51D53] hover:bg-[#D41B4D] font-black text-sm mt-1">
          {loading ? (isTh ? 'กำลังดำเนินการ...' : 'Processing...') : (isTh ? 'สร้างบัญชี' : 'Create Account')}
        </Button>
      </form>
      <div className="space-y-2">
        <Button variant="outline" onClick={onLineSignup}
          className="w-full h-10 rounded-xl font-bold border-[#06C755]/20 gap-2.5 text-sm hover:bg-green-50 text-[#06C755]">
          <div className="w-4 h-4 bg-[#06C755] flex items-center justify-center text-white text-[9px] font-black rounded">L</div>
          {isTh ? 'สมัครด้วย LINE (แนะนำ)' : 'Sign up with LINE (Recommended)'}
        </Button>
        <Button variant="outline" onClick={onGoogleSignup}
          className="w-full h-10 rounded-xl font-bold border-gray-100 gap-2.5 text-sm hover:bg-gray-50">
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
          {isTh ? 'ดำเนินการต่อด้วย Google' : 'Continue with Google'}
        </Button>
      </div>
    </div>
  );
}
