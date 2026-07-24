import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, User, Camera } from 'lucide-react';

interface KycDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
}

export function KycDetailModal({ isOpen, onClose, request }: KycDetailModalProps) {
  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white rounded-2xl p-6 font-thai">
        <DialogHeader>
          <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
            🔍 รายละเอียดข้อมูลการยืนยันตัวตน (e-KYC Details)
          </DialogTitle>
          <DialogDescription className="text-xs">
            เปรียบเทียบรูปภาพบัตรประชาชนกับการสแกนใบหน้าจริงเพื่ออนุมัติสิทธิ์การเป็นเอเจ้นต์
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Column 1: ID Card Mockup */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">💳 เอกสารบัตรประชาชน (Uploaded ID Card)</h4>
            <div className="aspect-[1.6/1] bg-gradient-to-br from-sky-100 via-sky-50 to-blue-100 rounded-xl p-4 border border-blue-200 relative overflow-hidden shadow-inner flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="text-[7px] font-bold text-sky-800 tracking-tight">บัตรประจำตัวประชาชน (THAILAND ID)</div>
                <div className="w-5 h-5 rounded-full bg-yellow-400 opacity-80" />
              </div>
              
              <div className="flex gap-3 items-center">
                <div className="w-12 h-14 bg-slate-200 border border-slate-300 rounded flex items-center justify-center text-slate-400">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-1 font-bold text-[9px] text-slate-800">
                  <p className="font-black text-[10px] text-slate-900">{request.name}</p>
                  <p>เลขบัตร: 1-2099-00384-91-2</p>
                  <p>บ.พาร์ตเนอร์: {request.brokerName}</p>
                </div>
              </div>
              <div className="text-[6px] text-sky-800 font-bold text-right">กรมการปกครอง (DOPA Verified)</div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold text-center">ไฟล์แนบ: {request.documents.find((d: any) => d.type === 'ID Card')?.filename || 'n/a'}</p>
          </div>

          {/* Column 2: Face Scan (Liveness Check) */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">📸 การสแกนใบหน้าจริง (Liveness Scan)</h4>
            <div className="aspect-[1.6/1] bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-emerald-500 bg-slate-900 flex items-center justify-center text-emerald-400 relative">
                <User className="w-9 h-9" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              </div>

              <div className="absolute bottom-2 left-2 bg-emerald-500/90 text-white font-black text-[9px] px-2 py-0.5 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                ใบหน้าตรงกัน: {request.livenessScore}%
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="text-[8px] bg-slate-900 border-slate-800 text-slate-400 font-black flex items-center gap-1">
                  <Camera className="w-2 h-2 text-emerald-400" />
                  LIVE
                </Badge>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold text-center">ผลลัพธ์: ผ่านการตรวจสอบความมีชีวิตทางชีวภาพ</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-[10px] space-y-2 mt-4">
          <div className="flex justify-between font-bold">
            <span className="text-slate-500">วันที่ลงทะเบียนใบสมัคร:</span>
            <span className="text-slate-800">{request.submittedAt}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-slate-500">หมายเลขใบรับรอง (NDID Reference):</span>
            <span className="text-slate-800 font-mono">TXN-NDID-{request.id.toUpperCase()}-2026</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-slate-500">สถานะประวัติคดีอาชญากรรม (Criminal Check):</span>
            <span className={request.criminalCheckStatus === 'clear' ? 'text-green-600' : request.criminalCheckStatus === 'flagged' ? 'text-red-600' : 'text-amber-600'}>
              {request.criminalCheckStatus === 'clear' ? '✓ CLEAR (ไม่มีคดีความ)' : request.criminalCheckStatus === 'flagged' ? '❌ FLAGGED (พบประวัติอาชญากรรม)' : '⏳ PENDING (รอผลการตรวจ)'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
