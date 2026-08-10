'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Trash2, UserCheck } from 'lucide-react';
import type { Contract, SignatureData } from './constants';
import type { UserRole } from '@/lib/types';

interface Props {
  contract: Contract;
  userRole: UserRole;
  onSigned: (role: 'owner' | 'tenant' | 'agent', dataUrl: string, name: string) => void;
  onSignRemove: (role: 'owner' | 'tenant' | 'agent') => void;
  /** Called when the hasAgent toggle changes — parent should persist to contract */
  onHasAgentChange?: (hasAgent: boolean, agentName: string) => void;
}

import { useSignatureCanvas } from '@/components/contract/DigitalContractView/useSignatureCanvas';

// ─── Signature Canvas ────────────────────────────────────────────────────────

function SignatureCanvas({ label, name, onConfirm }: {
  label: string; name: string; onConfirm: (dataUrl: string) => void;
}) {
  const {
    canvasRef, startDrawing, draw, stopDrawing, clearCanvas, isCanvasEmpty
  } = useSignatureCanvas();

  // ตั้งค่า Context ของ Canvas เมื่อเมาท์
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [canvasRef]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 3.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
    startDrawing(e);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || isCanvasEmpty()) {
      alert('กรุณาเซ็นชื่อก่อนกดยืนยัน');
      return;
    }
    onConfirm(canvas.toDataURL('image/png'));
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <canvas
        ref={canvasRef} width={340} height={90}
        className="w-full border border-gray-200 rounded-xl bg-gray-50 cursor-crosshair touch-none"
        onMouseDown={handleStart} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
        onTouchStart={handleStart} onTouchMove={draw} onTouchEnd={stopDrawing}
      />
      <div className="flex gap-2 items-center">
        <button onClick={clearCanvas} className="text-[11px] text-gray-400 hover:text-red-500 transition-colors">ล้าง</button>
        <button
          onClick={handleConfirm}
          className="flex-1 text-xs font-bold py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          ✅ ยืนยันลายเซ็น — {name}
        </button>
      </div>
    </div>
  );
}

// ─── Signed Badge ────────────────────────────────────────────────────────────

function SignedBadge({ sig, onRemove }: { sig: SignatureData; onRemove: () => void }) {
  return (
    <div className="relative group">
      <img src={sig.signatureDataUrl} alt="ลายเซ็น" className="h-16 border border-gray-200 rounded-xl bg-gray-50 p-2 w-full object-contain" />
      <p className="text-[10px] text-gray-500 mt-1 font-semibold">{sig.name}</p>
      <p className="text-[10px] text-gray-400">{new Date(sig.signedAt).toLocaleDateString('th-TH')}</p>
      {/* [DEV TEST] Delete icon */}
      <button
        onClick={onRemove}
        title="[DEV TEST] ลบลายเซ็นนี้"
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white rounded-full shadow text-red-500 hover:bg-red-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ContractSignatures({ contract, userRole, onSigned, onSignRemove, onHasAgentChange }: Props) {
  const isOwnerSide = userRole === 'owner' || userRole === 'landlord' || userRole === 'agent';
  const isTenantSide = userRole === 'renter';

  // Local state for hasAgent toggle
  const [hasAgent, setHasAgent] = useState<boolean>(contract.hasAgent ?? false);

  const handleToggleAgent = (checked: boolean) => {
    setHasAgent(checked);
    onHasAgentChange?.(checked, '');
  };

  // Determine who can sign what
  const canSignAs: Array<'owner' | 'tenant' | 'agent'> = isOwnerSide
    ? ['owner', ...(userRole === 'agent' ? ['agent' as const] : [])]
    : isTenantSide
    ? ['tenant']
    : [];

  // Parties to show
  const parties: Array<{ role: 'owner' | 'tenant' | 'agent'; label: string; name: string }> = [
    { role: 'owner',  label: 'ผู้ให้เช่า (Owner)',  name: contract.ownerName },
    { role: 'tenant', label: 'ผู้เช่า (Tenant)',     name: contract.tenantName },
    ...(hasAgent
      ? [{ role: 'agent' as const, label: 'ตัวแทน (Agent)', name: 'เอเจ้นท์' }]
      : []),
  ];

  return (
    <div className="mt-10 pt-8 border-t border-gray-100 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ลายเซ็นคู่สัญญา</p>

        {/* hasAgent toggle — show only to owner/agent side */}
        {isOwnerSide && (
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl w-fit">
            <input
              type="checkbox"
              checked={hasAgent}
              onChange={e => handleToggleAgent(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
            />
            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
            มีเอเจ้นท์เป็นตัวแทนประสานงาน (สัญญา 3 ฝ่าย)
          </label>
        )}
      </div>


      {/* Signature slots */}
      <div className={`grid gap-6 ${parties.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {parties.map(({ role, label, name }) => {
          const sig = contract.signatures[role as keyof typeof contract.signatures];
          if (sig) {
            return <SignedBadge key={role} sig={sig} onRemove={() => onSignRemove(role)} />;
          }
          if (canSignAs.includes(role)) {
            return <SignatureCanvas key={role} label={label} name={name} onConfirm={d => onSigned(role, d, name)} />;
          }
          return (
            <div key={role} className="h-28 border border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50/50">
              <p className="text-xs text-gray-400 font-semibold text-center px-3">{label}<br />รอลายเซ็น</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
