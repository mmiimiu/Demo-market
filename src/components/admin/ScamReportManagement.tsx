'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Search, Shield, Ban } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/hooks/useAdminStore';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ScamReportManagement() {
  const { scamReports, loadDatabase, handleScamReport, updateUserStatus } = useAdminStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionDialog, setActionDialog] = useState<{ reportId: string; action: 'takedown' | 'dismiss' | 'investigate' } | null>(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => { loadDatabase(); }, [loadDatabase]);

  const filtered = scamReports.filter(r => {
    const matchSearch = (r.reason || '').toLowerCase().includes(search.toLowerCase()) || (r.reporterName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAction = () => {
    if (!actionDialog) return;
    handleScamReport(actionDialog.reportId, actionDialog.action, resolution);
    const report = scamReports.find(r => r.id === actionDialog.reportId);
    if (actionDialog.action === 'takedown' && report?.targetType === 'user') {
      updateUserStatus(report.targetId, 'banned', `Auto-ban จากรายงาน: ${report.reason}`);
    }
    toast({ title: actionDialog.action === 'takedown' ? '🚫 Takedown สำเร็จ' : actionDialog.action === 'investigate' ? '🔍 เริ่มสืบสวน' : 'ปิดรายงาน' });
    setActionDialog(null);
    setResolution('');
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'open': return 'bg-red-50 text-red-700 border-red-100';
      case 'investigating': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-100';
      case 'dismissed': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 font-thai">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Report / Scam Management</h1>
          <p className="text-xs text-slate-500 font-bold">รับเรื่องร้องเรียน, takedown ประกาศ, ban user — พร้อม evidence log</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'ทั้งหมด', value: scamReports.length, color: 'text-slate-700' },
          { label: 'เปิดอยู่', value: scamReports.filter(r => r.status === 'open').length, color: 'text-red-600' },
          { label: 'กำลังสืบสวน', value: scamReports.filter(r => r.status === 'investigating').length, color: 'text-blue-600' },
          { label: 'แก้ไขแล้ว', value: scamReports.filter(r => r.status === 'resolved').length, color: 'text-green-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาเรื่องร้องเรียน..." className="pl-9 h-9 text-xs rounded-xl" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border rounded-xl px-3 py-2 text-xs bg-white font-bold focus:outline-none">
          <option value="all">ทุกสถานะ</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {/* Reports Table */}
      <Card className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b">
              <tr className="font-black text-slate-400 text-[10px] uppercase">
                <th className="p-4">หัวข้อและรายละเอียด</th>
                <th className="p-4">เป้าหมาย</th>
                <th className="p-4 text-center">หลักฐาน</th>
                <th className="p-4 text-center">สถานะ</th>
                <th className="p-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {filtered.map(rep => (
                <tr key={rep.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-black text-slate-900">{rep.reason}</p>
                    <p className="text-[10px] text-slate-400">ผู้แจ้ง: {rep.reporterName} · {rep.createdAt}</p>
                    {rep.resolution && <p className="text-[10px] text-green-600 mt-1">แก้ไข: {rep.resolution}</p>}
                  </td>
                  <td className="p-4">
                    <Badge className="bg-slate-100 text-slate-700 border-none font-bold text-[9px] uppercase mr-1">{rep.targetType}</Badge>
                    <span className="font-mono text-slate-500">#{rep.targetId}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-[10px] font-bold text-blue-600 underline cursor-pointer">🖼 {rep.evidence}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-lg border', statusColor(rep.status))}>
                      {rep.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {rep.status === 'open' && (
                      <div className="flex gap-1.5 justify-end">
                        <Button variant="outline" size="sm" className="h-7 font-black text-[10px] text-blue-600" onClick={() => setActionDialog({ reportId: rep.id, action: 'investigate' })}>
                          🔍 สืบสวน
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 font-black text-[10px]" onClick={() => setActionDialog({ reportId: rep.id, action: 'dismiss' })}>
                          ปิด
                        </Button>
                        <Button variant="destructive" size="sm" className="h-7 font-black text-[10px]" onClick={() => setActionDialog({ reportId: rep.id, action: 'takedown' })}>
                          🚫 Takedown
                        </Button>
                      </div>
                    )}
                    {rep.status === 'investigating' && (
                      <div className="flex gap-1.5 justify-end">
                        <Button variant="outline" size="sm" className="h-7 font-black text-[10px]" onClick={() => setActionDialog({ reportId: rep.id, action: 'dismiss' })}>
                          ปิด
                        </Button>
                        <Button variant="destructive" size="sm" className="h-7 font-black text-[10px]" onClick={() => setActionDialog({ reportId: rep.id, action: 'takedown' })}>
                          🚫 Takedown
                        </Button>
                      </div>
                    )}
                    {(rep.status === 'resolved' || rep.status === 'dismissed') && (
                      <span className="text-[10px] text-slate-400 font-bold">{rep.resolvedBy && `โดย ${rep.resolvedBy}`}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Action Dialog */}
      {actionDialog && (
        <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setResolution(''); }}>
          <DialogContent className="max-w-sm w-[95vw] rounded-2xl font-thai">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                {actionDialog.action === 'takedown' ? <Ban className="w-5 h-5 text-red-600" /> : actionDialog.action === 'investigate' ? <Search className="w-5 h-5 text-blue-600" /> : <Shield className="w-5 h-5 text-slate-600" />}
                {actionDialog.action === 'takedown' ? 'Takedown & Ban' : actionDialog.action === 'investigate' ? 'เริ่มสืบสวน' : 'ปิดรายงาน'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-black text-slate-700 mb-1 block">บันทึกเหตุผล / Resolution</label>
                <textarea value={resolution} onChange={e => setResolution(e.target.value)} placeholder="ระบุรายละเอียด..." className="w-full border rounded-xl p-3 text-xs font-bold min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setActionDialog(null); setResolution(''); }} className="flex-1 rounded-xl font-black text-xs">ยกเลิก</Button>
                <Button onClick={handleAction} className={cn('flex-1 rounded-xl font-black text-xs text-white', actionDialog.action === 'takedown' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700')}>
                  ยืนยัน
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
