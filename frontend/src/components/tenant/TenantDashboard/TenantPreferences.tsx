import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings2, MapPin, DollarSign, Calendar } from 'lucide-react';

export function TenantPreferences({ label }: { label: (th: string, en: string, cn: string) => string }) {
  return (
    <Card className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50 relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-2 h-full bg-[#E51D53]" />
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-[#E51D53]" />
          {label('ความต้องการของฉัน', 'My Request', '我的要求')}
        </CardTitle>
        <CardDescription className="font-bold text-gray-500">
          {label('ข้อมูลที่ Agent ใช้ค้นหาห้องให้คุณ', 'Preferences agents use to find your room', '代理用来为您找房的偏好')}
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0 space-y-4">
        <div className="p-4 bg-gray-50 border border-gray-100 flex items-center gap-4 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-[#E51D53]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-0.5">{label('โซนที่ต้องการ', 'Preferred Zone', '首选区域')}</p>
            <p className="font-bold text-gray-900 text-sm">Sukhumvit, Asoke, Phrom Phong</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-100 flex items-center gap-4 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-[#E51D53]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-0.5">{label('งบประมาณ / เดือน', 'Budget / Month', '预算/月')}</p>
            <p className="font-bold text-gray-900 text-sm">฿15,000 - ฿20,000</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-100 flex items-center gap-4 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-[#E51D53]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-0.5">{label('วันที่ต้องการเข้าอยู่', 'Move-in Date', '入住日期')}</p>
            <p className="font-bold text-gray-900 text-sm">Within 30 Days</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
