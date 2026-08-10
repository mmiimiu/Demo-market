'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Pen,
  Download,
  RefreshCcw,
  CalendarDays,
  Building2,
  User,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  X,
  RotateCcw,
} from 'lucide-react';
import { Contract, ContractStatus, DEFAULT_MOCK_CONTRACTS, CONTRACTS_STORAGE_KEY } from '@/components/contract/ContractSystem/constants';
import { ContractSignatures } from '@/components/contract/ContractSystem/ContractSignatures';
import { ContractDocModal } from '@/components/contract/ContractSystem/ContractDocModal';
import type { Language } from '@/lib/types';

// --- helpers ---

function loadContracts(): Contract[] {
  try {
    const r = typeof window !== 'undefined' ? localStorage.getItem(CONTRACTS_STORAGE_KEY) : null;
    const list = r ? JSON.parse(r) as Contract[] : DEFAULT_MOCK_CONTRACTS;
    return list.map(c => c.id === 'cnt-103' ? { ...c, status: 'draft', signatures: {} } : c);
  } catch {
    return DEFAULT_MOCK_CONTRACTS.map(c => c.id === 'cnt-103' ? { ...c, status: 'draft', signatures: {} } : c);
  }
}

function daysLeft(endDate: string): number {
  const end = new Date(endDate).getTime();
  return Math.ceil((end - Date.now()) / 86_400_000);
}

function formatDateTH(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}


const STATUS_CONFIG: Record<ContractStatus, { label: string; color: string; icon: any }> = {
  completed:          { label: 'เช่าอยู่',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  pending_signatures: { label: 'รอลงนาม',     color: 'bg-amber-100  text-amber-700  border-amber-200',    icon: Clock        },
  draft:              { label: 'ฉบับร่าง',     color: 'bg-blue-100   text-blue-700   border-blue-200',     icon: FileText     },
  expired:            { label: 'หมดอายุแล้ว', color: 'bg-rose-100   text-rose-700   border-rose-200',     icon: XCircle      },
};

// --- Expiry pill ---

function ExpiryPill({ endDate }: { endDate: string }) {
  const days = daysLeft(endDate);
  if (days < 0) return (
    <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
      <XCircle className="w-3 h-3" /> หมดอายุแล้ว
    </span>
  );
  if (days <= 30) return (
    <span className="flex items-center gap-1 text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full animate-pulse">
      <AlertTriangle className="w-3 h-3" /> เหลืออีก {days} วัน
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] font-black text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
      <CalendarDays className="w-3 h-3" /> เหลืออีก {days} วัน
    </span>
  );
}

// --- Contract Card ---

