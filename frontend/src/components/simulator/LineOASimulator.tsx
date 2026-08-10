"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bell, ChevronLeft, LayoutGrid, CreditCard, FileText, 
  Clock, Newspaper, HeadphonesIcon, ExternalLink, X, 
  UserCircle, MessageCircle, Building2, CheckSquare, LineChart, Wrench, Briefcase, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

type Role = 'tenant' | 'owner' | 'agent';

export function LineOASimulator() {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [role, setRole] = useState<Role>('tenant');
  const [dynamicMessages, setDynamicMessages] = useState<any[]>([]);

  // Load dynamic LINE OA messages (credit top-up etc.) from localStorage
  useEffect(() => {
    const loadMessages = () => {
      try {
        const stored = localStorage.getItem('primerent_line_oa_messages');
        if (stored) {
          setDynamicMessages(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Error loading LINE OA messages:', e);
      }
    };
    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  const TENANT_USER = {
    name: 'ผู้เช่า',
    avatar: 'https://i.pravatar.cc/150?u=tenant',
  };

  const OWNER_USER = {
    name: 'เจ้าของห้อง',
    avatar: 'https://i.pravatar.cc/150?u=owner',
  };

  const AGENT_USER = {
    name: 'เอเจนต์',
    avatar: 'https://i.pravatar.cc/150?u=agent',
  };

  const activeUser = role === 'tenant' ? TENANT_USER : role === 'owner' ? OWNER_USER : AGENT_USER;

  const UNIFIED_MENU = [
    { id: 'search', label: 'ค้นหาห้องพัก', icon: <Building2 className="w-6 h-6 mb-1" />, url: '/liff/properties' },
    { id: 'payment', label: 'บิล & ชำระเงิน', icon: <CreditCard className="w-6 h-6 mb-1" />, url: '/liff/payment/select' },
    { id: 'contract', label: 'สัญญาของฉัน', icon: <FileText className="w-6 h-6 mb-1" />, url: '/liff/sign' },
    role === 'agent'
      ? { id: 'deals', label: 'ดีลทั้งหมด', icon: <Briefcase className="w-6 h-6 mb-1" />, url: '/liff/agent/deals' }
      : { id: 'maintenance', label: 'แจ้งซ่อมบำรุง', icon: <Wrench className="w-6 h-6 mb-1" />, url: '/liff/maintenance' },
    { id: 'dashboard', label: 'แดชบอร์ดหลัก', icon: <LayoutGrid className="w-6 h-6 mb-1" />, url: 'dashboard' },
    { id: 'profile', label: 'โปรไฟล์ & ติดต่อ', icon: <UserCircle className="w-6 h-6 mb-1" />, url: '/profile' },
  ];

  const handleMenuClick = (btnId: string, defaultUrl: string) => {
    if (btnId === 'dashboard') {
      if (role === 'tenant') {
        setActiveUrl('/tenant/dashboard');
      } else if (role === 'owner') {
        setActiveUrl('/liff/owner/dashboard');
      } else if (role === 'agent') {
        setActiveUrl('/liff/agent/dashboard');
      }
    } else if (btnId === 'maintenance') {
      setActiveUrl(`/liff/maintenance?role=${role}`);
    } else if (btnId === 'deals') {
      setActiveUrl('/liff/agent/deals');
    } else if (btnId === 'payment') {
      // Owner/Agent see billing summary; Tenant sees bill select
      setActiveUrl(`/liff/payment/select?role=${role}`);
    } else if (btnId === 'contract') {
      // Pass role so /liff/sign can show the edit button for Owner/Agent
      setActiveUrl(`/liff/sign?role=${role}`);
    } else {
      setActiveUrl(defaultUrl);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      
      {/* Role Switcher Toolbar */}
      <div className="mb-6 flex bg-slate-800 p-1.5 rounded-xl">
        <button 
          onClick={() => { setRole('tenant'); setActiveUrl(null); }}
          className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all", role === 'tenant' ? "bg-[#00B900] text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}
        >
          มุมมองผู้เช่า
        </button>
        <button 
          onClick={() => { setRole('owner'); setActiveUrl(null); }}
          className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all", role === 'owner' ? "bg-[#00B900] text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}
        >
          มุมมองเจ้าของ
        </button>
        <button 
          onClick={() => { setRole('agent'); setActiveUrl(null); }}
          className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all", role === 'agent' ? "bg-[#00B900] text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}
        >
          มุมมองเอเจนต์
        </button>
      </div>

      {/* Smartphone Frame Mockup */}
      <div className="w-full max-w-[400px] h-[800px] max-h-[85vh] bg-[#749bb5] rounded-[40px] overflow-hidden shadow-2xl relative border-[8px] border-slate-800 flex flex-col">
        
        {/* Dynamic Top Bar */}
        <div className="bg-[#00B900] text-white px-4 h-14 flex items-center justify-between shrink-0 z-10 shadow-sm relative">
          <div className="flex items-center gap-3">
            {activeUrl ? (
              <button onClick={() => setActiveUrl(null)} className="p-1 hover:bg-black/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            ) : (
              <button className="p-1 hover:bg-black/10 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <span className="font-semibold text-lg">{activeUrl ? 'RentFlow Web' : 'RentFlow OA'}</span>
          </div>
          <div className="flex items-center gap-3">
            {!activeUrl && (
              <button className="p-1 hover:bg-black/10 rounded-full transition-colors relative">
                <Bell className="w-5 h-5" />
                {(role === 'owner' || role === 'agent') && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#00B900]" />}
              </button>
            )}
            {activeUrl && (
              <button className="p-1 hover:bg-black/10 rounded-full transition-colors" title="Open in external browser">
                <ExternalLink className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Body */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-[#84A1C4]">
          
          {activeUrl ? (
            // Embedded LIFF Browser View
            <iframe 
              src={activeUrl} 
              className="w-full h-full border-none bg-white min-h-0"
              title="LIFF App View"
            />
          ) : (
            // Chat View
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              
              {/* Chat History Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Date Header */}
                <div className="flex justify-center">
                  <span className="bg-black/10 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">วันนี้</span>
                </div>

                {/* Message Bubbles */}
                <div className="space-y-6">
                  
                  {role === 'tenant' && (
                    <>
                      {/* Tenant Message 1: Monthly Utility & Rent Bill */}
                      <div className="flex gap-3 max-w-[85%]">
                        <Avatar className="w-10 h-10 border-none shadow-sm shrink-0">
                          <AvatarImage src="https://ui-avatars.com/api/?name=RentFlow&background=00B900&color=fff" />
                          <AvatarFallback>RF</AvatarFallback>
                        </Avatar>
                        <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm overflow-hidden text-slate-800 border border-slate-200">
                          <div className="p-4 space-y-3">
                            <p className="font-bold text-[#E51D53] flex items-center gap-1.5">🧾 บิลค่าเช่า & บริการรายเดือน</p>
                            <div>
                              <p className="font-bold text-sm">โครงการ Ideo Mix Sukhumvit 103</p>
                              <p className="text-[10px] text-slate-500">ห้อง A-1204 | ประจำเดือน มิถุนายน 2569</p>
                            </div>
                            <div className="h-[1px] bg-slate-100 w-full" />
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between text-slate-600"><span>• ค่าเช่าห้อง</span><span className="font-bold text-slate-900">฿8,000</span></div>
                              <div className="flex justify-between text-slate-600"><span>• ค่าน้ำ</span><span className="font-bold text-slate-900">฿300</span></div>
                              <div className="flex justify-between text-slate-600"><span>• ค่าไฟ</span><span className="font-bold text-slate-900">฿1,200</span></div>
                              <div className="flex justify-between text-slate-600"><span>• ค่าส่วนกลาง</span><span className="font-bold text-slate-900">฿2,000</span></div>
                            </div>
                            <div className="h-[1px] bg-slate-100 w-full" />
                            <div className="flex justify-between items-baseline pt-1">
                              <span className="font-bold text-xs">ยอดชำระรวม</span>
                              <span className="font-black text-lg text-[#E51D53]">฿11,500</span>
                            </div>
                            <p className="text-[10px] font-bold text-red-500">⏱️ ครบกำหนดชำระ: 05 ก.ค. 2569</p>
                          </div>
                          <button 
                            onClick={() => setActiveUrl('/liff/payment/select?propertyId=prop-1')}
                            className="w-full bg-[#E51D53] hover:bg-[#d11a4b] text-white font-bold py-3 text-xs transition-colors border-t border-black/5"
                          >
                            ชำระเงินแยกส่วนหรือรวมทั้งหมด
                          </button>
                        </div>
                      </div>

                      {/* Tenant Message 2: Lease Expiration Alert */}
                      <div className="flex gap-3 max-w-[85%]">
                        <Avatar className="w-10 h-10 border-none shadow-sm shrink-0">
                          <AvatarImage src="https://ui-avatars.com/api/?name=RentFlow&background=00B900&color=fff" />
                          <AvatarFallback>RF</AvatarFallback>
                        </Avatar>
                        <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm overflow-hidden text-slate-800 border border-slate-200">
                          <div className="p-4 space-y-3">
                            <p className="font-bold text-[#F59E0B] flex items-center gap-1.5">⚠️ สัญญาเช่าใกล้หมดอายุ</p>
                            <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                              สัญญาห้องพัก <span className="font-bold">Ideo Mix Sukhumvit 103</span> ของคุณจะหมดอายุในอีก 45 วัน (30 ส.ค. 2569)
                            </p>
                            <p className="text-[10px] text-slate-500">
                              กรุณาแจ้งความจำนงในการต่อสัญญาหรือแจ้งย้ายออก เพื่อความสะดวกในการดำเนินการ
                            </p>
                          </div>
                          <div className="flex border-t border-slate-100">
                            <button 
                              onClick={() => setActiveUrl('/tenant/journey?action=moveout')}
                              className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 text-xs transition-colors border-r border-slate-100"
                            >
                              แจ้งย้ายออก
                            </button>
                            <button 
                              onClick={() => setActiveUrl('/tenant/journey?action=renew')}
                              className="flex-1 bg-[#F59E0B] hover:bg-[#d98204] text-white font-bold py-3 text-xs transition-colors"
                            >
                              ต่อสัญญาเช่า
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {role === 'tenant' && dynamicMessages.filter(m => m.type === 'credit').length > 0 && (
                    <>
                      {dynamicMessages
                        .filter(m => m.type === 'credit')
                        .slice(0, 3)
                        .map((msg) => (
                          <div key={msg.id} className="flex gap-3 max-w-[85%]">
                            <Avatar className="w-10 h-10 border-none shadow-sm shrink-0">
                              <AvatarImage src="https://ui-avatars.com/api/?name=RentFlow&background=00B900&color=fff" />
                              <AvatarFallback>RF</AvatarFallback>
                            </Avatar>
                            <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm overflow-hidden text-slate-800 border border-amber-200">
                              <div className="p-4 space-y-2">
                                <p className="font-bold text-amber-600 flex items-center gap-1.5">🪙 เติมเครดิตสำเร็จ!</p>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">เครดิตที่ได้รับ:</span>
                                    <span className="font-black text-emerald-600">+{msg.amount.toLocaleString()} เครดิต</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">ยอดคงเหลือ:</span>
                                    <span className="font-bold text-slate-900">{msg.balance.toLocaleString()} เครดิต</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">เลขที่รายการ:</span>
                                    <span className="font-bold text-slate-500 text-[10px]">#{msg.transactionId.substring(0, 12)}...</span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleString('th-TH')}</p>
                              </div>
                              <button
                                onClick={() => setActiveUrl('/profile?tab=credits')}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 text-xs transition-colors border-t border-black/5"
                              >
                                ดูยอดเครดิตและประวัติ
                              </button>
                            </div>
                          </div>
                        ))
                      }
                    </>
                  )}

                  {role === 'owner' && (
                    <>
                      {/* Owner Message 1: Slips to verify */}
                      <div className="flex gap-3 max-w-[85%]">
                        <Avatar className="w-10 h-10 border-none shadow-sm shrink-0">
                          <AvatarImage src="https://ui-avatars.com/api/?name=RentFlow&background=00B900&color=fff" />
                          <AvatarFallback>RF</AvatarFallback>
                        </Avatar>
                        <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm overflow-hidden text-slate-800 border border-slate-200">
                          <div className="p-4 space-y-3">
                            <p className="font-bold text-[#1A56DB] flex items-center gap-1.5">🧾 ตรวจสอบยอดชำระเงินเข้า</p>
                            <p className="text-xs text-slate-800 leading-relaxed">
                              ผู้เช่าห้อง <span className="font-bold">A-1204</span> อัปโหลดสลิปยอดชำระ <span className="font-bold text-emerald-600">฿11,500</span> แล้ว เพื่อชำระค่าเช่าประจำเดือนมิถุนายน
                            </p>
                            <p className="text-[10px] text-slate-500">กรุณาตรวจสอบความถูกต้องของยอดโอนและบันทึกข้อมูลเข้าระบบ</p>
                          </div>
                          <button 
                            onClick={() => setActiveUrl('/liff/owner/verify')}
                            className="w-full bg-[#1A56DB] hover:bg-[#1447b8] text-white font-bold py-3 text-xs transition-colors border-t border-black/5"
                          >
                            ตรวจสอบและยืนยันสลิป
                          </button>
                        </div>
                      </div>

                      {/* Owner Message 2: Lease Inbound Alert */}
                      <div className="flex gap-3 max-w-[85%]">
                        <Avatar className="w-10 h-10 border-none shadow-sm shrink-0">
                          <AvatarImage src="https://ui-avatars.com/api/?name=RentFlow&background=00B900&color=fff" />
                          <AvatarFallback>RF</AvatarFallback>
                        </Avatar>
                        <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm overflow-hidden text-slate-800 border border-slate-200">
                          <div className="p-4 space-y-3">
                            <p className="font-bold text-[#10B981] flex items-center gap-1.5">🏠 สถานะการเช่าห้องพัก</p>
                            <p className="text-xs text-slate-800 leading-relaxed">
                              วันนี้มีผู้เช่าย้ายเข้าใหม่ที่ห้องพัก <span className="font-bold">Sathorn Loft</span> ของคุณ สัญญาเช่าลงนามเสร็จสมบูรณ์เรียบร้อยแล้ว
                            </p>
                          </div>
                          <button 
                            onClick={() => setActiveUrl('/liff/owner/dashboard')}
                            className="w-full bg-[#10B981] hover:bg-[#0d9668] text-white font-bold py-3 text-xs transition-colors border-t border-black/5"
                          >
                            เปิดดูเอกสารสัญญาเช่า
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Credit Top-up Messages for Owner */}
                      {dynamicMessages
                        .filter(m => m.type === 'credit')
                        .slice(0, 3)
                        .map((msg) => (
                          <div key={msg.id} className="flex gap-3 max-w-[85%]">
                            <Avatar className="w-10 h-10 border-none shadow-sm shrink-0">
                              <AvatarImage src="https://ui-avatars.com/api/?name=RentFlow&background=00B900&color=fff" />
                              <AvatarFallback>RF</AvatarFallback>
                            </Avatar>
                            <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm overflow-hidden text-slate-800 border border-amber-200">
                              <div className="p-4 space-y-2">
                                <p className="font-bold text-amber-600 flex items-center gap-1.5">🪙 เติมเครดิตสำเร็จ!</p>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">เครดิตที่ได้รับ:</span>
                                    <span className="font-black text-emerald-600">+{msg.amount.toLocaleString()} เครดิต</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">ยอดคงเหลือ:</span>
                                    <span className="font-bold text-slate-900">{msg.balance.toLocaleString()} เครดิต</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">เลขที่รายการ:</span>
                                    <span className="font-bold text-slate-500 text-[10px]">#{msg.transactionId.substring(0, 12)}...</span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleString('th-TH')}</p>
                              </div>
                              <button
                                onClick={() => setActiveUrl('/profile?tab=credits')}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 text-xs transition-colors border-t border-black/5"
                              >
                                ดูยอดเครดิตและประวัติ
                              </button>
                            </div>
                          </div>
                        ))
                      }
                    </>
                  )}

                  {role === 'agent' && (
                    <>
                      {/* Agent Message 1: Daily Portfolio Summary */}
                      <div className="flex gap-3 max-w-[85%]">
                        <Avatar className="w-10 h-10 border-none shadow-sm shrink-0">
                          <AvatarImage src="https://ui-avatars.com/api/?name=RentFlow&background=00B900&color=fff" />
                          <AvatarFallback>RF</AvatarFallback>
                        </Avatar>
                        <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm overflow-hidden text-slate-800 border border-slate-200">
                          <div className="p-4 space-y-3">
                            <p className="font-bold text-[#E51D53] flex items-center gap-1.5">💼 แดชบอร์ดสรุปงานเอเจนต์</p>
                            <p className="text-xs text-slate-600 font-semibold">สรุปรายการรอดำเนินการประจำวันนี้:</p>
                            <div className="space-y-1.5 text-xs">
                              <div className="bg-amber-50 rounded-lg p-2 border border-amber-100 flex justify-between items-center">
                                <span className="text-amber-800">• ดีลใหม่รอดำเนินการ</span>
                                <span className="font-bold text-amber-700">8 รายการ</span>
                              </div>
                              <div className="bg-rose-50 rounded-lg p-2 border border-rose-100 flex justify-between items-center">
                                <span className="text-rose-800">• สลิปรอยืนยันยอด</span>
                                <span className="font-bold text-rose-700">12 รายการ</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActiveUrl('/liff/agent/dashboard')}
                            className="w-full bg-[#E51D53] hover:bg-[#d11a4b] text-white font-bold py-3 text-xs transition-colors border-t border-black/5"
                          >
                            ดูรายงาน & สถิติ
                          </button>
                        </div>
                      </div>

                      {/* Agent Message 2: Mixed Notification (Owner & Tenant signing) */}
                      <div className="flex gap-3 max-w-[85%]">
                        <Avatar className="w-10 h-10 border-none shadow-sm shrink-0">
                          <AvatarImage src="https://ui-avatars.com/api/?name=RentFlow&background=00B900&color=fff" />
                          <AvatarFallback>RF</AvatarFallback>
                        </Avatar>
                        <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm overflow-hidden text-slate-800 border border-slate-200">
                          <div className="p-4 space-y-3">
                            <p className="font-bold text-[#1A56DB] flex items-center gap-1.5">📋 แจ้งดีลลงนามสัญญาเช่า</p>
                            <p className="text-xs text-slate-800 leading-relaxed">
                              ผู้เช่าคุณ <span className="font-bold">Mary</span> ได้ทำการลงนามในสัญญาเช่าสำหรับดีล <span className="font-bold">Chiang Mai Villa</span> เรียบร้อยแล้ว สัญญาพร้อมตรวจสอบความถูกต้อง
                            </p>
                          </div>
                          <button 
                            onClick={() => setActiveUrl('/liff/agent/deals')}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 text-xs transition-colors border-t border-black/5"
                          >
                            ตรวจสอบข้อมูลดีล
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {role === 'agent' && dynamicMessages.filter(m => m.type === 'credit').length > 0 && (
                    <>
                      {dynamicMessages
                        .filter(m => m.type === 'credit')
                        .slice(0, 3)
                        .map((msg) => (
                          <div key={msg.id} className="flex gap-3 max-w-[85%]">
                            <Avatar className="w-10 h-10 border-none shadow-sm shrink-0">
                              <AvatarImage src="https://ui-avatars.com/api/?name=RentFlow&background=00B900&color=fff" />
                              <AvatarFallback>RF</AvatarFallback>
                            </Avatar>
                            <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm overflow-hidden text-slate-800 border border-amber-200">
                              <div className="p-4 space-y-2">
                                <p className="font-bold text-amber-600 flex items-center gap-1.5">🪙 เติมเครดิตสำเร็จ!</p>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">เครดิตที่ได้รับ:</span>
                                    <span className="font-black text-emerald-600">+{msg.amount.toLocaleString()} เครดิต</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">ยอดคงเหลือ:</span>
                                    <span className="font-bold text-slate-900">{msg.balance.toLocaleString()} เครดิต</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">เลขที่รายการ:</span>
                                    <span className="font-bold text-slate-500 text-[10px]">#{msg.transactionId.substring(0, 12)}...</span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleString('th-TH')}</p>
                              </div>
                              <button
                                onClick={() => setActiveUrl('/profile?tab=credits')}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 text-xs transition-colors border-t border-black/5"
                              >
                                ดูยอดเครดิตและประวัติ
                              </button>
                            </div>
                          </div>
                        ))
                      }
                    </>
                  )}

                </div>

              </div>

              {/* Rich Menu Area */}
              <div className="bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] shrink-0 overflow-hidden">
                <div className="h-1 bg-slate-200 w-12 mx-auto my-3 rounded-full" /> {/* Drag Handle Mock */}
                
                <div className="grid grid-cols-3 gap-[1px] bg-slate-100 p-[1px]">
                  {UNIFIED_MENU.map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => handleMenuClick(btn.id, btn.url)}
                      className="bg-white aspect-[4/3] flex flex-col items-center justify-center p-2 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="text-[#00B900] group-hover:scale-110 transition-transform">
                        {btn.icon}
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 mt-1">{btn.label}</span>
                    </button>
                  ))}
                </div>
                
                {/* LINE input bar mock */}
                <div className="bg-white p-3 flex items-center justify-between border-t border-slate-100">
                  <div className="bg-slate-100 text-slate-400 text-sm px-4 py-2 rounded-full flex-1 mr-3 flex items-center">
                    พิมพ์ข้อความ...
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#00B900] flex items-center justify-center text-white shrink-0">
                    <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
