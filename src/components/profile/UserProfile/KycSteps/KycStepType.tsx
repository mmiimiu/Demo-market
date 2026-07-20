import React from 'react';
import { Smartphone, Building2, QrCode, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Language, UserRole } from '@/lib/types';

interface KycStepTypeProps {
  lang: Language;
  currentRole: UserRole;
  kycDocType: 'id' | 'passport' | 'license' | 'deed' | 'thaid' | 'ndid';
  onSetDocType: (t: 'id' | 'passport' | 'license' | 'deed' | 'thaid' | 'ndid') => void;
  onNext: () => void;
}

export function KycStepType({ lang, currentRole, kycDocType, onSetDocType, onNext }: KycStepTypeProps) {
  const docOptions = [
    { 
      id: 'thaid', 
      title: lang === 'th' ? 'ThaID (แอปพลิเคชันจากรัฐ DOPA)' : 'ThaID (DOPA Government App)', 
      desc: lang === 'th' ? 'ยืนยันตัวตนโดยใช้โทรศัพท์สแกน QR Code ผ่านแอป ThaID ของกระทรวงมหาดไทย' : 'Verify by scanning a secure DOPA QR code on your mobile device', 
      icon: QrCode 
    },
    { 
      id: 'ndid', 
      title: lang === 'th' ? 'NDID (National Digital ID ผ่านธนาคาร)' : 'NDID (Bank Digital ID)', 
      desc: lang === 'th' ? 'ยืนยันตัวตนผ่านโมบายแบงก์กิ้งของธนาคารที่คุณลงทะเบียนไว้ (เช่น K-Plus, SCB Easy)' : 'Verify identity via registered mobile banking apps (e.g. K-Plus, SCB Easy)', 
      icon: Building2 
    },
    {
      id: 'passport',
      title: lang === 'th' ? 'NFC Passport (ระบบอ่านชิปพาสปอร์ตสำหรับต่างชาติ)' : 'NFC Passport (Foreign National Identity)',
      desc: lang === 'th' ? 'สแกนชิปพาสปอร์ตสากลผ่าน NFC บนสมาร์ทโฟน พร้อมเทคโนโลยีตรวจจับใบหน้า Liveness' : 'Read electronic passport chip via NFC on your phone with biometric liveness selfie verification',
      icon: Globe
    }
  ] as { id: string; title: string; desc: string; icon: any }[];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      <p className="text-sm font-black text-gray-700">{lang === 'th' ? 'เลือกช่องทางการยืนยันตัวตนความปลอดภัยสูง:' : 'Select digital identity provider:'}</p>
      <div className="grid grid-cols-1 gap-4">
        {docOptions.map((docItem) => (
          <button 
            key={docItem.id} 
            onClick={() => onSetDocType(docItem.id as any)}
            className={cn(
              'p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] flex items-start gap-4', 
              kycDocType === docItem.id ? 'bg-orange-50/20 border-orange-500 shadow-sm shadow-orange-100/50' : 'border-gray-150 hover:bg-gray-50'
            )}
          >
            <div className={cn('p-3 rounded-xl shrink-0', kycDocType === docItem.id ? 'bg-orange-500 text-white shadow-md shadow-orange-200/50' : 'bg-gray-100 text-gray-400')}>
              <docItem.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm">{docItem.title}</p>
              <p className="text-[10px] text-gray-500 font-bold mt-1 leading-relaxed">{docItem.desc}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button onClick={onNext} className="bg-orange-500 hover:bg-orange-600 rounded-xl px-8 h-12 text-white font-bold shadow-md shadow-orange-200/50 hover:scale-105 transition-all">
          {lang === 'th' ? 'ขั้นตอนถัดไป' : 'Next Step'}
        </Button>
      </div>
    </div>
  );
}
