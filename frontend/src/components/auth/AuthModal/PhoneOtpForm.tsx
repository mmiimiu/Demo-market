'use client';
import React, { useState, useRef } from 'react';
import { Smartphone, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Language } from '@/lib/types';

interface PhoneOtpFormProps {
  lang: Language;
  onSuccess: () => void;
  onBack: () => void;
}

export default function PhoneOtpForm({ lang, onSuccess, onBack }: PhoneOtpFormProps) {
  const isTh = lang === 'th';
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setOtpSent(true); }, 1200);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setVerified(true); setTimeout(onSuccess, 800); }, 1000);
  };

  if (verified) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <CheckCircle className="w-12 h-12 text-green-500" />
        <p className="font-black text-gray-900">{isTh ? 'ยืนยันสำเร็จ!' : 'Verified!'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        {isTh ? 'กลับ' : 'Back'}
      </button>

      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <Label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
              {isTh ? 'เบอร์โทรศัพท์' : 'Phone Number'}
            </Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <Input type="tel" placeholder="08X-XXX-XXXX" value={phone}
                onChange={e => setPhone(e.target.value)} required
                className="h-11 pl-10 rounded-xl border-gray-100 text-sm font-medium" />
            </div>
          </div>
          <Button type="submit" disabled={loading}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-black text-sm">
            {loading ? (isTh ? 'กำลังส่ง...' : 'Sending...') : (isTh ? 'รับรหัส OTP' : 'Get OTP Code')}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              {isTh ? `ส่ง OTP ไปยัง ${phone} แล้ว` : `OTP sent to ${phone}`}
            </p>
            <Label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 block">
              {isTh ? 'กรอกรหัส 6 หลัก' : 'Enter 6-digit code'}
            </Label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className="w-11 h-12 text-center text-xl font-black border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              ))}
            </div>
          </div>
          <Button type="submit" disabled={loading || otp.some(d => !d)}
            className="w-full h-11 rounded-xl bg-[#E51D53] hover:bg-[#D41B4D] font-black text-sm">
            {loading ? (isTh ? 'กำลังตรวจสอบ...' : 'Verifying...') : (isTh ? 'ยืนยัน OTP' : 'Verify OTP')}
          </Button>
          <button type="button" onClick={() => setOtpSent(false)}
            className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600">
            {isTh ? 'ส่งรหัสใหม่' : 'Resend code'}
          </button>
        </form>
      )}
    </div>
  );
}
