"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Receipt, History, AlertCircle, KeyRound, CalendarClock } from 'lucide-react';

export default function LiffPropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Dynamic data based on property ID
  const isProp1 = id === 'prop-1';
  const isProp2 = id === 'prop-2';
  const isProp3 = id === 'prop-3';
  const isProp4 = id === 'prop-4';

  let propertyName = 'Sukhumvit 71 Condo';
  let unitName = 'Unit A-1204';
  let totalDue = 16500;

  if (isProp2) {
    propertyName = 'Chiang Mai Villa';
    unitName = 'บ้านเลขที่ 5';
    totalDue = 6500;
  } else if (isProp3) {
    propertyName = 'Phuket Beachfront';
    unitName = 'ห้อง 202';
    totalDue = 0; // Assuming no pending bills for now
  } else if (isProp4) {
    propertyName = 'Sathorn Loft';
    unitName = 'ห้อง 8B';
    totalDue = 0;
  }

  return (
    <div className="flex flex-col h-full min-h-screen pb-24 bg-slate-50">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-slate-100">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">{propertyName}</h1>
          <p className="text-xs text-slate-500">{unitName}</p>
        </div>
      </header>

      <main className="p-4 space-y-6">
        
        {/* Dynamic Alerts based on state */}
        {isProp3 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <CalendarClock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 mb-1">ใกล้หมดสัญญาเช่า</h3>
                <p className="text-sm text-amber-700">สัญญาเช่าของคุณจะหมดอายุในอีก 30 วัน กรุณาแจ้งความประสงค์ของคุณ</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-white border border-amber-300 text-amber-700 text-sm font-bold py-2.5 rounded-xl hover:bg-amber-100 transition-colors">
                ย้ายออก
              </button>
              <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                ต่อสัญญา
              </button>
            </div>
          </div>
        )}

        {isProp4 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <KeyRound className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="w-full">
              <h3 className="font-bold text-emerald-900 mb-1">ยินดีต้อนรับ! วันนี้วันย้ายเข้า</h3>
              <p className="text-sm text-emerald-700 mb-3">คุณสามารถติดต่อรับกุญแจห้องพักได้ที่สำนักงานนิติบุคคล</p>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-xl w-full transition-colors">
                ดูคู่มือการย้ายเข้า
              </button>
            </div>
          </div>
        )}

        {/* Regular Outstanding Invoice Alert (Show only for Prop 1 and 2 in this mockup) */}
        {(isProp1 || isProp2) && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="w-full">
              <h3 className="font-bold text-rose-900 mb-1">ใบแจ้งหนี้พร้อมแล้ว</h3>
              <p className="text-sm text-rose-700 mb-3">คุณมียอดค้างชำระ {totalDue.toLocaleString()} บาท สำหรับห้องนี้</p>
              <button 
                onClick={() => router.push(`/liff/payment/select?propertyId=${id}`)}
                className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold px-4 py-2 rounded-xl w-full transition-colors"
              >
                ชำระเงิน
              </button>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => router.push('/liff/history')}
            className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-300 active:scale-95 transition-all shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-slate-700">ประวัติการชำระ</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 opacity-60 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-slate-700 text-center">ชำระเงิน<br/>ล่วงหน้า</span>
          </div>
        </div>
        
        {/* Contract Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-[#00B900] rounded-full" />
            รายละเอียดสัญญา
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">วันเริ่มต้นสัญญา</span>
              <span className="font-semibold text-slate-900">{isProp4 ? 'วันนี้' : '01 ม.ค. 2026'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">วันสิ้นสุดสัญญา</span>
              <span className={`font-semibold ${isProp3 ? 'text-amber-600' : 'text-slate-900'}`}>{isProp3 ? 'อีก 30 วัน' : '31 ธ.ค. 2026'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">เงินประกัน</span>
              <span className="font-semibold text-slate-900">16,000 บาท</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
