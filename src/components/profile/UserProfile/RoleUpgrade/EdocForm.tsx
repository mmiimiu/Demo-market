'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Award } from 'lucide-react';
import { RoleUpgradeFormData } from './types';

interface EdocFormProps {
  lang: 'th' | 'en' | 'cn';
  role: 'agent' | 'landlord';
  formData: RoleUpgradeFormData;
  onChange: (fields: Partial<RoleUpgradeFormData>) => void;
}

export function EdocForm({ lang, role, formData, onChange }: EdocFormProps) {
  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  return (
    <div className="w-full bg-white border border-gray-200 shadow-2xl p-6 md:p-10 font-sans text-gray-800 space-y-8 max-w-2xl mx-auto rounded-none border-t-8 border-t-gray-900 relative overflow-hidden">
      {/* Decorative Stamp Seal */}
      <div className="absolute right-6 top-6 w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center rotate-12 select-none pointer-events-none">
        <div className="text-[8px] font-black text-primary/30 text-center uppercase leading-none">
          PrimeRent<br/>Partner<br/>KYC
        </div>
      </div>

      {/* Doc Header */}
      <div className="text-center border-b pb-6 border-gray-100">
        <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center mx-auto mb-3">
          {role === 'agent' ? <Award className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
        </div>
        <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide">
          {role === 'agent'
            ? (isTh ? 'คำขอเปิดใช้งานบัญชีตัวแทนและใบรับรองวิชาชีพ' : 'Broker Partnership & License Validation')
            : (isTh ? 'คำขอเปิดใช้งานบัญชีผู้ให้เช่าและยืนยันกรรมสิทธิ์' : 'Landlord Partnership & Deed Verification')}
        </h2>
        <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">
          DOCUMENT REF NO: PR-KYC-{Math.floor(100000 + Math.random() * 900000)}
        </p>
      </div>

      {/* Official Agreement Text */}
      <div className="text-xs leading-relaxed text-gray-600 space-y-3 bg-gray-50/50 p-4 border border-gray-100">
        <p>
          {isTh 
            ? 'ข้าพเจ้าขอให้การรับรองว่าข้อมูลและหลักฐานที่ปรากฏในใบสมัครนี้เป็นความจริงทุกประการ และยินยอมให้บริษัท ไพรม์เรนท์ จำกัด ดำเนินการตรวจสอบข้อมูลทางวิชาชีพและประวัติความปลอดภัยเพื่อประโยชน์ในการให้บริการนายหน้า/การปล่อยเช่าที่พักอาศัยอย่างถูกต้องตามกฎหมาย'
            : 'I hereby certify that all information and credentials provided in this application are authentic. I grant PrimeRent Co., Ltd. the permission to verify my professional credentials and property deeds to comply with real estate hosting laws.'}
        </p>
      </div>

      {/* Input Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="text-xs font-black text-gray-600 uppercase tracking-wider">
            {isTh ? 'ชื่อ-นามสกุลจริงตามกฎหมาย' : 'Legal Full Name'}
          </Label>
          <Input
            value={formData.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="Jane Doe"
            required
            className="h-10 bg-gray-50 border-gray-200 focus-visible:ring-primary/20 text-xs font-bold rounded-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-black text-gray-600 uppercase tracking-wider">
            {isTh ? 'หมายเลขบัตรประชาชน / พาสปอร์ต' : 'National ID / Passport No.'}
          </Label>
          <Input
            value={formData.idNumber}
            onChange={(e) => onChange({ idNumber: e.target.value })}
            placeholder={isTh ? '1-1002-34567-89-0' : 'A00000000'}
            required
            className="h-10 bg-gray-50 border-gray-200 focus-visible:ring-primary/20 text-xs font-bold rounded-none"
          />
        </div>

        <div className="space-y-1.5 col-span-1 md:col-span-2">
          <Label className="text-xs font-black text-gray-600 uppercase tracking-wider">
            {isTh ? 'เบอร์โทรศัพท์ติดต่อ' : 'Contact Telephone'}
          </Label>
          <Input
            value={formData.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="081-234-5678"
            required
            className="h-10 bg-gray-50 border-gray-200 focus-visible:ring-primary/20 text-xs font-bold rounded-none"
          />
        </div>

        {/* Conditional Fields based on Role */}
        {role === 'agent' ? (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs font-black text-gray-600 uppercase tracking-wider">
                {isTh ? 'ชื่อสังกัด/บริษัทนายหน้า (ถ้ามี)' : 'Agency/Company Name'}
              </Label>
              <Input
                value={formData.companyName || ''}
                onChange={(e) => onChange({ companyName: e.target.value })}
                placeholder="Prime Brokerage Group"
                className="h-10 bg-gray-50 border-gray-200 focus-visible:ring-primary/20 text-xs font-bold rounded-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-black text-gray-600 uppercase tracking-wider">
                {isTh ? 'เลขที่ใบประกอบวิชาชีพนายหน้า' : 'Broker License Number'}
              </Label>
              <Input
                value={formData.licenseNumber || ''}
                onChange={(e) => onChange({ licenseNumber: e.target.value })}
                placeholder="AG-8829-10"
                required
                className="h-10 bg-gray-50 border-gray-200 focus-visible:ring-primary/20 text-xs font-bold rounded-none"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs font-black text-gray-600 uppercase tracking-wider">
                {isTh ? 'สำนักงานที่ดิน/เขตพื้นที่' : 'Land Registry District'}
              </Label>
              <Input
                value={formData.deedDistrict || ''}
                onChange={(e) => onChange({ deedDistrict: e.target.value })}
                placeholder={isTh ? 'ห้วยขวาง, กรุงเทพฯ' : 'Huay Kwang, Bangkok'}
                required
                className="h-10 bg-gray-50 border-gray-200 focus-visible:ring-primary/20 text-xs font-bold rounded-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-black text-gray-600 uppercase tracking-wider">
                {isTh ? 'เลขที่โฉนดที่ดินหลักทรัพย์' : 'Deed Reference Number'}
              </Label>
              <Input
                value={formData.deedId || ''}
                onChange={(e) => onChange({ deedId: e.target.value })}
                placeholder="DEED-18992"
                required
                className="h-10 bg-gray-50 border-gray-200 focus-visible:ring-primary/20 text-xs font-bold rounded-none"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
