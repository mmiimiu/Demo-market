"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, Phone, MessageCircle, Calendar, Wallet, Building2, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type DealStage = 'new' | 'viewing' | 'negotiating' | 'closed';

interface Deal {
  id: string;
  leadName: string;
  phone: string;
  property: string;
  unit: string;
  commission: number;
  viewingDate: string | null;
  stage: DealStage;
  avatar: string;
}

export default function LiffAgentDeals() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DealStage>('viewing');
  const [search, setSearch] = useState('');

  const TABS: { id: DealStage; label: string; count: number }[] = [
    { id: 'new', label: 'ติดต่อใหม่', count: 1 },
    { id: 'viewing', label: 'นัดดูห้อง', count: 2 },
    { id: 'negotiating', label: 'เจรจา', count: 1 },
    { id: 'closed', label: 'ปิดดีลแล้ว', count: 2 },
  ];

  const DEALS: Deal[] = [
    {
      id: 'deal-1',
      leadName: 'คุณภาคภูมิ',
      phone: '081-xxx-xxxx',
      property: 'Sukhumvit 71 Condo',
      unit: 'A-1204',
      commission: 8000,
      viewingDate: 'พรุ่งนี้ 14:00 น.',
      stage: 'viewing',
      avatar: 'https://i.pravatar.cc/150?u=lead1',
    },
    {
      id: 'deal-2',
      leadName: 'คุณแอนนา',
      phone: '089-xxx-xxxx',
      property: 'Sathorn Loft',
      unit: '8B',
      commission: 15000,
      viewingDate: 'วันนี้ 17:30 น.',
      stage: 'viewing',
      avatar: 'https://i.pravatar.cc/150?u=lead2',
    },
    {
      id: 'deal-3',
      leadName: 'คุณจอห์น (Expat)',
      phone: '095-xxx-xxxx',
      property: 'Phuket Beachfront',
      unit: '202',
      commission: 25000,
      viewingDate: null,
      stage: 'negotiating',
      avatar: 'https://i.pravatar.cc/150?u=lead3',
    },
    {
      id: 'deal-4',
      leadName: 'คุณสุดา',
      phone: '082-xxx-xxxx',
      property: 'Chiang Mai Villa',
      unit: 'บ้านเลขที่ 5',
      commission: 6500,
      viewingDate: null,
      stage: 'new',
      avatar: 'https://i.pravatar.cc/150?u=lead4',
    },
    {
      id: 'deal-5',
      leadName: 'คุณพงศ์ศักดิ์',
      phone: '088-xxx-xxxx',
      property: 'Lumpini Suite',
      unit: 'C-808',
      commission: 12000,
      viewingDate: null,
      stage: 'closed',
      avatar: 'https://i.pravatar.cc/150?u=lead5',
    },
    {
      id: 'deal-6',
      leadName: 'คุณแมรี่ (Mary)',
      phone: '061-xxx-xxxx',
      property: 'The Base Park',
      unit: '12A',
      commission: 9500,
      viewingDate: null,
      stage: 'closed',
      avatar: 'https://i.pravatar.cc/150?u=lead6',
    }
  ];

  const filteredDeals = DEALS.filter(deal => deal.stage === activeTab && (
    deal.leadName.toLowerCase().includes(search.toLowerCase()) || 
    deal.property.toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-semibold text-slate-900">จัดการดีล (8)</span>
        <div className="w-9" />
      </header>

      <main className="flex-1 flex flex-col">
        
        {/* Sticky Search & Tabs */}
        <div className="sticky top-14 z-10 bg-slate-50 p-4 pb-2 space-y-4 shadow-sm border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อลูกค้า, โครงการ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#00B900] focus:ring-1 focus:ring-[#00B900] transition-all text-sm"
            />
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                  activeTab === tab.id 
                    ? "bg-[#00B900] text-white border-[#00B900]" 
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                )}
              >
                {tab.label} <span className={cn("ml-1 px-1.5 py-0.5 rounded-full text-[10px]", activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Deals List */}
        <div className="p-4 space-y-3">
          {filteredDeals.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>ไม่มีข้อมูลดีลในหมวดหมู่นี้</p>
            </div>
          ) : (
            filteredDeals.map((deal) => (
              <div key={deal.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                {/* Accent line */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  deal.stage === 'new' ? "bg-blue-500" :
                  deal.stage === 'viewing' ? "bg-amber-500" :
                  deal.stage === 'negotiating' ? "bg-purple-500" : "bg-emerald-500"
                )} />

                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-slate-100">
                      <AvatarImage src={deal.avatar} />
                      <AvatarFallback>{deal.leadName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">{deal.leadName}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {deal.phone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">ค่าคอมฯ คาดการณ์</p>
                    <p className="font-bold text-[#00B900] leading-none">฿{deal.commission.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 space-y-2 mb-4 border border-slate-100">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{deal.property}</p>
                      <p className="text-xs text-slate-500">ห้อง {deal.unit}</p>
                    </div>
                  </div>
                  
                  {deal.viewingDate && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 mt-2">
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                      <p className="text-xs font-medium text-amber-700">นัดหมาย: {deal.viewingDate}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors text-sm">
                    <Phone className="w-4 h-4" /> โทร
                  </button>
                  {deal.stage === 'closed' ? (
                    <button 
                      onClick={() => router.push(`/liff/agent/deals/${deal.id}/contract`)}
                      className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm border border-emerald-200"
                    >
                      ดูสัญญาเช่า
                    </button>
                  ) : (
                    <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm">
                      อัปเดตสถานะ
                    </button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </main>

      {/* Global CSS for hiding scrollbar but allowing scroll */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
