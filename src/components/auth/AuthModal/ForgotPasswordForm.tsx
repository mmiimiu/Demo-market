import React from 'react';
import { ArrowLeft, AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Language } from '@/lib/types';

interface ForgotPasswordFormProps {
  lang: Language;
  initialEmail?: string;
  onBack: () => void;
  onReset: (email: string) => Promise<void>;
}

export default function ForgotPasswordForm({ lang, initialEmail = '', onBack, onReset }: ForgotPasswordFormProps) {
  const isTh = lang === 'th';
  const [email, setEmail] = React.useState(initialEmail);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        {isTh ? 'กลับ' : 'Back'}
      </button>

      <div>
        <h3 className="text-lg font-black text-gray-900 mb-1">
          {isTh ? 'ลืมรหัสผ่าน?' : 'Forgot Password?'}
        </h3>
        <p className="text-sm text-gray-400 font-medium">
          {isTh ? 'กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน' : 'Enter your email to receive a password reset link'}
        </p>
      </div>

      {success ? (
        <div className="flex flex-col items-center gap-3 py-6 border border-green-200 bg-green-50 rounded-2xl">
          <CheckCircle className="w-10 h-10 text-green-500" />
          <p className="font-black text-green-700 text-sm">{isTh ? 'ส่งอีเมลแล้ว!' : 'Email Sent!'}</p>
          <p className="text-xs text-green-600 font-medium">{isTh ? 'ตรวจสอบกล่องข้อความของคุณ' : 'Check your inbox'}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
              {isTh ? 'อีเมล' : 'Email'}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="email@example.com"
                className="h-11 pl-10 rounded-xl border-gray-100 text-sm font-medium" />
            </div>
          </div>
          {error && (
            <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />{error}
            </p>
          )}
          <Button type="submit" disabled={loading}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-sm">
            {loading ? '...' : (isTh ? 'ส่งลิงก์รีเซ็ต' : 'Send Reset Link')}
          </Button>
        </form>
      )}
    </div>
  );
}
