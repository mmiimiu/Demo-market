'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { translations } from '@/lib/translations';

interface OwnerKpisProps {
  lang: 'th' | 'en' | 'cn';
  propertiesCount: number;
}

export function OwnerKpis({ lang, propertiesCount }: OwnerKpisProps) {
  const t = translations[lang] || translations.th;
  const isThai = lang === 'th';

  const kpis = [
    { 
      label: t.my_listings, 
      value: propertiesCount.toString(), 
      icon: Building2, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      borderColor: 'border-t-blue-500', 
      desc: isThai ? 'ประกาศทั้งหมดที่คุณลงไว้' : 'Total listed properties',
      trend: null 
    },
    { 
      label: isThai ? 'รายรับเดือนนี้' : 'Monthly Revenue', 
      value: '฿185,000', 
      icon: DollarSign, 
      color: 'text-green-600', 
      bg: 'bg-green-50', 
      borderColor: 'border-t-green-500',
      desc: isThai ? '+12% เทียบกับเดือนที่แล้ว' : '+12% compared to last month',
      trend: { value: '12%', up: true } 
    },
    { 
      label: isThai ? 'อัตราการเช่า' : 'Occupancy Rate', 
      value: '92%', 
      icon: TrendingUp, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50', 
      borderColor: 'border-t-purple-500',
      desc: isThai ? 'ห้องมีผู้เช่าแล้ว 11/12 ห้อง' : '11/12 rooms occupied',
      trend: { value: '4%', up: true } 
    },
    { 
      label: isThai ? 'แจ้งซ่อมรอจัดการ' : 'Pending Repairs', 
      value: '3', 
      icon: AlertCircle, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50', 
      borderColor: 'border-t-orange-500',
      desc: isThai ? 'กำลังดำเนินการ 2 เคส' : '2 cases in progress',
      trend: { value: '2', up: false } 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {kpis.map((kpi, i) => (
        <Card key={i} className={cn(
          "rounded-2xl border-gray-100 shadow-sm shadow-gray-200/50 bg-white overflow-hidden transition-all duration-300",
          "hover:shadow-md hover:-translate-y-1 hover:border-[#E51D53]/20"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn(kpi.bg, "w-10 h-10 rounded-full flex items-center justify-center")}>
                <kpi.icon className={cn("w-5 h-5", kpi.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-500 truncate">{kpi.label}</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 truncate tracking-tight">{kpi.value}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
              <p className="text-[10px] text-slate-400 font-semibold">{kpi.desc}</p>
              {kpi.trend && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0",
                  kpi.trend.up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {kpi.trend.up ? "↑" : "↓"} {kpi.trend.value}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
