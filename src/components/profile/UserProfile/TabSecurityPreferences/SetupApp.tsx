import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SetupStep } from './types';

interface SetupAppProps {
  verificationCode: string;
  codeError: string;
  isTh: boolean;
  setVerificationCode: (code: string) => void;
  setCodeError: (error: string) => void;
  setSetupStep: (step: SetupStep) => void;
  handleVerify2fa: () => void;
}

export function SetupApp({
  verificationCode,
  codeError,
  isTh,
  setVerificationCode,
  setCodeError,
  setSetupStep,
  handleVerify2fa
}: SetupAppProps) {
  return (
    <div className="bg-white p-6 border space-y-6 animate-in fade-in duration-300">
      <h5 className="font-black text-sm text-gray-800">🔑 {isTh ? 'ตั้งค่าแอป Authenticator' : 'Authenticator App Configuration'}</h5>
      
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="w-36 h-36 bg-gray-50 border p-2 flex flex-col justify-center items-center relative shrink-0">
          <QrCode className="w-28 h-28 text-gray-800" />
          <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">MOCK SETUP QR</span>
        </div>
        <div className="space-y-2 flex-1">
          <p className="text-xs text-gray-500 leading-relaxed font-semibold">
            {isTh 
              ? '1. สแกนคิวอาร์โค้ดทางซ้ายมือผ่านแอป Authenticator เช่น Google Authenticator\n2. หรือกรอกคีย์ด้านล่างเพื่อผูกบัญชีด้วยตนเอง'
              : '1. Scan the QR code using Google Authenticator or similar apps.\n2. Or enter the secret key manually.'}
          </p>
          <div className="bg-gray-50 p-2.5 border text-xs font-mono font-black text-gray-700 flex justify-between items-center rounded-none select-all">
            <span>JBSWY3DPEHPK3PXP</span>
            <Copy className="w-3.5 h-3.5 text-gray-400 cursor-pointer" onClick={() => {
              navigator.clipboard.writeText('JBSWY3DPEHPK3PXP');
              toast({ title: isTh ? 'คัดลอกคีย์สำเร็จ' : 'Key Copied' });
            }} />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-dashed">
        <div className="space-y-2">
          <Label className="text-xs text-gray-400 font-bold">{isTh ? 'กรอกรหัส 6 หลักจากแอป (ใช้ 123456 ในการทดสอบ)' : 'Enter 6-digit code from app (Use 123456)'}</Label>
          <Input 
            type="text" 
            maxLength={6}
            placeholder="xxxxxx"
            value={verificationCode}
            onChange={e => setVerificationCode(e.target.value)}
            className="rounded-none h-12 text-center text-lg font-black tracking-widest"
          />
          {codeError && <p className="text-xs text-red-500 font-semibold">{codeError}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSetupStep('select')} className="rounded-none flex-1 font-bold">ย้อนกลับ</Button>
          <Button onClick={handleVerify2fa} className="rounded-none flex-1 font-black bg-primary text-white">ยืนยัน (Verify & Activate)</Button>
        </div>
      </div>
    </div>
  );
}
