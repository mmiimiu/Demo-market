import React from 'react';
import { Button } from '@/components/ui/button';

interface PDPAControlsProps {
  marketingConsent: boolean;
  analyticsConsent: boolean;
  isTh: boolean;
  handleConsentToggle: (type: 'marketing' | 'analytics', value: boolean) => void;
}

export function PDPAControls({ marketingConsent, analyticsConsent, isTh, handleConsentToggle }: PDPAControlsProps) {
  return (
    <div className="space-y-6 pt-6 border-t border-gray-100">
      <h4 className="font-black text-gray-800 text-lg">{isTh ? 'การจัดการความยินยอมข้อมูลส่วนบุคคล (PDPA)' : 'PDPA Privacy Settings'}</h4>
      
      <div className="bg-gray-50 border p-5 rounded-none space-y-2">
        <p className="text-xs text-gray-500 leading-relaxed font-semibold">
          {isTh 
            ? 'ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ท่านสามารถเลือกให้ความยินยอมการเก็บข้อมูล วิเคราะห์ ค้นหาห้องพัก และเลือกรับข่าวสารโปรโมชั่นต่างๆ หรือยกเลิกเพื่อถอนการเก็บข้อมูลได้ตลอดเวลา'
            : 'In compliance with PDPA guidelines, you can choose to grant or withdraw consents regarding promotional messaging, tracking analytics, and custom recommendation profiles.'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between p-5 rounded-none border border-gray-100 bg-white">
          <div className="space-y-1">
            <p className="font-black text-sm text-gray-900 flex items-center gap-1.5">
              {isTh ? 'ความยินยอมเก็บรวบรวมข้อมูลส่วนบุคคลพื้นฐาน (จำเป็น)' : 'Necessary Personal Data Processing'}
              <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-0.5 rounded-full">REQUIRED</span>
            </p>
            <p className="text-xs text-gray-400 font-bold">{isTh ? 'เพื่อการทำสัญญาเช่า และยืนยันตัวตน (e-KYC)' : 'Needed for lease verification and KYC security processing.'}</p>
          </div>
          <input type="checkbox" disabled checked className="w-5 h-5 rounded accent-primary bg-gray-50 cursor-not-allowed opacity-50" />
        </div>

        <div className="flex items-start justify-between p-5 rounded-none border border-gray-100 bg-white">
          <div className="space-y-1">
            <p className="font-black text-sm text-gray-900">{isTh ? 'รับโปรโมชั่นและการเสนอห้องพักจากทางทีมงาน (ตัวเลือก)' : 'Marketing & Promotional Communications'}</p>
            <p className="text-xs text-gray-400 font-bold">{isTh ? 'จัดเก็บข้อมูลเพื่อส่งโปรส่วนลดและข่าวสารแนะนำอสังหาฯ ใหม่' : 'Collect preferences to suggest rent deals and newly uploaded listings.'}</p>
          </div>
          <input 
            type="checkbox" 
            checked={marketingConsent} 
            onChange={e => handleConsentToggle('marketing', e.target.checked)}
            className="w-5 h-5 rounded accent-primary bg-gray-50 cursor-pointer" 
          />
        </div>

        <div className="flex items-start justify-between p-5 rounded-none border border-gray-100 bg-white">
          <div className="space-y-1">
            <p className="font-black text-sm text-gray-900">{isTh ? 'วิเคราะห์พฤติกรรมการใช้งานในระบบและข้อมูลโฆษณา (ตัวเลือก)' : 'Third-Party Analytics & Tracking'}</p>
            <p className="text-xs text-gray-400 font-bold">{isTh ? 'ช่วยให้นักพัฒนาสามารถดูการคลิกหน้าเว็บเพื่อปรับปรุงหน้าจอการเช่า' : 'Helps improve layouts by recording heatmaps and interaction patterns.'}</p>
          </div>
          <input 
            type="checkbox" 
            checked={analyticsConsent} 
            onChange={e => handleConsentToggle('analytics', e.target.checked)}
            className="w-5 h-5 rounded accent-primary bg-gray-50 cursor-pointer" 
          />
        </div>
      </div>
    </div>
  );
}
