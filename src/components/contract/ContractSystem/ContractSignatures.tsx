'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import type { Contract, SignatureData } from './constants';
import type { UserRole } from '@/lib/types';

interface Props {
  contract: Contract;
  userRole: UserRole;
  onSigned: (role: 'owner' | 'tenant', dataUrl: string, name: string) => void;
  onSignRemove: (role: 'owner' | 'tenant') => void;
}

function SignatureCanvas({ label, name, onConfirm }: {
  label: string; name: string; onConfirm: (dataUrl: string) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  }, []);

  const pos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const src = 'touches' in e ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.beginPath(); ctx.moveTo(x, y);
    drawing.current = true;
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y); ctx.stroke();
    setHasSigned(true);
  };

  const stop = () => { drawing.current = false; };

  const clear = () => {
    const ctx = ref.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, ref.current!.width, ref.current!.height);
    setHasSigned(false);
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <canvas
        ref={ref} width={340} height={90}
        className="w-full border border-gray-200 rounded-xl bg-gray-50 cursor-crosshair touch-none"
        onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop}
        onTouchStart={start} onTouchMove={move} onTouchEnd={stop}
      />
      <div className="flex gap-2 items-center">
        <button onClick={clear} className="text-[11px] text-gray-400 hover:text-red-500 transition-colors">ล้าง</button>
        <button
          disabled={!hasSigned}
          onClick={() => onConfirm(ref.current?.toDataURL() || '')}
          className="flex-1 text-xs font-bold py-2 rounded-xl bg-blue-600 text-white disabled:opacity-30 hover:bg-blue-700 transition-colors"
        >
          ✅ ยืนยันลายเซ็น — {name}
        </button>
      </div>
    </div>
  );
}

function SignedBadge({ sig, onRemove }: { sig: SignatureData; onRemove: () => void }) {
  return (
    <div className="relative group">
      <img src={sig.signatureDataUrl} alt="ลายเซ็น" className="h-16 border border-gray-200 rounded-xl bg-gray-50 p-2 w-full object-contain" />
      <p className="text-[10px] text-gray-500 mt-1 font-semibold">{sig.name}</p>
      <p className="text-[10px] text-gray-400">{new Date(sig.signedAt).toLocaleDateString('th-TH')}</p>
      {/* [DEV TEST] Delete signature icon — guard with env flag or remove before production */}
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

export function ContractSignatures({ contract, userRole, onSigned, onSignRemove }: Props) {
  const canSignAs: Array<'owner' | 'tenant'> =
    userRole === 'owner' || userRole === 'landlord' || userRole === 'agent' ? ['owner'] : ['tenant'];

  return (
    <div className="mt-10 pt-8 border-t border-gray-100 space-y-4">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ลายเซ็นคู่สัญญา</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {(['owner', 'tenant'] as const).map((role) => {
          const sig = contract.signatures[role];
          const label = role === 'owner' ? 'ผู้ให้เช่า (Owner)' : 'ผู้เช่า (Tenant)';
          const name = role === 'owner' ? contract.ownerName : contract.tenantName;
          if (sig) return <SignedBadge key={role} sig={sig} onRemove={() => onSignRemove(role)} />;
          if (canSignAs.includes(role)) {
            return <SignatureCanvas key={role} label={label} name={name} onConfirm={(d) => onSigned(role, d, name)} />;
          }
          return (
            <div key={role} className="h-28 border border-dashed border-gray-200 rounded-xl flex items-center justify-center">
              <p className="text-xs text-gray-400 font-semibold">{label} — รอลายเซ็น</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
