'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  HeadsetIcon, CheckCircle2, Clock, AlertCircle,
  ChevronLeft, Send, X, Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: string;
}

interface SupportTicket {
  id: string;
  userEmail?: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  messages: ChatMessage[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'support-001', userEmail: 'somchai@email.com', subject: 'ไม่สามารถชำระเงินได้',
    status: 'open', priority: 'high', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    messages: [
      { id: 'm1', sender: 'user', text: 'สวัสดีครับ กดชำระเงินค่าเช่าแล้วแต่ระบบขึ้น error ทุกครั้งครับ ลองมาหลายวันแล้ว', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
    ]
  },
  {
    id: 'support-002', userEmail: 'malee@email.com', subject: 'ไม่ได้รับอีเมลยืนยันการสมัคร',
    status: 'in_progress', priority: 'medium', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    messages: [
      { id: 'm2', sender: 'user', text: 'สมัครสมาชิกไปแล้ว 3 วัน ยังไม่ได้รับอีเมลยืนยันเลยค่ะ', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 'm3', sender: 'admin', text: 'ทีมงานกำลังตรวจสอบครับ อาจมีปัญหาด้าน spam filter กรุณาเช็กโฟลเดอร์ Junk/Spam ด้วยนะครับ', timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
      { id: 'm4', sender: 'user', text: 'เช็กแล้วค่ะ ไม่มีเลยทั้ง inbox และ spam', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
    ]
  },
  {
    id: 'support-003', userEmail: 'wichai@email.com', subject: 'ต้องการยกเลิกสัญญาเช่า',
    status: 'resolved', priority: 'low', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    messages: [
      { id: 'm5', sender: 'user', text: 'อยากยกเลิกสัญญาเช่าก่อนกำหนดครับ ต้องทำยังไง', timestamp: new Date(Date.now() - 86400000 * 10).toISOString() },
      { id: 'm6', sender: 'admin', text: 'กรุณาติดต่อเจ้าของห้องโดยตรงผ่านระบบแชทครับ หากมีข้อพิพาทสามารถแจ้งเพิ่มเติมมาได้เลยครับ', timestamp: new Date(Date.now() - 86400000 * 9).toISOString() },
    ]
  },
];

// ─── Status Config ────────────────────────────────────────────────────────────

const statusConfig = {
  open:        { label: 'รอดำเนินการ',     color: 'bg-blue-100 text-blue-700',   dotColor: 'bg-blue-400',   Icon: AlertCircle },
  in_progress: { label: 'กำลังดำเนินการ', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-400',  Icon: Clock },
  resolved:    { label: 'แก้ไขแล้ว',       color: 'bg-green-100 text-green-700', dotColor: 'bg-green-400',  Icon: CheckCircle2 },
  closed:      { label: 'ปิดแล้ว',         color: 'bg-gray-100 text-gray-400',   dotColor: 'bg-gray-300',   Icon: X },
};
const priorityColor = { high: 'text-red-500', medium: 'text-amber-500', low: 'text-gray-400' };

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filterStatus, setFilterStatus] = useState<SupportTicket['status'] | 'all'>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSync = () => {
      const stored = localStorage.getItem('primerent_support_tickets_v2');
      const baseTickets: SupportTicket[] = stored ? JSON.parse(stored) : [];

      // Merge real messages from FloatingChat Admin Support conversation
      const combined: ChatMessage[] = JSON.parse(localStorage.getItem('primerent_admin_support_messages') || '[]');

      // IDs that already exist in MOCK_TICKETS — exclude them from baseTickets to avoid duplicate keys
      const mockIds = new Set(MOCK_TICKETS.map(t => t.id));

      if (combined.length > 0) {
        const hasAdminReply = combined.some(m => m.sender === 'admin');
        const liveTicket: SupportTicket = {
          id: 'live-admin-support',
          userEmail: 'ผู้ใช้งาน (Live Chat)',
          subject: 'บทสนทนาจาก PrimeRent Admin Support Chat',
          status: hasAdminReply ? 'in_progress' : 'open',
          priority: 'high',
          createdAt: combined[0]?.timestamp || new Date().toISOString(),
          messages: combined,
        };
        // filter out mock IDs and live ticket ID to prevent duplicates
        const rest = baseTickets.filter(t => t.id !== 'live-admin-support' && !mockIds.has(t.id));
        setTickets([liveTicket, ...MOCK_TICKETS, ...rest]);
      } else if (baseTickets.length > 0) {
        // filter mock IDs from persisted list to avoid duplicates
        const extra = baseTickets.filter(t => !mockIds.has(t.id));
        setTickets([...MOCK_TICKETS, ...extra]);
      } else {
        setTickets(MOCK_TICKETS);
      }
    };

    handleSync();
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, tickets]);

  const persist = (updated: SupportTicket[]) => {
    setTickets(updated);
    localStorage.setItem('primerent_support_tickets_v2', JSON.stringify(updated));
  };

  const activeTicket = tickets.find(t => t.id === activeId);