function RenterContractCard({ c, onClick }: { c: Contract; onClick: () => void }) {
  const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  const needSign = c.status === 'pending_signatures' && !c.signatures?.tenant;

  return (
    <button onClick={onClick} className="w-full text-left bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md rounded-2xl p-4 md:p-5 transition-all group">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full border ${cfg.color}`}>
          <Icon className="w-3 h-3" />{cfg.label}
        </span>
        {(c.status === 'completed' || c.status === 'pending_signatures') && <ExpiryPill endDate={c.endDate} />}
        {needSign && (
          <span className="flex items-center gap-1 text-[10px] font-black text-white bg-blue-600 px-2.5 py-0.5 rounded-full animate-pulse">
            <Pen className="w-3 h-3" /> รอลายเซ็นคุณ
          </span>
        )}
      </div>
      <h4 className="font-black text-gray-900 text-sm md:text-base leading-snug group-hover:text-blue-600 transition-colors mb-1">{c.propertyName}</h4>
      <p className="text-xs text-gray-400 font-medium mb-3 truncate">📍 {c.propertyAddress}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-gray-600"><Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" /><span className="truncate">{c.unitNo || '-'}</span></div>
        <div className="flex items-center gap-1.5 text-gray-600"><User className="w-3.5 h-3.5 text-gray-400 shrink-0" /><span className="truncate">{c.ownerName}</span></div>
        <div className="flex items-center gap-1.5 text-gray-600"><Banknote className="w-3.5 h-3.5 text-gray-400 shrink-0" /><span className="font-black text-blue-700">฿{c.rentAmount.toLocaleString()}/ด.</span></div>
        <div className="flex items-center gap-1.5 text-gray-500"><CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" /><span className="truncate">{formatDateTH(c.startDate)} – {formatDateTH(c.endDate)}</span></div>
      </div>
      <div className="flex justify-end mt-3">
        <span className="text-[11px] font-black text-blue-500 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
          เปิดดูสัญญา <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}



// --- Contract Detail (read-only + sign) ---

function RenterContractDetail({
  contract,
  onBack,
  onUpdate,
}: {
  contract: Contract;
  onBack: () => void;
  onUpdate: (c: Contract) => void;
}) {
  const needSign   = contract.status === 'pending_signatures' && !contract.signatures?.tenant;
  const days       = daysLeft(contract.endDate);
  const canRenew   = days > 0 && days <= 30 && contract.status === 'completed';
  const [showDoc, setShowDoc] = useState(false);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {showDoc && <ContractDocModal contract={contract} onClose={() => setShowDoc(false)} />}
      <div className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black text-gray-700 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> กลับไปรายการสัญญา
        </button>
        <span className="text-[10px] font-bold text-gray-400">ID: {contract.id}</span>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-2xl p-5 md:p-6 shadow-lg">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${STATUS_CONFIG[contract.status].color}`}>{STATUS_CONFIG[contract.status].label}</span>
          {(contract.status === 'completed' || contract.status === 'pending_signatures') && <ExpiryPill endDate={contract.endDate} />}
        </div>
        <h3 className="text-lg font-black leading-snug">{contract.propertyName}</h3>
        <p className="text-xs text-gray-300 mt-1">📍 {contract.propertyAddress}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            { label: 'ห้อง',      value: contract.unitNo || '-' },
            { label: 'เจ้าของ',   value: contract.ownerName },
            { label: 'ค่าเช่า/ด.',value: `฿${contract.rentAmount.toLocaleString()}` },
            { label: 'เงินประกัน',value: `฿${contract.deposit.toLocaleString()}` },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{item.label}</p>
              <p className="text-sm font-black text-white mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-4 pt-4 flex flex-wrap gap-6 text-xs">
          <div><p className="text-[10px] text-gray-400 uppercase font-bold">วันเริ่มสัญญา</p><p className="font-black text-white">{formatDateTH(contract.startDate)}</p></div>
          <div><p className="text-[10px] text-gray-400 uppercase font-bold">วันสิ้นสุดสัญญา</p><p className="font-black text-white">{formatDateTH(contract.endDate)}</p></div>
        </div>
      </div>

      {needSign && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          สัญญานี้รอลายเซ็นของคุณอยู่ กรุณาลงนามด้านล่างเพื่อให้สัญญามีผลสมบูรณ์
        </div>
      )}
      {canRenew && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900 text-xs font-semibold">
          <RefreshCcw className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          สัญญาใกล้หมดอายุใน {days} วัน คุณสามารถขอต่อสัญญาได้แล้วตอนนี้
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {needSign && (
          <div className="w-full bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-xs font-black text-gray-700 mb-3 flex items-center gap-2">
              <Pen className="w-4 h-4 text-blue-600" /> ลงนามดิจิทัล (ผู้เช่า)
            </p>
            <ContractSignatures
              contract={contract}
              userRole="renter"
              onSigned={(role, dataUrl, name) => {
                const newSig = { signatureDataUrl: dataUrl, name, signedAt: new Date().toISOString() };
                const updatedSigs = { ...contract.signatures, [role]: newSig };
                const bothSigned = updatedSigs.owner && updatedSigs.tenant;
                onUpdate({ ...contract, signatures: updatedSigs, status: bothSigned ? 'completed' : 'pending_signatures' });
              }}
              onSignRemove={(role) => {
                const sigs = { ...contract.signatures };
                delete sigs[role];
                onUpdate({ ...contract, signatures: sigs });
              }}
            />
          </div>
        )}
        <button onClick={() => setShowDoc(true)} className="flex items-center gap-2 text-xs font-black text-gray-700 border border-gray-200 hover:border-blue-400 hover:text-blue-600 px-4 py-2.5 rounded-xl transition-all">
          <Download className="w-4 h-4" /> ดูเอกสาร / พิมพ์ PDF
        </button>
        {canRenew && (
          <button className="flex items-center gap-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-all shadow-sm">
            <RefreshCcw className="w-4 h-4" /> ขอต่อสัญญา
          </button>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
        <p className="text-xs font-black text-gray-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" /> สถานะลายเซ็น
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(['owner', 'tenant'] as const).map(party => {
            const sig = contract.signatures?.[party];
            return (
              <div key={party} className={`rounded-xl border p-3 text-xs font-bold ${sig ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-400'}`}>
                <p className="font-black text-[10px] uppercase tracking-wide mb-1">{party === 'owner' ? 'เจ้าของ' : 'ผู้เช่า (คุณ)'}</p>
                {sig ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-0.5" />
                    <p className="truncate">{sig.name}</p>
                    <p className="text-[10px] font-medium text-emerald-500 mt-0.5">{new Date(sig.signedAt).toLocaleDateString('th-TH')}</p>
                  </>
                ) : (
                  <p className="text-gray-400">ยังไม่ได้ลงนาม</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* [DEV] Reset signature for re-testing */}
      <div className="border border-dashed border-orange-300 bg-orange-50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-orange-600 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded-md uppercase tracking-wide">DEV</span>
          <span className="text-xs font-semibold text-orange-700">รีเซ็ตเพื่อทดสอบการลงนามใหม่</span>
        </div>
        <div className="flex gap-2">
          <button
            title="ล้างลายเซ็นผู้เช่าของสัญญานี้"
            onClick={() => {
              const sigs = { ...contract.signatures };
              delete sigs.tenant;
              onUpdate({ ...contract, signatures: sigs, status: 'pending_signatures' });
            }}
            className="flex items-center gap-1.5 text-[11px] font-black text-orange-700 border border-orange-300 bg-white hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-all"
          >
            <RotateCcw className="w-3 h-3" /> ล้างลายเซ็นผู้เช่า
          </button>
          <button
            title="[DEV] ล้าง localStorage ทั้งหมดแล้วโหลด mock ใหม่"
            onClick={() => {
              if (typeof window !== 'undefined') localStorage.removeItem(CONTRACTS_STORAGE_KEY);
              window.location.reload();
            }}
            className="flex items-center gap-1.5 text-[11px] font-black text-red-600 border border-red-300 bg-white hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
          >
            <RotateCcw className="w-3 h-3" /> Reset ทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main export ---

export function RenterContractsTab({ currentUser, lang }: { currentUser: any; lang: Language }) {
  const [contracts, setContracts] = useState<Contract[]>(DEFAULT_MOCK_CONTRACTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { setContracts(loadContracts()); }, []);

  const handleUpdate = (updated: Contract) => {
    const next = contracts.map(c => c.id === updated.id ? updated : c);
    setContracts(next);
    if (typeof window !== 'undefined') localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(next));
  };

  // ดึงชื่อจริงของผู้ใช้ปัจจุบัน เพื่อคัดกรองสัญญาเฉพาะของตัวเอง
  const resolvedRenterName = (() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('prime_mock_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.displayName) return parsed.displayName;
        }
      } catch { /* ignore */ }
    }
    return currentUser?.displayName || 'นาย ณัฐพล ใจสู้';
  })();

  // กรองสำหรับการแสดงผลในหน้าผู้เช่า (Renter):
  // 1. ผู้เช่าจะไม่มีสิทธิ์เห็นสัญญาฉบับร่าง (Draft)
  // 2. ดึงเฉพาะสัญญาที่มีชื่อตรงกับตัวผู้เช่าเอง หากไม่พบให้ดึงตัวอย่าง (1 ใบที่เช่าอยู่ และ 1 ใบที่รอลายเซ็น) มาแสดงเพื่อให้มีเคสสำหรับทดสอบเสมอ
  const myContracts = (() => {
    const nonDrafts = contracts.filter(c => c.status !== 'draft');
    const matched = nonDrafts.filter(c => c.tenantName === resolvedRenterName);
    return matched.length > 0 ? matched : nonDrafts.filter(c => c.id === 'cnt-101' || c.id === 'cnt-102');
  })();

  const selected = myContracts.find(c => c.id === selectedId) ?? null;

  if (selected) return <RenterContractDetail contract={selected} onBack={() => setSelectedId(null)} onUpdate={handleUpdate} />;

  const isTh = lang === 'th';

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-2xl px-5 py-5 shadow-md">
        <p className="text-[10px] font-black tracking-widest uppercase text-blue-300 mb-1">
          {isTh ? 'สัญญาเช่าของฉัน' : 'My Contracts'}
        </p>
        <h3 className="text-lg font-black">
          {isTh ? 'สัญญาเช่าที่พักอาศัย' : 'Residential Lease Portal'}
        </h3>
        <p className="text-xs text-blue-200 font-medium mt-1">
          {isTh ? 'ดูรายละเอียด ลงนาม และติดตามสถานะสัญญาเช่าของคุณ' : 'Review details, sign, and monitor your active rental contracts.'}
        </p>
      </div>

      {myContracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 md:p-12 border border-dashed border-gray-200 bg-gray-50/50 rounded-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-black text-gray-800 mb-1">
            {isTh ? 'ไม่มีเอกสารสัญญาเช่าของคุณ' : 'No Rental Contracts Found'}
          </h4>
          <p className="text-xs text-gray-500 font-medium max-w-sm leading-relaxed mb-6">
            {isTh 
              ? `คุณ (${resolvedRenterName}) ยังไม่มีเอกสารสัญญาเช่าที่บันทึกในขณะนี้ หากตกลงเช่าห้องพักแล้ว กรุณาแจ้งให้เอเจ้นท์หรือเจ้าของห้องส่งสัญญาเช่ามาให้คุณ` 
              : `You (${resolvedRenterName}) do not have any lease agreements registered. Ask your owner or agent to send the contract link.`}
          </p>
          <a
            href="/search"
            className="flex items-center gap-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            🔍 {isTh ? 'ไปค้นหาที่พักอาศัย' : 'Search Properties'}
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {myContracts.map(c => <RenterContractCard key={c.id} c={c} onClick={() => setSelectedId(c.id)} />)}
        </div>
      )}
    </div>
  );
}

