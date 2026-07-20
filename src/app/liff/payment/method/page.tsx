"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Globe, CreditCard, UploadCloud, ChevronRight, QrCode } from 'lucide-react';

function PaymentMethodContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount') || '0';

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-semibold text-slate-900">เลือกช่องทางชำระเงิน</span>
        <div className="w-9" />
      </header>

      <main className="flex-1 p-4 pb-24 space-y-6">
        <div className="text-center py-4">
          <p className="text-slate-500 text-sm mb-1">ยอดชำระทั้งหมด</p>
          <p className="text-4xl font-bold text-[#00B900]">{amount} <span className="text-xl text-slate-500">บาท</span></p>
        </div>

        {/* Method 1: Automatic / Gateway */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">ชำระเงินอัตโนมัติ</h2>
          
          <button 
            onClick={() => router.push(`/liff/payment/success?method=domestic`)}
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-400 active:scale-[0.98] transition-all shadow-sm"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-slate-900 text-base">พร้อมเพย์ / สแกนจ่าย</h3>
              <p className="text-xs text-slate-500">แอปธนาคารในประเทศไทย</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          <button 
            onClick={() => router.push(`/liff/payment/success?method=international`)}
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-400 active:scale-[0.98] transition-all shadow-sm"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-slate-900 text-base">บัตรเครดิต / ช่องทางต่างประเทศ</h3>
              <p className="text-xs text-slate-500">Alipay, WeChat Pay, Stripe</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Method 2: Manual Upload */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">แนบสลิปโอนเงิน</h2>
          
          <button 
            onClick={() => router.push(`/liff/payment/manual?amount=${amount}`)}
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:border-[#00B900] active:scale-[0.98] transition-all shadow-sm group"
          >
            <div className="w-12 h-12 bg-[#00B900]/10 text-[#00B900] rounded-xl flex items-center justify-center shrink-0">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-slate-900 text-base">โอนเงินและแนบสลิป</h3>
              <p className="text-xs text-slate-500">แอดมินใช้เวลาตรวจสอบ 1-2 ชั่วโมง</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#00B900]" />
          </button>
        </div>
      </main>
    </div>
  );
}

export default function LiffPaymentMethod() {
  return (
    <Suspense fallback={<div className="p-8 text-center">กำลังโหลดข้อมูล...</div>}>
      <PaymentMethodContent />
    </Suspense>
  );
}
