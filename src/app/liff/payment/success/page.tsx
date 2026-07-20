"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isManual = searchParams.get('method') === 'manual';

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50 items-center justify-center p-6 text-center pb-24">
      <div className="w-20 h-20 bg-[#00B900]/10 text-[#00B900] rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">รับเรื่องเรียบร้อย!</h1>
        <p className="text-slate-500 mb-8 max-w-[280px] mx-auto">
          {isManual 
            ? 'อัปโหลดสลิปสำเร็จ แอดมินจะดำเนินการตรวจสอบภายใน 1-2 ชั่วโมง' 
            : 'ระบบบันทึกการชำระเงินเรียบร้อยแล้ว ใบเสร็จจะถูกส่งไปที่แชทของคุณ'
          }
        </p>

        <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 mb-8 space-y-2 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">เลขที่ธุรกรรม</span>
            <span className="font-semibold text-slate-900">TXN-2026-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">สถานะ</span>
            <span className={`font-semibold ${isManual ? 'text-amber-600' : 'text-emerald-600'}`}>
              {isManual ? 'รอการตรวจสอบ' : 'ชำระเงินแล้ว'}
            </span>
          </div>
        </div>

        <div className="space-y-3 w-full">
          <button 
            onClick={() => router.push('/liff/properties')}
            className="w-full bg-[#00B900] hover:bg-[#00a000] text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-sm"
          >
            กลับสู่หน้าห้องของฉัน
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LiffPaymentSuccess() {
  return (
    <Suspense fallback={<div className="p-8 text-center">กำลังโหลดข้อมูล...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
