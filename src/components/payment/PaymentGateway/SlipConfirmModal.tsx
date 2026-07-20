'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertTriangle, FileImage } from 'lucide-react';
import { Language } from '@/lib/types';
import { PaymentRecord } from '@/lib/types/payment';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  payment: PaymentRecord;
  tenantName: string;
  lang: Language;
  confirmedByUid: string;
  onConfirmed?: () => void;
  onRejected?: () => void;
}

export function SlipConfirmModal({ open, onClose, payment, tenantName, lang, confirmedByUid, onConfirmed, onRejected }: Props) {
  const isTh = lang === 'th';
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [processing, setProcessing] = useState(false);

  const typeLabel = {
    deposit: isTh ? 'ค่ามัดจำ (Pool 1)' : 'Security Deposit (Pool 1)',
    advance_rent: isTh ? 'ค่าเช่าล่วงหน้า (Pool 2)' : 'Advance Rent (Pool 2)',
    monthly_rent: isTh ? 'ค่าเช่ารายเดือน' : 'Monthly Rent',
  }[payment.type];

  const updatePayment = (updates: Partial<PaymentRecord>) => {
    try {
      const stored = JSON.parse(localStorage.getItem('primerent_payments') || '[]');
      const idx = stored.findIndex((p: any) => p.id === payment.id);
      if (idx !== -1) {
        stored[idx] = { ...stored[idx], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('primerent_payments', JSON.stringify(stored));
      }
    } catch {}
  };

  const handleConfirm = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 800));
    updatePayment({ status: 'confirmed', confirmedAt: new Date().toISOString(), confirmedBy: confirmedByUid });
    toast({ title: isTh ? 'ยืนยันรับเงินสำเร็จ' : 'Payment Confirmed', description: isTh ? 'ระบบบันทึกการชำระเงินเรียบร้อยแล้ว' : 'Payment recorded in the system.' });
    setProcessing(false);
    onConfirmed?.();
    onClose();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 800));
    updatePayment({ status: 'rejected', rejectedReason: rejectReason });
    toast({ variant: 'destructive', title: isTh ? 'ปฏิเสธสลิป' : 'Slip Rejected', description: rejectReason });
    setProcessing(false);
    onRejected?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl font-thai">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
            <FileImage className="w-5 h-5 text-primary" />
            {isTh ? 'ตรวจสอบสลิปการโอนเงิน' : 'Review Payment Slip'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-bold">{isTh ? 'ประเภท' : 'Type'}</span>
              <span className="font-black text-gray-900">{typeLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-bold">{isTh ? 'ผู้เช่า' : 'Tenant'}</span>
              <span className="font-black text-gray-900">{tenantName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-bold">{isTh ? 'ยอดเงิน' : 'Amount'}</span>
              <span className="font-black text-primary text-lg">฿{payment.amount.toLocaleString()}</span>
            </div>
            {payment.month && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-bold">{isTh ? 'รอบบิล' : 'Month'}</span>
                <span className="font-black text-gray-900">{payment.month}</span>
              </div>
            )}
          </div>

          {/* Slip image */}
          {payment.slipUrl ? (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <img src={payment.slipUrl} alt="payment slip" className="w-full object-contain max-h-64" />
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
              <FileImage className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-bold">{isTh ? 'ไม่มีไฟล์สลิป' : 'No slip attached'}</p>
            </div>
          )}

          {payment.note && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs font-bold text-blue-700">{isTh ? 'หมายเหตุ:' : 'Note:'} {payment.note}</p>
            </div>
          )}

          {!showReject ? (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => setShowReject(true)} className="h-12 rounded-xl font-black border-red-200 text-red-600 hover:bg-red-50 gap-2">
                <X className="w-4 h-4" />{isTh ? 'ปฏิเสธ' : 'Reject'}
              </Button>
              <Button onClick={handleConfirm} disabled={processing} className="h-12 rounded-xl font-black bg-green-600 hover:bg-green-700 text-white gap-2">
                <Check className="w-4 h-4" />{isTh ? 'ยืนยันรับเงิน' : 'Confirm Receipt'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-700">{isTh ? 'กรุณาระบุเหตุผลการปฏิเสธ' : 'Please state the reason for rejection.'}</p>
              </div>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder={isTh ? 'ระบุเหตุผล...' : 'Enter reason...'} className="w-full border border-red-200 rounded-xl p-3 text-sm resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-red-200" />
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => setShowReject(false)} className="h-12 rounded-xl font-black">{isTh ? 'ยกเลิก' : 'Cancel'}</Button>
                <Button onClick={handleReject} disabled={!rejectReason.trim() || processing} className="h-12 rounded-xl font-black bg-red-600 hover:bg-red-700 text-white gap-2">
                  <X className="w-4 h-4" />{isTh ? 'ส่งคำปฏิเสธ' : 'Send Rejection'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
