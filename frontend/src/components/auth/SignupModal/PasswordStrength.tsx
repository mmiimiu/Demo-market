'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PasswordCheck } from './types';

interface PasswordStrengthProps {
  password: string;
  lang: 'th' | 'en' | 'cn';
}

export function getPasswordStrength(pwd: string) {
  let s = 0;
  if (pwd.length >= 8)  s++;
  if (pwd.length >= 12) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[a-z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}

export function PasswordStrength({ password, lang }: PasswordStrengthProps) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const strengthColor = strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-amber-400' : 'bg-green-500';

  const passwordChecks: PasswordCheck[] = [
    { label: lang === 'th' ? '8+ ตัวอักษร' : lang === 'cn' ? '8个以上字符' : '8+ chars', valid: password.length >= 8 },
    { label: lang === 'th' ? 'ตัวพิมพ์ใหญ่' : lang === 'cn' ? '大写字母' : 'Uppercase', valid: /[A-Z]/.test(password) },
    { label: lang === 'th' ? 'ตัวพิมพ์เล็ก' : lang === 'cn' ? '小写字母' : 'Lowercase', valid: /[a-z]/.test(password) },
    { label: lang === 'th' ? 'ตัวเลข' : lang === 'cn' ? '数字' : 'Number', valid: /[0-9]/.test(password) },
  ];

  return (
    <div className="mt-2.5 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map(l => (
          <div key={l} className={cn("h-1 flex-1 transition-all", strength >= l ? strengthColor : "bg-gray-100")} />
        ))}
      </div>
      {/* Checks */}
      <div className="grid grid-cols-2 gap-1">
        {passwordChecks.map((c, i) => (
          <div key={i} className={cn("flex items-center gap-1.5 text-[10px] font-bold", c.valid ? "text-green-600" : "text-gray-400")}>
            {c.valid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
