import React from 'react';
import { cn } from '@/lib/utils';

interface StatBoxProps {
  value: React.ReactNode;
  label: string;
  color?: string;
}

export function StatBox({ value, label, color = 'text-primary' }: StatBoxProps) {
  return (
    <div className="border border-gray-100 p-3 text-center bg-white">
      <p className={cn("text-lg font-bold leading-none mb-1", color)}>{value}</p>
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}
