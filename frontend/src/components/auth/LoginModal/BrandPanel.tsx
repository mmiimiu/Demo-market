import React from 'react';
import { Building2 } from 'lucide-react';
import { Language } from '@/lib/types';
import { DEMO_ROLES } from './demoRoles';

interface BrandPanelProps {
  lang: Language;
}

export default function BrandPanel({ lang }: BrandPanelProps) {
  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  return (
    <div className="hidden sm:flex w-[240px] shrink-0 bg-gradient-to-br from-[#E51D53] to-[#D41B4D] flex-col justify-between p-7 relative overflow-hidden rounded-l-2xl">
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/5" />
      <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-white/5" />

      <div className="relative z-10 flex items-center gap-2">
        <div className="w-8 h-8 bg-white flex items-center justify-center rounded-xl">
          <Building2 className="w-4 h-4 text-[#E51D53]" />
        </div>
        <span className="text-white font-black text-sm tracking-widest uppercase">PrimeRent</span>
      </div>

      <div className="relative z-10 space-y-5">
        <div>
          <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
            {isTh ? 'ยินดีต้อนรับกลับ' : isCn ? '欢迎回来' : 'Welcome Back'}
          </p>
          <h2 className="text-white text-xl font-black leading-tight">
            {isTh ? 'จัดการที่พักของคุณได้ทุกที่ ทุกเวลา' : isCn ? '随时随地管理您的房源' : 'Manage your properties anytime, anywhere.'}
          </h2>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-white/10">
          <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Demo Roles</p>
          {DEMO_ROLES.map((r) => (
            <div key={r.role} className="flex items-center gap-2 text-white/60 text-xs font-medium">
              <div className={`w-5 h-5 rounded-xl flex items-center justify-center bg-gradient-to-br ${r.gradient}`}>
                <r.icon className="w-3 h-3 text-white" />
              </div>
              <span>{isTh ? r.labelTh : r.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="relative z-10 text-white/20 text-[10px] font-medium">© 2026 PrimeRent</p>
    </div>
  );
}
