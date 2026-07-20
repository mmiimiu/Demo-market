"use client";

import React, { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Image as ImageIcon, CheckCircle2, XCircle, Check } from 'lucide-react';

function VerifyContent() {
  const router = useRouter();
  
  // Mock data for slips to verify
  const [slips, setSlips] = useState([
    { id: 1, tenant: 'สมชาย', room: 'Sukhumvit 71 • A-1204', amount: 16500, date: 'วันนี้ 10:30 น.' },
    { id: 2, tenant: 'จอห์น สมิธ', room: 'Chiang Mai Villa • บ้านเลขที่ 5', amount: 6500, date: 'เมื่อวานนี้ 18:45 น.' },
  ]);

  const handleAction = (id: number) => {
    setSlips(slips.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-semibold text-slate-900">ตรวจสอบสลิป</span>
        <div className="w-9" />
      </header>

      <main className="p-4 space-y-4">
        {slips.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Check className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>ตรวจสอบครบถ้วนแล้ว!</p>
          </div>
        ) : (
          slips.map((slip) => (
            <div key={slip.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-4">
              <div className="p-4 border-b border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{slip.tenant}</h3>
                    <p className="text-sm text-slate-500">{slip.room}</p>
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-md">
                    รอตรวจสอบ
                  </span>
                </div>
                <p className="text-xl font-bold text-[#00B900] mt-3">{slip.amount.toLocaleString()} บาท</p>
                <p className="text-xs text-slate-400">อัปโหลดเมื่อ: {slip.date}</p>
              </div>

              {/* Mock Slip Preview */}
              <div className="bg-slate-100 h-32 flex items-center justify-center border-b border-slate-200 relative group">
                <ImageIcon className="w-8 h-8 text-slate-300" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium cursor-pointer">
                  ดูรูปเต็ม
                </div>
              </div>

              <div className="p-4 flex gap-2">
                <button 
                  onClick={() => handleAction(slip.id)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> ปฏิเสธ
                </button>
                <button 
                  onClick={() => handleAction(slip.id)}
                  className="flex-1 bg-[#00B900] hover:bg-[#00a000] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> อนุมัติ
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default function LiffOwnerVerify() {
  return (
    <Suspense fallback={<div className="p-8 text-center">กำลังโหลดข้อมูล...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
