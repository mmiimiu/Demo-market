'use client';

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Check, Shield, Home, Copy, AlertTriangle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { PaymentRecord } from '@/lib/types/payment';

interface Props {
  open: boolean;
  onClose: () => void;
  contractId: string;
  propertyName: string;
  ownerName: string;
  ownerBankAccount: string;
  ownerPromptPay: string;
  depositAmount: number;
  payerId: string;
  payeeId: string;
  lang: Language;
  onSuccess?: (payment: PaymentRecord) => void;
}

export function DepositPaymentModal({
  open, onClose, contractId, propertyName,
  ownerName, ownerBankAccount, ownerPromptPay,
  depositAmount, payerId, payeeId, lang, onSuccess,
}: Props) {
  const isTh = lang === 'th';
  const [step, setStep] = useState<'info' | 'upload' | 'done'>('info');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string>('');
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<'bank' | 'pp' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCopy = (text: string, type: 'bank' | 'pp') => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSlipFile(f);
    const url = URL.createObjectURL(f);
    setSlipPreview(url);
  };

  const handleSubmitSlip = async () => {
    if (!slipFile) return;
    setUploading(true);
    await new Promise(r => setTimeout(r, 1200));
    const now = new Date().toISOString();
    const payment: PaymentRecord = {
      id: `pay_dep_${Date.now()}`,
      contractId,
      propertyId: '',
      type: 'deposit',
      amount: depositAmount,
      currency: 'THB',
      payerId,
      payeeId,
      slipUrl: slipPreview,
      slipUploadedAt: now,
      note,
      status: 'slip_uploaded',
      createdAt: now,
      updatedAt: now,
    };
    try {
      const stored = JSON.parse(localStorage.getItem('primerent_payments') || '[]');
      stored.push(payment);
      localStorage.setItem('primerent_payments', JSON.stringify(stored));
    } catch {}
    setUploading(false);
    setStep('done');
    onSuccess?.(payment);
    toast({ title: isTh ? 'แนบสลิปสำเร็จ' : 'Slip Uploaded', description: isTh ? 'รอเจ้าของยืนยันการรับเงิน' : 'Waiting for owner confirmation.' });
  };

  const handleClose = () => {
    setStep('info');
    setSlipFile(null);
    setSlipPreview('');
    setNote('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl font-thai">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            {isTh ? 'ชำระค่ามัดจำ (Pool 1)' : 'Pay Security Deposit (Pool 1)'}
          </DialogTitle>
        </DialogHeader>

        {step === 'info' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Home className="w-5 h-5 text-gray-400 shrink-0" />
              <div>
                <p className="font-black text-gray-900 text-sm">{propertyName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{isTh ? 'เจ้าของ:' : 'Owner:'} {ownerName}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-green-700 mb-1">{isTh ? 'ยอดค่ามัดจำ' : 'Deposit Amount'}</p>
              <p className="text-3xl font-black text-green-900">฿{depositAmount.toLocaleString()}</p>
              <p className="text-xs text-green-700 mt-1">{isTh ? '(โอนตรงให้เจ้าของ ไม่ผ่านระบบกลาง)' : '(Direct to owner, not via platform escrow)'}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-black text-sm text-gray-700">{isTh ? '📋 ข้อมูลการโอนเงิน' : '📋 Transfer Details'}</h4>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">PromptPay</p>
                  <p className="font-black text-gray-900 mt-0.5">{ownerPromptPay}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-amber-700 font-bold gap-1" onClick={() => handleCopy(ownerPromptPay, 'pp')}>
                  {copied === 'pp' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === 'pp' ? (isTh ? 'คัดลอกแล้ว' : 'Copied!') : (isTh ? 'คัดลอก' : 'Copy')}
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">{isTh ? 'โอนบัญชีธนาคาร' : 'Bank Transfer'}</p>
                  <p className="font-black text-gray-900 mt-0.5">{ownerBankAccount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{isTh ? 'ชื่อบัญชี:' : 'Name:'} {ownerName}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-700 font-bold gap-1" onClick={() => handleCopy(ownerBankAccount, 'bank')}>
                  {copied === 'bank' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === 'bank' ? (isTh ? 'คัดลอกแล้ว' : 'Copied!') : (isTh ? 'คัดลอก' : 'Copy')}
                </Button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-yellow-800">
                {isTh ? 'หลังโอนแล้วกรุณาแนบสลิปเพื่อยืนยัน เจ้าของจะได้รับแจ้งทันที' : 'After transfer, upload your slip for confirmation. Owner will be notified immediately.'}
              </p>
            </div>

            <Button onClick={() => setStep('upload')} className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black gap-2">
              <Upload className="w-4 h-4" />
              {isTh ? 'แนบสลิปยืนยันการโอน' : 'Upload Payment Slip'}
            </Button>
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-4">
            <button onClick={() => setStep('info')} className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600">← {isTh ? 'ย้อนกลับ' : 'Back'}</button>
            <h4 className="font-black text-gray-900">{isTh ? '📸 แนบสลิปการโอนเงิน' : '📸 Upload Payment Slip'}</h4>
            <div
              onClick={() => fileRef.current?.click()}
              className={cn('border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors', slipPreview ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-primary hover:bg-gray-50')}
            >
              {slipPreview ? (
                <div className="relative">
                  <img src={slipPreview} alt="slip" className="max-h-48 mx-auto rounded-lg object-contain" />
                  <button onClick={(e) => { e.stopPropagation(); setSlipFile(null); setSlipPreview(''); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-bold text-gray-500 text-sm">{isTh ? 'คลิกเพื่อเลือกรูปสลิป' : 'Click to select slip image'}</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, HEIC</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={isTh ? 'หมายเหตุเพิ่มเติม (ไม่บังคับ)' : 'Additional note (optional)'} className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <Button onClick={handleSubmitSlip} disabled={!slipFile || uploading} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black gap-2 disabled:opacity-40">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {uploading ? (isTh ? 'กำลังส่ง...' : 'Uploading...') : (isTh ? 'ส่งสลิปยืนยัน' : 'Submit Slip')}
            </Button>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900">{isTh ? 'ส่งสลิปสำเร็จ!' : 'Slip Submitted!'}</h3>
            <p className="text-sm text-gray-500 font-bold">{isTh ? 'เจ้าของจะตรวจสอบและยืนยันการรับเงินภายใน 24 ชั่วโมง' : 'The owner will review and confirm receipt within 24 hours.'}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-800">{isTh ? '⏳ สถานะ: รอเจ้าของยืนยัน' : '⏳ Status: Awaiting owner confirmation'}</p>
            </div>
            <Button onClick={handleClose} className="w-full h-12 rounded-xl font-black">{isTh ? 'ปิด' : 'Close'}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
