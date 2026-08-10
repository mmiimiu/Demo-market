import React from 'react';
import { Mail, QrCode } from 'lucide-react';
import { SetupMethod, SetupStep } from './types';

interface SetupSelectProps {
  isTh: boolean;
  setSetupMethod: (method: SetupMethod) => void;
  setSetupStep: (step: SetupStep) => void;
}

export function SetupSelect({ isTh, setSetupMethod, setSetupStep }: SetupSelectProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <p className="text-sm font-bold text-gray-700">{isTh ? 'เลือกวิธีการยืนยันตัวตนระดับสอง (ฟรีค่าบริการ):' : 'Select preferred free 2FA method:'}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => { setSetupMethod('email'); setSetupStep('email'); }}
          className="p-5 border cursor-pointer bg-white hover:border-primary transition-all flex items-start gap-4 rounded-xl shadow-xs"
        >
          <Mail className="w-8 h-8 text-primary shrink-0 animate-pulse" />
          <div>
            <h5 className="font-black text-sm text-gray-800">{isTh ? 'รหัสความปลอดภัยทางอีเมล (Email OTP)' : 'Email OTP Message'}</h5>
            <p className="text-xs text-gray-400 mt-1">{isTh ? 'ส่งรหัสยืนยัน 6 หลักไปที่กล่องจดหมายอีเมลของคุณ (ไม่มีค่าบริการ)' : 'Send code to your email account securely.'}</p>
          </div>
        </div>
        <div 
          onClick={() => { setSetupMethod('app'); setSetupStep('app'); }}
          className="p-5 border cursor-pointer bg-white hover:border-primary transition-all flex items-start gap-4 rounded-xl shadow-xs"
        >
          <QrCode className="w-8 h-8 text-primary shrink-0" />
          <div>
            <h5 className="font-black text-sm text-gray-800">{isTh ? 'แอปยืนยันตัวตน (Authenticator App)' : 'Authenticator App'}</h5>
            <p className="text-xs text-gray-400 mt-1">{isTh ? 'สแกน QR Code เพื่อสร้างรหัสความปลอดภัยแบบออฟไลน์ด้วยตนเอง' : 'Scan QR code and generate codes via app.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
