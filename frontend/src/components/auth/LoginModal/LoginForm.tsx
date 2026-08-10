import React from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Language } from '@/lib/types';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  error: string;
  onLogin: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  onGoogleLogin: () => void;
  onLineLogin: () => void;
  lang: Language;
}

export default function LoginForm({
  email, setEmail, password, setPassword, loading, error,
  onLogin, onForgotPassword, onGoogleLogin, onLineLogin, lang
}: LoginFormProps) {
  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  return (
    <div className="max-w-sm mx-auto w-full">
      <form onSubmit={onLogin} className="space-y-3">
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

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <Label className="text-xs font-black text-gray-500 uppercase tracking-widest">
              {isTh ? 'รหัสผ่าน' : isCn ? '密码' : 'Password'}
            </Label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              {isTh ? 'ลืมรหัสผ่าน?' : isCn ? '忘记密码？' : 'Forgot?'}
            </button>
          </div>
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
        </div>

        {error && (
          <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />{error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-[#E51D53] hover:bg-[#D41B4D] font-black text-sm">
          {loading ? (isTh ? 'กำลังดำเนินการ...' : 'Processing...') : (isTh ? 'เข้าสู่ระบบ' : isCn ? '登录' : 'Sign In')}
        </Button>
      </form>

      <div className="mt-3 space-y-2">
        <Button
          variant="outline"
          onClick={onGoogleLogin}
          className="w-full h-10 rounded-xl font-bold border-gray-100 gap-2.5 text-sm hover:bg-gray-50"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
          {isTh ? 'ดำเนินการต่อด้วย Google' : isCn ? '继续使用 Google' : 'Continue with Google'}
        </Button>
        <Button
          variant="outline"
          onClick={onLineLogin}
          className="w-full h-10 rounded-xl font-bold border-[#06C755]/20 gap-2.5 text-sm hover:bg-green-50 text-[#06C755]"
        >
          <div className="w-4 h-4 bg-[#06C755] flex items-center justify-center text-white text-[9px] font-black rounded-xl">L</div>
          {isTh ? 'เข้าสู่ระบบด้วย LINE' : isCn ? '使用 LINE 登录' : 'Login with LINE'}
        </Button>
      </div>
    </div>
  );
}
