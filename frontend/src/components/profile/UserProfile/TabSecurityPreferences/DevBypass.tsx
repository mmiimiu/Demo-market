import React from 'react';
import { UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DevBypassProps {
  isMockUser: boolean;
  currentKyc: any;
  isTh: boolean;
  onDevInstantVerify: () => void;
}

export function DevBypass({ isMockUser, currentKyc, isTh, onDevInstantVerify }: DevBypassProps) {
  if (!isMockUser || currentKyc === 'verified') return null;

  return (
    <div className="p-6 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between shadow-sm">
      <div className="space-y-1">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Developer Sandbox Toggle</p>
        <p className="text-sm font-black text-slate-800">{isTh ? 'ยืนยันตัวตนจำลองทันที (Bypass)' : 'Bypass verification instantly'}</p>
      </div>
      <Button onClick={onDevInstantVerify} className="bg-slate-800 text-white rounded-xl hover:bg-slate-900 font-bold transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-slate-200">
        <UserCheck className="w-4 h-4 mr-2" /> Verify Now
      </Button>
    </div>
  );
}
