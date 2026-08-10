import React from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Language } from '@/lib/types';

interface PasswordResetFormProps {
  resetEmail: string;
  setResetEmail: (email: string) => void;
  resetLoading: boolean;
  resetSuccess: boolean;
  error: string;
  onReset: (e: React.FormEvent) => void;
  onBack: () => void;
  lang: Language;
}

export default function PasswordResetForm({
  resetEmail, setResetEmail, resetLoading, resetSuccess, error,
  onReset, onBack, lang
}: PasswordResetFormProps) {
  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  return (
    <div className="p-8 max-w-sm mx-auto w-full">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {isTh ? 'กลับ' : isCn ? '返回' : 'Back'}
      </button>
      <h3 className="text-xl font-black text-gray-900 mb-1">
        {isTh ? 'รีเซ็ตรหัสผ่าน' : isCn ? '重置密码' : 'Reset Password'}
      </h3>
      <p className="text-sm text-gray-400 font-medium mb-6">
        {isTh ? 'กรอกอีเมลเพื่อรับลิงก์รีเซ็ต' : isCn ? '输入邮箱以接收重置链接' : 'Enter your email to receive a reset link'}
      </p>

      {resetSuccess ? (
        <div className="border border-green-200 bg-green-50 p-5 text-center rounded-xl">
          <p className="font-black text-green-700 text-sm mb-1">{isTh ? 'ส่งอีเมลแล้ว!' : 'Email Sent!'}</p>
          <p className="text-xs text-green-600 font-medium">{isTh ? 'ตรวจสอบอีเมลของคุณ' : 'Check your inbox'}</p>
        </div>
      ) : (
        <form onSubmit={onReset} className="space-y-4">
          <div>
            <Label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Email</Label>
            <Input
              type="email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              required
              className="h-11 rounded-xl border-gray-100 text-sm font-medium focus-visible:ring-[#E51D53]/20"
            />
          </div>
          {error && (
            <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />{error}
            </p>
          )}
          <Button type="submit" disabled={resetLoading} className="w-full h-11 rounded-xl bg-[#E51D53] hover:bg-[#D41B4D] font-black text-sm">
            {resetLoading ? '...' : (isTh ? 'ส่งลิงก์รีเซ็ต' : isCn ? '发送重置链接' : 'Send Reset Link')}
          </Button>
        </form>
      )}
    </div>
  );
}
