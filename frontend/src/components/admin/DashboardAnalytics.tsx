'use client';

import React, { useEffect } from 'react';
import { BarChart3, TrendingUp, Users, AlertTriangle, DollarSign, ShieldAlert, Activity } from 'lucide-react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAdminStore } from '@/hooks/useAdminStore';

const REVENUE_DATA = [
  { month: 'ม.ค.', revenue: 120000, users: 12 },
  { month: 'ก.พ.', revenue: 135000, users: 18 },
  { month: 'มี.ค.', revenue: 150000, users: 24 },
  { month: 'เม.ย.', revenue: 165000, users: 31 },
  { month: 'พ.ค.', revenue: 175000, users: 38 },
  { month: 'มิ.ย.', revenue: 284500, users: 45 },
];

export function DashboardAnalytics() {
  const { users, agentRequests, scamReports, refunds, agentPerformance, securityEvents, loadDatabase } = useAdminStore();

  useEffect(() => { loadDatabase(); }, [loadDatabase]);

  const kpiCards = [
    { label: 'DAU (Active Users)', value: users.filter(u => u.status === 'active').length, sub: `จาก ${users.length} สมาชิกทั้งหมด`, color: 'border-l-indigo-500', icon: '👥' },
    { label: 'Listings ทั้งหมด', value: 47, sub: '+5 ใน 7 วันล่าสุด', color: 'border-l-emerald-500', icon: '🏠' },
    { label: 'Revenue (เดือนนี้)', value: '฿284,500', sub: '+62.8% จากเดือนก่อน', color: 'border-l-violet-500', icon: '💰' },
    { label: 'Agent KYC รอตรวจ', value: agentRequests.filter(r => r.ndidStatus === 'pending').length, sub: 'Pending verification', color: 'border-l-amber-500', icon: '🕵️' },
    { label: 'Reports ที่เปิดอยู่', value: scamReports.filter(r => r.status === 'open').length, sub: 'Scam / fraud alerts', color: 'border-l-red-500', icon: '⚠️' },
    { label: 'Refund รออนุมัติ', value: refunds.filter(r => r.status !== 'completed' && r.status !== 'rejected').length, sub: 'ต้อง dual approval', color: 'border-l-rose-500', icon: '💸' },
    { label: 'Security Alerts', value: securityEvents.filter(e => !e.resolved).length, sub: 'Unresolved threats', color: 'border-l-orange-500', icon: '🔒' },
    { label: 'Fraud Rate', value: '2.1%', sub: 'ต่ำกว่า industry avg 5%', color: 'border-l-teal-500', icon: '🛡️' },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8 font-thai">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Dashboard Analytics</h1>
          <p className="text-xs text-slate-500 font-bold">KPI รวม: DAU, Listings, Revenue, Agent Performance, Fraud Rate</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <Card key={i} className={`border border-slate-200 shadow-sm rounded-2xl bg-white p-5 border-l-4 ${card.color} hover:shadow-md transition-shadow`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                <p className="text-2xl font-black text-slate-800 mt-1.5">{card.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{card.sub}</p>
              </div>
              <span className="text-xl bg-slate-50 p-2 rounded-xl border">{card.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm">
          <CardTitle className="text-sm font-black text-slate-800 mb-4">📈 สถิติรายได้ธุรกรรมรายเดือน</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="revColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickFormatter={(v) => `฿${v / 1000}k`} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#revColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm">
          <CardTitle className="text-sm font-black text-slate-800 mb-4">📊 ผู้ใช้ใหม่รายเดือน</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REVENUE_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="users" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Escrow Pools */}
      <Card className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <CardTitle className="text-sm font-black text-slate-800">💼 สรุปการฝากเงินของส่วนกลาง (System Escrow)</CardTitle>
        <div className="space-y-3">
          {[
            { name: 'Pool 1: ค่ามัดจำสัญญา (โอนตรง)', sub: 'Owner handles deposit approval directly', amount: '฿480,000', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { name: 'Pool 2: ค่าเช่าล่วงหน้า (ระบบกลาง)', sub: 'Holds Website fee, Agent, and Co-Agent payouts', amount: '฿120,000', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
            { name: 'Pool 3: ค่าเช่ารายเดือน', sub: 'Processed through system invoice checks monthly', amount: '฿185,000', color: 'bg-slate-100 text-slate-700' },
          ].map((pool, i) => (
            <div key={i} className="flex items-center justify-between border-b last:border-b-0 pb-2 last:pb-0">
              <div>
                <p className="font-bold text-xs text-slate-800">{pool.name}</p>
                <p className="text-[10px] text-slate-400">{pool.sub}</p>
              </div>
              <Badge className={`${pool.color} border font-black`}>{pool.amount}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Agent Performance */}
      <Card className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-500" />
          Agent Performance Leaderboard
        </CardTitle>
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b">
              <tr className="font-black text-slate-400 text-[10px] uppercase">
                <th className="p-4">อันดับ</th>
                <th className="p-4">นายหน้า</th>
                <th className="p-4 text-center">Deals</th>
                <th className="p-4 text-center">Revenue</th>
                <th className="p-4 text-center">Rating</th>
                <th className="p-4 text-center">Response Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {agentPerformance.sort((a, b) => b.deals - a.deals).map((agent, i) => (
                <tr key={agent.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-700' : 'bg-orange-100 text-orange-700'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="p-4 font-black text-slate-900">{agent.name}</td>
                  <td className="p-4 text-center">{agent.deals}</td>
                  <td className="p-4 text-center">฿{agent.revenue.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <span className="text-amber-600">⭐</span> {agent.rating}
                  </td>
                  <td className="p-4 text-center text-slate-500">{agent.responseTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
