'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, User, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActiveRole } from './types';

type Status = 'pending' | 'confirmed' | 'done' | 'cancelled';

const STATUS_STYLE: Record<Status, string> = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  done:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-500 border-red-200',
};
const STATUS_TH: Record<Status, string> = {
  pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', done: 'เสร็จสิ้น', cancelled: 'ยกเลิก',
};

const TENANT_TODOS = [
  { id: 1, room: 'คอนโดหรู ใกล้ BTS อโศก', location: 'สุขุมวิท ซ.21', date: '10/07/2026', time: '10:00', status: 'confirmed' as Status },
  { id: 2, room: 'ห้องพักใจกลาง สีลม', location: 'สีลม ซ.7', date: '12/07/2026', time: '14:00', status: 'pending' as Status },
  { id: 3, room: 'Studio ใกล้เซ็นทรัลลาดพร้าว', location: 'ลาดพร้าว', date: '05/07/2026', time: '11:00', status: 'done' as Status },
];
const OWNER_TODOS = [
  { id: 1, requester: 'คุณทัตเทพ แสนสุข', room: 'A-1204', date: '10/07/2026', time: '10:00', status: 'pending' as Status },
  { id: 2, requester: 'คุณสมหมาย ดีจริง', room: 'B-0312', date: '11/07/2026', time: '13:00', status: 'confirmed' as Status },
];
const AGENT_TODOS = [
  { id: 1, client: 'คุณทัตเทพ แสนสุข', room: 'คอนโดหรู BTS อโศก', date: '10/07/2026', time: '10:00', status: 'confirmed' as Status },
  { id: 2, client: 'คุณพิมพ์ใจ สบายดี', room: 'สตูดิโอ ลาดพร้าว', date: '12/07/2026', time: '09:00', status: 'pending' as Status },
  { id: 3, client: 'คุณอรรถ มั่นคง', room: 'ห้องพัก สีลม', date: '08/07/2026', time: '15:00', status: 'done' as Status },
];

