'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, RotateCcw } from 'lucide-react';
import type { UserRole } from '@/lib/types';
import { Contract, ContractStatus, DEFAULT_MOCK_CONTRACTS, CONTRACTS_STORAGE_KEY } from './constants';
import { ContractManager } from './ContractManager';

const STATUS_LABEL: Record<ContractStatus, string> = {
  draft: 'ร่าง', pending_signatures: 'รอลายเซ็น', completed: 'สมบูรณ์', expired: 'หมดอายุ',
};
const STATUS_COLOR: Record<ContractStatus, string> = {
  draft: 'bg-gray-100 text-gray-500',
  pending_signatures: 'bg-amber-50 text-amber-700',
  completed: 'bg-green-50 text-green-700',
  expired: 'bg-red-50 text-red-500',
};

function loadContracts(): Contract[] {
  try { const r = localStorage.getItem(CONTRACTS_STORAGE_KEY); return r ? JSON.parse(r) : DEFAULT_MOCK_CONTRACTS; }
  catch { return DEFAULT_MOCK_CONTRACTS; }
}
function saveContracts(c: Contract[]) { localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(c)); }

function ContractCard({ c, onClick }: { c: Contract; onClick: () => void }) {
  const sigCount = Object.values(c.signatures).filter(Boolean).length;
  return (
    <button onClick={onClick} className="w-full text-left p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-gray-900 text-sm truncate group-hover:text-blue-700 transition-colors">{c.propertyName}</h4>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{c.propertyAddress}</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">{c.startDate} – {c.endDate}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${STATUS_COLOR[c.status]}`}>
            {STATUS_LABEL[c.status]}
          </span>
          <span className="text-[10px] text-gray-400 font-bold">ลายเซ็น {sigCount}/2</span>
        </div>
      </div>
    </button>
  );
}

export function TabContracts({ userRole }: { userRole: UserRole }) {
  const [contracts, setContracts] = useState<Contract[]>(DEFAULT_MOCK_CONTRACTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTabMode, setActiveTabMode] = useState<'contracts' | 'drafts'>('contracts');

  useEffect(() => { setContracts(loadContracts()); }, []);

  const selected = contracts.find(c => c.id === selectedId) ?? null;

  const handleUpdate = (updated: Contract) => {
    const next = contracts.map(c => c.id === updated.id ? updated : c);
    setContracts(next); saveContracts(next);
  };

  const handleAddNew = (templateType?: string) => {
    const title = templateType || 'ทรัพย์สินใหม่ (แบบร่างสัญญา Manual)';
    const newC: Contract = {
      id: `cnt-${Date.now()}`,
      propertyName: title, propertyAddress: 'กรุณาระบุที่อยู่ห้องพักที่ทำสัญญา',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      rentAmount: 12000, deposit: 24000,
      ownerName: userRole === 'owner' ? 'คุณ (เจ้าของห้อง)' : 'เจ้าของที่พัก', 
      tenantName: 'ผู้เช่า (รอระบุชื่อ)',
      status: 'draft', signatures: {},
    };
    const next = [newC, ...contracts];
    setContracts(next); saveContracts(next); setSelectedId(newC.id);
  };

  const handleReset = () => {
    localStorage.removeItem(CONTRACTS_STORAGE_KEY);
    setContracts(DEFAULT_MOCK_CONTRACTS);
    setSelectedId(null);
  };

  if (selected) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-6">
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> กลับไปหน้ารวมสัญญา
          </button>
        </div>
        <ContractManager contract={selected} userRole={userRole} onUpdate={handleUpdate} />
      </div>
    );
  }

  const draftTemplates = [
    { title: 'แบบร่างสัญญาเช่าที่พักอาศัยมาตรฐาน (Standard Residential Lease)', desc: 'เอกสารร่างสัญญาเช่า 1 ปี ครบถ้วนข้อกำหนดเงินมัดจำและการดูแลรักษา', badge: 'แนะนำ' },
    { title: 'แบบร่างหนังสือสัญญาจองและรับเงินมัดจำ (Reservation & Deposit Receipt)', desc: 'เอกสารร่างสำหรับวางเงินมัดจำล่วงหน้าเพื่อล็อคห้องพักก่อนทำสัญญาจริง', badge: 'มัดจำ' },
    { title: 'แบบร่างหนังสือข้อตกลงต่ออายุสัญญาเช่า (Lease Extension Draft)', desc: 'แบบร่างเอกสารยินยอมต่ออายุสัญญาเช่าปรับปรุงอัตราค่าเช่าใหม่', badge: 'ต่ออายุ' }
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-black text-gray-900 text-lg">ระบบจัดการสัญญา & แบบร่างสัญญา</h3>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">สร้างและแก้ไขร่างเอกสารสัญญาแบบ Manual หรือดำเนินการลงนามอิเล็กทรอนิกส์</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={handleReset} title="[DEV TEST] ล้างข้อมูลและโหลด Mock ใหม่"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-xl transition-all">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
          </button>
          <button onClick={() => handleAddNew()}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" /> สร้างร่างสัญญาใหม่
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTabMode('contracts')}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${activeTabMode === 'contracts' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
        >
          📄 สัญญาของคุณ ({contracts.length})
        </button>
        <button 
          onClick={() => setActiveTabMode('drafts')}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${activeTabMode === 'drafts' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
        >
          📝 แบบร่างสัญญา Manual (Templates)
        </button>
      </div>

      {activeTabMode === 'contracts' ? (
        contracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 border border-dashed border-gray-200 rounded-2xl text-gray-400">
            <p className="text-sm font-bold">ยังไม่มีสัญญา</p>
            <p className="text-xs mt-1">กด "สร้างร่างสัญญาใหม่" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map(c => <ContractCard key={c.id} c={c} onClick={() => setSelectedId(c.id)} />)}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {draftTemplates.map((tpl, i) => (
            <div key={i} className="bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all">
              <div className="space-y-2">
                <span className="text-[9px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100 uppercase">{tpl.badge}</span>
                <h4 className="font-black text-gray-900 text-xs leading-snug">{tpl.title}</h4>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{tpl.desc}</p>
              </div>
              <button 
                onClick={() => handleAddNew(tpl.title)}
                className="w-full text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                📝 ใช้แบบร่างนี้ทำสัญญา
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
