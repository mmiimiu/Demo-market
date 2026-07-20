'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Megaphone, Users, Target } from 'lucide-react';

interface WebviewBroadcastProps {
  onSendBroadcast: (text: string, segment: string) => void;
}

export default function WebviewBroadcast({ onSendBroadcast }: WebviewBroadcastProps) {
  const [text, setText] = useState('');
  const [segment, setSegment] = useState<'all' | 'renter' | 'owner' | 'agent'>('all');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  const handleBroadcast = () => {
    if (!text.trim()) {
      toast({ title: '⚠️ กรุณากรอกข้อความ', variant: 'destructive' });
      return;
    }
    const filterDesc = segment === 'all' 
      ? 'กลุ่มผู้ใช้งานทั้งหมด' 
      : `บทบาท: ${segment} ${budgetMin || budgetMax ? `(งบประมาณ ${budgetMin || '0'} - ${budgetMax || 'ไม่จำกัด'} บ.)` : ''}`;
    
    onSendBroadcast(text, filterDesc);
    setText('');
    toast({ title: '📢 ทำการ Broadcast สำเร็จ', description: `ส่งข้อความไปยัง segment: ${filterDesc}` });
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl p-4 text-white">
        <h4 className="font-black text-sm flex items-center gap-1.5">
          <Megaphone className="w-4 h-4" />
          Broadcast & Segment Control
        </h4>
        <p className="text-[10px] opacity-80 mt-0.5">แจ้งเตือนข่าวสาร โปรโมชั่น หรือห้องว่างให้กับกลุ่มลูกค้าแบบเจาะจง</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-700 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> เลือกกลุ่มเป้าหมาย (Segment)
          </label>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'renter', 'owner', 'agent'] as const).map(role => (
              <Badge key={role} onClick={() => setSegment(role)}
                className={`cursor-pointer px-2.5 py-1 text-[10px] font-black border transition-all ${segment === role ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                {role === 'all' ? 'ทุกคน' : role === 'renter' ? 'ผู้เช่า' : role === 'owner' ? 'เจ้าของห้อง' : 'นายหน้า'}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500">งบประมาณเริ่มต้น (บาท)</label>
            <Input type="number" placeholder="เช่น 5,000" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} className="h-8 text-xs font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500">งบประมาณสูงสุด (บาท)</label>
            <Input type="number" placeholder="เช่น 20,000" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} className="h-8 text-xs font-bold" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black text-gray-700 flex items-center gap-1">
            <Target className="w-3.5 h-3.5" /> ข้อความ Broadcast
          </label>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="ใส่รายละเอียดประกาศ เช่น '🔥 ยูนิตหลุดดาวน์พร้อมอยู่คอนโดอโศก ลดกระหน่ำเฉพาะวันนี้!'"
            className="w-full border rounded-xl p-3 text-xs font-bold text-gray-800 min-h-[90px] focus:outline-none focus:ring-1 focus:ring-rose-400" />
        </div>

        <Button onClick={handleBroadcast} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs h-10">
          📢 ส่งข้อความแบบ Broadcast
        </Button>
      </div>
    </div>
  );
}
