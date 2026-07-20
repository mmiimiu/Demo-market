'use client';

import React, { useState } from 'react';
import { QrCode, X, Coins, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { calculateTotalCredits, type CreditPackage } from '@/lib/credit';
import type { Language } from '@/lib/types';

interface QRMockModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  pkg: CreditPackage | null;
  onSuccess: (pkg: CreditPackage) => void;
  onFail: (pkg: CreditPackage) => void;
}

export function QRMockModal({ isOpen, onClose, lang, pkg, onSuccess, onFail }: QRMockModalProps) {
  const [step, setStep] = useState<'qr' | 'confirming' | 'success' | 'failed'>('qr');
  const isTh = lang === 'th';

  const handleConfirm = () => {
    setStep('confirming');
    setTimeout(() => {
      setStep('success');
    }, 1500);
  };

  const handleFailSimulate = () => {
    setStep('confirming');
    setTimeout(() => {
      setStep('failed');
    }, 1500);
  };

  const handleDone = () => {
    if (pkg) onSuccess(pkg);
    onClose();
    setStep('qr');
  };

  const handleDoneFail = () => {
    if (pkg) onFail(pkg);
    onClose();
    setStep('qr');
  };

  if (!isOpen || !pkg) return null;

  const total = calculateTotalCredits(pkg.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[360px] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900">
                {isTh ? 'ชำระเงิน PromptPay' : 'PromptPay Payment'}
              </h2>
              <p className="text-[10px] text-gray-400 font-medium">
                {isTh ? `แพ็กเกจ ${pkg.name}` : `Package ${pkg.name}`}
              </p>
            </div>
          </div>
          <button onClick={() => { onClose(); setStep('qr'); }}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount */}
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
          <span className="text-xs font-black text-amber-700 uppercase tracking-widest">
            {isTh ? 'ยอดชำระ' : 'Amount'}
          </span>
          <span className="text-xl font-black text-amber-600">
            ฿{pkg.priceTHB.toLocaleString()}
          </span>
        </div>

        <div className="p-6">
          {/* QR Step */}
          {step === 'qr' && (
            <div className="space-y-5 text-center">
              {/* Mock QR Code using SVG pattern */}
              <div className="border-2 border-gray-100 rounded-2xl p-4 inline-block mx-auto">
                <div className="w-44 h-44 bg-gray-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                  {/* QR Grid Pattern */}
                  <div className="grid grid-cols-7 gap-[2px] opacity-80">
                    {Array.from({ length: 49 }).map((_, i) => {
                      const pattern = [
                        1,1,1,1,1,1,1,
                        1,0,0,0,0,0,1,
                        1,0,1,0,1,0,1,
                        1,0,0,0,0,0,1,
                        1,1,1,1,1,1,1,
                        0,1,0,0,1,0,1,
                        1,0,1,1,0,1,0,
                      ];
                      const row = Math.floor(i / 7);
                      const col = i % 7;
                      const isRand = Math.abs(Math.sin(i * 127 + 37)) > 0.5;
                      const isBorder = row < 5 && col < 7 ? pattern[i] : (isRand ? 1 : 0);
                      return (
                        <div
                          key={i}
                          className={cn("w-5 h-5 rounded-[2px]", isBorder ? "bg-gray-900" : "bg-transparent")}
                        />
                      );
                    })}
                  </div>
                  {/* Center logo overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-white rounded-xl shadow flex items-center justify-center border border-gray-100">
                      <Coins className="w-5 h-5 text-amber-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit summary */}
              <div className="bg-amber-50 rounded-2xl p-4 text-left space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">{isTh ? 'เครดิตหลัก' : 'Base Credits'}</span>
                  <span className="font-black text-gray-900">{pkg.credits.toLocaleString()} ₡</span>
                </div>
                {pkg.bonus > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-orange-500 font-medium">{isTh ? 'โบนัส' : 'Bonus'}</span>
                    <span className="font-black text-orange-500">+{pkg.bonus.toLocaleString()} ₡</span>
                  </div>
                )}
                <div className="border-t border-amber-200 pt-2 flex justify-between items-center">
                  <span className="text-gray-700 font-black text-sm">{isTh ? 'รับรวม' : 'Total'}</span>
                  <span className="font-black text-amber-600 text-lg">{total.toLocaleString()} ₡</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 font-medium">
                {isTh ? 'นี่คือ QR จำลองเพื่อ Demo — กดปุ่มด้านล่างเพื่อจำลองการชำระเงิน' : 'Mock QR for demo — press below to simulate payment'}
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={handleConfirm}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black shadow-lg shadow-amber-500/30 gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isTh ? 'จำลองสำเร็จ' : 'Sim. Success'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleFailSimulate}
                  className="flex-1 h-12 rounded-2xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-black gap-2"
                >
                  <X className="w-4 h-4" />
                  {isTh ? 'จำลองไม่สำเร็จ' : 'Sim. Fail'}
                </Button>
              </div>
            </div>
          )}

          {/* Confirming Step */}
          {step === 'confirming' && (
            <div className="py-10 flex flex-col items-center gap-4">
              <div className="w-14 h-14 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-sm font-bold text-gray-500">
                {isTh ? 'กำลังดำเนินการ...' : 'Processing...'}
              </p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="py-6 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-green-50 border-2 border-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {isTh ? 'ชำระเงินสำเร็จ!' : 'Payment Successful!'}
                </h3>
                <p className="text-sm text-gray-400 font-medium mt-1">
                  {isTh ? `ได้รับ ${total.toLocaleString()} เครดิตแล้ว` : `${total.toLocaleString()} credits added`}
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-3">
                <span className="text-2xl font-black text-amber-600">+{total.toLocaleString()} ₡</span>
              </div>
              <Button onClick={handleDone} className="w-full h-12 rounded-2xl bg-gray-900 hover:bg-black text-white font-black">
                {isTh ? 'ตกลง' : 'Done'}
              </Button>
            </div>
          )}

          {/* Failed Step */}
          {step === 'failed' && (
            <div className="py-6 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {isTh ? 'ชำระเงินไม่สำเร็จ' : 'Payment Failed'}
                </h3>
                <p className="text-sm text-gray-400 font-medium mt-1">
                  {isTh ? 'ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง' : 'Unable to process payment, please try again'}
                </p>
              </div>
              <Button onClick={handleDoneFail} className="w-full h-12 rounded-2xl bg-gray-900 hover:bg-black text-white font-black">
                {isTh ? 'ปิดหน้าต่าง' : 'Close'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
