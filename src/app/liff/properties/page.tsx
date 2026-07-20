"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ChevronRight, MapPin } from 'lucide-react';

export default function LiffProperties() {
  const router = useRouter();

  const properties = [
    { id: 'prop-1', name: 'Sukhumvit 71 Condo', room: 'ห้อง A-1204', location: 'กรุงเทพมหานคร', status: 'ปกติ', badge: null },
    { id: 'prop-2', name: 'Chiang Mai Villa', room: 'บ้านเลขที่ 5', location: 'เชียงใหม่', status: 'ปกติ', badge: null },
    { id: 'prop-3', name: 'Phuket Beachfront', room: 'ห้อง 202', location: 'ภูเก็ต', status: 'ใกล้หมดสัญญา', badge: 'expiring' },
    { id: 'prop-4', name: 'Sathorn Loft', room: 'ห้อง 8B', location: 'กรุงเทพมหานคร', status: 'ย้ายเข้าวันนี้', badge: 'movein' }
  ];

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      <header className="bg-[#00B900] text-white p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold">ห้องของฉัน</h1>
        <p className="text-white/80 text-sm">เลือกห้องที่ต้องการจัดการ</p>
      </header>

      <main className="flex-1 p-4 space-y-4 pb-24">
        {properties.map((prop) => (
          <div 
            key={prop.id}
            onClick={() => router.push(`/liff/property/${prop.id}`)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden"
          >
            {/* Conditional Banner Accent */}
            {prop.badge === 'expiring' && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />}
            {prop.badge === 'movein' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />}

            <div className="flex justify-between items-start mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${prop.badge === 'expiring' ? 'bg-amber-50 text-amber-500' : prop.badge === 'movein' ? 'bg-emerald-50 text-emerald-500' : 'bg-[#00B900]/10 text-[#00B900]'}`}>
                <Building2 className="w-6 h-6" />
              </div>
              
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide
                ${prop.badge === 'expiring' ? 'bg-amber-100 text-amber-700' : 
                  prop.badge === 'movein' ? 'bg-emerald-100 text-emerald-700' : 
                  'bg-emerald-100 text-emerald-700'}`}
              >
                {prop.status}
              </span>
            </div>
            
            <h2 className="text-lg font-bold text-slate-900">{prop.name}</h2>
            <p className="text-slate-600 font-medium">{prop.room}</p>
            
            <div className="flex items-center text-slate-400 text-sm mt-3">
              <MapPin className="w-4 h-4 mr-1" />
              {prop.location}
            </div>

            <div className={`mt-4 pt-4 border-t border-slate-100 flex items-center justify-between font-medium text-sm
              ${prop.badge === 'expiring' ? 'text-amber-600' : prop.badge === 'movein' ? 'text-emerald-600' : 'text-[#00B900]'}`}
            >
              จัดการห้องพัก
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
