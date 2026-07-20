'use client';

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Check, X, Loader2, AlertTriangle, Zap, Droplets, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { MonthlyBill, PaymentRecord } from '@/lib/types/payment';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  bill: MonthlyBill;
  ownerName: string;
  ownerBankAccount: string;
  ownerPromptPay: string;
  lang: Language;
  onSuccess?: (payment: PaymentRecord) => void;
}

export function MonthlyPaymentModal({ open, onClose, bill, ownerName, ownerBankAccount, ownerPromptPay, lang, onSuccess }: Props) {
  const isTh = lang === 'th';
  const [step, setStep] = useState<'summary' | 'upload' | 'done'>('summary');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string>('');
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const getItemIcon = (type: string) => {
    if (type === 'water') return <Droplets className="w-4 h-4 text-blue-500" />;
    if (type === 'electric') return <Zap className="w-4 h-4 text-yellow-500" />;
    return <Home className="w-4 h-4 text-gray-500" />;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSlipFile(f);
    setSlipPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!slipFile) return;
    setUploading(true);
    await new Promise(r => setTimeout(r, 1200));
    const now = new Date().toISOString();
    const payment: PaymentRecord = {
      id: `pay_mth_${Date.now()}`,
      contractId: bill.contractId,
      propertyId: bill.propertyId,
      type: 'monthly_rent',
      amount: bill.totalAmount,
      currency: 'THB',
      payerId: bill.tenantId,
      payeeId: bill.ownerId,
      slipUrl: slipPreview,
      slipUploadedAt: now,
      note,
      status: 'slip_uploaded',
      month: bill.month,
      createdAt: now,
      updatedAt: now,
    };
    try {
      const stored = JSON.parse(localStorage.getItem('primerent_payments') || '[]');
      stored.push(payment);
      localStorage.setItem('primerent_payments', JSON.stringify(stored));
      // Update bill status
      const bills = JSON.parse(localStorage.getItem('primerent_bills') || '[]');
      const idx = bills.findIndex((b: any) => b.id === bill.id);
      if (idx !== -1) { bills[idx].status = 'paid'; bills[idx].paymentId = payment.id; localStorage.setItem('primerent_bills', JSON.stringify(bills)); }
    } catch {}
    setUploading(false);
    setStep('done');
    onSuccess?.(payment);
    toast({ title: isTh ? 'ส่งสลิปสำเร็จ' : 'Slip Submitted', description: isTh ? 'รอเจ้าของยืนยันการรับเงิน' : 'Awaiting owner confirmation.' });
  };

  const handleClose = () => { setStep('summary'); setSlipFile(null); setSlipPreview(''); setNote(''); onClose(); };

  const monthLabel = bill.month ? new Date(bill.month + '-01').toLocaleDateString(isTh ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long' }) : bill.month;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl font-thai">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
            💵 {isTh ? `ชำระค่าเช่า — ${monthLabel}` : `Pay Rent — ${monthLabel}`}
          </DialogTitle>
        </DialogHeader>

        {step === 'summary' && (
          <div className="space-y-4">
            {/* Bill items */}
            <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
              {bill.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getItemIcon(item.type)}
                    <div>
                      <p className="font-bold text-sm text-gray-900">{item.label}</p>
                      {item.unit != null && item.ratePerUnit != null && (
                        <p className="text-[10px] text-gray-400">{item.unit} {isTh ? 'หน่วย' : 'units'} × ฿{item.ratePerUnit}</p>
                      )}
                    </div>
                  </div>
                  <p className="font-black text-gray-900">฿{item.amount.toLocaleString()}</p>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 bg-primary/5">
                <p className="font-black text-gray-900">{isTh ? 'ยอดรวมสุทธิ' : 'Total'}</p>
                <p className="text-xl font-black text-primary">฿{bill.totalAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* Payment info */}
            <div className="space-y-2">
              <h4 className="font-black text-sm text-gray-700">{isTh ? '📋 โอนเงินไปที่' : '📋 Transfer To'}</h4>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">PromptPay</p>
                <p className="font-black text-gray-900 mt-0.5">{ownerPromptPay}</p>
                <p className="text-xs text-gray-500 mt-0.5">{ownerName}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">{isTh ? 'บัญชีธนาคาร' : 'Bank Account'}</p>
                <p className="font-black text-gray-900 mt-0.5">{ownerBankAccount}</p>
                <p className="text-xs text-gray-500 mt-0.5">{ownerName}</p>
              </div>
            </div>

            <Button onClick={() => setStep('upload')} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black gap-2">
              <Upload className="w-4 h-4" />{isTh ? 'แนบสลิปยืนยันการโอน' : 'Upload Payment Slip'}
            </Button>
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-4">
            <button onClick={() => setStep('summary')} className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600">← {isTh ? 'ย้อนกลับ' : 'Back'}</button>
            <div onClick={() => fileRef.current?.click()} className={cn('border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors', slipPreview ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-primary hover:bg-gray-50')}>
              {slipPreview ? (
                <div className="relative">
                  <img src={slipPreview} alt="slip" className="max-h-48 mx-auto rounded-lg object-contain" />
                  <button onClick={(e) => { e.stopPropagation(); setSlipFile(null); setSlipPreview(''); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <><Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="font-bold text-gray-500 text-sm">{isTh ? 'คลิกเพื่อเลือกรูปสลิป' : 'Click to select slip image'}</p><p className="text-xs text-gray-400 mt-1">PNG, JPG, HEIC</p></>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={isTh ? 'หมายเหตุ (ไม่บังคับ)' : 'Note (optional)'} className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <Button onClick={handleSubmit} disabled={!slipFile || uploading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black gap-2 disabled:opacity-40">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {uploading ? (isTh ? 'กำลังส่ง...' : 'Uploading...') : (isTh ? 'ส่งสลิปยืนยัน' : 'Submit Slip')}
            </Button>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto"><Check className="w-8 h-8 text-white" /></div>
            <h3 className="text-xl font-black text-gray-900">{isTh ? 'ส่งสลิปสำเร็จ!' : 'Slip Submitted!'}</h3>
            <p className="text-sm text-gray-500 font-bold">{isTh ? 'เจ้าของจะยืนยันการรับเงินภายใน 24 ชั่วโมง' : 'Owner will confirm receipt within 24 hours.'}</p>
            <Button onClick={handleClose} className="w-full h-12 rounded-xl font-black">{isTh ? 'ปิด' : 'Close'}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
