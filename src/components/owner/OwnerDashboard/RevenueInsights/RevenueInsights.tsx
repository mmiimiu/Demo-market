'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, TrendingUp, Calendar } from 'lucide-react';
import { RevenueChart } from './components/RevenueChart';
import { RevenueInsightsProps, ChartPoint } from './types';

export function RevenueInsights({ lang }: RevenueInsightsProps) {
  const isThai = lang === 'th';
  const isChinese = lang === 'cn';
  const [activePoint, setActivePoint] = useState<number>(5);

  const data: ChartPoint[] = [
    { monthTh: 'ม.ค.', monthEn: 'Jan', value: 120000, label: '฿120k', growth: 'Base', x: 30, y: 120 },
    { monthTh: 'ก.พ.', monthEn: 'Feb', value: 135000, label: '฿135k', growth: '+12.5%', x: 80, y: 105 },
    { monthTh: 'มี.ค.', monthEn: 'Mar', value: 150000, label: '฿150k', growth: '+11.1%', x: 130, y: 90 },
    { monthTh: 'เม.ย.', monthEn: 'Apr', value: 165000, label: '฿165k', growth: '+10.0%', x: 180, y: 75 },
    { monthTh: 'พ.ค.', monthEn: 'May', value: 175000, label: '฿175k', growth: '+6.1%', x: 230, y: 68 },
    { monthTh: 'มิ.ย.', monthEn: 'Jun', value: 185000, label: '฿185k', growth: '+5.7%', x: 280, y: 60 }
  ];

  const currentPoint = data[activePoint];

  return (
    <Card className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50 p-6 relative overflow-hidden group flex flex-col justify-between h-[395px] font-thai">
      {/* Decorative background watermark */}
      <ArrowUpRight className="absolute -right-4 -top-4 w-32 h-32 text-[#E51D53]/5 pointer-events-none group-hover:scale-125 transition-transform duration-700" />

      <div className="shrink-0 z-10">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-base font-semibold tracking-wide text-gray-900">
            {isThai ? 'วิเคราะห์รายรับสะสม' : isChinese ? '累计收入分析' : 'Revenue Analysis'}
          </h4>
          <span className="bg-[#E51D53]/10 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold tracking-wider rounded-xl flex items-center gap-1 text-[#E51D53] font-thai">
            <Calendar className="w-3 h-3" /> 6 MONTHS
          </span>
        </div>

        {/* Interactive Tooltip Header */}
        <div className="flex justify-between items-baseline mt-4 border-b border-gray-100 pb-3">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
              {isThai ? `ยอดรายรับเดือน ${currentPoint.monthTh}` : `Revenue for ${currentPoint.monthEn}`}
            </p>
            <p className="text-2xl font-semibold tracking-tight text-gray-900 animate-in fade-in duration-300">
              ฿{currentPoint.value.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-[#E51D53]/10 text-[#E51D53] font-semibold px-2 py-0.5 rounded-xl flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> {currentPoint.growth}
            </span>
            <p className="text-[9px] text-gray-400 mt-1 font-medium">เทียบเดือนก่อน</p>
          </div>
        </div>
      </div>

      <RevenueChart data={data} activePoint={activePoint} setActivePoint={setActivePoint} isThai={isThai} />

      {/* Target Progress Bar Footer */}
      <div className="space-y-2 mt-4 shrink-0 border-t border-gray-100 pt-4 z-10">
        <div className="flex justify-between text-[9px] font-semibold uppercase tracking-widest text-gray-600">
          <span>{isThai ? 'เป้าหมายรายปี' : isChinese ? '年度目标' : 'Yearly Target'}</span>
          <span>฿2.22M / ฿2.50M</span>
        </div>
        <Progress value={88} className="h-2 bg-gray-100" />
      </div>
    </Card>
  );
}
