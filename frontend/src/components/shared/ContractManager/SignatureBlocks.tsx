import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SignatureBlocksProps {
  contract: any;
  isTh: boolean;
}

export function SignatureBlocks({ contract, isTh }: SignatureBlocksProps) {
  const roles = [
    { role: 'owner', label: isTh ? 'เจ้าของที่พัก (Owner)' : 'Landlord', sig: contract?.signatures?.owner },
    { role: 'tenant', label: isTh ? 'ผู้เช่า (Tenant)' : 'Tenant', sig: contract?.signatures?.tenant },
    ...(contract?.agentId ? [{ role: 'agent', label: isTh ? 'ตัวแทน (Agent)' : 'Agent', sig: contract?.signatures?.agent }] : []),
  ];

  return (
    <div className={cn(
      "grid gap-6 mt-6",
      contract?.agentId ? "grid-cols-3" : "grid-cols-2"
    )}>
      {roles.map((p) => (
        <div key={p.role} className="space-y-2 text-left">
          {p.sig ? (
            <>
              <div className="h-20 border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden rounded-md">
                <img
                  src={p.sig.signatureDataUrl}
                  alt={`${p.role} signature`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="border-t border-gray-400 pt-2 font-bold text-gray-700">
                <p className="text-[10px] text-gray-900 truncate">{p.sig.name}</p>
                <p className="text-[9px] text-gray-400 font-normal">
                  {p.sig.signedAt ? format(new Date(p.sig.signedAt), 'dd MMM yyyy HH:mm') : ''}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="h-20 border-2 border-dashed border-gray-300 bg-gray-50/50 flex items-center justify-center rounded-md">
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                  {isTh ? 'รอลงนาม' : 'Pending'}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-2 font-bold text-gray-400">
                <p className="text-[10px]">{p.label}</p>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