export default function WebviewAppointment({ activeRole, onApproveAppointment }: { activeRole: ActiveRole; onApproveAppointment?: (info: any) => void }) {
  const [ownerItems, setOwnerItems] = useState(OWNER_TODOS);
  const [agentItems, setAgentItems] = useState(AGENT_TODOS);
  
  // States for creating new appointment
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClient, setNewClient] = useState('');
  const [newRoom, setNewRoom] = useState('คอนโดหรู BTS อโศก');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const approveItem = (id: number) => {
    const item = ownerItems.find(i => i.id === id);
    setOwnerItems(p => p.map(i => i.id === id ? { ...i, status: 'confirmed' as Status } : i));
    toast({ title: '✅ ยืนยันการนัดดูห้องแล้ว' });
    if (item && onApproveAppointment) {
      onApproveAppointment({
        dateTime: `${item.date} ${item.time} น.`,
        location: `คอนโดหรู ห้อง ${item.room} อโศก`,
        mapLink: 'https://maps.google.com',
        agentName: 'คุณแสนดี นายหน้า',
      });
    }
  };
  const rejectItem = (id: number) => {
    setOwnerItems(p => p.map(i => i.id === id ? { ...i, status: 'cancelled' as Status } : i));
    toast({ title: 'ยกเลิกการนัดดูห้องแล้ว', variant: 'destructive' });
  };

  const approveAgentItem = (id: number) => {
    const item = agentItems.find(i => i.id === id);
    setAgentItems(p => p.map(i => i.id === id ? { ...i, status: 'confirmed' as Status } : i));
    toast({ title: '✅ ยืนยันการนัดดูห้องแล้ว' });
    if (item && onApproveAppointment) {
      onApproveAppointment({
        dateTime: `${item.date} ${item.time} น.`,
        location: item.room,
        mapLink: 'https://maps.google.com',
        agentName: 'คุณแสนดี นายหน้า',
      });
    }
  };

  const rejectAgentItem = (id: number) => {
    setAgentItems(p => p.map(i => i.id === id ? { ...i, status: 'cancelled' as Status } : i));
    toast({ title: 'ยกเลิกการนัดดูห้องแล้ว', variant: 'destructive' });
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newDate || !newTime) {
      toast({ title: '❌ กรุณากรอกข้อมูลให้ครบถ้วน', variant: 'destructive' });
      return;
    }

    const formattedDate = newDate.split('-').reverse().join('/'); // Convert yyyy-mm-dd to dd/mm/yyyy
    const newId = agentItems.length + 1;
    const newAppt = {
      id: newId,
      client: newClient,
      room: newRoom,
      date: formattedDate,
      time: newTime,
      status: 'confirmed' as Status
    };

    setAgentItems(p => [newAppt, ...p]);
    toast({ title: '✨ สร้างนัดหมายสำเร็จ', description: `นัดหมายคุณ ${newClient} ดูห้อง ${newRoom} เรียบร้อยแล้ว` });
    
    // Auto notify simulation
    if (onApproveAppointment) {
      onApproveAppointment({
        dateTime: `${formattedDate} ${newTime} น.`,
        location: newRoom,
        mapLink: 'https://maps.google.com',
        agentName: 'คุณแสนดี นายหน้า (สร้างนัดแทน)',
      });
    }

    // Reset Form
    setNewClient('');
    setNewDate('');
    setNewTime('');
    setShowCreateForm(false);
  };

  const Header = ({ title, sub, color }: { title: string; sub: string; color: string }) => (
    <div className={`rounded-xl p-4 text-white mb-4 ${color}`}>
      <h4 className="font-black text-sm mb-0.5">{title}</h4>
      <p className="text-[10px] opacity-80 font-semibold">{sub}</p>
    </div>
  );

  if (activeRole === 'tenant') return (
    <div className="space-y-3">
      <Header title="📅 การนัดดูห้องของฉัน" sub="รายการนัดหมายเพื่อเข้าชมห้องพัก" color="bg-gradient-to-r from-blue-500 to-indigo-600" />
      {TENANT_TODOS.map(t => (
        <div key={t.id} className="border rounded-xl p-3.5 bg-white shadow-sm space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-black text-xs text-gray-900 truncate">{t.room}</p>
              <div className="flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-gray-400" /><span className="text-[10px] text-gray-400 font-semibold">{t.location}</span></div>
            </div>
            <Badge className={`text-[9px] font-black border shrink-0 ${STATUS_STYLE[t.status]}`}>{STATUS_TH[t.status]}</Badge>
          </div>
          <div className="flex gap-3 text-[10px] font-bold text-gray-600">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{t.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.time} น.</span>
          </div>
        </div>
      ))}
      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs h-9 mt-2"
        onClick={() => toast({ title: 'นัดดูห้องใหม่', description: 'เลือกห้องจากเมนูค้นหาห้องก่อนนัดได้เลยค่ะ' })}>
        + นัดดูห้องใหม่
      </Button>
    </div>
  );

  if (activeRole === 'owner') return (
    <div className="space-y-3">
      <Header title="🏠 คำขอนัดดูห้องของคุณ" sub="ลูกค้าที่ขอนัดมาดูห้องพัก — อนุมัติหรือปฏิเสธได้เลย" color="bg-gradient-to-r from-emerald-500 to-[#06c755]" />
      {ownerItems.map(t => (
        <div key={t.id} className="border rounded-xl p-3.5 bg-white shadow-sm space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" /><p className="font-black text-xs text-gray-900">{t.requester}</p></div>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">ห้อง {t.room}</p>
            </div>
            <Badge className={`text-[9px] font-black border shrink-0 ${STATUS_STYLE[t.status]}`}>{STATUS_TH[t.status]}</Badge>
          </div>
          <div className="flex gap-3 text-[10px] font-bold text-gray-600">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{t.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.time} น.</span>
          </div>
          {t.status === 'pending' && (
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={() => approveItem(t.id)} className="flex-1 bg-[#06c755] hover:bg-[#05b34c] text-white font-black text-[10px] h-8">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />อนุมัติ
              </Button>
              <Button size="sm" variant="outline" onClick={() => rejectItem(t.id)} className="flex-1 border-red-200 text-red-500 font-black text-[10px] h-8 hover:bg-red-50">
                <XCircle className="w-3.5 h-3.5 mr-1" />ปฏิเสธ
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Agent
  return (
    <div className="space-y-3">
      <Header title="✨ นัดดูห้องแทนลูกค้า" sub="รายการนัดหมายทั้งหมดที่รับผิดชอบ" color="bg-gradient-to-r from-violet-500 to-purple-600" />
      
      {showCreateForm ? (
        <form onSubmit={handleCreateAppointment} className="border border-violet-200 rounded-xl p-4 bg-violet-50/20 space-y-3 animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-violet-100 pb-2 mb-1">
            <h5 className="font-black text-xs text-violet-950">📋 นัดหมายเข้าชมห้องแทนลูกค้า</h5>
            <button type="button" onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-gray-500 uppercase">ชื่อลูกค้า</Label>
            <Input 
              placeholder="เช่น คุณวิชัย รักดี" 
              value={newClient} 
              onChange={e => setNewClient(e.target.value)} 
              className="h-8 text-xs font-bold" 
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-gray-500 uppercase">โครงการ / ห้องพัก</Label>
            <select 
              value={newRoom} 
              onChange={e => setNewRoom(e.target.value)}
              className="w-full border rounded-md px-3 h-8 text-xs font-bold bg-white text-gray-900 focus:outline-none"
            >
              <option value="คอนโดหรู BTS อโศก">คอนโดหรู BTS อโศก</option>
              <option value="สตูดิโอ ลาดพร้าว">สตูดิโอ ลาดพร้าว</option>
              <option value="ห้องพัก สีลม">ห้องพัก สีลม</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-gray-500 uppercase">วันที่</Label>
              <Input 
                type="date" 
                value={newDate} 
                onChange={e => setNewDate(e.target.value)} 
                className="h-8 text-xs font-bold" 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-gray-500 uppercase">เวลา</Label>
              <Input 
                type="time" 
                value={newTime} 
                onChange={e => setNewTime(e.target.value)} 
                className="h-8 text-xs font-bold" 
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs h-8">
              ยืนยันการนัดหมาย
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1 text-xs font-bold h-8">
              ยกเลิก
            </Button>
          </div>
        </form>
      ) : (
        <Button 
          onClick={() => setShowCreateForm(true)} 
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black text-xs h-9 flex items-center justify-center gap-1.5 rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4" /> สร้างนัดหมายแทนลูกค้า
        </Button>
      )}

      <div className="space-y-2.5 mt-3">
        {agentItems.map(t => (
          <div key={t.id} className="border rounded-xl p-3.5 bg-white shadow-sm space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <p className="font-black text-xs text-gray-900">{t.client}</p>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5 truncate">{t.room}</p>
              </div>
              <Badge className={`text-[9px] font-black border shrink-0 ${STATUS_STYLE[t.status]}`}>{STATUS_TH[t.status]}</Badge>
            </div>
            <div className="flex gap-3 text-[10px] font-bold text-gray-600">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{t.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.time} น.</span>
            </div>
            
            {t.status === 'pending' && (
              <div className="flex gap-2 pt-1 border-t border-dashed mt-2">
                <Button size="sm" onClick={() => approveAgentItem(t.id)} className="flex-1 bg-[#06c755] hover:bg-[#05b34c] text-white font-black text-[10px] h-8">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />อนุมัติ
                </Button>
                <Button size="sm" variant="outline" onClick={() => rejectAgentItem(t.id)} className="flex-1 border-red-200 text-red-500 font-black text-[10px] h-8 hover:bg-red-50">
                  <XCircle className="w-3.5 h-3.5 mr-1" />ปฏิเสธ
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
