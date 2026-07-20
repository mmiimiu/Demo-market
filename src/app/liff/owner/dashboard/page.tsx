"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, Wallet, AlertCircle, CalendarClock, KeyRound } from 'lucide-react';

export default function LiffOwnerDashboard() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50 pb-24">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold">ภาพรวม (Dashboard)</h1>
        <p className="text-slate-400 text-sm">ข้อมูลสรุปของพอร์ตโฟลิโอ</p>
      </header>

      <main className="flex-1 p-4 space-y-4">
        
        {/* Verification Alert */}
        <div 
          onClick={() => router.push('/liff/owner/verify')}
          className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-rose-100 active:scale-95 transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-rose-900">รายการรอดำเนินการ</p>
              <p className="text-sm text-rose-700">มี 3 สลิปที่ต้องตรวจสอบ</p>
            </div>
          </div>
          <div className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            ตรวจสอบ
          </div>
        </div>

        {/* Lifecycle Alerts (New Section) */}
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1 mt-6">การแจ้งเตือนสถานะเช่า</h2>
        
        <div className="space-y-3">
          {/* Lease Expiration Alert */}
          <div className="bg-white border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1 h-full bg-amber-500" />
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">1 สัญญาใกล้หมดอายุ</p>
              <p className="text-xs text-slate-500 mb-2">Phuket Beachfront • หมดอายุใน 30 วัน</p>
              <button className="text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                ติดต่อผู้เช่า
              </button>
            </div>
          </div>

          {/* Move-in Alert */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500" />
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">1 ผู้เช่าย้ายเข้าใหม่วันนี้</p>
              <p className="text-xs text-slate-500 mb-2">Sathorn Loft • ห้อง 8B</p>
              <button className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                ดูขั้นตอนย้ายเข้า
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1 mt-6">สถิติโดยรวม</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Building2 className="w-4 h-4" />
            </div>
            <p className="text-sm text-slate-500">จำนวนห้อง</p>
            <p className="text-xl font-bold text-slate-900">12 ยูนิต</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-sm text-slate-500">ผู้เช่าปัจจุบัน</p>
            <p className="text-xl font-bold text-slate-900">8 ท่าน</p>
          </div>
        </div>

        {/* Income Summary */}
        <div className="bg-[#00B900] text-white rounded-2xl p-5 shadow-sm mt-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="flex items-center gap-2 mb-4 opacity-90 relative z-10">
            <Wallet className="w-5 h-5" />
            <span className="font-medium">รายได้ประจำเดือน</span>
          </div>
          <p className="text-4xl font-bold mb-1 relative z-10">145,000</p>
          <p className="text-sm opacity-80 relative z-10">บาท (มิ.ย. 2026)</p>
        </div>

      </main>
    </div>
  );
}
