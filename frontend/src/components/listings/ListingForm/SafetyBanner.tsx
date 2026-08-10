import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function SafetyBanner({ t }: { t: any }) {
  return (
    <div className="bg-[#051130] text-white p-6 md:p-8 rounded-none flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[60px] -mr-24 -mt-24 group-hover:bg-primary/20 transition-all duration-700" />
      <div className="w-14 h-14 bg-primary rounded-none flex items-center justify-center shadow-lg shrink-0 z-10">
        <ShieldCheck className="w-7 h-7" />
      </div>
      <div className="z-10 text-center md:text-left">
        <h3 className="text-lg font-black mb-1">{t.listing_safety_title}</h3>
        <p className="text-white/50 font-medium text-sm max-w-xl">
          {t.listing_safety_desc}
        </p>
      </div>
    </div>
  );
}
