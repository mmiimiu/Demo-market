"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { translations } from '@/lib/translations';

const inquiries = [
  { id: 1, name: 'Brooklyn Simmons', email: 'brok.simms@mail.com', property: 'Sukhumvit Condo', status: 'Pending', statusColor: 'bg-yellow-100 text-yellow-700' },
  { id: 2, name: 'Cody Fisher', email: 'cody_fisher99@mail.com', property: 'Silom Apartment', status: 'Approved', statusColor: 'bg-green-100 text-green-700' },
  { id: 3, name: 'Ralph Edwards', email: 'ralp_uxdsg@mail.com', property: 'Ari Studio', status: 'Viewing', statusColor: 'bg-blue-100 text-blue-700' },
];

export function RecentInquiries({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const isThai = lang === 'th';

  return (
    <Card className="p-6 rounded-2xl border-gray-100 shadow-sm shadow-gray-200/50 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800 text-base">{isThai ? 'คำถามล่าสุด' : 'Recent Inquiries'}</h3>
        <button className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-100 hover:bg-slate-100 transition-colors">
          {isThai ? 'ดูรายละเอียด' : 'See Details'}
        </button>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-slate-400 pb-3 border-b border-slate-100">
          <div className="col-span-5">{isThai ? 'ชื่อผู้เช่า' : 'Tenant Name'}</div>
          <div className="col-span-4">{isThai ? 'อสังหาริมทรัพย์' : 'Property'}</div>
          <div className="col-span-3 text-right">{isThai ? 'สถานะ' : 'Status'}</div>
        </div>
        
        <div className="flex flex-col">
          {inquiries.map((inq, idx) => (
            <div key={inq.id} className={`grid grid-cols-12 gap-4 items-center py-4 ${idx !== inquiries.length - 1 ? 'border-b border-slate-50' : ''}`}>
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                  <img src={`https://i.pravatar.cc/150?u=${inq.id}`} alt={inq.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{inq.name}</div>
                  <div className="text-xs text-slate-500">{inq.email}</div>
                </div>
              </div>
              <div className="col-span-4 flex items-center">
                <span className="text-xs font-semibold text-slate-700">{inq.property}</span>
              </div>
              <div className="col-span-3 flex justify-end">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${inq.statusColor}`}>
                  {inq.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
