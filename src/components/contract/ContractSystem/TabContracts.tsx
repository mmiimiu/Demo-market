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

  useEffect(() => { setContracts(loadContracts()); }, []);

  const selected = contracts.find(c => c.id === selectedId) ?? null;

  const handleUpdate = (updated: Contract) => {
    const next = contracts.map(c => c.id === updated.id ? updated : c);
    setContracts(next); saveContracts(next);
  };

  const handleAddNew = () => {
    const newC: Contract = {
      id: `cnt-${Date.now()}`,
      propertyName: 'ทรัพย์สินใหม่', propertyAddress: 'กรุณาระบุที่อยู่',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      rentAmount: 10000, deposit: 20000,
      ownerName: 'เจ้าของที่พัก', tenantName: 'ผู้เช่า',
      status: 'draft', signatures: {},
    };
    const next = [newC, ...contracts];
    setContracts(next); saveContracts(next); setSelectedId(newC.id);
  };

  // [DEV TEST] Reset demo data — remove or guard with process.env.NODE_ENV !== 'production' before deployment
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

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-gray-900 text-lg">สัญญาของคุณ</h3>
        <div className="flex gap-2">
          {/* [DEV TEST] Reset Demo Data — remove or guard before production deployment */}
          <button onClick={handleReset} title="[DEV TEST] ล้างข้อมูลและโหลด Mock ใหม่"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-xl transition-all">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
          </button>
          <button onClick={handleAddNew}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors">
            <Plus className="w-3.5 h-3.5" /> สร้างสัญญาใหม่
          </button>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 border border-dashed border-gray-200 rounded-2xl text-gray-400">
          <p className="text-sm font-bold">ยังไม่มีสัญญา</p>
          <p className="text-xs mt-1">กด "สร้างสัญญาใหม่" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(c => <ContractCard key={c.id} c={c} onClick={() => setSelectedId(c.id)} />)}
        </div>
      )}
    </div>
  );
}
