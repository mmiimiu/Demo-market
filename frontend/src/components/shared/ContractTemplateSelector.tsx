"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Layers, Calendar, Clock, CalendarDays } from 'lucide-react';

type ContractTemplate = 'monthly' | 'annual' | 'short_term';

interface ContractTemplateSelectorProps {
  value: ContractTemplate;
  onChange: (t: ContractTemplate) => void;
  lang?: 'th' | 'en' | 'cn';
}

const TEMPLATES = [
  {
    key: 'monthly' as ContractTemplate,
    icon: Calendar,
    labelTh: 'รายเดือน',
    labelEn: 'Monthly',
    descTh: 'สัญญามาตรฐาน 12 เดือน ชำระค่าเช่าทุกเดือน',
    descEn: 'Standard 12-month agreement, monthly payments',
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    activeColor: 'border-blue-500 bg-blue-100 text-blue-800 ring-2 ring-blue-300/50',
    dot: 'bg-blue-500',
  },
  {
    key: 'annual' as ContractTemplate,
    icon: CalendarDays,
    labelTh: 'รายปี',
    labelEn: 'Annual',
    descTh: 'ระยะยาว มีข้อกำหนดปรับค่าเช่ารายปีไม่เกิน 5%',
    descEn: 'Long-term with annual rent increment clause (max 5%)',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    activeColor: 'border-emerald-500 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300/50',
    dot: 'bg-emerald-500',
  },
  {
    key: 'short_term' as ContractTemplate,
    icon: Clock,
    labelTh: 'ระยะสั้น',
    labelEn: 'Short-term',
    descTh: 'รายสัปดาห์หรือรายวัน เหมาะสำหรับ Serviced Apartment',
    descEn: 'Weekly / daily rate, suited for serviced apartments',
    color: 'border-amber-200 bg-amber-50 text-amber-700',
    activeColor: 'border-amber-500 bg-amber-100 text-amber-800 ring-2 ring-amber-300/50',
    dot: 'bg-amber-500',
  },
];

export function ContractTemplateSelector({
  value,
  onChange,
  lang = 'th',
}: ContractTemplateSelectorProps) {
  const isTh = lang === 'th';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-primary" />
        <span className="text-sm font-black text-gray-700 uppercase tracking-wider">
          {isTh ? 'เลือกประเภทสัญญา' : 'Select Contract Template'}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TEMPLATES.map((t) => {
          const isActive = value === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={cn(
                "flex flex-col gap-2 p-4 border-2 rounded-none text-left transition-all duration-200 hover:shadow-md",
                isActive ? t.activeColor : `border-gray-200 bg-white text-gray-600 hover:${t.color}`
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", isActive ? t.dot : "bg-gray-300")} />
                <Icon className={cn("w-4 h-4", isActive ? "" : "text-gray-400")} />
                <span className="font-black text-sm">{isTh ? t.labelTh : t.labelEn}</span>
              </div>
              <p className={cn("text-[11px] font-bold leading-relaxed", isActive ? "opacity-80" : "text-gray-400")}>
                {isTh ? t.descTh : t.descEn}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { ContractTemplate };
