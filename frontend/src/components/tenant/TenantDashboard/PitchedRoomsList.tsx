import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PitchedRoomsList({ label }: { label: (th: string, en: string, cn: string) => string }) {
  const mockPitchedRooms = [
    {
      id: 1,
      name: 'Ideo Mobi Sukhumvit 81',
      agent: 'Somchai (PrimeRent Agent)',
      match: 95,
      price: '15,000',
      status: 'new'
    },
    {
      id: 2,
      name: 'The Base Park East',
      agent: 'Nipa (Co-Broke)',
      match: 88,
      price: '14,500',
      status: 'viewed'
    }
  ];

  return (
    <Card className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50 relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-2 h-full bg-[#E51D53]" />
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
          <Home className="w-5 h-5 text-[#E51D53]" />
          {label('ห้องที่ Agent นำเสนอ', 'Rooms Pitched to You', '代理向您推介的房源')}
        </CardTitle>
        <CardDescription className="font-bold text-gray-500">
          {label('พิจารณาห้องที่ตรงกับความต้องการของคุณ', 'Review properties that match your request', '查看符合您要求的房产')}
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0 space-y-4">
        {mockPitchedRooms.map((room) => (
          <div key={room.id} className="p-4 border border-gray-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-black text-gray-900">{room.name}</h4>
                {room.status === 'new' && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider rounded-xl">New</span>
                )}
              </div>
              <p className="text-xs font-bold text-gray-500 mb-2">Agent: {room.agent}</p>
              <div className="flex items-center gap-3 text-xs font-black">
                <span className="text-[#E51D53]">Match: {room.match}%</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-900">฿{room.price}/mo</span>
              </div>
            </div>
            <Button variant="outline" className="shrink-0 h-9 rounded-xl font-bold text-xs bg-white border-gray-200 hover:bg-[#E51D53] hover:text-white hover:border-[#E51D53] gap-2 transition-colors">
              {label('ดูรายละเอียด', 'View Details', '查看详情')}
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
