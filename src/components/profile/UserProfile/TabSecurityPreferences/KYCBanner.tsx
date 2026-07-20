import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KYCStatus } from '@/lib/types';

interface KYCBannerProps {
  currentKyc: KYCStatus;
  isTh: boolean;
  t: any;
  onOpenKycStepper: () => void;
}

export function KYCBanner({ currentKyc, isTh, t, onOpenKycStepper }: KYCBannerProps) {
  return (
    <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-50/60 to-amber-50/60 border border-orange-100/80 flex flex-col md:flex-row items-center gap-6 shadow-sm shadow-orange-100/30">
      <div className="w-16 h-16 bg-gradient-to-tr from-orange-400 to-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-orange-200/50 shrink-0">
        <ShieldCheck className="w-8 h-8" />
      </div>
      <div className="text-center md:text-left flex-1 space-y-1">
        <h4 className="font-black text-orange-950 text-xl flex items-center justify-center md:justify-start gap-2">{t.kyc_status}</h4>
        <p className="text-orange-800 font-semibold text-sm leading-relaxed">
          {currentKyc === 'verified' ? (isTh ? 'ขอแสดงความยินดี! โปรไฟล์ได้รับการยืนยันตัวตนระดับพรีเมียมแล้ว' : 'Congratulations! Your profile is verified as premium.')
            : currentKyc === 'pending' ? (isTh ? 'เอกสารยืนยันตัวตนของคุณได้รับแล้ว อยู่ระหว่างรอตรวจสอบอนุมัติ' : 'Documents received. We are validating your credentials.')
            : (isTh ? 'กรุณายื่นเอกสารการรับรองตัวตน (KYC) เพื่อเพิ่มความเชื่อมั่น' : 'Please submit documents for identity review to verify your profile.')}
        </p>
      </div>
      {currentKyc === 'unverified' && (
        <Button onClick={onOpenKycStepper} className="bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 transition-all rounded-xl px-6 py-6 font-black text-sm shadow-md shadow-orange-200/50">
          {t.verify_now}
        </Button>
      )}
      {currentKyc === 'pending' && (
        <Button disabled className="bg-amber-100 border border-amber-200 text-amber-600 rounded-xl px-6 py-6 font-black text-sm">
          {isTh ? 'รออนุมัติ' : 'Pending Approval'}
        </Button>
      )}
      {currentKyc === 'verified' && (
        <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-green-500 text-white shadow-md shadow-green-200/50">
          <CheckCircle2 className="w-4 h-4 fill-white text-green-500" /> Verified
        </span>
      )}
    </div>
  );
}
