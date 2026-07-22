'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Search, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/hooks/useAdminStore';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function AgentKYCReview() {
  const { agentRequests, documents, loadDatabase, handleAgentKYC, receiveCriminalCheckWebhook } = useAdminStore();
  const [search, setSearch] = useState('');
  const [rejectDialog, setRejectDialog] = useState<{ requestId: string; userId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [docAudit, setDocAudit] = useState<any>(null);

  useEffect(() => { loadDatabase(); }, [loadDatabase]);

  const filtered = agentRequests.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (requestId: string, userId: string) => {
    handleAgentKYC(requestId, userId, 'approve');
    toast({ title: '✓ อนุมัติเอกสารเอเจ้นต์แล้ว' });
  };

  const handleReject = () => {
    if (!rejectDialog || !rejectReason.trim()) return;
    handleAgentKYC(rejectDialog.requestId, rejectDialog.userId, 'reject', rejectReason);
    toast({ title: '❌ ปฏิเสธเอกสารเอเจ้นต์' });
    setRejectDialog(null);
    setRejectReason('');
  };

  const kycDocs = documents.filter(d => d.documentType === 'kyc');

  return (
    <div className="space-y-6 p-6 lg:p-8 font-thai">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">ตรวจสอบ + อนุมัติ Agent</h1>
          <p className="text-xs text-slate-500 font-bold">Review เอกสาร KYC, อนุมัติ/ปฏิเสธ พร้อม reason</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาผู้สมัคร..." className="pl-9 h-9 text-xs rounded-xl" />
      </div>

      {/* Pending KYC Requests */}
      <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-black text-slate-800">🕵️ รายการขออัปเกรดสมัครเอเจ้นต์รอตรวจสอบ</CardTitle>
          <CardDescription className="text-xs">ตรวจสอบเอกสารการยืนยันตัวตน, NDID, Liveness score และประวัติบริษัทประกอบการ</CardDescription>
        </CardHeader>
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
                        req.criminalCheckStatus === 'clear' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      )}>
                        {req.criminalCheckStatus === 'clear' ? '✓ CLEAR (ไม่มีประวัติ)' : '⏳ PENDING (รอผลตรวจ)'}
                      </span>
                      <p className="text-[9.5px] text-slate-400 font-bold block">
                        {req.criminalCheckPaid ? '🎁 โปรโมชั่น: ฟรี 3 เดือนแรก' : '💳 ชำระแล้ว (ค่าธรรมเนียม ฿100)'}
                      </p>
                      <p className="text-[8.5px] text-red-500 font-bold tracking-tight block">🔒 สิทธิ์ข้อมูล: เฉพาะเจ้าตัว & แอดมิน</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1.5">
                      {req.documents.map((d, i) => (
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
      </Card>

      {/* Document Audit */}
      <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-black text-slate-800">📑 เอกสาร KYC ที่เก็บในระบบ</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto border rounded-xl divide-y divide-slate-100">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b">
              <tr className="font-black text-slate-400 text-[10px] uppercase">
                <th className="p-4">ชื่อเอกสาร</th>
                <th className="p-4 text-center">ประเภท</th>
                <th className="p-4 text-center">สถานะ</th>
                <th className="p-4 text-center">อัปเดตล่าสุด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {kycDocs.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-black text-slate-900">{doc.propertyName}</td>
                  <td className="p-4 text-center"><Badge className="bg-blue-50 text-blue-700 border border-blue-100 font-bold text-[9px]">KYC</Badge></td>
                  <td className="p-4 text-center font-bold text-indigo-700">{doc.status}</td>
                  <td className="p-4 text-center text-slate-500">{doc.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ⚡ Police e-Criminal Webhook Simulation Panel (Option 1) */}
      <Card className="border border-indigo-200 bg-indigo-50/5 rounded-2xl p-5 shadow-sm space-y-4 mt-6">
        <CardHeader className="p-0">
          <CardTitle className="text-base font-black text-indigo-950 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            ⚡ ตัวจำลองการส่งสัญญาณ Webhook (ทว. e-Criminal API)
          </CardTitle>
          <CardDescription className="text-xs text-indigo-700">
            ใช้ในการจำลองสัญญาณความปลอดภัยจากกองทะเบียนประวัติอาชญากร ส่งผลการตรวจของเอเจ้นต์กลับมาระบบอัตโนมัติ
          </CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">เลือกใบสมัครเอเจ้นต์</label>
            <select 
              id="webhook_agent_req"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-9"
            >
              {agentRequests.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.id} - สถานะตรวจประวัติ: {r.criminalCheckStatus?.toUpperCase() || 'NONE'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">ผลการตรวจประวัติ (Criminal Status)</label>
            <select 
              id="webhook_agent_status"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-9"
            >
              <option value="clear">✓ CLEAR (ประวัติขาวสะอาด / ผ่าน)</option>
              <option value="flagged">❌ FLAGGED (พบประวัติคดีอาชญากรรม)</option>
            </select>
          </div>

          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs h-9 rounded-xl shadow-md border-none"
            onClick={() => {
              const reqSelect = document.getElementById('webhook_agent_req') as HTMLSelectElement;
              const statusSelect = document.getElementById('webhook_agent_status') as HTMLSelectElement;
              if (reqSelect && statusSelect) {
                receiveCriminalCheckWebhook(reqSelect.value, statusSelect.value as any);
                toast({
                  title: '⚡ จำลองสัญญาณ Webhook สำเร็จ',
                  description: `ส่งข้อมูลผลตรวจ [${statusSelect.value.toUpperCase()}] ให้ใบสมัคร ${reqSelect.value} สำเร็จ`
                });
              }
            }}
          >
            ⚡ ยิงจำลอง Webhook เข้าเซิร์ฟเวอร์
          </Button>
        </div>
      </Card>

      {/* Reject Reason Dialog */}
      {rejectDialog && (
        <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason(''); }}>
          <DialogContent className="max-w-sm w-[95vw] rounded-2xl font-thai">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                ปฏิเสธการสมัครเอเจ้นต์
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-black text-slate-700 mb-1 block">เหตุผลที่ปฏิเสธ *</label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="ระบุเหตุผลที่ปฏิเสธเอกสาร..." className="w-full border rounded-xl p-3 text-xs font-bold min-h-[80px] focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setRejectDialog(null); setRejectReason(''); }} className="flex-1 rounded-xl font-black text-xs">ยกเลิก</Button>
                <Button onClick={handleReject} disabled={!rejectReason.trim()} className="flex-1 rounded-xl font-black text-xs bg-red-600 hover:bg-red-700 text-white">
                  ยืนยันปฏิเสธ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
