import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PendingRequestsTableProps {
  filtered: any[];
  handleApprove: (requestId: string, userId: string) => void;
  setRejectDialog: (dialog: { requestId: string; userId: string } | null) => void;
}

export function PendingRequestsTable({ filtered, handleApprove, setRejectDialog }: PendingRequestsTableProps) {
  return (
    <div className="overflow-x-auto border rounded-xl divide-y divide-slate-100">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-50 border-b">
          <tr className="font-black text-slate-400 text-[10px] uppercase">
            <th className="p-4">ผู้สมัคร</th>
            <th className="p-4">เลขที่ใบอนุญาต</th>
            <th className="p-4 text-center">NDID Status</th>
            <th className="p-4 text-center">Liveness Score</th>
            <th className="p-4 text-center">ประวัติอาชญากรรม (Criminal Check)</th>
            <th className="p-4 text-center">เอกสารประกอบ</th>
            <th className="p-4 text-right">ดำเนินการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
          {filtered.map(req => (
            <tr key={req.id} className="hover:bg-slate-50/50">
              <td className="p-4">
                <p className="font-black text-slate-900">{req.name}</p>
                <p className="text-[10px] text-slate-400">{req.email}</p>
                <p className="text-[10px] text-slate-500 mt-1">บริษัท: {req.brokerName}</p>
              </td>
              <td className="p-4 font-mono font-bold">{req.licenseNumber}</td>
              <td className="p-4 text-center">
                <Badge className={req.ndidStatus === 'verified' ? 'bg-green-50 text-green-700 border border-green-100 font-black' : req.ndidStatus === 'failed' ? 'bg-red-50 text-red-700 border border-red-100 font-black' : 'bg-amber-50 text-amber-700 border border-amber-100 font-black'}>
                  {req.ndidStatus.toUpperCase()}
                </Badge>
              </td>
              <td className="p-4 text-center">
                <span className={cn('font-bold', req.livenessScore >= 90 ? 'text-green-600' : req.livenessScore >= 70 ? 'text-amber-600' : 'text-red-600')}>
                  {req.livenessScore}%
                </span>
              </td>
              <td className="p-4 text-center">
                <div className="space-y-1">
                  <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase',
                    req.criminalCheckStatus === 'clear'
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : req.criminalCheckStatus === 'flagged'
                        ? 'bg-red-50 text-red-700 border-red-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                  )}>
                    {req.criminalCheckStatus === 'clear'
                      ? '✓ CLEAR (ไม่มีประวัติ)'
                      : req.criminalCheckStatus === 'flagged'
                        ? '❌ FLAGGED (พบประวัติคดี)'
                        : '⏳ PENDING (รอผลตรวจ)'}
                  </span>
                  <p className="text-[9.5px] text-slate-400 font-bold block">
                    {req.criminalCheckPaid ? '🎁 โปรโมชั่น: ฟรี 3 เดือนแรก' : '💳 ชำเนียม ฿100 (ชำระแล้ว)'}
                  </p>
                  <p className="text-[8.5px] text-red-500 font-bold tracking-tight block">🔒 สิทธิ์ข้อมูล: เฉพาะเจ้าตัว & แอดมิน</p>
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-col gap-1.5">
                  {req.documents.map((d: any, i: number) => (
                    <span key={i} className="inline-flex items-center text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50 w-fit">
                      📄 {d.type} ({d.filename})
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-4 text-right">
                {req.ndidStatus === 'verified' && !req.reviewedBy ? (
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" className="border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-black text-[10px] h-8" onClick={() => setRejectDialog({ requestId: req.id, userId: req.userId })}>
                      ❌ ปฏิเสธ
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-black text-[10px] h-8" onClick={() => handleApprove(req.id, req.userId)}>
                      ✓ อนุมัติ
                    </Button>
                  </div>
                ) : req.reviewedBy ? (
                  <div className="text-[10px] font-bold">
                    <span className={req.ndidStatus === 'verified' ? 'text-green-600' : 'text-red-600'}>
                      {req.ndidStatus === 'verified' ? '✅ อนุมัติแล้ว' : '❌ ปฏิเสธแล้ว'}
                    </span>
                    <p className="text-slate-400 mt-0.5">โดย {req.reviewedBy}</p>
                    {req.rejectReason && <p className="text-red-500 mt-0.5">เหตุผล: {req.rejectReason}</p>}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 font-bold text-center">รอ NDID ยืนยัน</p>
                )}
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={7} className="p-8 text-center text-slate-400 font-bold">ไม่พบรายการ</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
