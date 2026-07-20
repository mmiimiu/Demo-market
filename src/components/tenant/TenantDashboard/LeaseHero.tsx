'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LeaseInfo } from './types';

interface LeaseHeroProps {
  lease: LeaseInfo;
  daysLeft: number;
  isTh: boolean;
  label: (th: string, en: string, cn: string) => string;
}

export function LeaseHero({ lease, daysLeft, isTh, label }: LeaseHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E51D53] to-[#D41B4D] text-white shadow-lg shadow-[#E51D53]/20">
      <div className="absolute inset-0 opacity-[0.03]">
        <img src={lease.img} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="relative p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
            <img src={lease.img} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">
              {label('ที่พักปัจจุบัน', 'Current Residence', '当前居所')}
            </div>
            <h1 className="text-xl font-black leading-tight mb-1.5">
              {isTh ? lease.propertyName : lease.propertyNameEn}
            </h1>
            <p className="text-white/60 text-xs font-medium">{lease.address}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge className="bg-white/5 text-white/90 border border-white/15 text-[9px] font-bold rounded-xl px-2.5 py-0.5">
                ACTIVE
              </Badge>
              <Badge className="bg-white/5 text-white/90 border border-white/15 text-[9px] font-bold rounded-xl px-2.5 py-0.5">
                {label('รายเดือน', 'Monthly', '月租')}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
            {label('สิ้นสุดสัญญาใน', 'Contract ends in', '合同剩余')}
          </div>
          <div className={cn("text-5xl font-black leading-none", daysLeft < 60 ? "text-amber-300" : "text-white")}>
            {daysLeft}
          </div>
          <div className="text-white/60 text-xs font-semibold mt-1">{label('วัน', 'days', '天')}</div>
        </div>
      </div>
    </div>
  );
}
