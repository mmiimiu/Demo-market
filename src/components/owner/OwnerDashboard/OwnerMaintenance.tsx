'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { translations } from '@/lib/translations';

interface OwnerMaintenanceProps {
  lang: 'th' | 'en' | 'cn';
}

export function OwnerMaintenance({ lang }: OwnerMaintenanceProps) {
  const t = translations[lang] || translations.th;
  const isThai = lang === 'th';
  const isChinese = lang === 'cn';

  const roomSchedules = [
    { property: 'Ideo Mix Sukhumvit (102)', daysLeft: 15, curtainDate: '15 ส.ค. 2026', acDate: '20 ส.ค. 2026', rentDueDate: 'ทุกวันที่ 1', windowDays: 5, urgent: true },
    { property: 'The Base Park East (405)', daysLeft: 42, curtainDate: '1 ก.ย. 2026', acDate: '10 ก.ย. 2026', rentDueDate: 'ทุกวันที่ 5', windowDays: 3, urgent: false },
    { property: 'Condo Asoke Place (1209)', daysLeft: 88, curtainDate: '15 ต.ค. 2026', acDate: '25 ต.ค. 2026', rentDueDate: 'ทุกวันที่ 1', windowDays: 7, urgent: false },
  ].sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <Card className="border-gray-100 shadow-sm shadow-gray-200/50 rounded-2xl bg-white p-6 md:p-8 space-y-6">
      <div>
        <h4 className="text-lg font-black mb-1 flex items-center gap-2 text-gray-900">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          {isThai ? 'สัญญาใกล้หมดอายุ & กำหนดดูแลห้องพัก' : 'Lease Expirations & Maintenance Schedules'}
        </h4>
        <p className="text-xs text-gray-500 font-semibold">
          {isThai ? 'เรียงลำดับห้องที่ใกล้หมดสัญญาขึ้นก่อน พร้อมวันซักผ้าม่าน วันล้างแอร์ และกำหนดเก็บค่าเช่า' : 'Rooms sorted by lease expiry with maintenance & billing schedule.'}
        </p>
      </div>

      <div className="space-y-4">
        {roomSchedules.map((room, i) => (
          <div key={i} className={cn("p-4 rounded-xl border space-y-3 bg-white transition-all shadow-xs", room.urgent ? "border-amber-200 bg-amber-50/30" : "border-gray-150")}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-black text-gray-900 text-sm">{room.property}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">{isThai ? 'กำหนดชำระค่าเช่า:' : 'Rent Due:'} {room.rentDueDate} ({isThai ? `กรอบเวลา ${room.windowDays} วัน` : `${room.windowDays} days window`})</p>
              </div>
              <Badge className={cn('rounded-xl text-[9px] font-black border-none px-2 py-0.5', room.urgent ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800')}>
                ⏳ เหลือ {room.daysLeft} วัน
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
              <div className="bg-blue-50/80 p-2 rounded-lg text-blue-900 font-semibold">
                <span className="text-[10px] text-gray-500 block">{isThai ? '🧺 วันซักผ้าม่าน' : 'Curtain Wash'}</span>
                <span className="font-bold">{room.curtainDate}</span>
              </div>
              <div className="bg-teal-50/80 p-2 rounded-lg text-teal-900 font-semibold">
                <span className="text-[10px] text-gray-500 block">{isThai ? '❄️ วันล้างแอร์' : 'AC Cleaning'}</span>
                <span className="font-bold">{room.acDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
