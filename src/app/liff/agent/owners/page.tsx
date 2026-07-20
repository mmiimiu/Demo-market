"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, Phone, MessageCircle, Building2, ChevronDown, CheckCircle2, CircleDashed } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Owner {
  id: string;
  name: string;
  company: string;
  avatar: string;
  rented: number;
  vacant: number;
}

export default function LiffAgentOwners() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const OWNERS: Owner[] = [
    {
      id: 'ow-1',
      name: 'คุณสมยศ พัฒนากุล',
      company: 'Somyot Properties',
      avatar: 'https://i.pravatar.cc/150?u=somyot',
      rented: 10,
      vacant: 25,
    },
    {
      id: 'ow-2',
      name: 'บจก. เอเชีย เรียลเอสเตท',
      company: 'Corporate',
      avatar: 'https://i.pravatar.cc/150?u=asia',
      rented: 18,
      vacant: 2,
    },
    {
      id: 'ow-3',
      name: 'คุณวิภาดา แสนสุข',
      company: 'Personal',
      avatar: 'https://i.pravatar.cc/150?u=vipada',
      rented: 2,
      vacant: 0,
    }
  ];

  const filteredOwners = OWNERS.filter(ow => 
    ow.name.toLowerCase().includes(search.toLowerCase()) || 
    ow.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-semibold text-slate-900">รายชื่อเจ้าของ (12)</span>
        <div className="w-9" />
      </header>

      <main className="flex-1 p-4 space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อเจ้าของ, นิติบุคคล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#00B900] focus:ring-1 focus:ring-[#00B900] transition-all"
          />
        </div>

        {/* Owners List */}
        <div className="space-y-3">
          {filteredOwners.map((owner) => {
            const total = owner.rented + owner.vacant;
            const isExpanded = expandedId === owner.id;

            return (
              <div key={owner.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
                
                {/* Card Header (Click to expand) */}
                <div 
                  className="p-4 cursor-pointer hover:bg-slate-50 flex items-center justify-between"
                  onClick={() => setExpandedId(isExpanded ? null : owner.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-slate-100">
                      <AvatarImage src={owner.avatar} />
                      <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">{owner.name}</h3>
                      <p className="text-xs text-slate-500">{owner.company} • {total} ห้อง</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", isExpanded && "rotate-180")} />
                </div>

                {/* Card Body (Expanded State) */}
                <div className={cn("px-4 pb-4 space-y-4 overflow-hidden transition-all", isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pb-0")}>
                  
                  {/* Status Badges */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">ปล่อยเช่าแล้ว</p>
                        <p className="font-bold text-slate-900 text-lg leading-none">{owner.rented} <span className="text-xs font-normal text-slate-500">ห้อง</span></p>
                      </div>
                    </div>

                    <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <CircleDashed className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-0.5">รอปล่อยเช่า</p>
                        <p className="font-bold text-slate-900 text-lg leading-none">{owner.vacant} <span className="text-xs font-normal text-slate-500">ห้อง</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors text-sm">
                      <Phone className="w-4 h-4" /> โทร
                    </button>
                    <button className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors text-sm">
                      <MessageCircle className="w-4 h-4" /> แชท
                    </button>
                    <button 
                      onClick={() => router.push('/liff/agent/dashboard')} // Mock routing to properties
                      className="flex-1 bg-[#00B900] hover:bg-[#00a000] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
                    >
                      <Building2 className="w-4 h-4" /> ดูห้องพัก
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
