'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { ChecklistItem } from './types';

interface ChecklistSectionProps {
  checklist: ChecklistItem[];
  doneCount: number;
  totalCount: number;
  label: (th: string, en: string, cn: string) => string;
}

export function ChecklistSection({ checklist, doneCount, totalCount, label }: ChecklistSectionProps) {
  const percent = Math.round((doneCount / totalCount) * 100);

  return (
    <Card className="glass-card premium-shadow border-none rounded-3xl overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">
              {label('ขั้นตอนเตรียมย้ายเข้า', 'Move-in Checklist', '入驻手续')}
            </h3>
            <p className="text-[9px] text-gray-400 font-bold mt-1">
              {label('กรุณาทำรายการตามหัวข้อด้านล่างให้เสร็จสิ้น', 'Please complete the items below', '请完成以下事项')}
            </p>
          </div>
          <span className="text-xs font-black text-[#1E293B]">{percent}%</span>
        </div>
        <Progress value={percent} className="h-1.5 bg-gray-100 [&>div]:bg-[#2563EB] rounded-full" />
        <div className="divide-y divide-gray-50">
          {checklist.map(item => (
            <div key={item.id} className="py-3 flex items-center justify-between font-bold text-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-4.5 h-4.5 ${item.done ? 'text-emerald-500 fill-emerald-50' : 'text-gray-200'}`} />
                <span className={item.done ? 'text-gray-400 line-through' : 'text-gray-700'}>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
