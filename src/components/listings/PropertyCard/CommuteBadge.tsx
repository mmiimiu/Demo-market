'use client';

import React from 'react';
import { Language } from '@/lib/types';

interface CommuteBadgeProps {
  commuteInfo: {
    bts: number;
    car: number;
    moto: number;
    destination: string;
  } | null;
  lang: Language;
}

export const CommuteBadge: React.FC<CommuteBadgeProps> = ({ commuteInfo, lang }) => {
  if (!commuteInfo) return null;
  
  return (
    <div className="mb-4 p-3 bg-primary/5 rounded-none border border-primary/10 text-[10px] font-bold text-gray-600 flex items-center justify-between flex-wrap gap-2 animate-in fade-in duration-300">
      <div className="flex items-center gap-1.5">
        <span className="text-primary font-black">📍 {lang === 'th' ? 'ไปที่' : lang === 'cn' ? '至' : 'To'} {commuteInfo.destination}</span>
      </div>
      <div className="flex items-center gap-3 font-black">
        <span className="flex items-center gap-0.5">🚗 {commuteInfo.car} {lang === 'th' ? 'นาที' : 'm'}</span>
        <span className="flex items-center gap-0.5">🏍️ {commuteInfo.moto} {lang === 'th' ? 'นาที' : 'm'}</span>
        <span className="flex items-center gap-0.5">🚇 {commuteInfo.bts} {lang === 'th' ? 'นาที' : 'm'}</span>
      </div>
    </div>
  );
};
