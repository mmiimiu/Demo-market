import React from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SetupStep } from './types';

interface SetupEmailProps {
  emailAddress: string;
  verificationCode: string;
  codeError: string;
  isCodeSent: boolean;
  isTh: boolean;
  setEmailAddress: (email: string) => void;
  setVerificationCode: (code: string) => void;
  setCodeError: (error: string) => void;
  setIsCodeSent: (sent: boolean) => void;
  setSetupStep: (step: SetupStep) => void;
  handleSendEmailCode: () => void;
  handleVerify2fa: () => void;
}

export function SetupEmail({
  emailAddress,
  verificationCode,
  codeError,
  isCodeSent,
  isTh,
  setEmailAddress,
  setVerificationCode,
  setCodeError,
  setIsCodeSent,
  setSetupStep,
  handleSendEmailCode,
  handleVerify2fa
}: SetupEmailProps) {
  return (
    <div className="bg-white p-6 border rounded-2xl space-y-4 animate-in fade-in duration-300 font-sans">
      <h5 className="font-black text-sm text-gray-800 flex items-center gap-2">
        <Mail className="w-5 h-5 text-blue-500 animate-pulse" />
        {isTh ? 'เปิดใช้งานยืนยันตัวตนผ่านอีเมล (Email OTP)' : 'Email OTP Verification'}
      </h5>
      <p className="text-xs text-gray-400 font-bold leading-relaxed">
        {isTh 
          ? 'ระบบจะส่งรหัสลับ 6 หลักไปยังที่อยู่อีเมลของคุณเพื่อยืนยันสิทธิ์ โดยไม่มีค่าบริการส่ง SMS OTP' 
          : 'A secure 6-digit verification code will be sent to your email address (free of charge).'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-2 col-span-2">
          <Label className="text-xs text-gray-700 font-bold">{isTh ? 'ที่อยู่อีเมลสำหรับการรับรหัส' : 'Email Address'}</Label>
          <Input 
            type="email" 
            placeholder="example@email.com"
            value={emailAddress} 
            onChange={e => setEmailAddress(e.target.value)}
            className="rounded-xl h-11 bg-gray-50 border-gray-200 font-bold"
          />
        </div>
        <Button 
          onClick={handleSendEmailCode}
          className="h-11 rounded-xl font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-150"
        >
          {isCodeSent ? (isTh ? 'ส่งรหัสใหม่อีกครั้ง' : 'Resend Code') : (isTh ? 'ส่งรหัส OTP' : 'Send Code')}
        </Button>
      </div>

      {isCodeSent && (
        <div className="space-y-4 pt-4 border-t border-dashed animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <Label className="text-xs text-gray-700 font-bold">{isTh ? 'กรอกรหัสยืนยัน 6 หลัก (ใช้ 123456 ในการจำลอง)' : 'Enter 6-digit verification code (Use 123456)'}</Label>
            <Input 
              type="text" 
              maxLength={6}
              placeholder="xxxxxx"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              className="rounded-xl h-12 text-center text-lg font-black tracking-widest bg-gray-50 border-gray-200"
            />
            {codeError && <p className="text-xs text-red-500 font-semibold">{codeError}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { setIsCodeSent(false); setSetupStep('select'); }} className="rounded-xl flex-1 font-bold text-gray-500">ย้อนกลับ</Button>
            <Button onClick={handleVerify2fa} className="rounded-xl flex-1 font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-150">เปิดใช้งาน (Verify)</Button>
          </div>
        </div>
      )}
    </div>
  );
}
