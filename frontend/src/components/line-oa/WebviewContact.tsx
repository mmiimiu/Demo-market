'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Phone, MessageCircle, Star, Home } from 'lucide-react';
import type { ActiveRole } from './types';

const AGENTS = [
  { id: 1, name: 'คุณแสนดี นายหน้า', license: 'AG-2026-99182', rating: 4.9, deals: 127, areas: 'สุขุมวิท, พระราม 9', verified: true },
  { id: 2, name: 'คุณสมศักดิ์ ดีมาก',  license: 'AG-2026-88341', rating: 4.7, deals: 84,  areas: 'รัชดา, ลาดพร้าว',  verified: true },
];
const OWNERS = [
  { id: 1, name: 'คุณสมยศ ใจดี', rooms: 3, active: true  },
];

export default function WebviewContact({ activeRole }: { activeRole: ActiveRole }) {
  const [chatAgent, setChatAgent] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isLinked, setIsLinked] = useState(false);

  const LineLoginCard = () => (
    <div className="border border-green-200 rounded-xl p-3 bg-emerald-50/20 space-y-1.5 mt-3">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black text-emerald-700 uppercase">LINE Login Integration</span>
        <Badge className={`text-[8px] font-black ${isLinked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {isLinked ? 'Synced' : 'Not Linked'}
        </Badge>
      </div>
      <p className="text-[10px] text-gray-500 font-bold">ผูกบัญชี LINE เพื่อรับแจ้งเตือนบิลค่าห้อง การแจ้งเตือนซ่อม และการนัดหมายทันที</p>
      {!isLinked && <Button onClick={() => { setIsLinked(true); toast({ title: '🔗 เชื่อมต่อ LINE สำเร็จ' }); }} className="w-full bg-[#06c755] hover:bg-[#05b34c] text-white font-black text-[10px] h-7">💚 เชื่อมต่อ LINE Account</Button>}
    </div>
  );

  if ((activeRole as string) === 'tenant' || (activeRole as string) === 'owner') {
    const isTenant = activeRole === 'tenant';
    if (chatAgent !== null) {
      const ag = AGENTS[chatAgent];
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 border rounded-xl">
            <Avatar className="w-10 h-10 border"><AvatarFallback className="bg-violet-600 text-white font-black text-xs">AG</AvatarFallback></Avatar>
            <div><p className="font-black text-xs text-gray-900">{ag.name}</p><p className="text-[9px] text-gray-400">{ag.license}</p></div>
          </div>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder={isTenant ? 'สอบถามข้อมูลห้อง...' : 'ต้องการฝากห้อง...'}
            className="w-full border rounded-xl p-3 text-xs font-bold text-gray-800 min-h-[80px]" />
          <Button onClick={() => { toast({ title: '✅ ส่งข้อความแล้ว' }); setChatAgent(null); setMessage(''); }}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black text-xs h-9">ส่งข้อความ</Button>
          <Button variant="outline" onClick={() => setChatAgent(null)} className="w-full text-xs font-black h-9">← เลือก Agent ใหม่</Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="rounded-xl p-4 text-white bg-gradient-to-r from-violet-500 to-purple-600">
          <h4 className="font-black text-sm">{isTenant ? '✨ ติดต่อ Agent นายหน้า' : '🤝 ฝากห้องกับ Agent'}</h4>
          <p className="text-[10px] opacity-80 mt-0.5">{isTenant ? 'ขอคำปรึกษา หรือสอบถามข้อมูลห้อง' : 'เลือก Agent เพื่อดูแลห้องพักของคุณ'}</p>
        </div>
        {AGENTS.map((a, i) => (
          <div key={a.id} className="border rounded-xl p-3 bg-white shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-gray-900">{a.name}</span>
              <span className="text-xs font-black text-gray-700">★ {a.rating}</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setChatAgent(i)} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] h-8">แชท</Button>
              <Button onClick={() => toast({ title: 'กำลังโทร...', description: a.name })} variant="outline" className="flex-1 text-[10px] h-8">โทร</Button>
            </div>
          </div>
        ))}
        <LineLoginCard />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-slate-900 rounded-xl p-4 text-white">
        <h4 className="font-black text-sm">🏢 รายชื่อ Owner ที่ดูแลอยู่</h4>
      </div>
      {OWNERS.map(o => (
        <div key={o.id} className="border rounded-xl p-3 bg-white shadow-sm flex items-center justify-between">
          <div><p className="font-black text-xs text-gray-900">{o.name}</p><p className="text-[9px] text-gray-400">ฝาก {o.rooms} ยูนิต</p></div>
          <div className="flex gap-1.5">
            <Button onClick={() => toast({ title: 'แชท Owner' })} className="bg-slate-800 text-white text-[10px] h-8">แชท</Button>
            <Button onClick={() => toast({ title: 'โทร Owner' })} variant="outline" className="text-[10px] h-8">โทร</Button>
          </div>
        </div>
      ))}
      <LineLoginCard />
    </div>
  );
}
