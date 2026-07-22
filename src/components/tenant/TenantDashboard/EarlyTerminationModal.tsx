'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, X, Calendar, DollarSign, FileText, Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EarlyTerminationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'th' | 'en' | 'cn';
  propertyName: string;
  depositAmount?: number;
}

export function EarlyTerminationModal({
  isOpen, onClose, lang, propertyName, depositAmount = 36000
}: EarlyTerminationModalProps) {
  const isTh = lang === 'th';
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reason, setReason] = useState('relocation');
  const [effectiveDate, setEffectiveDate] = useState('2026-08-31');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const penaltyFee = 6000;
  const netRefund = depositAmount - penaltyFee;
  const isTextMatch = confirmText.trim() === (isTh ? 'ยกเลิกสัญญา' : 'CANCEL');

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
    }, 1200);
  };

  const handleResetAndClose = () => {
    setStep(1);
    setConfirmCheckbox(false);
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-gray-150 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden font-sans relative">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-rose-500 to-rose-600 text-white flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black leading-snug">
                {isTh ? 'ขอเลิกสัญญาก่อนกำหนด' : 'Early Lease Termination'}
              </h2>
              <p className="text-xs text-white/80 font-medium">
                {propertyName}
              </p>
            </div>
          </div>
          <button 
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Details & Terms Breakdown */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            {/* Warning Banner */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">
                  {isTh ? '⚠️ การเลิกสัญญาล่วงหน้ามีเงื่อนไขค่าปรับตามสัญญา' : '⚠️ Early termination subject to penalty fee'}
                </p>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  {isTh 
                    ? 'กรุณาตรวจสอบประมาณการหักค่าธรรมเนียมและเงินมัดจำคืนสุทธิก่อนดำเนินการยื่นเรื่องให้เจ้าของห้องอนุมัติ' 
                    : 'Review estimated deposit refund deduction before submitting request to landlord.'}
                </p>
              </div>
            </div>

            {/* Inputs: Reason & Effective Date */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {isTh ? '1. ระบุสาเหตุที่ขอเลิกสัญญา' : '1. Reason for Termination'}
                </label>
                <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-800 outline-none focus:border-rose-500 transition-colors"
                >
                  <option value="relocation">{isTh ? 'ย้ายสถานที่ทำงาน / ย้ายสถานศึกษา' : 'Work/School Relocation'}</option>
                  <option value="personal">{isTh ? 'เหตุผลส่วนตัว / ย้ายกลับบ้าน' : 'Personal / Moving Home'}</option>
                  <option value="financial">{isTh ? 'ปรับเปลี่ยนงบประมาณทางการเงิน' : 'Financial Budget Change'}</option>
                  <option value="other">{isTh ? 'อื่นๆ' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {isTh ? '2. วันที่ต้องการย้ายออกจริง' : '2. Proposed Move-out Date'}
                </label>
                <input 
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs font-bold text-gray-800 outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            {/* Financial Refund Breakdown Box */}
            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 space-y-2.5">
              <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                {isTh ? 'ประมาณการคำนวณเงินมัดจำ (Escrow Refund Summary)' : 'Estimated Deposit Refund'}
              </p>
              <div className="space-y-1.5 text-xs font-medium border-t border-gray-200/60 pt-2">
                <div className="flex justify-between text-gray-600">
                  <span>{isTh ? 'เงินมัดจำแรกเข้าทั้งหมด' : 'Initial Deposit Paid'}</span>
                  <span className="font-bold text-gray-900">฿{depositAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>{isTh ? 'หักค่าธรรมเนียมเลิกสัญญา/ความเสียหาย' : 'Deduction / Penalty Fee'}</span>
                  <span className="font-bold">-฿{penaltyFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 text-sm font-black pt-1.5 border-t border-gray-200">
                  <span>{isTh ? 'คาดว่าจะได้รับคืนสุทธิ' : 'Estimated Net Refund'}</span>
                  <span>฿{netRefund.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Next Step Button */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={handleResetAndClose}
                className="flex-1 rounded-xl h-11 text-xs font-bold border-gray-200"
              >
                {isTh ? 'ยกเลิก / ปิด' : 'Cancel'}
              </Button>
              <Button 
                onClick={() => setStep(2)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 text-xs font-bold shadow-md shadow-rose-500/20"
              >
                {isTh ? 'ไปขั้นตอนยืนยันความปลอดภัย →' : 'Proceed to Security Check →'}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Strict Security Check & Double Confirmation */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <Badge className="bg-rose-100 text-rose-700 font-bold border-none text-[10px] px-2.5 py-0.5">
                STEP 2/2: SECURITY CONFIRMATION
              </Badge>
              <h3 className="text-base font-black text-gray-900">
                {isTh ? 'ยืนยันความต้องการเลิกสัญญา' : 'Confirm Early Termination'}
              </h3>
              <p className="text-xs text-gray-500">
                {isTh ? 'กรุณาตรวจสอบและพิมพ์คำยืนยันเพื่อป้องกันการกดผิด' : 'To prevent accidental requests, type confirmation keyword.'}
              </p>
            </div>

            {/* Checkbox Agreement */}
            <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-700 leading-relaxed">
                  {isTh 
                    ? 'ข้าพเจ้ายืนยันขอเลิกสัญญาล่วงหน้า และรับทราบเงื่อนไขการหักเงินมัดจำจำนวน ฿6,000' 
                    : 'I confirm early termination and accept the ฿6,000 deposit deduction.'}
                </span>
              </label>
            </div>

            {/* Keyword Input Safety Requirement */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isTh ? `พิมพ์คำว่า "${isTh ? 'ยกเลิกสัญญา' : 'CANCEL'}" เพื่อปลดล็อกปุ่มยืนยัน:` : 'Type "CANCEL" to unlock submit:'}
              </label>
              <input 
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={isTh ? 'พิมพ์คำว่า: ยกเลิกสัญญา' : 'Type: CANCEL'}
                className="w-full bg-slate-50 border border-gray-300 rounded-xl p-3 text-xs font-black text-rose-600 text-center tracking-widest outline-none focus:border-rose-500 focus:bg-white transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="flex-1 rounded-xl h-11 text-xs font-bold border-gray-200"
              >
                {isTh ? '← ย้อนกลับ' : '← Back'}
              </Button>
              <Button 
                disabled={!confirmCheckbox || !isTextMatch || isSubmitting}
                onClick={handleSubmit}
                className={cn(
                  "flex-1 text-white rounded-xl h-11 text-xs font-bold transition-all shadow-md",
                  (confirmCheckbox && isTextMatch) 
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20 cursor-pointer" 
                    : "bg-gray-300 cursor-not-allowed shadow-none"
                )}
              >
                {isSubmitting ? (isTh ? 'กำลังส่งคำร้อง...' : 'Submitting...') : (isTh ? '🔒 ยืนยันยื่นคำร้องขอเลิกสัญญา' : '🔒 Final Submit')}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Final Success Result Banner */}
        {step === 3 && (
          <div className="p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-1">
              <Badge className="bg-emerald-100 text-emerald-700 font-bold border-none text-[10px] px-2.5 py-0.5">
                SUBMITTED SUCCESSFULLY
              </Badge>
              <h3 className="text-lg font-black text-gray-900">
                {isTh ? 'ยื่นคำร้องขอเลิกสัญญาเรียบร้อยแล้ว!' : 'Termination Request Submitted!'}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {isTh ? 'คำร้องของคุณถูกส่งไปยังเจ้าของห้องและเอเจนต์เรียบร้อยแล้ว' : 'Sent to Landlord and Agent for Dual Approval.'}
              </p>
            </div>

            {/* Summary Details Card */}
            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex justify-between border-b pb-2 text-gray-500 font-semibold">
                <span>{isTh ? 'รหัสคำร้อง' : 'Request Ref'}</span>
                <span className="font-bold text-gray-900">TRM-2026-8821</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{isTh ? 'วันที่ย้ายออกที่เสนอ' : 'Proposed Date'}</span>
                <span className="font-bold text-gray-900">{effectiveDate}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{isTh ? 'คาดว่าจะได้รับมัดจำคืน' : 'Est. Refund'}</span>
                <span className="font-bold text-emerald-600">฿{netRefund.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{isTh ? 'สถานะปัจจุบัน' : 'Current Status'}</span>
                <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-[9px]">
                  {isTh ? 'รอเจ้าของอนุมัติ (Pending Approval)' : 'Pending Approval'}
                </Badge>
              </div>
            </div>

            <Button 
              onClick={handleResetAndClose}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11 text-xs font-bold shadow-md"
            >
              {isTh ? 'ตกลง / ปิดหน้าต่าง' : 'Done'}
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
