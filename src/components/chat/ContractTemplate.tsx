"use client";

import React, { useState } from 'react';
import { FileSignature, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export interface ContractData {
  id: string;
  type: 'co-broke' | 'deposit';
  title: string;
  terms: string[];
  status: 'pending' | 'accepted' | 'rejected';
  proposedBy: string;
}

interface ContractTemplateProps {
  contract: ContractData;
  isSender: boolean;
  onAccept?: (contractId: string) => void;
  onReject?: (contractId: string) => void;
}

export function ContractTemplate({ contract, isSender, onAccept, onReject }: ContractTemplateProps) {
  const [localStatus, setLocalStatus] = useState(contract.status);

  const handleAccept = () => {
    setLocalStatus('accepted');
    if (onAccept) onAccept(contract.id);
    toast({
      title: "สัญญาได้รับการยอมรับแล้ว",
      description: "ข้อมูลสัญญาถูกบันทึกลงระบบ",
    });
  };

  const handleReject = () => {
    setLocalStatus('rejected');
    if (onReject) onReject(contract.id);
  };

  const statusConfig = {
    pending: { label: 'รอการยืนยัน', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    accepted: { label: 'ยอมรับแล้ว', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'ปฏิเสธ', className: 'bg-red-50 text-red-700 border-red-200' }
  };

  const config = statusConfig[localStatus];

  return (
    <div className={cn("rounded-2xl border p-5 max-w-[320px] shadow-sm mt-2 mb-2 bg-white", config.className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
          <FileSignature className="w-4 h-4 text-slate-700" />
        </div>
        <div>
          <h4 className="font-black text-sm text-slate-900">{contract.title}</h4>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block bg-white", config.className)}>
            {config.label}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4 bg-white/50 p-3 rounded-xl border border-white/60">
        {contract.terms.map((term, i) => (
          <p key={i} className="text-xs font-medium text-slate-700 flex items-start gap-1.5">
            <span className="text-slate-400 font-black mt-0.5">•</span>
            {term}
          </p>
        ))}
      </div>

      {localStatus === 'pending' && !isSender && (
        <div className="flex gap-2 pt-2 border-t border-black/5">
          <Button 
            onClick={handleReject}
            variant="outline" 
            className="flex-1 h-9 rounded-xl text-xs font-bold bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border-white/60"
          >
            ปฏิเสธ
          </Button>
          <Button 
            onClick={handleAccept}
            className="flex-1 h-9 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
          >
            ยอมรับ
          </Button>
        </div>
      )}
      
      {localStatus === 'accepted' && (
        <div className="pt-2 border-t border-black/5 flex items-center gap-1.5 text-emerald-700 font-bold text-xs justify-center">
          <CheckCircle className="w-3.5 h-3.5" />
          สัญญามีผลบังคับใช้
        </div>
      )}

      {localStatus === 'rejected' && (
        <div className="pt-2 border-t border-black/5 flex items-center gap-1.5 text-red-700 font-bold text-xs justify-center">
          <XCircle className="w-3.5 h-3.5" />
          สัญญาถูกปฏิเสธ
        </div>
      )}
    </div>
  );
}
