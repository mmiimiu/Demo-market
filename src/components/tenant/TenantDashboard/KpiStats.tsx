'use client';

import React from 'react';
import { Calendar, CreditCard, Clock, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiStatsProps {
  monthsPaid: number;
  totalPaid: number;
  nextPaymentDays: number;
  checklistDone: number;
  checklistTotal: number;
  label: (th: string, en: string, cn: string) => string;
}

export function KpiStats({
  monthsPaid, totalPaid, nextPaymentDays, checklistDone, checklistTotal, label
}: KpiStatsProps) {
  const stats = [
    {
      icon: <Calendar className="w-4 h-4 text-[#E51D53]" />,
      iconBg: 'bg-rose-50 border-rose-100 text-[#E51D53]',
      label: label('เดือนที่เช่าแล้ว', 'Months Rented', '已租月数'),
      value: `${monthsPaid}`,
      sub: label('เดือนที่สะสม', 'Total Months', '累计月数'),
    },
    {
      icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
      label: label('ยอดรวมที่จ่าย', 'Total Paid', '累计支付'),
      value: `฿${totalPaid.toLocaleString()}`,
      sub: label('บาทรวมสุทธิ', 'THB Total', '泰铢'),
    },
    {
      icon: <Clock className="w-4 h-4 text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100 text-amber-600',
      label: label('บิลถัดไปใน', 'Next Payment', '下次付款'),
      value: nextPaymentDays > 0 ? `${nextPaymentDays} วัน` : '-',
      sub: nextPaymentDays > 0 ? label('วันชำระงวดถัดไป', 'Days remaining', '剩余天数') : label('ไม่มีบิลค้างชำระ', 'No bill due', '无账单'),
    },
    {
      icon: <ClipboardList className="w-4 h-4 text-indigo-600" />,
      iconBg: 'bg-indigo-50 border-indigo-100 text-indigo-600',
      label: label('รายการย้ายเข้า', 'Move-in Checklist', '入住清单'),
      value: `${checklistDone}/${checklistTotal}`,
      sub: label('รายการสำเร็จแล้ว', 'Tasks Completed', '已完成'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className="bg-white border border-gray-150 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-w-0 relative group"
        >
          {/* Header row with Label & Icon */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs sm:text-sm font-bold text-gray-600 tracking-wide">
              {stat.label}
            </span>
            <div className={cn("p-2.5 rounded-xl shrink-0 border shadow-2xs transition-transform group-hover:scale-105", stat.iconBg)}>
              {stat.icon}
            </div>
          </div>

          {/* Value and Subtitle */}
          <div className="min-w-0">
            <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {stat.value}
            </div>
            <p className="text-xs font-medium text-gray-400 mt-1.5">
              {stat.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

