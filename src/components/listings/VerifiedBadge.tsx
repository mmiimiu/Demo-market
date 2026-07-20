'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  className?: string;
}

/**
 * VerifiedBadge — แสดงบนประกาศที่ผ่านการยืนยันตัวตนจาก Agent หรือเจ้าของห้องจริง
 * ใช้ field `isVerified: true` บน property object
 */
export function VerifiedBadge({ size = 'sm', variant = 'default', className }: VerifiedBadgeProps) {
  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };
  const iconSizes = { sm: 'w-3 h-3', md: 'w-3.5 h-3.5', lg: 'w-4 h-4' };

  if (variant === 'outline') {
    return (
      <span className={cn(
        'inline-flex items-center font-black rounded-full border border-emerald-300 text-emerald-600 bg-emerald-50',
        sizes[size], className
      )}>
        <ShieldCheck className={iconSizes[size]} />
        Verified
      </span>
    );
  }

  return (
    <span className={cn(
      'inline-flex items-center font-black rounded-full text-white',
      'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/30',
      sizes[size], className
    )}>
      <ShieldCheck className={iconSizes[size]} />
      Verified
    </span>
  );
}
