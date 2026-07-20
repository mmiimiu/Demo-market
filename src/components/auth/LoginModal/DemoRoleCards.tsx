import React from 'react';
import { ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { DEMO_ROLES, DemoRole } from './demoRoles';

interface DemoRoleCardsProps {
  lang: Language;
  demoLoading: string | null;
  onDemoLogin: (roleConfig: DemoRole) => void;
}

export default function DemoRoleCards({ lang, demoLoading, onDemoLogin }: DemoRoleCardsProps) {
  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Play className="w-3 h-3 text-white fill-white" />
        </div>
        <h3 className="text-base font-black text-gray-900">
          {isTh ? 'ทดลองใช้งานตาม Role' : 'Try Demo by Role'}
        </h3>
        <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide ml-1">
          {isTh ? 'ไม่ต้องสมัคร' : 'No signup'}
        </span>
      </div>
      <p className="text-xs text-gray-400 font-medium mb-4 pl-8">
        {isTh ? 'เลือก Role เพื่อเข้าใช้งานได้เลย — ไม่ต้องกรอกรหัสผ่าน' : 'Click any role card to instantly access — no password needed'}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {DEMO_ROLES.map((roleConfig) => {
          const isThisLoading = demoLoading === roleConfig.role;
          const IconComp = roleConfig.icon;

          return (
            <button
              key={roleConfig.role}
              onClick={() => onDemoLogin(roleConfig)}
              disabled={demoLoading !== null}
              className={cn(
                "relative group p-4 rounded-xl border-2 text-left transition-all duration-200 overflow-hidden",
                "border-gray-100 bg-white",
                !demoLoading && roleConfig.hoverBg,
                !demoLoading && "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                isThisLoading && "border-opacity-100 scale-[1.02] shadow-xl",
                demoLoading && demoLoading !== roleConfig.role && "opacity-40"
              )}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-200",
                !isThisLoading && "group-hover:opacity-[0.04]",
                roleConfig.gradient
              )} />

              {isThisLoading && (
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-current to-transparent animate-pulse opacity-30" />
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md",
                    roleConfig.gradient
                  )}>
                    {isThisLoading
                      ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <IconComp className="w-5 h-5 text-white" />
                    }
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 mt-1.5 transition-all duration-200",
                    roleConfig.textColor,
                    "opacity-0 group-hover:opacity-80 group-hover:translate-x-0.5"
                  )} />
                </div>

                <p className={cn("font-black text-sm leading-tight", roleConfig.textColor)}>
                  {isTh ? roleConfig.labelTh : roleConfig.label}
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-1 leading-snug">
                  {isTh ? roleConfig.taglineTh : roleConfig.taglineEn}
                </p>

                {isThisLoading && (
                  <p className={cn("text-[10px] font-bold mt-2 animate-pulse", roleConfig.textColor)}>
                    {isTh ? 'กำลังเข้าระบบ...' : 'Signing in...'}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
