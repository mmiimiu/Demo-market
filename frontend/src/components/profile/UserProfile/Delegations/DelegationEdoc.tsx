'use client';

import React from 'react';
import { Building2, Landmark, CheckCircle } from 'lucide-react';
import { DelegationAgreement } from './types';
import { SignatureSection } from './SignatureSection';

interface DelegationEdocProps {
  lang: 'th' | 'en' | 'cn';
  agreement: DelegationAgreement;
  currentRole: string;
  onSign: (signature: string) => void;
}

export function DelegationEdoc({ lang, agreement, currentRole, onSign }: DelegationEdocProps) {
  const isTh = lang === 'th';
  const isAgentSigned = !!agreement.agentSignature;
  const isOwnerSigned = !!agreement.ownerSignature;
  const isComplete = isAgentSigned && isOwnerSigned;

  return (
    <div className="w-full bg-white border border-gray-200 shadow-2xl p-6 md:p-10 text-gray-800 space-y-6 max-w-2xl mx-auto rounded-none border-t-8 border-t-teal-700 relative overflow-hidden">
      {/* Complete Stamp */}
      {isComplete && (
        <div className="absolute right-8 top-8 w-24 h-24 rounded-full border-4 border-emerald-500/30 flex flex-col items-center justify-center rotate-12 select-none pointer-events-none bg-emerald-50/10">
          <CheckCircle className="w-6 h-6 text-emerald-500/50 mb-1" />
          <span className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest text-center leading-none">
            AGREEMENT<br/>ACTIVE
          </span>
        </div>
      )}

      {/* Doc Header */}
      <div className="text-center border-b pb-6 border-gray-100">
        <div className="w-12 h-12 bg-teal-900 text-white flex items-center justify-center mx-auto mb-3">
          <Landmark className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide">
          {isTh ? 'หนังสือสัญญาแต่งตั้งตัวแทนบริหารจัดการห้องเช่า' : 'Property Management Care Delegation Contract'}
        </h2>
        <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">
          AGREEMENT REF: DELEGATE-{agreement.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Agreement Terms */}
      <div className="text-xs leading-relaxed text-gray-600 space-y-4">
        <div className="grid grid-cols-2 gap-4 border-b pb-4 border-gray-100">
          <div>
            <p className="font-black text-gray-400 uppercase tracking-wider text-[10px]">ผู้มอบอำนาจ (เจ้าของห้อง)</p>
            <p className="text-sm font-bold text-gray-900">{agreement.ownerName}</p>
          </div>
          <div>
            <p className="font-black text-gray-400 uppercase tracking-wider text-[10px]">ผู้รับมอบอำนาจ (ตัวแทน)</p>
            <p className="text-sm font-bold text-gray-900">{agreement.agentName}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-bold text-gray-800 text-sm">
            {isTh ? 'รายละเอียดและข้อตกลง:' : 'Scope of Care Details:'}
          </p>
          <ul className="list-disc pl-5 space-y-1 bg-gray-50/50 p-4 border border-gray-100 rounded-none">
            <li>
              <strong>{isTh ? 'ทรัพย์สินที่แต่งตั้ง:' : 'Delegated Property:'}</strong> {agreement.propertyName}
            </li>
            <li>
              <strong>{isTh ? 'อัตราค่าตอบแทนการดูแล:' : 'Commission rate:'}</strong> {agreement.commissionRate}% {isTh ? 'ของค่าเช่ารายเดือน' : 'of monthly rental fees'}
            </li>
            <li>
              {isTh 
                ? 'ผู้มอบอำนาจตกลงมอบหมายให้ผู้รับมอบอำนาจมีสิทธิ์ในการเจรจา จัดประกาศ หาผู้เช่า และประสานงานส่งมอบกุญแจ/แบบประเมินสภาพห้อง (Move-in Checklist) ร่วมกับผู้เช่าอย่างเป็นทางการ'
                : 'The authorizer delegates the right to negotiate, list properties, find tenants, and coordinate the Move-in checklist/handover process.'}
            </li>
          </ul>
        </div>
      </div>

      {/* Signatures */}
      <SignatureSection
        lang={lang}
        agreement={agreement}
        currentRole={currentRole}
        onSign={onSign}
      />
    </div>
  );
}
