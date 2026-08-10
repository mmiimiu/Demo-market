import React from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Language } from '@/lib/types';

interface EmailLoginFormProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  error: string;
  lang: Language;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  onGoogleLogin: () => void;
  onLineLogin: () => void;
}

export default function EmailLoginForm({
  email, setEmail, password, setPassword,
  loading, error, lang, onSubmit, onForgotPassword, onGoogleLogin, onLineLogin,
}: EmailLoginFormProps) {
  const isTh = lang === 'th';

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-3">
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
          <div className="flex justify-between items-center mb-1.5">
            <Label className="text-xs font-black text-gray-500 uppercase tracking-widest">
              {isTh ? 'รหัสผ่าน' : 'Password'}
            </Label>
            <button type="button" onClick={onForgotPassword}
              className="text-[11px] font-bold text-blue-600 hover:underline">
              {isTh ? 'ลืมรหัสผ่าน?' : 'Forgot password?'}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required className="h-11 pl-10 rounded-xl border-gray-100 text-sm font-medium" />
          </div>
        </div>
        {error && (
          <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />{error}
          </p>
        )}
        <Button type="submit" disabled={loading}
          className="w-full h-11 rounded-xl bg-[#E51D53] hover:bg-[#D41B4D] font-black text-sm">
          {loading ? (isTh ? 'กำลังดำเนินการ...' : 'Processing...') : (isTh ? 'เข้าสู่ระบบ' : 'Sign In')}
        </Button>
      </form>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">{isTh ? 'หรือ' : 'or'}</span></div>
      </div>
      <div className="space-y-2">
        <Button variant="outline" onClick={onGoogleLogin}
          className="w-full h-10 rounded-xl font-bold border-gray-100 gap-2.5 text-sm hover:bg-gray-50">
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
          {isTh ? 'ดำเนินการต่อด้วย Google' : 'Continue with Google'}
        </Button>
        <Button variant="outline" onClick={onLineLogin}
          className="w-full h-10 rounded-xl font-bold border-[#06C755]/20 gap-2.5 text-sm hover:bg-green-50 text-[#06C755]">
          <div className="w-4 h-4 bg-[#06C755] flex items-center justify-center text-white text-[9px] font-black rounded">L</div>
          {isTh ? 'เข้าสู่ระบบด้วย LINE' : 'Login with LINE'}
        </Button>
      </div>
    </div>
  );
}
