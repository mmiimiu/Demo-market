"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { translations } from '@/lib/translations';

const data = [
  { name: 'Jan 24', revenue: 45000, expenses: 12000 },
  { name: 'Jan 25', revenue: 52000, expenses: 15000 },
  { name: 'Jan 26', revenue: 48000, expenses: 10000 },
  { name: 'Jan 27', revenue: 61000, expenses: 18000 },
  { name: 'Jan 28', revenue: 59000, expenses: 14000 },
  { name: 'Jan 29', revenue: 65000, expenses: 16000 },
  { name: 'Jan 30', revenue: 72000, expenses: 19000 },
];

export function OwnerRevenueChart({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const isThai = lang === 'th';
  
  return (
    <Card className="p-6 rounded-2xl border-gray-100 shadow-sm shadow-gray-200/50 bg-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-base">{isThai ? 'รายได้และค่าใช้จ่าย' : 'Revenue & Expenses'}</h3>
          <p className="text-xs text-slate-500 mt-1">
            <span className="font-bold text-slate-800 text-xl tracking-tight">฿ 402,000</span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#E51D53]"></span> {isThai ? 'รายได้' : 'Revenue'}</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-200"></span> {isThai ? 'ค่าใช้จ่าย' : 'Expenses'}</div>
        </div>
      </div>
      
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={0}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `฿${val/1000}k`} />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              formatter={(value: number) => [`฿${value.toLocaleString()}`, '']}
            />
            <Bar dataKey="revenue" stackId="a" fill="#E51D53" radius={[0, 0, 4, 4]} barSize={32} />
            <Bar dataKey="expenses" stackId="a" fill="#fecaca" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
