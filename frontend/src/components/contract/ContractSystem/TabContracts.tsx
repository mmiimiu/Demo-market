'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, RotateCcw, Building, FileText, CheckCircle2, Clock, Edit3, MapPin, User, FileSpreadsheet } from 'lucide-react';
import type { UserRole } from '@/lib/types';
import { Contract, ContractStatus, DEFAULT_MOCK_CONTRACTS, CONTRACTS_STORAGE_KEY } from './constants';
import { ContractManager } from './ContractManager';

const STATUS_LABEL: Record<ContractStatus, string> = {
  draft: 'ฉบับร่าง (กำลังกรอกข้อมูล)',
  pending_signatures: 'รอลายเซ็น (อยู่ระหว่างจัดส่ง)',
  completed: 'สมบูรณ์ (เข้าอยู่แล้ว)',
  expired: 'หมดอายุสัญญา',
};

const STATUS_BADGE: Record<ContractStatus, { bg: string; text: string; border: string; icon: any }> = {
  draft: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Edit3 },
  pending_signatures: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  expired: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: FileText },
};

function loadContracts(): Contract[] {
  try {
    const r = localStorage.getItem(CONTRACTS_STORAGE_KEY);
    const list = r ? JSON.parse(r) as Contract[] : DEFAULT_MOCK_CONTRACTS;
    return list.map(c => {
      const orig = DEFAULT_MOCK_CONTRACTS.find(o => o.id === c.id);
      if (orig) {
        return {
          ...c,
          status: orig.status,
          signatures: { ...orig.signatures },
          hasAgent: orig.hasAgent,
          agentName: orig.agentName,
        };
      }
      return c;
    });
  } catch {
    return DEFAULT_MOCK_CONTRACTS;
  }
}

function saveContracts(c: Contract[]) {
  localStorage.setItem(CONTRACTS_STORAGE_KEY, JSON.stringify(c));
}

