'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Phone, MessageCircle, Star } from 'lucide-react';

const MOCK_AGENTS = [
  { id: 1, name: 'คุณแสนดี นายหน้า', license: 'AG-2026-99182', rating: 4.9, deals: 127, areas: 'สุขุมวิท, พระราม 9', verified: true },
  { id: 2, name: 'คุณสมศักดิ์ ดีมาก', license: 'AG-2026-88341', rating: 4.7, deals: 84, areas: 'รัชดา, ลาดพร้าว', verified: true },
  { id: 3, name: 'คุณอรุณ พร้อมให้บริการ', license: 'AG-2025-71209', rating: 4.6, deals: 56, areas: 'บางนา, อ่อนนุช', verified: false },
];

export default function WebviewAgent() {
  const [contacted, setContacted] = React.useState<number | null>(null);
  const [message, setMessage] = React.useState('');

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-4 text-white">
        <h4 className="font-black text-sm mb-1">✨ ติดต่อ Agent นายหน้า</h4>
        <p className="text-[10px] opacity-80 font-semibold">เลือก Agent ที่ได้รับการรับรองเพื่อขอความช่วยเหลือด้านอสังหาฯ</p>
      </div>

      {contacted !== null ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-xl">
            <Avatar className="w-10 h-10 border">
              <AvatarFallback className="bg-violet-600 text-white font-black text-xs">AG</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-black text-xs text-gray-900">{MOCK_AGENTS[contacted].name}</p>
              <p className="text-[9px] text-gray-400 font-semibold">กำลังรอรับสาย...</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase">ข้อความถึง Agent</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="เช่น ต้องการหาห้องย่าน BTS อโศก งบ 15,000 บาท..."
              className="w-full border rounded-xl p-3 text-xs font-bold text-gray-800 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <Button
            onClick={() => { toast({ title: '✅ ส่งข้อความถึง Agent เรียบร้อย', description: 'Agent จะติดต่อกลับใน LINE ภายใน 15 นาที' }); setContacted(null); setMessage(''); }}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black text-xs h-10"
          >
            <MessageCircle className="w-4 h-4 mr-1.5" /> ส่งข้อความ
          </Button>
          <Button variant="outline" onClick={() => setContacted(null)} className="w-full text-xs font-black">
            ← เลือก Agent ใหม่
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <span className="text-xs font-black text-gray-700">เลือก Agent ที่ต้องการติดต่อ:</span>
          {MOCK_AGENTS.map((a, i) => (
            <div key={a.id} className="border rounded-xl p-3.5 bg-white shadow-sm space-y-2.5">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border shrink-0">
                  <AvatarFallback className="bg-violet-600 text-white font-black text-xs">AG</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black text-xs text-gray-900">{a.name}</span>
                    {a.verified && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[8px] font-black px-1.5 py-0 h-4">Verified</Badge>}
                  </div>
                  <p className="text-[9px] text-gray-400 font-semibold">ใบอนุญาต: {a.license}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-black text-gray-700">{a.rating}</span>
                </div>
              </div>
              <div className="flex gap-3 text-[10px] text-gray-500 font-semibold">
                <span>📍 {a.areas}</span>
                <span>🏠 {a.deals} ดีล</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setContacted(i)} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] h-8">
                  <MessageCircle className="w-3.5 h-3.5 mr-1" />แชท
                </Button>
                <Button variant="outline" className="flex-1 border-violet-200 text-violet-700 font-black text-[10px] h-8"
                  onClick={() => toast({ title: 'กำลังโทรหา Agent', description: a.name })}>
                  <Phone className="w-3.5 h-3.5 mr-1" />โทร
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
