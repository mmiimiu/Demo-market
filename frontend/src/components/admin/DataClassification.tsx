'use client';

import React, { useEffect } from 'react';
import { Database, Lock, Globe, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/hooks/useAdminStore';
import { toast } from '@/hooks/use-toast';
import type { DataTier } from '@/lib/types/admin-types';

export function DataClassification() {
  const { classifications, loadDatabase, updateClassification } = useAdminStore();

  useEffect(() => { loadDatabase(); }, [loadDatabase]);

  const tierColor = (t: string) => {
    switch (t) { case 'Sensitive': return 'bg-red-50 text-red-700 border-red-100'; case 'Internal': return 'bg-amber-50 text-amber-700 border-amber-100'; case 'Public': return 'bg-green-50 text-green-700 border-green-100'; default: return 'bg-gray-100 text-gray-600'; }
  };
  const tierIcon = (t: string) => {
    switch (t) { case 'Sensitive': return <Lock className="w-3.5 h-3.5 text-red-500" />; case 'Internal': return <Shield className="w-3.5 h-3.5 text-amber-500" />; default: return <Globe className="w-3.5 h-3.5 text-green-500" />; }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 font-thai">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-600/20">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Data Classification Management</h1>
          <p className="text-xs text-slate-500 font-bold">จัดการ 3 tier: Public / Internal / Sensitive — access control + encryption per tier</p>
        </div>
      </div>

      {/* Tier Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { tier: 'Public', icon: '🌐', desc: 'ข้อมูลที่เปิดเผยได้ เช่น ที่ตั้งทรัพย์สิน, ราคาประกาศ', access: 'ทุกคน', encryption: 'ไม่เข้ารหัส', color: 'border-green-200 bg-green-50/30' },
          { tier: 'Internal', icon: '🔒', desc: 'ข้อมูลภายใน เช่น อีเมล, เบอร์โทร, ประวัติธุรกรรม', access: 'Admin + SuperAdmin', encryption: 'เข้ารหัส AES-256', color: 'border-amber-200 bg-amber-50/30' },
          { tier: 'Sensitive', icon: '🛡️', desc: 'ข้อมูลอ่อนไหว เช่น บัตรประชาชน, ลายเซ็น, บัญชีธนาคาร', access: 'SuperAdmin เท่านั้น', encryption: 'เข้ารหัส + Field-level encryption', color: 'border-red-200 bg-red-50/30' },
        ].map((t, i) => (
          <Card key={i} className={`${t.color} border rounded-2xl p-5 shadow-sm space-y-2`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{t.icon}</span>
              <h3 className="font-black text-slate-900">{t.tier}</h3>
            </div>
            <p className="text-[11px] text-slate-600 font-bold leading-relaxed">{t.desc}</p>
            <div className="text-[10px] space-y-1 pt-2 border-t">
              <p className="font-bold text-slate-500">🔑 Access: <span className="text-slate-800">{t.access}</span></p>
              <p className="font-bold text-slate-500">🔐 Encryption: <span className="text-slate-800">{t.encryption}</span></p>
            </div>
          </Card>
        ))}
      </div>

      {/* Classification Table */}
      <Card className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            ระบบจัดการระดับความเป็นส่วนตัวข้อมูล
          </CardTitle>
          <CardDescription className="text-xs">จำแนกชั้นความลับฟิลด์ฐานข้อมูลเพื่อความปลอดภัยของข้อมูลผู้เช่า</CardDescription>
        </CardHeader>
        <div className="p-5 overflow-x-auto">
          <div className="border rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b">
                <tr className="font-black text-slate-400 text-[10px] uppercase">
                  <th className="p-4">ตาราง/ฟิลด์</th>
                  <th className="p-4">คำอธิบาย</th>
                  <th className="p-4 text-center">ระดับ</th>
                  <th className="p-4 text-center">เข้ารหัส</th>
                  <th className="p-4 text-center">สิทธิ์เข้าถึง</th>
                  <th className="p-4 text-center">ผู้ดูแล</th>
                  <th className="p-4 text-right">แก้ไขระดับ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {classifications.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-slate-900">{item.field}</td>
                    <td className="p-4 text-slate-600">{item.description}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1">
                        {tierIcon(item.classification)}
                        <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-lg border', tierColor(item.classification))}>
                          {item.classification}
                        </span>
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {item.encrypted ? <span className="text-green-600 font-black">🔐 Yes</span> : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {item.accessRoles.slice(0, 3).map((r, i) => (
                          <Badge key={i} className="bg-slate-100 text-slate-600 border-none font-bold text-[8px]">{r}</Badge>
                        ))}
                        {item.accessRoles.length > 3 && <Badge className="bg-slate-100 text-slate-400 border-none text-[8px]">+{item.accessRoles.length - 3}</Badge>}
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-500">{item.owner}</td>
                    <td className="p-4 text-right">
                      <select value={item.classification} onChange={e => { updateClassification(item.id, e.target.value as DataTier); toast({ title: 'เปลี่ยนระดับความเป็นส่วนตัวแล้ว' }); }} className="border rounded-xl px-2 py-1 text-xs bg-white font-bold focus:outline-none">
                        <option value="Public">Public</option>
                        <option value="Internal">Internal</option>
                        <option value="Sensitive">Sensitive</option>
                      </select>
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
