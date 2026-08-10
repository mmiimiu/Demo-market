'use client';

import React from 'react';
import { Timer, TrendingUp, MapPin, Star, Award, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentPerformanceDashboardProps {
  lang: 'th' | 'en' | 'cn';
  /** ค่าเหล่านี้ inject มาจาก AgentDashboard — ไม่มีการเปลี่ยนแปลงข้อมูลเดิม */
  occupiedCount?: number;
  totalManaged?: number;
}

/** Mock performance data — ใช้ข้อมูล static จำลองสำหรับ demo */
const MOCK_ZONES = [
  { name: 'สุขุมวิท / อโศก', deals: 18, color: 'bg-indigo-500' },
  { name: 'ลาดพร้าว / รัชดา', deals: 12, color: 'bg-emerald-500' },
  { name: 'อารีย์ / ประดิพัทธ์', deals: 9, color: 'bg-amber-500' },
  { name: 'พระราม 9 / พระโขนง', deals: 7, color: 'bg-rose-500' },
  { name: 'ดินแดง / วิภาวดี', deals: 4, color: 'bg-purple-500' },
];

export function AgentPerformanceDashboard({ lang, occupiedCount = 37, totalManaged = 55 }: AgentPerformanceDashboardProps) {
  const isTh = lang === 'th';
  const dealCloseRate = Math.round((occupiedCount / totalManaged) * 100);
  const maxDeals = Math.max(...MOCK_ZONES.map(z => z.deals));

  const metrics = [
    {
      icon: Timer,
      label: isTh ? 'เวลาตอบสนองเฉลี่ย' : 'Avg. Response Time',
      value: '18 min',
      sub: isTh ? 'ภายใน 30 นาที ✓' : 'Within 30 min ✓',
      color: 'text-teal-600 bg-teal-50 border-teal-100',
      badge: isTh ? 'ดีมาก' : 'Excellent',
      badgeColor: 'bg-teal-100 text-teal-700',
    },
    {
      icon: TrendingUp,
      label: isTh ? 'Deal Close Rate' : 'Deal Close Rate',
      value: `${dealCloseRate}%`,
      sub: isTh ? `ปิดดีลได้ ${occupiedCount}/${totalManaged} ห้อง` : `${occupiedCount}/${totalManaged} units closed`,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      badge: dealCloseRate >= 70 ? (isTh ? 'สูงกว่าเป้า' : 'Above Target') : (isTh ? 'ต่ำกว่าเป้า' : 'Below Target'),
      badgeColor: dealCloseRate >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
    },
    {
      icon: Star,
      label: isTh ? 'คะแนนจากลูกค้า' : 'Client Rating',
      value: '4.8 / 5',
      sub: isTh ? 'จาก 124 รีวิว' : 'From 124 reviews',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      badge: isTh ? 'Top Agent' : 'Top Agent',
      badgeColor: 'bg-amber-100 text-amber-700',
    },
    {
      icon: Award,
      label: isTh ? 'ดีลปิดแล้วปีนี้' : 'Deals Closed (YTD)',
      value: '58 ดีล',
      sub: isTh ? 'เป้า 60 ดีล/ปี' : 'Target: 60 deals/yr',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      badge: '97%',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
  ];

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center">
          <Activity className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-base font-black text-gray-900">
            {isTh ? 'Performance Dashboard' : 'Agent Performance Dashboard'}
          </h2>
          <p className="text-[11px] text-gray-400 font-medium">
            {isTh ? 'วิเคราะห์ประสิทธิภาพการทำงานและย่านที่ครอบคลุม' : 'Real-time metrics on response time, close rate & coverage zones'}
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className={cn('bg-white border rounded-2xl p-4 space-y-2 hover:shadow-md transition-shadow', m.color.split(' ')[2])}>
            <div className="flex justify-between items-start">
              <div className={cn('p-2 rounded-xl border', m.color)}>
                <m.icon className="w-4 h-4" />
              </div>
              <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full', m.badgeColor)}>{m.badge}</span>
            </div>
            <p className="text-xs font-bold text-gray-500">{m.label}</p>
            <p className="text-xl font-black text-gray-900">{m.value}</p>
            <p className="text-[10px] text-gray-400 font-medium">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Zone Chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-black text-gray-900">
            {isTh ? 'ดีลตามย่าน (Top Zones)' : 'Deals by Zone (Top Zones)'}
          </h3>
        </div>
        <div className="space-y-3">
          {MOCK_ZONES.map((zone) => (
            <div key={zone.name} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>{zone.name}</span>
                <span className="text-gray-400">{zone.deals} {isTh ? 'ดีล' : 'deals'}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', zone.color)}
                  style={{ width: `${(zone.deals / maxDeals) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
