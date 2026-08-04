import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Language } from '@/lib/types';

interface KycStepSuccessProps {
  lang: Language;
  isMockUser: boolean;
  onClose: () => void;
  onDevInstantVerify: () => void; // kept for interface compatibility
  kycFullName?: string;
  kycIdNumber?: string;
  kycDocType?: 'id' | 'passport' | 'license' | 'deed' | 'thaid' | 'ndid';
}

export function KycStepSuccess({ lang, onClose, kycFullName = '', kycIdNumber = '', kycDocType = 'thaid' }: KycStepSuccessProps) {
  const isTh = lang === 'th';
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('primerent_user_role') : null;
  const isLandlordRole = userRole === 'owner' || userRole === 'landlord';

  const [copiedName, setCopiedName] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [hasClickedCrd, setHasClickedCrd] = useState(false);
  const [crdSyncStatus, setCrdSyncStatus] = useState<'idle' | 'linking' | 'success'>('idle');

  const handleCopy = (text: string, type: 'name' | 'id') => {
    navigator.clipboard.writeText(text);
    if (type === 'name') {
      setCopiedName(true);
      setTimeout(() => setCopiedName(false), 2000);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Determine method label
  const methodLabel = {
    thaid: 'ThaiD',
    ndid: 'NDID',
    passport: isTh ? 'NFC Passport (หนังสือเดินทาง)' : 'NFC Passport',
    id: isTh ? 'บัตรประชาชน' : 'Citizen ID',
    license: isTh ? 'ใบขับขี่' : 'Driver\'s License',
    deed: isTh ? 'โฉนดที่ดิน' : 'Land Deed'
  }[kycDocType] || 'ThaiD';

  const isPassport = kycDocType === 'passport';
  const idLabel = isPassport 
    ? (isTh ? 'หมายเลขหนังสือเดินทาง' : 'Passport Number') 
    : (isTh ? 'เลขบัตรประชาชน' : 'Citizen ID');

  const displayIdNumber = isPassport && (!kycIdNumber || kycIdNumber.length === 13) 
    ? 'AA1234567' // Mock Passport number fallback for demo if empty or Thai ID pattern
    : kycIdNumber;

  return (
    <div className="space-y-4 text-center animate-in zoom-in-95 duration-500 pb-2 font-sans">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-emerald-200">
        <ShieldCheck className="w-10 h-10" />
      </div>
      <div className="space-y-1">
        <h4 className="text-lg font-black text-gray-900">{isTh ? 'ยืนยันตัวตนสำเร็จ!' : 'Identity Verified!'}</h4>
        <p className="text-[11px] font-bold text-gray-500 max-w-sm mx-auto leading-relaxed">
          {isTh 
            ? `บัญชีของคุณผ่านการตรวจสอบอัตลักษณ์บุคคลผ่านดิจิทัลไอดี (${methodLabel}) เรียบร้อยแล้ว` 
            : `Your identity has been fully verified and authenticated using state-of-the-art digital ID gateways (${methodLabel}).`}
        </p>
      </div>

      {/* CRD Criminal Record Verification Box (Shown for Agent role only) */}
      {!isLandlordRole && (
        <>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3 max-w-sm mx-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                👮‍♂️ {isTh ? 'ตรวจสอบประวัติอาชญากรรม (CRD)' : 'Criminal Record Check (CRD)'}
              </span>
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                {isTh ? 'จำเป็นต้องคลิก' : 'Required'}
              </span>
            </div>

            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
              {isTh 
                ? `เพื่อความปลอดภัยสูงสุดของแพลตฟอร์ม กรุณาคลิกปุ่มด้านล่างเพื่อยื่นตรวจประวัติอาชญากรรมผ่านกองทะเบียนฯ ด้วยข้อมูลจาก ${methodLabel}` 
                : `To maintain platform safety, you must click the link below to process your criminal record verification using your verified ${methodLabel} credentials.`}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold">{isTh ? 'ชื่อ-นามสกุล' : 'Full Name'}</p>
                  <p className="font-bold text-slate-800">{kycFullName}</p>
                </div>
                <button 
                  onClick={() => handleCopy(kycFullName, 'name')}
                  className="text-gray-400 hover:text-primary transition-colors p-1"
                  title={isTh ? 'คัดลอกชื่อ' : 'Copy Name'}
                >
                  {copiedName ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold">{idLabel}</p>
                  <p className="font-bold text-slate-800">{displayIdNumber}</p>
                </div>
                <button 
                  onClick={() => handleCopy(displayIdNumber, 'id')}
                  className="text-gray-400 hover:text-primary transition-colors p-1"
                  title={isTh ? 'คัดลอกเลขประจำตัว' : 'Copy ID'}
                >
                  {copiedId ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Promotion Notice Box */}
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-2.5 text-[10px] text-emerald-800 leading-normal flex items-start gap-1.5 font-semibold">
              <span className="text-xs leading-none">✨</span>
              <div>
                <p className="font-black text-[10px] text-emerald-900 mb-0.5">
                  {isTh ? 'โปรโมชั่นเปิดตัวแพลตฟอร์ม!' : 'Platform Launch Promotion!'}
                </p>
                <p className="text-gray-600 font-medium">
                  {isTh 
                    ? 'แพลตฟอร์มสำรองจ่ายค่าตรวจประวัติ ฿100 ให้ก่อน (สำหรับสมาชิก 3 เดือนแรก) โดยระบบจะนำไปหักคืนจากค่าคอมมิชชั่นปล่อยเช่าครั้งแรกของคุณอัตโนมัติ' 
                    : 'The platform advances the ฿100 verification fee (first 3 months of registration). This will be automatically recovered from your first successful lease commission.'}
                </p>
              </div>
            </div>

            <a 
              href="https://crd.go.th/crd-service-1/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => {
                setHasClickedCrd(true);
                setCrdSyncStatus('linking');
                if (typeof window !== 'undefined') {
                  localStorage.setItem('primerent_pending_crd_deduction', 'true');
                }
                setTimeout(() => {
                  setCrdSyncStatus('success');
                }, 3000);
              }}
              className="flex items-center justify-center gap-1.5 w-full bg-[#1e293b] hover:bg-slate-900 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <span>{isTh ? 'ไปที่เว็บไซต์ตรวจสอบประวัติ (CRD)' : 'Go to CRD Portal'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Sync Status / Feedback */}
          {crdSyncStatus === 'linking' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] font-bold text-blue-700 flex items-center gap-2 animate-pulse justify-center max-w-sm mx-auto">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              <span>{isTh ? '🔗 กำลังเชื่อมโยงข้อมูลผลการตรวจสอบจากระบบ CRD...' : '🔗 Connecting record check results from CRD...'}</span>
            </div>
          )}

          {crdSyncStatus === 'success' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] font-bold text-emerald-700 flex items-center gap-2 justify-center animate-in fade-in zoom-in-95 max-w-sm mx-auto">
              <span>✅</span>
              <span>{isTh ? 'เชื่อมโยงข้อมูลสำเร็จ! การยืนยันตัวตนเสร็จสมบูรณ์' : 'Records linked successfully! Verification complete.'}</span>
            </div>
          )}

          {/* Warning message if not clicked yet */}
          {crdSyncStatus === 'idle' && !hasClickedCrd && (
            <div className="flex items-center gap-2 justify-center text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-2.5 max-w-sm mx-auto text-[11px] font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{isTh ? 'กรุณากดปุ่มตรวจสอบประวัติ (CRD) ด้านบนก่อนดำเนินการต่อ' : 'Please click the CRD Portal link above to proceed.'}</span>
            </div>
          )}
        </>
      )}

      <div className="pt-2 flex justify-center">
        <Button 
          onClick={onClose} 
          disabled={!isLandlordRole && (!hasClickedCrd || crdSyncStatus === 'linking')}
          className="bg-gray-900 hover:bg-black text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed rounded-xl px-12 h-12 font-black shadow-lg shadow-gray-200/50 hover:scale-105 transition-all"
        >
          {isTh ? 'ยืนยัน (เสร็จสิ้น)' : 'Done'}
        </Button>
      </div>
      </div>
    </div>
  );
}
