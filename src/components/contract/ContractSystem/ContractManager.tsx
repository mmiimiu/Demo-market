'use client';

import React from 'react';
import type { Contract } from './constants';
import type { UserRole } from '@/lib/types';
import { ContractDocument } from './ContractDocument';
import { ContractSignatures } from './ContractSignatures';

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
  const sigCount = Object.values(contract.signatures).filter(Boolean).length;

  const handleDocChange = (patch: Partial<Contract>) => {
    onUpdate({ ...contract, ...patch });
  };

  const handleSigned = (role: 'owner' | 'tenant', dataUrl: string, name: string) => {
    const nextSigs = {
      ...contract.signatures,
      [role]: { signatureDataUrl: dataUrl, name, signedAt: new Date().toISOString() },
    };
    const nextCount = Object.values(nextSigs).filter(Boolean).length;
    onUpdate({
      ...contract,
      signatures: nextSigs,
      status: nextCount >= 2 ? 'completed' : 'pending_signatures',
    });
  };

  const handleSignRemove = (role: 'owner' | 'tenant') => {
    const nextSigs = { ...contract.signatures };
    delete nextSigs[role];
    onUpdate({ ...contract, signatures: nextSigs, status: 'pending_signatures' });
  };

  return (
    <div className="max-w-[794px] mx-auto bg-white shadow-xl rounded-2xl px-8 sm:px-12 py-10 print:shadow-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8 pb-6 border-b border-gray-100">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">สัญญา #{contract.id}</p>
          <h3 className="font-black text-gray-900 text-xl">{contract.propertyName}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{contract.propertyAddress}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-xs font-black px-3 py-1.5 rounded-full ${STATUS_COLOR[contract.status] || 'bg-gray-100 text-gray-500'}`}>
            {STATUS_LABEL[contract.status] || contract.status}
          </span>
          <span className="text-[10px] text-gray-400 font-bold">ลายเซ็น {sigCount}/2</span>
        </div>
      </div>

      {/* Document body */}
      <ContractDocument contract={contract} userRole={userRole} onChange={handleDocChange} />

      {/* Signatures */}
      <ContractSignatures
        contract={contract}
        userRole={userRole}
        onSigned={handleSigned}
        onSignRemove={handleSignRemove}
      />
    </div>
  );
}
