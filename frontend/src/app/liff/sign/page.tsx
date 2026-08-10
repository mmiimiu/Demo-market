'use client';

/**
 * @fileOverview LIFF e-Signature Page
 * หน้าลงนามสัญญาเช่าแบบดิจิทัลภายใน LINE App
 *
 * Route: /liff/sign?contractId=xxx&lang=th
 */

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { translations } from '@/lib/translations';
import { Badge } from '@/components/ui/badge';
import { Check, RotateCcw, FileText, PenTool, ShieldCheck, AlertCircle, Pencil, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

interface ContractSummary {
  id: string;
  propertyName: string;
  monthlyRent: number;
  deposit: number;
  startDate: string;
  endDate: string;
  tenantName: string;
  landlordName: string;
  agentName?: string;
  attachments?: any[];
  addendums?: {
    furniture?: Array<{ item: string; penaltyPrice: number }>;
    others?: Array<{ title: string; content: string }>;
  };
  status?: 'completed' | 'pending_signatures';
}

// Localized helper labels for contract details
const localLabels = {
  th: {
    property: '🏠 ที่พัก',
    monthlyRent: '💰 ค่าเช่า/เดือน',
    deposit: '💳 เงินมัดจำ',
    startDate: '📅 เริ่มสัญญา',
    endDate: '📅 สิ้นสุดสัญญา',
    landlord: '👤 เจ้าของ',
    agent: '🤝 ตัวแทน',
    sign_title: '✍️ ลายเซ็นดิจิทัล',
    clear: 'ล้าง',
    placeholder: 'วาดลายเซ็นของคุณที่นี่',
    agree_text: 'ข้าพเจ้าได้อ่านและยอมรับเงื่อนไขสัญญาเช่าทุกข้อ และยินยอมให้ลายเซ็นดิจิทัลนี้มีผลทางกฎหมาย',
    loading: 'กำลังโหลด LINE LIFF...',
    submitting: '⏳ กำลังบันทึก...',
    submit: '✅ ยืนยันและลงนาม',
    secured: '🔒 ลายเซ็นนี้ถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย โดย PrimeRent',
    success_title: 'ลงนามสำเร็จแล้ว!',
    success_close: 'หน้าต่างจะปิดอัตโนมัติใน 3 วินาที...',
    error_signed: 'กรุณาวาดลายเซ็นก่อนยืนยัน',
    error_agree: 'กรุณาตรวจสอบและยอมรับเงื่อนไขก่อน',
    error_api: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
    signed_by: 'ผู้ลงนาม (จาก LINE)',
    contract_details: '📄 รายละเอียดสัญญา',
  },
  en: {
    property: '🏠 Property',
    monthlyRent: '💰 Monthly Rent',
    deposit: '💳 Security Deposit',
    startDate: '📅 Start Date',
    endDate: '📅 End Date',
    landlord: '👤 Landlord',
    agent: '🤝 Agent',
    sign_title: '✍️ Digital Signature',
    clear: 'Clear',
    placeholder: 'Draw your signature here',
    agree_text: 'I have read and accepted all the contract terms, and agree that this digital signature is legally binding.',
    loading: 'Loading LINE LIFF...',
    submitting: '⏳ Saving...',
    submit: '✅ Confirm and Sign',
    secured: '🔒 Encrypted and secured by PrimeRent',
    success_title: 'Signed Successfully!',
    success_close: 'Window will close in 3 seconds...',
    error_signed: 'Please draw your signature before confirming',
    error_agree: 'Please accept terms and conditions first',
    error_api: 'An error occurred. Please try again.',
    signed_by: 'Signer (LINE profile)',
    contract_details: '📄 Contract Terms',
  },
  cn: {
    property: '🏠 房产',
    monthlyRent: '💰 月租金',
    deposit: '💳 押金',
    startDate: '📅 开始日期',
    endDate: '📅 结束日期',
    loading: '正在加载合同数据...',
    contract_details: '📄 合同摘要',
  }
};

const getMockContract = (id: string, lang: string): ContractSummary => {
  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  return {
    id,
    propertyName: isTh 
      ? `คอนโดสุขุมวิท 101 ชั้น 12 ห้อง 1204` 
      : isCn ? `素坤逸 101 公寓 12 楼 1204 室` : `Sukhumvit 101 Condo, 12th Floor, Unit 1204`,
    monthlyRent: 18000,
    deposit: 36000,
    startDate: isTh ? '1 ก.ค. 2569' : isCn ? '2026年7月1日' : 'Jul 1, 2026',
    endDate: isTh ? '30 มิ.ย. 2570' : isCn ? '2027年6月30日' : 'Jun 30, 2027',
    tenantName: isTh ? 'นาย ณัฐพล ใจสู้' : isCn ? 'Nattapon Jaisoo' : 'Nattapon Jaisoo',
    landlordName: isTh ? 'นาย สมชาย ใจดี' : isCn ? 'Somchai Jaidee' : 'Somchai Jaidee',
    agentName: isTh ? 'PrimeRent Agent' : isCn ? 'PrimeRent Agent' : 'PrimeRent Agent',
    addendums: {
      furniture: [
        { item: 'Sofa', penaltyPrice: 5000 },
        { item: 'TV', penaltyPrice: 12000 }
      ],
      others: [
        { title: 'ข้อตกลงพิเศษ', content: 'ห้ามเจาะผนังเพิ่มเติม' }
      ]
    },
    status: 'completed'
  };
};

function LiffSignContent() {
  const searchParams = useSearchParams();
  const contractId = searchParams.get('contractId') || 'demo-001';
  const langQuery = searchParams.get('lang') || 'th';
  const lang = (langQuery === 'cn' || langQuery === 'en' || langQuery === 'th') ? langQuery : 'th';
  // role: 'tenant' | 'owner' | 'agent' — determines if edit button is shown
  const role = searchParams.get('role') || 'tenant';
  const canEdit = role === 'owner' || role === 'agent';
  
  const t = localLabels[lang];

  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [liffReady, setLiffReady] = useState(false);
  const [contractData, setContractData] = useState<ContractSummary | null>(null);
  const [viewPdf, setViewPdf] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  // Editable fields
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editRent, setEditRent] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editFurniture, setEditFurniture] = useState<Array<{ item: string; penaltyPrice: number }>>([]);
  const [editSaved, setEditSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize LIFF and load Contract
  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (typeof window === 'undefined') return;

    const initLiff = async () => {
      try {
        const liff = (window as any).liff;
        if (!liff) {
          setProfile({ userId: 'dev-user', displayName: 'Dev User (Mock)' });
          setLiffReady(true);
          return;
        }

        if (liffId) {
          await liff.init({ liffId });
          if (!liff.isLoggedIn()) {
            liff.login();
            return;
          }
          const p = await liff.getProfile();
          setProfile({ userId: p.userId, displayName: p.displayName, pictureUrl: p.pictureUrl });
        } else {
          setProfile({ userId: 'dev-user', displayName: 'Dev User (Mock)' });
        }
        setLiffReady(true);
      } catch (e) {
        console.error('[liff-sign] Init error:', e);
        setProfile({ userId: 'dev-user', displayName: 'Dev User (Mock)' });
        setLiffReady(true);
      }
    };

    const fetchContract = async () => {
      try {
        // Try localStorage
        const stored = localStorage.getItem('contracts');
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find((c: any) => c.id === contractId);
          if (found) {
            setContractData({
              id: found.id,
              propertyName: found.propertyName || found.title || 'คอนโดสุขุมวิท 101 ชั้น 12 ห้อง 1204',
              monthlyRent: Number(found.monthlyRent) || 18000,
              deposit: Number(found.deposit) || 36000,
              startDate: found.startDate || '1 ก.ค. 2569',
              endDate: found.endDate || '30 มิ.ย. 2570',
              tenantName: found.tenantName || 'นาย ณัฐพล ใจสู้',
              landlordName: found.landlordName || found.ownerName || 'นาย สมชาย ใจดี',
              agentName: found.agentName || 'PrimeRent Agent',
            });
            return;
          }
        }

        // Try Firestore
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/firebase/config');
        const docRef = doc(db, 'contracts', contractId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setContractData({
            id: snap.id,
            propertyName: data.propertyName || 'คอนโดสุขุมวิท 101 ชั้น 12 ห้อง 1204',
            monthlyRent: Number(data.monthlyRent) || 18000,
            deposit: Number(data.deposit) || 36000,
            startDate: data.startDate || '1 ก.ค. 2569',
            endDate: data.endDate || '30 มิ.ย. 2570',
            tenantName: data.tenantName || 'นาย ณัฐพล ใจสู้',
            landlordName: data.landlordName || 'นาย สมชาย ใจดี',
            agentName: data.agentName || 'PrimeRent Agent',
          });
          return;
        }
      } catch (err) {
        console.error('Error loading contract:', err);
      }

      // Fallback
      setContractData(getMockContract(contractId, lang));
    };

    fetchContract();
    const timer = setTimeout(initLiff, 800);
    return () => clearTimeout(timer);
  }, [contractId, lang]);

  // ─── Loading State ────────────────────────────────────────────────────────────
  if (!liffReady || !contractData) {
    return (
      <div className="max-w-md mx-auto p-4 pb-10 flex flex-col items-center justify-center min-h-screen bg-gray-50/50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
        <p className="text-gray-400 mt-4 text-xs font-bold uppercase tracking-widest">{t.loading}</p>
      </div>
    );
  }

  // ─── Full-screen PDF Mockup Viewer overlay ────────────────────────────────────
  if (viewPdf) {
    return (
      <div className="fixed inset-0 bg-slate-900/95 z-50 overflow-y-auto p-4 md:p-6 font-thai flex flex-col animate-in fade-in duration-200">
        {/* PDF Top Bar */}
        <div className="max-w-2xl w-full mx-auto bg-slate-800 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-xs font-mono">contract_{contractId}.pdf</span>
          </div>
          <button 
            onClick={() => setViewPdf(false)}
            className="px-3.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-black transition-all"
          >
            ปิดตัวอย่าง
          </button>
        </div>

        {/* PDF Paper Content */}
        <div className="max-w-2xl w-full mx-auto bg-white text-slate-800 p-6 md:p-12 shadow-2xl flex-1 rounded-b-xl space-y-6 select-none font-sans text-xs md:text-sm border-t border-slate-100 leading-relaxed">
          <div className="text-center space-y-1.5 border-b border-slate-100 pb-5">
            <h1 className="text-lg md:text-xl font-black uppercase tracking-wide text-slate-950">หนังสือสัญญาเช่าที่พักอาศัย</h1>
            <p className="text-[10px] md:text-xs text-slate-500 font-bold tracking-wider">ทำขึ้น ณ แพลตฟอร์ม PrimeRent (สัญญาเช่าฉบับสมบูรณ์)</p>
          </div>

          <div className="space-y-5 font-medium text-slate-700">
            <p className="indent-8 leading-relaxed">
              สัญญาฉบับนี้ทำขึ้นเมื่อวันที่ <span className="font-black text-slate-900 underline underline-offset-4 px-1">{new Date().toLocaleDateString('th-TH')}</span> 
              ระหว่าง <span className="font-black text-slate-900 underline underline-offset-4 px-1">{contractData.landlordName}</span> (ซึ่งต่อไปในสัญญานี้จะเรียกว่า "ผู้ให้เช่า") ฝ่ายหนึ่ง กับ 
              <span className="font-black text-slate-900 underline underline-offset-4 px-1">{contractData.tenantName}</span> (ซึ่งต่อไปในสัญญานี้จะเรียกว่า "ผู้เช่า") อีกฝ่ายหนึ่ง โดยมี 
              <span className="font-black text-slate-900 underline underline-offset-4 px-1">{contractData.agentName || 'PrimeRent Agent'}</span> เป็นตัวแทนและพยานผู้ประสานงานร่วมดูแล
            </p>

            <p className="indent-8 leading-relaxed">
              ทั้งสองฝ่ายตกลงทำสัญญาเช่าทรัพย์สินประเภทห้องพัก โครงการ <span className="font-black text-slate-900 px-1">{contractData.propertyName}</span> โดยมีเงื่อนไขรายละเอียดดังนี้:
            </p>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-3 my-4">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600 font-bold">อัตราค่าเช่ารายเดือน:</span>
                <span className="font-black text-slate-900">฿{contractData.monthlyRent.toLocaleString()} บาท / เดือน</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600 font-bold">เงินประกันความเสียหาย (มัดจำ):</span>
                <span className="font-black text-slate-900">฿{contractData.deposit.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600 font-bold">ระยะเวลาเช่าเริ่มต้น:</span>
                <span className="font-black text-slate-900">{contractData.startDate}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-600 font-bold">ระยะเวลาเช่าสิ้นสุด:</span>
                <span className="font-black text-slate-900">{contractData.endDate}</span>
              </div>
            </div>

            <div className="space-y-3 text-slate-600 text-[12px] md:text-sm">
              <p className="font-black text-slate-900">ข้อตกลงและหน้าที่เพิ่มเติม:</p>
              <ul className="list-decimal pl-5 space-y-2">
                <li>ผู้เช่าตกลงชำระเงินค่าเช่าล่วงหน้าภายในวันที่ 5 ของทุกเดือน หากชำระล่าช้าปรับวันละ 100 บาท</li>
                <li>ผู้เช่าตกลงรับผิดชอบชำระค่าสาธารณูปโภค ค่าน้ำ ค่าไฟ ตามหน่วยอัตราจริงของการใช้งาน</li>
                <li>เมื่อสิ้นสุดสัญญาเช่าโดยไม่มีการต่ออายุ ผู้ให้เช่าตกลงคืนเงินมัดจำประกันความเสียหายแก่ผู้เช่าเต็มจำนวนหลังหักค่าชำระความเสียหายและค้างจ่ายแล้ว</li>
              </ul>
            </div>

            <div className="mt-8 border-t-2 border-dashed border-slate-200 pt-6">
              <h4 className="font-black text-sm md:text-base mb-2 text-slate-900">เอกสารแนบท้าย 1: รายการเฟอร์นิเจอร์และประเมินค่าเสียหาย</h4>
              <p className="text-xs text-slate-500 mb-4">รายละเอียดทรัพย์สินภายในห้องพัก หากเกิดความเสียหายผู้เช่ายินยอมชดใช้ตามมูลค่าที่ระบุด้านล่าง</p>
              <div className="space-y-1.5 md:space-y-2 max-w-md mx-auto">
                {contractData.attachments && contractData.attachments.length > 0 ? contractData.attachments.map((att: any, i: number) => (
                  <div key={att.id || i} className="flex items-center gap-1 md:gap-2 mb-1.5 group relative">
                    <span className="w-3 md:w-4 text-right text-gray-500 font-bold !text-[10px] shrink-0" style={{ fontSize: '10px' }}>{i + 1}.</span>
                    <span className="flex-[2] font-normal text-gray-800 !text-[10px] pl-1" style={{ fontSize: '10px' }}>{att.title}</span>
                    <div className="flex-1 border-b-2 border-dotted border-gray-400 mx-1 md:mx-2 opacity-50 shrink-0" />
                    <span className="font-bold text-amber-700 !text-[10px] pr-1" style={{ fontSize: '10px' }}>{Number(att.content || 0).toLocaleString()}</span>
                    <span className="text-gray-700 font-bold !text-[10px] w-6 md:w-8 shrink-0" style={{ fontSize: '10px' }}>บาท</span>
                  </div>
                )) : contractData.addendums?.furniture?.length ? contractData.addendums.furniture.map((f: any, i: number) => (
                  <div key={i} className="flex items-center gap-1 md:gap-2 mb-1.5 group relative">
                    <span className="w-3 md:w-4 text-right text-gray-500 font-bold !text-[10px] shrink-0" style={{ fontSize: '10px' }}>{i + 1}.</span>
                    <span className="flex-[2] font-normal text-gray-800 !text-[10px] pl-1" style={{ fontSize: '10px' }}>{f.item}</span>
                    <div className="flex-1 border-b-2 border-dotted border-gray-400 mx-1 md:mx-2 opacity-50 shrink-0" />
                    <span className="font-bold text-amber-700 !text-[10px] pr-1" style={{ fontSize: '10px' }}>{Number(f.penaltyPrice || 0).toLocaleString()}</span>
                    <span className="text-gray-700 font-bold !text-[10px] w-6 md:w-8 shrink-0" style={{ fontSize: '10px' }}>บาท</span>
                  </div>
                )) : (
                  <p className="!text-[10px] text-slate-400 italic text-center py-2" style={{ fontSize: '10px' }}>ไม่มีรายการเฟอร์นิเจอร์</p>
                )}
              </div>
            </div>
            
            <div className="mt-8 border-t-2 border-dashed border-slate-200 pt-6">
              <h4 className="font-black text-sm md:text-base mb-3 text-slate-900">เอกสารแนบท้าย 2: ข้อตกลงเพิ่มเติม</h4>
              <div className="space-y-3 text-slate-600 text-[12px] md:text-sm">
                {contractData.addendums?.others?.map((o, i) => (
                  <div key={i}>
                    <p className="font-black text-slate-900">{o.title}</p>
                    <p className="indent-4">{o.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100 my-6" />

          {/* Signature Grid */}
          <div className="grid grid-cols-3 gap-6 pt-4 text-center">
            <div className="space-y-2.5">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">ลงชื่อ ผู้ให้เช่า (Landlord)</span>
              <div className="h-16 flex items-center justify-center border border-dashed border-emerald-200 bg-emerald-50/20 rounded-lg p-2 relative overflow-hidden">
                <div className="font-black text-sky-800 text-sm italic tracking-tight font-serif rotate-[-6deg]">Somchai.J</div>
                <div className="absolute bottom-1 right-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1 scale-90">VERIFIED</div>
              </div>
              <p className="text-xs font-black text-slate-700 truncate">{contractData.landlordName}</p>
              <p className="text-[9px] text-slate-400 font-bold">อนุมัติผ่านเว็บ (OTP Verified)</p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">ลงชื่อ ผู้เช่า (Tenant)</span>
              <div className="h-16 flex items-center justify-center border border-dashed border-emerald-200 bg-emerald-50/20 rounded-lg p-2 relative overflow-hidden">
                <div className="font-black text-emerald-800 text-sm italic tracking-tight font-serif rotate-[-4deg]">Nattapon.J</div>
                <div className="absolute bottom-1 right-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1 scale-90">VERIFIED</div>
              </div>
              <p className="text-xs font-black text-slate-700 truncate">{contractData.tenantName}</p>
              <p className="text-[9px] text-slate-400 font-bold">อนุมัติผ่านเว็บ (LINE Link)</p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">ลงชื่อ พยาน/ตัวแทน (Agent)</span>
              <div className="h-16 flex items-center justify-center border border-dashed border-emerald-200 bg-emerald-50/20 rounded-lg p-2 relative overflow-hidden">
                <div className="font-black text-[#E51D53] text-sm italic tracking-tight font-serif rotate-[-8deg]">PrimeRent.Auth</div>
                <div className="absolute bottom-1 right-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1 scale-90">VERIFIED</div>
              </div>
              <p className="text-xs font-black text-slate-700 truncate">{contractData.agentName || 'PrimeRent Agent'}</p>
              <p className="text-[9px] text-slate-400 font-bold">ลงนามดิจิทัล (System Sign)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Completed Contract Main View ─────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto p-4 md:p-6 pb-10 flex flex-col gap-5 min-h-screen bg-gray-50/50 font-thai animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex items-center gap-4 bg-[#10B981] text-white rounded-none p-6 shadow-lg shadow-emerald-500/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] -mr-16 -mt-16 rounded-full" />
        <div className="w-12 h-12 bg-white/10 rounded-none flex items-center justify-center text-white shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div className="z-10">
          <div className="font-black text-lg tracking-tight">
            {contractData.status === 'pending_signatures' ? '⏳ รอการลงนามสัญญา' : '📄 สัญญาเช่าฉบับสมบูรณ์'}
          </div>
          <div className="text-[10px] text-white/70 font-bold uppercase tracking-wider">
            {contractData.status === 'pending_signatures' ? 'Pending Signatures' : 'PrimeRent Executed Document'}
          </div>
        </div>
      </div>

      {/* Contract Executed Badge */}
      <div className={cn("flex items-center gap-3.5 border rounded-none p-4 shadow-sm", contractData.status === 'pending_signatures' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100')}>
        <div className={cn("w-8 h-8 text-white rounded-full flex items-center justify-center shadow-sm shrink-0", contractData.status === 'pending_signatures' ? 'bg-amber-500' : 'bg-emerald-500')}>
          {contractData.status === 'pending_signatures' ? <AlertCircle className="w-4.5 h-4.5" /> : <Check className="w-4.5 h-4.5" />}
        </div>
        <div>
          <div className={cn("font-black text-sm", contractData.status === 'pending_signatures' ? 'text-amber-800' : 'text-emerald-800')}>
            {contractData.status === 'pending_signatures' ? 'รอการตรวจสอบและลงนามใหม่' : 'อนุมัติ & เซ็นครบทุกฝ่ายแล้ว'}
          </div>
          <div className={cn("text-[10px] font-bold mt-0.5", contractData.status === 'pending_signatures' ? 'text-amber-600' : 'text-emerald-600')}>
            {contractData.status === 'pending_signatures' ? 'สัญญามีการแก้ไข กรุณาลงนามใหม่เพื่อให้สัญญาทำงาน' : 'สัญญาเช่ามีผลทางกฎหมายเรียบร้อยแล้ว'}
          </div>
        </div>
      </div>

      {/* Contract Information Summary Card */}
      <div className="bg-white rounded-none p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="font-black text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-3">
          📋 รายละเอียดข้อตกลงสัญญา
        </div>
        <div className="space-y-3.5">
          {[
            ['🏠 ที่พักอาศัย', contractData.propertyName],
            ['💰 ค่าเช่ารายเดือน', `฿${contractData.monthlyRent.toLocaleString()} / เดือน`],
            ['💳 เงินประกันค้ำเสียหาย', `฿${contractData.deposit.toLocaleString()}`],
            ['📅 เริ่มสัญญาเช่า', contractData.startDate],
            ['📅 สิ้นสุดสัญญาเช่า', contractData.endDate],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-start gap-4 text-xs font-bold">
              <span className="text-gray-400 shrink-0">{label}</span>
              <span className="text-gray-900 text-right font-black">{value}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Signers Status Verification Cards */}
      <div className="bg-white rounded-none p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="font-black text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-3">
          ✍️ ประวัติการลงนามของทุกฝ่าย
        </div>
        <div className="space-y-3">
          {/* Owner Signer */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center text-xs font-black border border-sky-100">👤</div>
              <div>
                <p className="text-xs font-black text-slate-800">{contractData.landlordName}</p>
                <p className="text-[9px] text-slate-400 font-bold">ผู้ให้เช่า (Landlord)</p>
              </div>
            </div>
            {contractData.status === 'completed' ? (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-black bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5 animate-pulse">
                <Check className="w-3 h-3" /> เซ็นแล้ว
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-black bg-amber-50 border border-amber-100 rounded-full px-2.5 py-0.5">
                <AlertCircle className="w-3 h-3" /> ยังไม่เซ็น
              </div>
            )}
          </div>

          {/* Tenant Signer */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-black border border-emerald-100">👥</div>
              <div>
                <p className="text-xs font-black text-slate-800">{contractData.tenantName}</p>
                <p className="text-[9px] text-slate-400 font-bold">ผู้เช่า (Tenant)</p>
              </div>
            </div>
            {contractData.status === 'completed' ? (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-black bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5 animate-pulse">
                <Check className="w-3 h-3" /> เซ็นแล้ว
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-black bg-amber-50 border border-amber-100 rounded-full px-2.5 py-0.5">
                <AlertCircle className="w-3 h-3" /> ยังไม่เซ็น
              </div>
            )}
          </div>

          {/* Agent Signer */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E51D53]/5 text-[#E51D53] flex items-center justify-center text-sm font-black border border-[#E51D53]/10">🤝</div>
              <div>
                <p className="text-xs font-black text-slate-800">{contractData.agentName || 'PrimeRent Agent'}</p>
                <p className="text-[9px] text-slate-400 font-bold">ตัวแทน/พยาน (Agent)</p>
              </div>
            </div>
            {contractData.status === 'completed' ? (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-black bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5 animate-pulse">
                <Check className="w-3 h-3" /> เซ็นแล้ว
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-black bg-amber-50 border border-amber-100 rounded-full px-2.5 py-0.5">
                <AlertCircle className="w-3 h-3" /> ยังไม่เซ็น
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PDF View Large Action Button */}
      <button
        onClick={() => setViewPdf(true)}
        className="w-full h-14 bg-[#10B981] hover:bg-[#0d9668] text-white rounded-none text-sm font-black transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
      >
        <FileText className="w-5 h-5 text-emerald-200" />
        เปิดดูสัญญาเช่าฉบับเต็ม (PDF)
      </button>

      {/* Edit Button — Agent / Owner only */}
      {canEdit && (
        <button
          onClick={() => {
            setEditStartDate(contractData?.startDate || '');
            setEditEndDate(contractData?.endDate || '');
            setEditRent(contractData?.monthlyRent?.toString() || '');
            setEditNotes('');
            setEditFurniture(contractData?.addendums?.furniture || []);
            setEditSaved(false);
            setShowEditModal(true);
          }}
          className="w-full h-12 border-2 border-slate-200 hover:border-slate-400 text-slate-700 hover:text-slate-900 rounded-none text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer bg-white"
        >
          <Pencil className="w-4 h-4" />
          แก้ไขข้อมูลสัญญา
        </button>
      )}

      <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
        🔒 เอกสารนี้เป็นความลับและจัดเก็บอย่างปลอดภัยโดย PrimeRent
      </p>

      {/* ─── Edit Contract Modal ─────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-900">แก้ไขข้อมูลสัญญา</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">สำหรับ Agent / Owner เท่านั้น</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {editSaved && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-xs font-bold text-emerald-700">บันทึกข้อมูลสำเร็จแล้ว!</p>
              </div>
            )}

            {/* Start Date Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">📅 วันที่เริ่มสัญญา (วันเข้า)</label>
              <input
                type="text"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                placeholder="เช่น 1 ก.ค. 2569"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 transition-colors"
              />
            </div>

            {/* End Date Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">📅 วันสิ้นสุดสัญญา (วันออก)</label>
              <input
                type="text"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
                placeholder="เช่น 30 มิ.ย. 2571"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 transition-colors"
              />
            </div>

            {/* Monthly Rent Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">💰 ค่าเช่ารายเดือน (บาท)</label>
              <input
                type="number"
                value={editRent}
                onChange={(e) => setEditRent(e.target.value)}
                placeholder="เช่น 18000"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 transition-colors"
              />
            </div>

            {/* Notes Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">📝 หมายเหตุ</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="เพิ่มหมายเหตุหรือข้อตกลงเพิ่มเติม..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] bg-slate-50 transition-colors resize-none"
              />
            </div>

            {/* Edit Addendums (Furniture) */}
            <div className="space-y-2 border-t border-slate-100 pt-4 mt-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex justify-between items-center">
                <span>เอกสารแนบ: เฟอร์นิเจอร์</span>
                <button
                  onClick={() => setEditFurniture([...editFurniture, { item: '', penaltyPrice: 0 }])}
                  className="text-[#10B981] bg-emerald-50 px-2 py-1 rounded-md text-[10px]"
                >
                  + เพิ่มรายการ
                </button>
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {editFurniture.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={f.item}
                      onChange={(e) => {
                        const newF = [...editFurniture];
                        newF[i].item = e.target.value;
                        setEditFurniture(newF);
                      }}
                      placeholder="รายการ"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#10B981]"
                    />
                    <input
                      type="number"
                      value={f.penaltyPrice || ''}
                      onChange={(e) => {
                        const newF = [...editFurniture];
                        newF[i].penaltyPrice = Number(e.target.value);
                        setEditFurniture(newF);
                      }}
                      placeholder="ราคาชดใช้"
                      className="w-24 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#10B981]"
                    />
                    <button
                      onClick={() => {
                        const newF = [...editFurniture];
                        newF.splice(i, 1);
                        setEditFurniture(newF);
                      }}
                      className="text-red-500 font-black px-2"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              disabled={isUpdating}
              onClick={async () => {
                setIsUpdating(true);
                try {
                  const payload = {
                    contractId,
                    startDate: editStartDate,
                    endDate: editEndDate,
                    monthlyRent: editRent,
                    addendums: {
                      furniture: editFurniture,
                      others: contractData?.addendums?.others || []
                    },
                    updatedByRole: role,
                    updatedByUid: profile?.userId || 'unknown'
                  };
                  
                  const res = await fetch('/api/contract/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  
                  if (res.ok) {
                    if (contractData) {
                      setContractData({
                        ...contractData,
                        startDate: editStartDate || contractData.startDate,
                        endDate: editEndDate || contractData.endDate,
                        monthlyRent: editRent ? Number(editRent) : contractData.monthlyRent,
                        addendums: payload.addendums,
                        status: 'pending_signatures' // Reset UI state explicitly
                      });
                    }
                    setEditSaved(true);
                    
                    // Show a fake LINE alert since we don't have real app loaded
                    alert('ข้อความแจ้งเตือนถูกส่งผ่าน LINE ไปยังทุกฝ่ายเรียบร้อยแล้ว: "สัญญาถูกแก้ไข กรุณาเข้ามาลงนามใหม่"');
                    
                    setTimeout(() => setShowEditModal(false), 2000);
                  } else {
                    alert('เกิดข้อผิดพลาดในการอัปเดตสัญญา');
                  }
                } catch (e) {
                  console.error(e);
                  alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
                } finally {
                  setIsUpdating(false);
                }
              }}
              className="w-full h-13 bg-[#10B981] hover:bg-[#0d9668] disabled:opacity-50 text-white rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 py-4 mt-2"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? 'กำลังบันทึก...' : 'บันทึกการแก้ไขและรีเซ็ตลายเซ็น'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiffSignPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto p-4 pb-10 flex flex-col items-center justify-center min-h-screen bg-gray-50/50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
        <p className="text-gray-400 mt-4 text-xs font-bold uppercase tracking-widest">Loading LINE LIFF...</p>
      </div>
    }>
      <LiffSignContent />
    </Suspense>
  );
}