  const handleSend = () => {
    if (!inputText.trim() || !activeId) return;
    const newMsg: ChatMessage = { id: `msg_${Date.now()}`, sender: 'admin', text: inputText.trim(), timestamp: new Date().toISOString() };
    const updated = tickets.map(t => t.id === activeId
      ? { ...t, messages: [...t.messages, newMsg], status: 'in_progress' as const }
      : t
    );
    persist(updated);
    // If replying to the live admin support chat, also save reply to shared localStorage
    if (activeId === 'live-admin-support') {
      const stored = localStorage.getItem('primerent_admin_support_messages');
      const msgs = stored ? JSON.parse(stored) : [];
      msgs.push(newMsg);
      localStorage.setItem('primerent_admin_support_messages', JSON.stringify(msgs));
      window.dispatchEvent(new Event('storage'));
    }
    setInputText('');
  };

  const updateStatus = (id: string, status: SupportTicket['status']) => {
    persist(tickets.map(t => t.id === id ? { ...t, status } : t));
  };

  const filtered = filterStatus === 'all' ? tickets : tickets.filter(t => t.status === filterStatus);
  const openCount = tickets.filter(t => t.status === 'open').length;

  return (
    <div className="flex h-full">

      {/* ── Left Panel: Ticket List ────────────────────────────────────── */}
      <div className={cn("flex flex-col border-r border-gray-100 bg-white shrink-0 w-full md:w-[340px]", activeId && "hidden md:flex")}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <HeadsetIcon className="w-5 h-5 text-blue-600" />
            <h1 className="text-base font-black text-gray-900">Help Desk</h1>
            {openCount > 0 && <span className="ml-auto text-[10px] font-black bg-red-500 text-white rounded-full px-2 py-0.5">{openCount} ใหม่</span>}
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
            {(['all', 'open', 'in_progress', 'resolved'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={cn('flex-1 text-[10px] font-black rounded-lg py-1.5 transition-all',
                  filterStatus === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600')}>
                {s === 'all' ? 'ทั้งหมด' : statusConfig[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <Inbox className="w-10 h-10 mb-2" />
              <p className="text-xs font-bold">ไม่มีรายการ</p>
            </div>
          )}
          {filtered.map(ticket => {
            const sc = statusConfig[ticket.status];
            const lastMsg = ticket.messages[ticket.messages.length - 1];
            return (
              <button key={ticket.id} onClick={() => setActiveId(ticket.id)}
                className={cn('w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors',
                  activeId === ticket.id && 'bg-blue-50')}>
                <div className="flex items-start gap-3">
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', sc.dotColor)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">{ticket.subject}</p>
                    <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{lastMsg?.text}</p>
                    <p className="text-[10px] text-gray-300 font-bold mt-1">{ticket.userEmail} · {format(new Date(ticket.createdAt), 'dd MMM HH:mm')}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right Panel: Chat Thread ───────────────────────────────────── */}
      {activeTicket ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat Header */}
          <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0">
            <button onClick={() => setActiveId(null)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 text-sm truncate">{activeTicket.subject}</p>
              <p className="text-[11px] text-gray-400 font-bold">{activeTicket.userEmail}</p>
            </div>
            {/* Status actions */}
            <div className="flex gap-2 shrink-0">
              {activeTicket.status !== 'resolved' && (
                <button onClick={() => updateStatus(activeTicket.id, 'resolved')}
                  className="text-[10px] font-black text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                  ✓ แก้ไขแล้ว
                </button>
              )}
              {activeTicket.status !== 'closed' && (
                <button onClick={() => updateStatus(activeTicket.id, 'closed')}
                  className="text-[10px] font-black text-gray-400 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                  ปิดเรื่อง
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {activeTicket.messages.map(msg => (
              <div key={msg.id} className={cn('flex', msg.sender === 'admin' ? 'justify-end' : 'justify-start')}>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-black text-gray-600 mr-2 mt-auto shrink-0">
                    {(activeTicket.userEmail || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={cn(
                  'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-medium',
                  msg.sender === 'admin'
                    ? 'bg-blue-600 text-white rounded-br-sm shadow-sm shadow-blue-600/20'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'
                )}>
                  <p>{msg.text}</p>
                  <p className={cn('text-[9px] mt-1 font-bold', msg.sender === 'admin' ? 'text-blue-200' : 'text-gray-300')}>
                    {msg.sender === 'admin' ? 'Admin · ' : ''}{format(new Date(msg.timestamp), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {activeTicket.status !== 'closed' && activeTicket.status !== 'resolved' ? (
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2 shrink-0">
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="พิมพ์ข้อความตอบลูกค้า..."
                rows={1}
                className="flex-1 max-h-28 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
              <Button onClick={handleSend} disabled={!inputText.trim()}
                className="h-11 w-11 p-0 rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0 shadow-md shadow-blue-600/20">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400 font-bold shrink-0">
              {activeTicket.status === 'resolved' ? '✓ ปิดเรื่องแล้ว — ไม่สามารถส่งข้อความเพิ่มเติมได้' : 'เรื่องนี้ถูกปิดแล้ว'}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center text-gray-200">
          <HeadsetIcon className="w-16 h-16 mb-4" />
          <p className="text-lg font-black">เลือก Ticket เพื่อดูบทสนทนา</p>
        </div>
      )}
    </div>
  );
}
