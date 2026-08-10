"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, UserCheck, Star, Briefcase, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function AgentMatching({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const isThai = lang === 'th';
  const [activeTab, setActiveTab] = useState<'find' | 'tasks'>('find');

  const recommendedAgents = [
    { id: 1, name: 'Somchai Sukhumvit', zone: 'Asok / Sukhumvit', rating: 4.9, reviews: 124, type: 'Full Management' },
    { id: 2, name: 'Jane Specialist', zone: 'Ari / Phaya Thai', rating: 4.8, reviews: 89, type: 'Full & Tasks' },
    { id: 3, name: 'Mike Runner', zone: 'Sathorn / Silom', rating: 4.7, reviews: 200, type: 'Tasks Only (Keys/Viewing)' },
  ];

  const handlePostTask = () => {
    toast({
      title: isThai ? 'สร้างงานสำเร็จ' : 'Task Posted',
      description: isThai ? 'เอเจนต์ในพื้นที่จะได้รับการแจ้งเตือน' : 'Agents in the area will be notified.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{isThai ? 'ระบบจัดหาเอเจนต์ (Agent Matching)' : 'Agent Matching System'}</h2>
          <p className="text-slate-500 text-sm mt-1">{isThai ? 'หาผู้ช่วยดูแลห้องหรือเปิดห้องให้ลูกค้าแทนคุณ' : 'Find someone to manage your property or open doors for viewings.'}</p>
        </div>
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex">
          <button 
            onClick={() => setActiveTab('find')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'find' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {isThai ? 'ค้นหาเอเจนต์' : 'Find Agents'}
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'tasks' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {isThai ? 'จ้างงานรายครั้ง (Gig)' : 'Post a Gig/Task'}
          </button>
        </div>
      </div>

      {activeTab === 'find' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800">{isThai ? 'เอเจนต์แนะนำในโซนของคุณ' : 'Recommended Agents in your zone'}</h3>
            {recommendedAgents.map(agent => (
              <Card key={agent.id} className="p-6 rounded-2xl border-slate-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${agent.id}`} alt={agent.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{agent.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-500"/> {agent.zone}</span>
                      <span className="flex items-center gap-1 text-orange-500 font-bold"><Star className="w-3 h-3 fill-orange-500"/> {agent.rating} ({agent.reviews})</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-full mb-2">{agent.type}</span>
                  <div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                      {isThai ? 'ทักแชท' : 'Chat'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 rounded-2xl border-blue-100 bg-blue-50 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{isThai ? 'ฝากห้องให้เอเจนต์ดูแลเต็มรูปแบบ' : 'Full Management Co-Broke'}</h3>
              <p className="text-sm text-slate-600 mb-6">
                {isThai 
                  ? 'ให้เอเจนต์มืออาชีพหาผู้เช่าให้ โดยตกลงค่าคอมมิชชั่นที่ 1 เดือน' 
                  : 'Let professional agents find tenants for you. Standard 1 month commission.'}
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6">
                {isThai ? 'เปิดรับ Co-Broke' : 'Open for Co-Broke'}
              </Button>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <Card className="p-8 rounded-2xl border-slate-100 shadow-sm text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">{isThai ? 'จ้างเอเจนต์เปิดห้อง (Gig)' : 'Hire an Agent for a Viewing'}</h3>
          <p className="text-slate-500 mb-8">
            {isThai 
              ? 'ไม่มีเวลาไปเปิดประตูให้ลูกค้าดูห้อง? จ้างเอเจนต์ในพื้นที่ไปเปิดห้องแทนคุณในราคาเริ่มต้น 500 บาท/ครั้ง' 
              : 'No time to open the door for a viewing? Hire a local agent to do it for you starting at 500 THB/time.'}
          </p>
          
          <div className="bg-slate-50 p-6 rounded-2xl text-left space-y-4 mb-8 border border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">{isThai ? 'เลือกห้องของคุณ' : 'Select your property'}</label>
              <select className="w-full p-3 rounded-xl border border-slate-200 mt-1 bg-white">
                <option>Sukhumvit Luxury Condo 2BR</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">{isThai ? 'วันที่' : 'Date'}</label>
                <input type="date" className="w-full p-3 rounded-xl border border-slate-200 mt-1 bg-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">{isThai ? 'เวลา' : 'Time'}</label>
                <input type="time" className="w-full p-3 rounded-xl border border-slate-200 mt-1 bg-white" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">{isThai ? 'ค่าจ้างเสนอ (THB)' : 'Offer Price (THB)'}</label>
              <input type="number" defaultValue={500} className="w-full p-3 rounded-xl border border-slate-200 mt-1 bg-white" />
            </div>
          </div>

          <Button onClick={handlePostTask} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-6 text-lg font-bold">
            {isThai ? 'โพสต์งาน' : 'Post Task'}
          </Button>
        </Card>
      )}
    </div>
  );
}
