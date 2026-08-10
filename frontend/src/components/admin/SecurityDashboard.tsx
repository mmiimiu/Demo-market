'use client';

import React, { useEffect } from 'react';
import { Shield, Key, Activity, AlertTriangle, Wifi, Lock, Ban } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/hooks/useAdminStore';
import { toast } from '@/hooks/use-toast';

export function SecurityDashboard() {
  const { securityEvents, auditLogs, is2faEnforced, loadDatabase, resolveSecurityEvent, toggle2fa } = useAdminStore();

  useEffect(() => { loadDatabase(); }, [loadDatabase]);

  const severityColor = (s: string) => {
    switch (s) { case 'critical': return 'bg-red-100 text-red-800 border-red-200'; case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'; case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200'; default: return 'bg-blue-100 text-blue-800 border-blue-200'; }
  };
  const typeIcon = (t: string) => {
    switch (t) { case 'failed_login': return '🔑'; case 'suspicious_ip': return '🌐'; case 'idor_attempt': return '🔓'; case 'rate_limit': return '⚡'; case 'brute_force': return '💥'; default: return '⚠️'; }
  };
  const typeLabel = (t: string) => {
    switch (t) { case 'failed_login': return 'Failed Login'; case 'suspicious_ip': return 'Suspicious IP'; case 'idor_attempt': return 'IDOR Attempt'; case 'rate_limit': return 'Rate Limit Hit'; case 'brute_force': return 'Brute Force'; default: return t; }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 font-thai">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">ดูแลความปลอดภัย</h1>
          <p className="text-xs text-slate-500 font-bold">Security dashboard: failed login, suspicious IP, IDOR attempt, rate limit hit</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Active Threats', value: securityEvents.filter(e => !e.resolved).length, color: 'text-red-600', icon: '🔴' },
          { label: 'Failed Logins', value: securityEvents.filter(e => e.type === 'failed_login' && !e.resolved).length, color: 'text-orange-600', icon: '🔑' },
          { label: 'Suspicious IPs', value: securityEvents.filter(e => e.type === 'suspicious_ip' && !e.resolved).length, color: 'text-amber-600', icon: '🌐' },
          { label: 'IDOR Attempts', value: securityEvents.filter(e => e.type === 'idor_attempt' && !e.resolved).length, color: 'text-purple-600', icon: '🔓' },
          { label: 'Rate Limits', value: securityEvents.filter(e => e.type === 'rate_limit' && !e.resolved).length, color: 'text-blue-600', icon: '⚡' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
            <span className="text-lg">{s.icon}</span>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2FA Toggle */}
        <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-500" />
              บังคับเปิด 2FA ทั่วระบบ
            </CardTitle>
            <p className="text-[11px] text-slate-400 mt-2 font-bold leading-relaxed">
              เปิดสวิตช์นี้เพื่อบังคับให้ Owner และ Agent ทุกคนต้องตั้งค่าการยืนยันตัวตนสองขั้นตอน
            </p>
          </div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <span className="text-xs font-black text-slate-700">สถานะบังคับใช้</span>
            <button onClick={() => { toggle2fa(); toast({ title: 'เปลี่ยนการบังคับความปลอดภัยเรียบร้อย' }); }} className={`w-12 h-6 rounded-full transition-colors ${is2faEnforced ? 'bg-amber-500' : 'bg-slate-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${is2faEnforced ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </Card>

        {/* Audit Log */}
        <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm lg:col-span-2 space-y-4">
          <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            Security Audit Log
          </CardTitle>
          <div className="max-h-[180px] overflow-y-auto border rounded-xl divide-y text-xs font-bold text-slate-600 bg-slate-50/50">
            {auditLogs.slice(0, 10).map((log, idx) => (
              <div key={idx} className="p-3 flex justify-between gap-3 hover:bg-slate-50">
                <div>
                  <p className="font-black text-slate-800">{log.action}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Target: {log.target} · Admin: {log.adminName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-[9px] text-slate-500">{log.ipAddress}</p>
                  <p className="text-[9px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && <div className="p-6 text-center text-slate-400">ไม่มีประวัติ</div>}
          </div>
        </Card>
      </div>

      {/* Security Events Table */}
      <Card className="border border-red-200 bg-red-50/5 rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Security Events & Threats
          </CardTitle>
          <CardDescription className="text-xs">เหตุการณ์ด้านความปลอดภัยที่ระบบตรวจพบ</CardDescription>
        </CardHeader>
        <div className="p-5 overflow-x-auto">
          <div className="border border-red-100 bg-white rounded-xl divide-y divide-red-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-red-50/50 border-b border-red-100">
                <tr className="font-black text-red-700 text-[10px] uppercase">
                  <th className="p-4">ประเภท</th>
                  <th className="p-4">รายละเอียด</th>
                  <th className="p-4 text-center">IP Address</th>
                  <th className="p-4 text-center">ความรุนแรง</th>
                  <th className="p-4 text-center">เวลา</th>
                  <th className="p-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {securityEvents.map(event => (
                  <tr key={event.id} className={cn('hover:bg-red-50/10', event.resolved && 'opacity-50')}>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span>{typeIcon(event.type)}</span>
                        <Badge className="bg-slate-100 text-slate-700 border-none font-bold text-[9px]">{typeLabel(event.type)}</Badge>
                      </span>
                    </td>
                    <td className="p-4 text-slate-900 max-w-[300px]">{event.description}</td>
                    <td className="p-4 text-center font-mono text-slate-500">{event.ipAddress}</td>
                    <td className="p-4 text-center">
                      <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-lg border', severityColor(event.severity))}>
                        {event.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-center text-[10px] text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</td>
                    <td className="p-4 text-right">
                      {!event.resolved ? (
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] h-7" onClick={() => { resolveSecurityEvent(event.id); toast({ title: 'Resolved security event' }); }}>
                          ✓ Resolve
                        </Button>
                      ) : (
                        <span className="text-green-600 text-[10px] font-bold">✅ {event.resolvedBy}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
