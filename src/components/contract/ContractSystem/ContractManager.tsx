'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Users, Clock, Download } from 'lucide-react';
import type { Contract } from './constants';
import type { UserRole } from '@/lib/types';
import { ContractDocument } from './ContractDocument';
import { ContractSignatures } from './ContractSignatures';
import { toast } from '@/hooks/use-toast';
import { ContractDocModal } from './ContractDocModal';

interface Props {
  contract: Contract;
  userRole: UserRole;
  onUpdate: (c: Contract) => void;
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'ร่าง',
  pending_signatures: 'รอลายเซ็น',
  completed: 'สัญญาสมบูรณ์',
  expired: 'หมดอายุ',
};

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  pending_signatures: 'bg-amber-50 text-amber-700',
  completed: 'bg-green-50 text-green-700',
  expired: 'bg-red-50 text-red-500',
};

export function ContractManager({ contract, userRole, onUpdate }: Props) {
  const [sending, setSending] = useState(false);
  const [showDoc, setShowDoc] = useState(false);

  const isOwnerSide = userRole === 'owner' || userRole === 'landlord' || userRole === 'agent';
  const requiredSigs = contract.hasAgent ? 3 : 2;
  const sigCount = Object.values(contract.signatures).filter(Boolean).length;

  const handleDocChange = (patch: Partial<Contract>) => {
    onUpdate({ ...contract, ...patch });
  };

  const handleSigned = (role: 'owner' | 'tenant' | 'agent', dataUrl: string, name: string) => {
    const nextSigs = {
      ...contract.signatures,
      [role]: { signatureDataUrl: dataUrl, name, signedAt: new Date().toISOString() },
    };
    const nextCount = Object.values(nextSigs).filter(Boolean).length;
    onUpdate({
      ...contract,
      signatures: nextSigs,
      status: nextCount >= requiredSigs ? 'completed' : 'pending_signatures',
    });
  };

  const handleSignRemove = (role: 'owner' | 'tenant' | 'agent') => {
    const nextSigs = { ...contract.signatures };
    delete nextSigs[role];
    onUpdate({ ...contract, signatures: nextSigs, status: 'pending_signatures' });
  };

  const handleHasAgentChange = (hasAgent: boolean, agentName: string) => {
    const nextSigs = { ...contract.signatures };
    if (!hasAgent) delete nextSigs.agent;
    onUpdate({ ...contract, hasAgent, agentName: agentName || undefined, signatures: nextSigs });
  };

  // ── ส่งเอกสารให้ลงนาม ────────────────────────────────────────────────────
  const handleSendForSigning = () => {
    setSending(true);
    // Mock: simulate network delay
    setTimeout(() => {
      onUpdate({ ...contract, status: 'pending_signatures' });
      const recipients = [
        contract.tenantName,
        ...(contract.hasAgent ? ['เอเจ้นท์'] : []),
      ].join(' และ ');
      toast({
        title: '📨 ส่งเอกสารสำเร็จ',
        description: `แจ้งเตือนไปยัง ${recipients} แล้ว — รอลงนามใน "สัญญาของฉัน"`,
      });
      setSending(false);
    }, 900);
  };

  return (
    <div className="max-w-[794px] mx-auto bg-white shadow-xl rounded-2xl px-8 sm:px-12 py-10 print:shadow-none">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8 pb-6 border-b border-gray-100">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">สัญญา #{contract.id}</p>
          <h3 className="font-black text-gray-900 text-xl">{contract.propertyName}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{contract.propertyAddress}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          {contract.status !== 'draft' && (
            <button 
              onClick={() => setShowDoc(true)} 
              className="flex items-center gap-2 text-xs font-black text-gray-700 hover:text-blue-600 bg-gray-50 border border-gray-200 hover:border-blue-400 px-4 py-2.5 rounded-xl transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-blue-600" /> ดูเอกสาร / พิมพ์ PDF
            </button>
          )}
          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-xs font-black px-3 py-1.5 rounded-full ${STATUS_COLOR[contract.status] || 'bg-gray-100 text-gray-500'}`}>
              {STATUS_LABEL[contract.status] || contract.status}
            </span>
            <span className="text-[10px] text-gray-400 font-bold">
              ลายเซ็น {sigCount}/{requiredSigs}
              {contract.hasAgent && <span className="ml-1 text-blue-500">(3 ฝ่าย)</span>}
            </span>
          </div>
        </div>
      </div>

      {showDoc && <ContractDocModal contract={contract} onClose={() => setShowDoc(false)} />}

      {/* ── Draft → Send banner (owner/agent only) ── */}
      {isOwnerSide && contract.status === 'draft' && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-black text-blue-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              เอกสารยังเป็นฉบับร่าง — ยังไม่ได้ส่งให้ลงนาม
            </p>
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              เมื่อร่างสัญญาเสร็จแล้ว กด&nbsp;<strong>"ส่งเอกสารให้ลงนาม"</strong>&nbsp;ระบบจะแจ้งเตือนไปยัง
              {' '}<span className="font-bold">{contract.tenantName}</span>
              {contract.hasAgent && <> และ <span className="font-bold">เอเจ้นท์</span></>}
              {' '}ให้เข้ามาเซ็นเองในระบบ
            </p>
          </div>
          <button
            onClick={handleSendForSigning}
            disabled={sending}
            className="flex items-center gap-2 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-5 py-3 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            {sending ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />กำลังส่ง...</>
            ) : (
              <><Send className="w-4 h-4" />ส่งเอกสารให้ลงนาม</>
            )}
          </button>
        </div>
      )}

      {/* ── Pending banner ── */}
      {contract.status === 'pending_signatures' && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <Users className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-xs font-black text-amber-900">รอลายเซ็นจากคู่สัญญา</p>
            <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
              ส่งเอกสารไปแล้ว — ลงนามแล้ว {sigCount}/{requiredSigs} คน
              {sigCount < requiredSigs && ' · รอฝ่ายที่เหลือดำเนินการ'}
            </p>
          </div>
        </div>
      )}

      {/* ── Completed banner ── */}
      {contract.status === 'completed' && (
        <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <p className="text-xs font-black text-emerald-900">สัญญาสมบูรณ์ — ลงนามครบทุกฝ่ายแล้ว</p>
            <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
              {sigCount}/{requiredSigs} ลายเซ็น · สัญญามีผลบังคับใช้ตามกฎหมาย
            </p>
          </div>
        </div>
      )}

      {/* ── Document body ── */}
      <ContractDocument contract={contract} userRole={userRole} onChange={handleDocChange} />

      {/* ── Signatures ── */}
      <ContractSignatures
        contract={contract}
        userRole={userRole}
        onSigned={handleSigned}
        onSignRemove={handleSignRemove}
        onHasAgentChange={handleHasAgentChange}
      />
    </div>
  );
}
