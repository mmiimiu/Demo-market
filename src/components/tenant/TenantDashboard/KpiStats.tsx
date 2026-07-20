'use client';

import React from 'react';
import { Calendar, CreditCard, Clock, ClipboardList } from 'lucide-react';

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
      icon: <Calendar className="w-5 h-5 text-[#E51D53]" />,
      label: label('เดือนที่เช่าแล้ว', 'Months Rented', '已租月数'),
      value: `${monthsPaid}`,
      sub: label('เดือน', 'months', '个月'),
      color: 'bg-white border-gray-100 shadow-sm shadow-gray-200/50',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
      label: label('ยอดรวมที่จ่าย', 'Total Paid', '累计支付'),
      value: `฿${totalPaid.toLocaleString()}`,
      sub: label('บาท', 'THB', '泰铢'),
      color: 'bg-white border-gray-100 shadow-sm shadow-gray-200/50',
    },
    {
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      label: label('บิลถัดไปใน', 'Next payment in', '下次付款'),
      value: nextPaymentDays > 0 ? `${nextPaymentDays}` : '-',
      sub: nextPaymentDays > 0 ? label('วัน', 'days', '天') : label('ไม่มีบิลค้าง', 'No bill', '无账单'),
      color: 'bg-white border-gray-100 shadow-sm shadow-gray-200/50',
    },
    {
      icon: <ClipboardList className="w-5 h-5 text-indigo-500" />,
      label: label('รายการย้ายเข้า', 'Move-in checklist', '入住清单'),
      value: `${checklistDone}/${checklistTotal}`,
      sub: label('สำเร็จ', 'completed', '已完成'),
      color: 'bg-white border-gray-100 shadow-sm shadow-gray-200/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className={`p-5 rounded-3xl border flex flex-col justify-between h-32 premium-card-hover ${stat.color}`}>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-semibold text-[10px] uppercase tracking-wider">{stat.label}</span>
            <div className="p-2 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm shrink-0 border border-white/40">{stat.icon}</div>
          </div>
          <div>
            <span className="text-2xl font-black text-[#1E293B] block leading-none">{stat.value}</span>
            <span className="text-[9px] text-gray-400 font-bold mt-1.5 block uppercase tracking-wider">{stat.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
