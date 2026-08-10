'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, FileText, Check, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/hooks/useAdminStore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function InsiderTradingPolicy() {
  const {
    insiderAlerts,
    insiderPolicies,
    loadDatabase,
    resolveInsiderAlert
  } = useAdminStore();

  const [activeAlert, setActiveAlert] = useState<any>(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    loadDatabase();
  }, [loadDatabase]);

  const handleResolve = () => {
    if (!activeAlert || !resolution.trim()) return;
    resolveInsiderAlert(activeAlert.id, resolution);
    toast({ title: '✓ เคลียร์การเตือนผลประโยชน์ทับซ้อนแล้ว' });
    setActiveAlert(null);
    setResolution('');
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 font-thai">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-rose-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/20">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Insider Trading Policy</h1>
          <p className="text-xs text-slate-500 font-bold">บันทึก policy ห้าม internal ใช้ platform data เพื่อลงทุน + ตรวจสอบผลประโยชน์ทับซ้อน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy view */}
        <Card className="border border-slate-200 bg-white rounded-2xl p-5 shadow-sm space-y-4 col-span-1">
          <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-600 shrink-0" />
            นโยบายห้ามใช้ข้อมูลภายใน (Insider Trading Policy)
          </CardTitle>
          <div className="space-y-3 pt-2 text-xs font-bold text-slate-600 leading-relaxed">
            {insiderPolicies.map(p => (
              <div key={p.id} className="border-b last:border-0 pb-3 last:pb-0 space-y-1.5">
                <div className="flex justify-between items-center">
                  <p className="font-black text-slate-900">{p.title}</p>
                  <Badge className="bg-rose-50 text-rose-700 border border-rose-100 font-bold text-[8px]">
                    v{p.version}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{p.description}</p>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>มีผลบังคับใช้: {p.effectiveDate}</span>
                  <span className="text-green-600 font-black flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Audit Agreement */}
        <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm col-span-2 space-y-4">
          <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            ประวัติการตอบรับนโยบาย (Policy Agreement Acknowledgment)
          </CardTitle>
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b">
                <tr className="font-black text-slate-400 text-[10px] uppercase">
                  <th className="p-4">ผู้ดูแล / พนักงาน</th>
                  <th className="p-4">นโยบายที่เซ็นยอมรับ</th>
                  <th className="p-4 text-center">สถานะ</th>
                  <th className="p-4 text-center">วันเวลาลงนาม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {insiderPolicies.flatMap(p => p.acknowledgedBy.map((user, idx) => (
                  <tr key={`${p.id}-${idx}`} className="hover:bg-slate-50/50">
                    <td className="p-4 font-black text-slate-900">{user}</td>
                    <td className="p-4 text-slate-600">{p.title}</td>
                    <td className="p-4 text-center">
                      <Badge className="bg-green-50 text-green-700 border border-green-100 font-black">
                        ACCEPTED
                      </Badge>
                    </td>
                    <td className="p-4 text-center text-slate-500">{p.lastUpdated}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Compliance / Insider Trading Alerts */}
      <Card className="border border-rose-200 bg-rose-50/5 rounded-2xl p-5 shadow-sm space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-black text-rose-950 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            การแจ้งเตือนความผิดปกติและผลประโยชน์ทับซ้อน (Insider Alerts)
          </CardTitle>
          <CardDescription className="text-xs text-rose-700">
            ระบบตรวจสอบความผิดปกติของราคาและผู้เช่า/ผู้ร่วมทำสัญญาเพื่อป้องกันความลับรั่วไหลและการปั่นราคาตลาด
          </CardDescription>
        </CardHeader>
        <div className="border border-rose-100 rounded-xl divide-y divide-rose-100 bg-white overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-rose-50/50 border-b border-rose-100">
              <tr className="font-black text-rose-700 text-[10px] uppercase">
                <th className="p-4">ประเภทปัญหา</th>
                <th className="p-4">คำอธิบายความผิดปกติ</th>
                <th className="p-4 text-center">ความรุนแรง</th>
                <th className="p-4 text-center">วันที่ตรวจพบ</th>
                <th className="p-4 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {insiderAlerts.map(alert => (
                <tr key={alert.id} className="hover:bg-rose-50/10">
                  <td className="p-4">
                    <Badge className="bg-rose-100 text-rose-800 border-none font-bold text-[9px] uppercase">
                      {alert.type}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-900 font-black">{alert.description}</p>
                    {alert.resolution && <p className="text-[10px] text-green-600 mt-1 font-bold">บันทึก: {alert.resolution}</p>}
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-lg border',
                      alert.severity === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    )}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-500">{alert.createdAt}</td>
                  <td className="p-4 text-right">
                    {alert.status === 'active' ? (
                      <Button className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] h-8" onClick={() => setActiveAlert(alert)}>
                        ตรวจสอบประวัติ / เคลียร์ Flag
                      </Button>
                    ) : (
                      <span className="text-green-600 text-[10px] font-bold">✓ แก้ไขแล้ว</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resolution Dialog */}
      {activeAlert && (
        <Dialog open={!!activeAlert} onOpenChange={() => { setActiveAlert(null); setResolution(''); }}>
          <DialogContent className="max-w-sm w-[95vw] rounded-2xl font-thai">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
                ประเมิน/เคลียร์ข้อเตือนการค้าภายใน
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600">ประเภท: <span className="font-black text-slate-900">{activeAlert.type}</span></p>
              <p className="text-xs font-bold text-slate-600">คำอธิบาย: <span className="font-black text-slate-800">{activeAlert.description}</span></p>
              <div>
                <label className="text-xs font-black text-slate-700 mb-1 block">รายละเอียดการประเมิน / ตรวจสอบ *</label>
                <textarea value={resolution} onChange={e => setResolution(e.target.value)} placeholder="บันทึกผลการตรวจสอบเหตุการณ์..." className="w-full border rounded-xl p-3 text-xs font-bold min-h-[80px] focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setActiveAlert(null); setResolution(''); }} className="flex-1 rounded-xl font-black text-xs">ยกเลิก</Button>
                <Button onClick={handleResolve} disabled={!resolution.trim()} className="flex-1 rounded-xl font-black text-xs bg-rose-600 hover:bg-rose-700 text-white">
                  บันทึก & เคลียร์
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
