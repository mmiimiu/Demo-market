'use client';

import React, { useEffect } from 'react';
import { Lock, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/hooks/useAdminStore';
import { toast } from '@/hooks/use-toast';

export function DualApprovalRefund() {
  const { refunds, loadDatabase, handleRefundAdminApprove, handleRefundSuperAdminConfirm, handleRefundReject, isSuperAdmin } = useAdminStore();

  useEffect(() => { loadDatabase(); }, [loadDatabase]);

  return (
    <div className="space-y-6 p-6 lg:p-8 font-thai">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Dual Approval Refund</h1>
          <p className="text-xs text-slate-500 font-bold">Refund เงินประกัน/commission ต้องผ่าน Admin approve + SA confirm</p>
        </div>
      </div>

      {/* Flow Explanation */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
        <div className="text-xs text-violet-800 font-bold leading-relaxed">
          <p className="font-black mb-1">ขั้นตอนการคืนเงิน 2 ระดับ:</p>
          <p>1️⃣ <strong>Admin</strong> ตรวจสอบและกดอนุมัติเบื้องต้น</p>
          <p>2️⃣ <strong>Super Admin</strong> ยืนยันยอดจ่ายออก (Final Confirmation)</p>
          <p className="mt-1 text-violet-600">⚠️ ปุ่ม Super Admin Confirm จะ disabled สำหรับ Admin ปกติ</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'รอ Admin อนุมัติ', value: refunds.filter(r => r.status === 'pending').length, color: 'text-amber-600' },
          { label: 'รอ SA ยืนยัน', value: refunds.filter(r => r.status === 'admin_approved').length, color: 'text-blue-600' },
          { label: 'เสร็จสมบูรณ์', value: refunds.filter(r => r.status === 'completed').length, color: 'text-green-600' },
          { label: 'ถูกปฏิเสธ', value: refunds.filter(r => r.status === 'rejected').length, color: 'text-red-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Refund Table */}
      <Card className="border border-violet-200 bg-violet-50/5 rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base font-black text-violet-950 flex items-center gap-2">
            <Lock className="w-5 h-5 text-violet-600" />
            ระบบคืนเงินอนุมัติสองขั้นตอน
          </CardTitle>
          <CardDescription className="text-xs text-violet-700">
            🔒 การคืนเงินจำเป็นต้องผ่าน Admin กดอนุมัติเบื้องต้น และ Super Admin ยืนยันยอดเงินจ่ายออกจึงจะเสร็จสมบูรณ์
          </CardDescription>
        </CardHeader>
        <div className="p-5 overflow-x-auto">
          <div className="border border-violet-100 bg-white rounded-xl divide-y divide-violet-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-violet-50/50 border-b border-violet-100">
                <tr className="font-black text-violet-700 text-[10px] uppercase">
                  <th className="p-4">ผู้ร้องขอและเหตุผล</th>
                  <th className="p-4 text-center">ประเภท</th>
                  <th className="p-4 text-center">การลงชื่ออนุมัติ</th>
                  <th className="p-4 text-center">ยอดคืนเงิน</th>
                  <th className="p-4 text-center">สถานะ</th>
                  <th className="p-4 text-right">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {refunds.map(ref => (
                  <tr key={ref.id} className="hover:bg-violet-50/10">
                    <td className="p-4">
                      <p className="font-black text-slate-900">{ref.reason}</p>
                      <p className="text-[10px] text-slate-400 mt-1">จากผู้เช่า: {ref.tenantName} ถึง {ref.ownerName}</p>
                      <p className="text-[10px] text-slate-400">Request: #{ref.id} · {ref.createdAt}</p>
                      {ref.rejectedReason && <p className="text-[10px] text-red-500 mt-1">เหตุผลปฏิเสธ: {ref.rejectedReason}</p>}
                    </td>
                    <td className="p-4 text-center">
                      <Badge className="bg-violet-100 text-violet-700 border-none font-bold text-[9px] uppercase">
                        {ref.type === 'deposit' ? 'เงินประกัน' : ref.type === 'commission' ? 'ค่าคอมมิชชัน' : 'ค่าเช่าล่วงหน้า'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-[10px]">
                        <span className={cn('font-bold inline-flex items-center gap-1.5', ref.adminApprovedBy ? 'text-green-600' : 'text-slate-400')}>
                          {ref.adminApprovedBy ? '✅' : '⏳'} Admin Approved {ref.adminApprovedBy && `(${ref.adminApprovedBy})`}
                        </span>
                        <span className={cn('font-bold inline-flex items-center gap-1.5', ref.superAdminApprovedBy ? 'text-green-600' : 'text-slate-400')}>
                          {ref.superAdminApprovedBy ? '✅' : '⏳'} SuperAdmin Confirmed
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-black text-slate-900 text-sm">฿{ref.amount.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase',
                        ref.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                        ref.status === 'admin_approved' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        ref.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      )}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end flex-wrap">
                        {ref.status === 'pending' && (
                          <>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] h-8" onClick={() => { handleRefundAdminApprove(ref.id); toast({ title: 'อนุมัติการคืนเงินขั้นแรกแล้ว' }); }}>
                              ✅ Admin อนุมัติ
                            </Button>
                            <Button variant="outline" className="border-red-200 text-red-600 bg-red-50 font-black text-[10px] h-8" onClick={() => { handleRefundReject(ref.id, 'ข้อมูลไม่ครบถ้วน'); toast({ title: 'ปฏิเสธคำร้องคืนเงิน' }); }}>
                              ❌ ปฏิเสธ
                            </Button>
                          </>
                        )}
                        {ref.status === 'admin_approved' && (
                          <Button disabled={!isSuperAdmin()} className="bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] h-8 disabled:opacity-40" onClick={() => { handleRefundSuperAdminConfirm(ref.id); toast({ title: 'อนุมัติคืนเงินขั้นสุดท้ายแล้ว' }); }}>
                            🔑 SA ยืนยันจ่ายเงิน
                          </Button>
                        )}
                        {ref.status === 'completed' && <span className="text-green-600 text-[10px] font-black">✅ เสร็จสิ้น</span>}
                        {ref.status === 'rejected' && <span className="text-red-500 text-[10px] font-black">❌ ปฏิเสธแล้ว</span>}
                      </div>
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
