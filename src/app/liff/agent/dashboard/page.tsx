"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, Wallet, AlertCircle, CalendarClock, KeyRound, Briefcase } from 'lucide-react';

export default function LiffAgentDashboard() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50 pb-24">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">พอร์ตโฟลิโอ (Agent)</h1>
          <p className="text-slate-400 text-sm">ข้อมูลสรุปของอสังหาที่ดูแล</p>
        </div>
        <div className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-500/30">
          PRO
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        
        {/* Verification Alert (Shared Module) */}
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
              <p className="text-sm text-rose-700">มี 12 สลิปที่ต้องตรวจสอบ</p>
            </div>
          </div>
          <div className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            ตรวจสอบ
          </div>
        </div>

        {/* Lifecycle Alerts (Shared Module) */}
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1 mt-6">การแจ้งเตือนสถานะเช่า</h2>
        
        <div className="space-y-3">
          {/* Lease Expiration Alert */}
          <div className="bg-white border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1 h-full bg-amber-500" />
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">3 สัญญาใกล้หมดอายุ</p>
              <p className="text-xs text-slate-500 mb-2">ของเจ้าของ 2 ราย • หมดอายุใน 30 วัน</p>
              <button className="text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                จัดการต่อสัญญา
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
              <p className="font-bold text-slate-900 text-sm">2 ผู้เช่าย้ายเข้าใหม่วันนี้</p>
              <p className="text-xs text-slate-500 mb-2">Sathorn Loft (8B), The Base (12A)</p>
              <button className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                ดูขั้นตอนย้ายเข้า
              </button>
            </div>
          </div>
        </div>

        {/* Agent Stats Grid */}
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1 mt-6">สถิติโดยรวม (Agent)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Building2 className="w-4 h-4" />
            </div>
            <p className="text-sm text-slate-500">ห้องที่ดูแล</p>
            <p className="text-2xl font-bold text-slate-900">57</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-sm text-slate-500">จำนวนเจ้าของ</p>
            <p className="text-2xl font-bold text-slate-900">12</p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <Briefcase className="w-4 h-4" />
            </div>
            <p className="text-sm text-slate-500">ดีลเปิดอยู่</p>
            <p className="text-2xl font-bold text-slate-900">8</p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#00B900]/10 text-[#00B900] flex items-center justify-center mb-2">
              <Wallet className="w-4 h-4" />
            </div>
            <p className="text-sm text-slate-500">ค่าคอมมิชชัน</p>
            <p className="text-2xl font-bold text-[#00B900]">32k</p>
          </div>
        </div>

        {/* Commission Summary */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl p-5 shadow-md mt-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl" />
          
          <div className="flex items-center gap-2 mb-4 opacity-90 relative z-10">
            <Wallet className="w-5 h-5" />
            <span className="font-medium">ค่าคอมมิชชันรวมเดือนนี้</span>
          </div>
          <p className="text-4xl font-bold mb-1 relative z-10">32,000</p>
          <p className="text-sm opacity-80 relative z-10">บาท (มิ.ย. 2026)</p>
          
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-sm relative z-10">
            <span className="opacity-90">รอเรียกเก็บจาก Owner</span>
            <span className="font-bold">12,500 บาท</span>
          </div>
        </div>

      </main>
    </div>
  );
}
