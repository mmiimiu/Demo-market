'use client';

import React from 'react';
import { Sparkles, Info, CheckCircle2, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/types';
import type { RoleTheme } from './types';


interface ProfileProgressProps {
  lang: Language;
  theme: RoleTheme;
  completionScore: number;
  completionTips: string[];
  isAgentVerified?: boolean;
  currentRole?: string;
}

export function ProfileProgress({ lang, theme, completionScore, completionTips, isAgentVerified, currentRole }: ProfileProgressProps) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className={cn('w-4.5 h-4.5', theme.text)} />
            <h4 className="font-bold text-gray-900 text-base">
              {lang === 'th' ? 'ความสมบูรณ์โปรไฟล์' : 'Profile Completion'}
            </h4>
          </div>
          <Badge className={cn('font-bold text-xs px-2.5 py-1 border-none',
            completionScore >= 80 ? 'bg-green-500 text-white' :
            completionScore >= 50 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
          )}>{completionScore}%</Badge>
        </div>
        
        <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className={cn('h-full transition-all duration-700 ease-out rounded-full',
            completionScore >= 80 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
            completionScore >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-rose-400 to-red-500'
          )} style={{ width: `${completionScore}%` }} />
        </div>

        {currentRole === 'agent' && isAgentVerified && (
          <div className="flex items-center gap-2 py-2 px-3 bg-teal-50 rounded-xl border border-teal-100">
            <BadgeCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-xs font-black text-teal-700">
              {lang === 'th' ? 'Verified Agent ✓' : 'Verified Agent ✓'}
            </span>
          </div>
        )}

        {completionTips.length > 0 ? (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-semibold flex items-center gap-1.5 mb-2">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              {lang === 'th' ? 'เพิ่มความน่าเชื่อถือ:' : 'Boost your visibility:'}
            </p>
            <ul className="text-xs text-gray-600 font-medium space-y-1.5">
              {completionTips.slice(0, 2).map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              {lang === 'th' ? 'โปรไฟล์สมบูรณ์แล้ว!' : 'Profile complete!'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
