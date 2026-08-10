"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, ShieldCheck, CheckCircle, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

export function TenantPayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useApp();
  const isTh = lang === 'th';

  const amountParam = searchParams.get('amount');
  const amount = amountParam ? parseInt(amountParam, 10) : 8300;

  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSuccess]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleConfirm = () => {
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 w-full max-w-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{isTh ? 'ชำระเงินสำเร็จ' : 'Payment Successful'}</h2>
          <p className="text-slate-500 mb-8">
            {isTh ? 'ระบบได้รับยอดเงินของคุณเรียบร้อยแล้ว' : 'We have successfully received your payment.'}
          </p>
          
          <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 mb-8 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Transaction ID</span>
              <span className="font-semibold text-slate-900">TXN-2026-001</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-slate-900">{amount.toLocaleString()} THB</span>
            </div>
          </div>

          <Button 
            onClick={() => router.push('/tenant/dashboard')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12"
          >
            {isTh ? 'กลับสู่หน้าหลัก' : 'Back to Dashboard'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24">
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-semibold text-slate-900">{isTh ? 'ชำระเงิน' : 'Payment'}</span>
        <div className="w-9" />
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full flex flex-col items-center">
        
        {/* Amount & Invoice Info */}
        <div className="w-full flex flex-col items-center mt-6 mb-8">
          <p className="text-slate-500 text-sm mb-1">Invoice: INV-2026-06</p>
          <p className="text-4xl font-bold text-slate-900 mb-2">{amount.toLocaleString()} <span className="text-xl text-slate-500">THB</span></p>
        </div>

        {/* Payment Method Badge */}
        <div className="w-full max-w-[280px] bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-3 mb-6 shadow-sm">
          <div className="w-10 h-10 bg-[#003D7A] rounded-xl flex items-center justify-center text-white font-bold text-xs">
            P
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#003D7A]">PromptPay QR</p>
            <p className="text-xs text-slate-500">Scan with any Thai banking app</p>
          </div>
        </div>

        {/* QR Code Area */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center relative overflow-hidden w-full max-w-[320px]">
          {/* Simulated QR Code using nested borders */}
          <div className="w-48 h-48 border-4 border-slate-900 p-2 rounded-xl mb-6 flex items-center justify-center relative">
            {/* Mock QR Pattern */}
            <div className="w-full h-full border-[12px] border-dashed border-slate-800 rounded-sm absolute opacity-50" />
            <div className="w-12 h-12 bg-white absolute flex items-center justify-center">
              <div className="w-8 h-8 bg-[#003D7A] rounded-full flex items-center justify-center text-white text-[10px] font-bold">QR</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-full border border-rose-100">
            <Clock className="w-4 h-4" />
            <span className="font-semibold tabular-nums">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure Payment Gateway</span>
        </div>

      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleConfirm}
            className="w-full bg-[#00B900] hover:bg-[#00a000] text-white rounded-xl h-14 text-lg font-bold shadow-sm"
          >
            {isTh ? 'ยืนยันการชำระเงิน' : 'Confirm Payment'}
          </Button>
        </div>
      </div>
    </div>
  );
}
