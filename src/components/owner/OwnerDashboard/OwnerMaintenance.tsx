'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { translations } from '@/lib/translations';

interface OwnerMaintenanceProps {
  lang: 'th' | 'en' | 'cn';
}

export function OwnerMaintenance({ lang }: OwnerMaintenanceProps) {
  const t = translations[lang] || translations.th;
  const isThai = lang === 'th';
  const isChinese = lang === 'cn';

  const maintenanceTasks = [
    { item: isThai ? 'แอร์ไม่เย็น' : isChinese ? '空调不冷' : 'AC not cooling', property: 'Sukhumvit 48', priority: 'High' },
    { item: isThai ? 'ก๊อกน้ำรั่ว' : isChinese ? '水龙头漏水' : 'Leaking faucet', property: 'Ladprao Valley', priority: 'Medium' },
  ];

  return (
    <Card className="border-gray-100 shadow-sm shadow-gray-200/50 rounded-2xl bg-white p-10">
      <h4 className="text-xl font-black mb-8 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-orange-500" />{' '}
        {isThai ? 'การแจ้งซ่อมและดูแล' : isChinese ? '维修申请' : 'Maintenance Requests'}
      </h4>
      <div className="space-y-6">
        {maintenanceTasks.map((task, i) => {
          const isHigh = task.priority === 'High';
          const isMedium = task.priority === 'Medium';
          const badgeColor = isHigh
            ? 'bg-red-50 text-red-700 hover:bg-red-100'
            : isMedium
            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100';

          return (
            <div key={i} className="p-5 rounded-xl border border-gray-100 space-y-3 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <p className="font-bold text-gray-800">{task.item}</p>
                <Badge className={cn('rounded-xl text-[9px] font-black border-none', badgeColor)}>
                  {task.priority}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 font-medium">{task.property}</p>
              <Button variant="outline" className="w-full rounded-xl h-10 font-bold text-xs border-[#E51D53]/20 text-[#E51D53]">
                {isThai ? 'มอบหมายช่าง' : isChinese ? '指派技工' : 'Assign Contractor'}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