function ContractCard({ c, onClick, userRole }: { c: Contract; onClick: () => void; userRole?: UserRole }) {
  const requiredSigs = c.hasAgent ? 3 : 2;
  const sigCount = Object.values(c.signatures).filter(Boolean).length;
  const badge = STATUS_BADGE[c.status] || STATUS_BADGE.draft;
  const Icon = badge.icon;

  return (
    <div 
      onClick={onClick}
      className="w-full bg-white border border-gray-200 hover:border-blue-400 rounded-xl p-3 md:py-3 md:px-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
    >
      {/* Left section: Name, Zone, Unit */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <MapPin className="w-2.5 h-2.5 text-blue-600" />
            {c.zone || 'ทุกโซน'}
          </span>
          {c.unitNo && (
            <span className="text-[10px] font-black text-gray-700 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-md">
              {c.unitNo}
            </span>
          )}
          
          {/* Agent-specific tag to distinguish listing source */}
          {userRole === 'agent' && c.agentType && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${
              c.agentType === 'direct' 
                ? 'bg-teal-50 text-teal-700 border-teal-200' 
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}>
              {c.agentType === 'direct' ? '🏷️ ปล่อยเช่าตรง' : '🤝 ปล่อยต่อจากเจ้าของ'}
            </span>
          )}

          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.bg} ${badge.text} ${badge.border}`}>
            <Icon className="w-3 h-3" />
            {STATUS_LABEL[c.status]}
          </span>
        </div>
        <div>
          <h4 className="font-black text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
            {c.propertyName}
          </h4>
          <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
            📍 {c.propertyAddress}
          </p>
        </div>
      </div>

      {/* Center section: Parties (Owner & Tenant) */}
      <div className="flex flex-row md:flex-col md:justify-center gap-x-4 gap-y-0.5 border-t md:border-t-0 pt-2 md:pt-0 border-gray-100 min-w-[180px]">
        <div className="flex items-center gap-1 truncate text-[11px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase">เจ้าของ:</span>
          <span className="font-bold text-gray-700 truncate">{c.ownerName || '-'}</span>
        </div>
        <div className="flex items-center gap-1 truncate text-[11px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase">ผู้เช่า:</span>
          <span className="font-bold text-gray-700 truncate">{c.tenantName || '-'}</span>
        </div>
      </div>

      {/* Right section: Rent, Dates, Signatures */}
      <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-gray-100 min-w-[220px]">
        <div className="text-left md:text-right">
          <div className="font-black text-blue-700 text-xs">฿{c.rentAmount.toLocaleString()} /ด.</div>
          <div className="text-[9px] font-medium text-gray-400 mt-0.5">{c.startDate} ถึง {c.endDate}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full whitespace-nowrap">
            ลายเซ็น {sigCount}/{requiredSigs}
          </span>
          <span className="text-[10px] font-black text-blue-600 group-hover:translate-x-0.5 transition-transform whitespace-nowrap">
            เปิดดู →
          </span>
        </div>
      </div>
    </div>
  );
}


export function TabContracts({ userRole }: { userRole: UserRole }) {
  const [contracts, setContracts] = useState<Contract[]>(DEFAULT_MOCK_CONTRACTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTabMode, setActiveTabMode] = useState<'contracts' | 'drafts'>('contracts');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending_signatures' | 'draft'>('all');

  useEffect(() => {
    setContracts(loadContracts());
  }, []);

  const selected = contracts.find(c => c.id === selectedId) ?? null;

  const handleUpdate = (updated: Contract) => {
    const next = contracts.map(c => c.id === updated.id ? updated : c);
    setContracts(next);
    saveContracts(next);
  };

  const handleAddNew = (templateType?: string) => {
    const title = templateType || 'สัญญาเช่าห้องพักใหม่ (แบบร่างสัญญา Manual)';
    const newC: Contract = {
      id: `cnt-${Date.now()}`,
      propertyName: title,
      propertyAddress: 'กรุณาระบุที่อยู่ห้องพักที่ทำสัญญา',
      zone: 'โซนทั่วไป',
      unitNo: 'ห้องใหม่',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      rentAmount: 15000,
      deposit: 30000,
      ownerName: userRole === 'owner' ? 'คุณ (เจ้าของห้อง)' : 'เจ้าของที่พัก (รอระบุชื่อ)',
      tenantName: 'ผู้เช่า (รอระบุชื่อ)',
      status: 'draft',
      signatures: {},
    };
    const next = [newC, ...contracts];
    setContracts(next);
    saveContracts(next);
    setSelectedId(newC.id);
  };

  const handleReset = () => {
    localStorage.removeItem(CONTRACTS_STORAGE_KEY);
    setContracts(DEFAULT_MOCK_CONTRACTS);
    setSelectedId(null);
  };

  if (selected) {
    return (
      <div className="animate-in fade-in duration-300 space-y-4">
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
          <button 
            onClick={() => setSelectedId(null)} 
            className="flex items-center gap-2 text-xs font-black text-gray-700 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> ← กลับไปหน้ารายการสัญญาแยกตามทรัพย์สิน
          </button>
          <span className="text-xs font-bold text-gray-400">ID สัญญา: {selected.id}</span>
        </div>
        <ContractManager contract={selected} userRole={userRole} onUpdate={handleUpdate} />
      </div>
    );
  }

  const draftTemplates = [
    { 
      id: 'lease',
      title: 'แบบร่างสัญญาเช่าที่พักอาศัยมาตรฐาน (Standard Residential Lease Template)', 
      desc: 'แม่แบบเอกสารสัญญาเช่ามาตรฐาน ครบถ้วนข้อกำหนด สามารถนำไปคัดลอกปรับแก้ ชื่อโครงการ, ชื่อเอเจ้นท์, ผู้เช่า, เจ้าของ, วันเริ่ม/สิ้นสุดสัญญา และเงื่อนไขแนบท้ายพร้อมช่องลงลายมือชื่อได้ตลอดเวลา', 
      badge: 'แม่แบบสัญญาหลัก',
      category: 'โครงสร้างมาตรฐาน (รองรับการแก้ไข & ต่อสัญญา)'
    },
    {
      id: 'authorization',
      title: 'แบบร่างหนังสือแต่งตั้งและมอบอำนาจตัวแทนเอเจ้นท์ (Agent Power of Attorney Draft)',
      desc: 'หนังสือแต่งตั้งและมอบอำนาจแต่งตั้งตัวแทนนายหน้า (Agent) สำหรับเจ้าของห้องที่ต้องการหาเอเจ้นท์ดูแลการจัดหาผู้เช่า ทำสัญญา และดูแลทรัพย์สินอย่างเป็นทางการ',
      badge: 'แม่แบบแต่งตั้งเอเจ้นท์',
      category: 'หนังสือแต่งตั้ง & มอบอำนาจตัวแทน'
    }
  ];

  const filteredContracts = contracts.filter(c => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md">
        <div>
          <span className="text-[10px] font-black tracking-widest uppercase bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
            เอกสารสัญญาแยกตามทรัพย์สิน & โซนห้องพัก
          </span>
          <h3 className="font-black text-xl text-white mt-2">ระบบจัดการสัญญา & แบบร่างสัญญา (Agent Contract Portal)</h3>
          <p className="text-xs text-gray-300 font-medium mt-1">
            แยกเอกสารสัญญาเป็นฉบับๆ ตามแต่ละโซนและห้องพัก พร้อมแม่แบบสัญญา Manual ให้กรอกข้อมูลได้อย่างสะดวก
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={handleReset} 
            title="[DEV TEST] ล้างข้อมูลและโหลด Mock ใหม่"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-2.5 rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
          </button>
          <button 
            onClick={() => handleAddNew()}
            className="flex items-center gap-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + สร้างฉบับร่างสัญญาใหม่
          </button>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-2">
        <button 
          onClick={() => setActiveTabMode('contracts')}
          className={`pb-3 px-4 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
            activeTabMode === 'contracts' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          🏢 รายการเอกสารสัญญาแยกตามทรัพย์สิน ({contracts.length} ฉบับ)
        </button>
        <button 
          onClick={() => setActiveTabMode('drafts')}
          className={`pb-3 px-4 text-xs font-black transition-all border-b-2 flex items-center gap-2 ${
            activeTabMode === 'drafts' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          📝 แม่แบบฉบับร่างสัญญา (Draft Templates)
        </button>
      </div>

      {/* Mode 1: Contracts List by Status */}
      {activeTabMode === 'contracts' && (
        <div className="space-y-4">
          {/* Status Filter Chips */}
          <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100 text-xs">
            <span className="text-[11px] font-black text-gray-400 uppercase px-2">กรองตามสถานะ:</span>
            {[
              { key: 'all', label: `ทั้งหมด (${contracts.length})` },
              { key: 'completed', label: `🟢 เข้าอยู่แล้ว (${contracts.filter(c => c.status === 'completed').length})` },
              { key: 'pending_signatures', label: `🟠 รอลายเซ็น (${contracts.filter(c => c.status === 'pending_signatures').length})` },
              { key: 'draft', label: `🔵 ฉบับร่าง (${contracts.filter(c => c.status === 'draft').length})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  statusFilter === f.key 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List of Contracts */}
          {filteredContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-gray-200 rounded-2xl text-gray-400 bg-white">
              <FileText className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm font-bold">ไม่พบเอกสารสัญญาในหมวดหมู่นี้</p>
              <p className="text-xs mt-1">กด "สร้างฉบับร่างสัญญาใหม่" เพื่อเริ่มต้นทำสัญญาฉบับใหม่</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContracts.map(c => (
                <ContractCard key={c.id} c={c} onClick={() => setSelectedId(c.id)} userRole={userRole} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Draft Templates (แยกเป็นแม่แบบเอกสารสำหรับกรอก) */}
      {activeTabMode === 'drafts' && (
        <div className="space-y-4 pt-1">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 font-medium leading-relaxed">
            💡 <strong>แม่แบบฉบับร่างสัญญา (Doc Templates):</strong> สามารถเลือกแม่แบบที่ต้องการ เพื่อคัดลอกสร้างเอกสารฉบับใหม่สำหรับห้องพัก/ทรัพย์สินเฉพาะรายได้ทันที
          </div>

          <div className="max-w-2xl">
            {draftTemplates.map((tpl, i) => (
              <div 
                key={i} 
                className="bg-white border border-gray-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100 uppercase">
                      {tpl.badge}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">{tpl.category}</span>
                  </div>
                  <h4 className="font-black text-gray-900 text-sm leading-snug">{tpl.title}</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{tpl.desc}</p>
                </div>
                <button 
                  onClick={() => handleAddNew(tpl.title)}
                  className="w-full text-xs font-black text-white bg-blue-600 hover:bg-blue-700 py-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  📝 ใช้แม่แบบนี้สร้างสัญญาฉบับใหม่
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

