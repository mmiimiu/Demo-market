"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wrench, Zap, Droplets, Wind, HelpCircle, AlertTriangle,
  CheckCircle2, Clock, Plus, ChevronDown, ChevronUp, Image as ImageIcon, Send,
  XCircle, Check, DollarSign, MessageSquare, AlertCircle, Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface ChatMessage {
  sender: 'tenant' | 'owner';
  text: string;
  timestamp: string;
}

interface MaintenanceRequest {
  id: string;
  propertyName: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  completedAt?: string;
  cost?: number;
  messages?: ChatMessage[];
  log: { event: string; timestamp: string; actor: string }[];
}

interface MaintenanceSystemProps {
  lang: 'th' | 'en' | 'cn';
  role?: string; // 'tenant' | 'owner' | 'agent'
}

// ─── Constants & Configuration ────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'electrical', icon: Zap, labelTh: 'ไฟฟ้า', labelEn: 'Electrical', color: 'text-yellow-500 bg-yellow-50 border-yellow-100' },
  { key: 'plumbing', icon: Droplets, labelTh: 'ประปา', labelEn: 'Plumbing', color: 'text-blue-500 bg-blue-50 border-blue-100' },
  { key: 'aircon', icon: Wind, labelTh: 'แอร์', labelEn: 'Air Conditioning', color: 'text-cyan-500 bg-cyan-50 border-cyan-100' },
  { key: 'other', icon: HelpCircle, labelTh: 'อื่นๆ', labelEn: 'Other', color: 'text-gray-400 bg-gray-50 border-gray-100' },
];

const URGENCY_CONFIG = {
  low: { labelTh: 'ปกติ', labelEn: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { labelTh: 'ด่วน', labelEn: 'Medium', color: 'bg-amber-100 text-amber-700' },
  high: { labelTh: 'เร่งด่วนมาก', labelEn: 'Urgent', color: 'bg-red-100 text-red-600' },
};

const STATUS_CONFIG = {
  pending: { labelTh: 'รอดำเนินการ', labelEn: 'Pending', icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  in_progress: { labelTh: 'กำลังดำเนินการ', labelEn: 'In Progress', icon: <Wrench className="w-3.5 h-3.5" />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  completed: { labelTh: 'เสร็จแล้ว', labelEn: 'Completed', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  rejected: { labelTh: 'ปฏิเสธ', labelEn: 'Rejected', icon: <XCircle className="w-3.5 h-3.5" />, color: 'bg-rose-50 text-rose-600 border-rose-100' },
};

const STORAGE_KEY = 'primerent_maintenance';

const MOCK_REQUESTS: MaintenanceRequest[] = [
  {
    id: 'm1',
    propertyName: 'คอนโดสุขุมวิท ห้อง 1204',
    category: 'aircon',
    urgency: 'medium',
    title: 'แอร์ไม่เย็น',
    description: 'แอร์ห้องนอนไม่ทำความเย็น น้ำหยดด้วยค่ะ',
    status: 'in_progress',
    cost: 500,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'ช่างสมชาย',
    messages: [
      { sender: 'tenant', text: 'สวัสดีค่ะ ช่างจะเข้าประมาณกี่โมงคะ?', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { sender: 'owner', text: 'ช่างนัดเวลาประมาณ 10:00 น. วันพรุ่งนี้ค่ะ หากมีการเปลี่ยนแปลงจะแจ้งอีกทีนะคะ', timestamp: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    log: [
      { event: 'ส่งคำขอซ่อม', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), actor: 'ผู้เช่า' },
      { event: 'อนุมัติงานซ่อมและรับผิดชอบค่าใช้จ่าย', timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(), actor: 'เจ้าของ' },
      { event: 'รับเรื่องและมอบหมายช่าง: ช่างสมชาย', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), actor: 'เจ้าของ' },
      { event: 'ระบุประเมินค่าซ่อม: ฿500', timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(), actor: 'เจ้าของ' },
    ],
  },
];

export function MaintenanceSystem({ lang, role = 'tenant' }: MaintenanceSystemProps) {
  const router = useRouter();
  const isTh = lang === 'th';
  const isCn = lang === 'cn';
  const label = (th: string, en: string, cn: string) => isTh ? th : isCn ? cn : en;

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state (Tenant)
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Cost & Status State (Owner)
  const [costInput, setCostInput] = useState<string>('');
  const [techInput, setTechInput] = useState<string>('');

  // Chat message state
  const [chatMessage, setChatMessage] = useState<string>('');

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setRequests(stored.length > 0 ? stored : MOCK_REQUESTS);
    } catch {
      setRequests(MOCK_REQUESTS);
    }
  }, []);

  const save = (items: MaintenanceRequest[]) => {
    setRequests(items);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  };

  // Submit new request (Tenant)
  const handleSubmit = async () => {
    if (!category || !title.trim() || !description.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 700));

    const newReq: MaintenanceRequest = {
      id: `m_${Date.now()}`,
      propertyName: 'คอนโดสุขุมวิท ห้อง 1204',
      category, urgency, title, description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      log: [{ event: label('ส่งคำขอซ่อม', 'Maintenance request submitted', '已提交维修申请'), timestamp: new Date().toISOString(), actor: label('ผู้เช่า', 'Tenant', '租客') }],
    };

    save([newReq, ...requests]);
    setCategory(''); setTitle(''); setDescription(''); setShowForm(false); setSubmitting(false);
    toast({
      title: label('ส่งคำขอซ่อมแล้ว!', 'Request Submitted!', '维修申请已提交！'),
      description: label('เจ้าของจะรับทราบและดำเนินการตอบกลับโดยเร็ว', 'Owner will respond shortly.', '房东将很快回复。'),
    });
  };

  // Send message in Chat
  const handleSendMessage = (reqId: string) => {
    if (!chatMessage.trim()) return;

    const actorLabel = role === 'owner' ? 'เจ้าของ' : 'ผู้เช่า';
    const senderRole: 'owner' | 'tenant' = role === 'owner' ? 'owner' : 'tenant';

    const updated = requests.map(req => {
      if (req.id === reqId) {
        const msgs = req.messages || [];
        const logs = req.log || [];
        return {
          ...req,
          updatedAt: new Date().toISOString(),
          messages: [...msgs, { sender: senderRole, text: chatMessage, timestamp: new Date().toISOString() }],
          log: [...logs, { event: `ส่งข้อความ: "${chatMessage}"`, timestamp: new Date().toISOString(), actor: actorLabel }],
        };
      }
      return req;
    });

    save(updated);
    setChatMessage('');
  };

  // Owner action: Approve request
  const handleApprove = (reqId: string) => {
    const updated = requests.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          status: 'in_progress' as const,
          updatedAt: new Date().toISOString(),
          log: [
            ...req.log,
            { event: 'อนุมัติงานซ่อมและรับผิดชอบค่าใช้จ่าย', timestamp: new Date().toISOString(), actor: 'เจ้าของ' }
          ],
        };
      }
      return req;
    });
    save(updated);
    toast({ title: 'อนุมัติงานซ่อมเรียบร้อยแล้ว', description: 'กำลังจัดหาช่างซ่อมบำรุง' });
  };

  // Owner action: Reject request
  const handleReject = (reqId: string) => {
    const updated = requests.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          status: 'rejected' as const,
          updatedAt: new Date().toISOString(),
          log: [
            ...req.log,
            { event: 'ปฏิเสธงานซ่อม (ไม่ใช่ความรับผิดชอบของโครงการ/เจ้าของ)', timestamp: new Date().toISOString(), actor: 'เจ้าของ' }
          ],
        };
      }
      return req;
    });
    save(updated);
    toast({ title: 'ปฏิเสธงานซ่อมเรียบร้อยแล้ว' });
  };

  // Owner action: Save technical and cost estimation details
  const handleSaveDetails = (reqId: string) => {
    const updated = requests.map(req => {
      if (req.id === reqId) {
        const logs = [...req.log];
        const newCost = costInput ? Number(costInput) : req.cost;
        const newTech = techInput ? techInput : req.assignedTo;

        if (costInput) {
          logs.push({ event: `ระบุประเมินค่าซ่อม: ฿${Number(costInput).toLocaleString()}`, timestamp: new Date().toISOString(), actor: 'เจ้าของ' });
        }
        if (techInput) {
          logs.push({ event: `มอบหมายช่าง: ${techInput}`, timestamp: new Date().toISOString(), actor: 'เจ้าของ' });
        }

        return {
          ...req,
          cost: newCost,
          assignedTo: newTech,
          updatedAt: new Date().toISOString(),
          log: logs,
        };
      }
      return req;
    });
    save(updated);
    setCostInput('');
    setTechInput('');
    toast({ title: 'บันทึกรายละเอียดเพิ่มเติมเรียบร้อยแล้ว' });
  };

  // Owner action: Complete job
  const handleComplete = (reqId: string) => {
    const updated = requests.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          status: 'completed' as const,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          log: [
            ...req.log,
            { event: 'เสร็จสิ้นงานซ่อมบำรุง', timestamp: new Date().toISOString(), actor: 'เจ้าของ' }
          ],
        };
      }
      return req;
    });
    save(updated);
    toast({ title: 'เสร็จสิ้นงานซ่อมบำรุงเรียบร้อยแล้ว!' });
  };


  return (
    <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto font-sans">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Wrench className="w-6 h-6 text-primary" />
            {role === 'owner' ? 'ติดตามการแจ้งซ่อม (เจ้าของ)' : role === 'agent' ? 'ภาพรวมแจ้งซ่อม (เอเจนต์)' : label('แจ้งซ่อมบำรุง', 'Maintenance Requests', '报修申请')}
          </h2>
          <p className="text-sm text-gray-400 font-bold mt-1">
            {role === 'owner' 
              ? 'ติดตามสถานะงานซ่อมบำรุง และชำระค่าซ่อม' 
              : role === 'agent'
              ? 'ดูภาพรวมการซ่อมบำรุงทั้งหมดของโครงการ'
              : label('แจ้งปัญหาห้องพักและประสานงานกับส่วนกลาง', 'Report issues and coordinate.', '向房东报告问题')}
          </p>
        </div>

        {role === 'tenant' && (
          <Button
            onClick={() => setShowForm(v => !v)}
            className="rounded-none bg-[#00B900] hover:bg-[#00a000] font-black text-white gap-2 h-10 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {label('แจ้งซ่อมใหม่', 'New Request', '新建申请')}
          </Button>
        )}
      </div>

      {/* New Request Form (Tenant only) */}
      {role === 'tenant' && showForm && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-none p-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
          <h3 className="font-black text-base text-gray-900">{label('รายละเอียดการซ่อม', 'Maintenance Details', '维修详情')}</h3>

          {/* Category */}
          <div className="space-y-2">
            <Label className="font-black text-xs text-gray-500 uppercase tracking-wider">{label('ประเภท', 'Category', '类型')}</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    type="button"
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 border-2 transition-all rounded-none",
                      category === cat.key ? "border-[#00B900] bg-emerald-50/20" : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", cat.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black text-gray-700">{isTh ? cat.labelTh : cat.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label className="font-black text-xs text-gray-500 uppercase tracking-wider">{label('ความเร่งด่วน', 'Urgency', '紧急程度')}</Label>
            <div className="flex gap-2">
              {(Object.entries(URGENCY_CONFIG) as [typeof urgency, typeof URGENCY_CONFIG[typeof urgency]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setUrgency(key)}
                  type="button"
                  className={cn(
                    "flex-1 py-2 text-xs font-black border-2 transition-all rounded-none",
                    urgency === key ? "border-[#00B900] bg-emerald-50/10 text-emerald-800" : "border-gray-100 hover:border-gray-200",
                    cfg.color
                  )}
                >
                  {isTh ? cfg.labelTh : cfg.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Title + Description */}
          <div className="space-y-2">
            <Label className="font-black text-xs text-gray-500 uppercase tracking-wider">{label('หัวข้อ', 'Title', '标题')}</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={label('เช่น แอร์ไม่เย็น, น้ำรั่ว', 'e.g. AC not cooling, Leaking faucet', '例如：空调不制冷')} className="rounded-none h-11 font-bold focus-visible:ring-[#00B900]" />
          </div>
          <div className="space-y-2">
            <Label className="font-black text-xs text-gray-500 uppercase tracking-wider">{label('รายละเอียด', 'Description', '详细描述')}</Label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={label('อธิบายปัญหาให้ละเอียด...', 'Describe the issue in detail...', '请详细描述问题...')}
              className="w-full border border-gray-200 p-3 text-sm font-bold rounded-none resize-none focus:outline-none focus:border-[#00B900]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-none font-bold border-gray-200 h-11">
              {label('ยกเลิก', 'Cancel', '取消')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!category || !title.trim() || !description.trim() || submitting}
              className="flex-1 rounded-none bg-[#00B900] hover:bg-[#00a000] font-black text-white h-11 gap-2 disabled:opacity-40"
            >
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              {label('ส่งคำขอ', 'Submit', '提交')}
            </Button>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 bg-white">
            <Wrench className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-black text-gray-400">{label('ยังไม่มีคำขอซ่อม', 'No maintenance requests yet', '暂无维修申请')}</p>
          </div>
        ) : requests.map(req => {
          const statusCfg = STATUS_CONFIG[req.status];
          const catCfg = CATEGORIES.find(c => c.key === req.category);
          const urgCfg = URGENCY_CONFIG[req.urgency];
          const isExpanded = expandedId === req.id;
          const CatIcon = catCfg?.icon || Wrench;

          return (
            <div key={req.id} className="bg-white border border-gray-200 rounded-none overflow-hidden shadow-sm">
              <button
                onClick={() => setExpandedId(isExpanded ? null : req.id)}
                className="w-full flex items-start gap-4 p-5 hover:bg-gray-50/50 transition-colors text-left"
              >
                {/* Category Icon */}
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", catCfg?.color || "bg-gray-50 text-gray-400 border border-gray-100")}>
                  <CatIcon className="w-5 h-5" />
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-sm text-gray-900">{req.title}</p>
                      <p className="text-[11px] text-gray-400 font-bold mt-0.5">{req.propertyName}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn("rounded-none text-[10px] font-black border gap-1", statusCfg.color)}>
                        {statusCfg.icon}
                        {isTh ? statusCfg.labelTh : statusCfg.labelEn}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", urgCfg.color)}>
                        {isTh ? urgCfg.labelTh : urgCfg.labelEn}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {format(new Date(req.createdAt), 'dd MMM yyyy')}
                      </span>
                      {req.assignedTo && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <Wrench className="w-3 h-3" /> ช่าง: {req.assignedTo}
                        </span>
                      )}
                    </div>
                    {req.cost && (
                      <span className="text-xs font-black text-slate-800">
                        ฿{req.cost.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
              </button>

              {/* Expanded Area: Management Actions + Chat + Log */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-slate-50/50 p-5 space-y-6">
                  
                  {/* Detailed Description */}
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">{label('รายละเอียด', 'Details', '详情')}</p>
                    <p className="text-sm text-gray-700 font-bold">{req.description}</p>
                  </div>

                  {/* Owner Action Buttons Panel (Payment Only) */}
                  {role === 'owner' && req.status === 'completed' && (req.cost ?? 0) > 0 && (
                    <div className="bg-white border border-emerald-200 p-4 space-y-4 rounded-xl shadow-sm">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <DollarSign className="w-5 h-5 text-emerald-600" />
                           <div>
                             <p className="text-xs font-black text-slate-900">ใบเรียกเก็บเงินค่าซ่อม</p>
                             <p className="text-[10px] font-bold text-slate-500">งานซ่อมเสร็จสิ้นแล้ว</p>
                           </div>
                         </div>
                         <p className="text-lg font-black text-slate-900">฿{req.cost!.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/liff/payment/method?amount=${req.cost}`)}
                        className="w-full py-2.5 text-xs font-black text-white bg-[#00B900] hover:bg-[#00a000] rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" /> ชำระค่าซ่อมบำรุง
                      </button>
                    </div>
                  )}

                  {role === 'owner' && req.status === 'rejected' && (
                    <div className="text-xs font-black text-red-500 bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 shrink-0" /> คำขอซ่อมนี้ถูกปฏิเสธโดยแอดมิน
                    </div>
                  )}

                  {/* Dynamic Chat Messages Box */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-slate-900/5 px-4 py-2 border-b border-gray-150 flex items-center gap-1.5 shrink-0">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">โต้ตอบ & ส่งข้อความเพิ่มเติม</span>
                    </div>

                    {/* Message Bubble Container */}
                    <div className="p-4 space-y-3 max-h-[220px] overflow-y-auto min-h-[60px] bg-slate-50/20">
                      {!req.messages || req.messages.length === 0 ? (
                        <p className="text-[10px] text-gray-400 font-bold text-center py-2">ยังไม่มีประวัติการพิมพ์คุย</p>
                      ) : (
                        req.messages.map((msg, index) => {
                          const isMe = (role === 'owner' && msg.sender === 'owner') || (role === 'tenant' && msg.sender === 'tenant');
                          return (
                            <div key={index} className={cn("flex flex-col max-w-[80%] space-y-0.5", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                              <div className={cn(
                                "px-3.5 py-2 text-xs font-bold shadow-sm",
                                isMe 
                                  ? "bg-[#00B900] text-white rounded-2xl rounded-tr-none" 
                                  : "bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-none"
                              )}>
                                {msg.text}
                              </div>
                              <span className="text-[8px] text-slate-400 font-bold px-1">
                                {format(new Date(msg.timestamp), 'HH:mm น.')}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Chat Input Bar (Only Tenant can reply) */}
                    {role === 'tenant' && (
                      <div className="p-2 border-t border-gray-150 flex gap-2 bg-white">
                        <Input
                          value={chatMessage}
                          onChange={e => setChatMessage(e.target.value)}
                          placeholder="พิมพ์ข้อความคุยรายละเอียด..."
                          className="h-9 text-xs font-bold flex-1 focus-visible:ring-[#00B900]"
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSendMessage(req.id);
                          }}
                        />
                        <button
                          onClick={() => handleSendMessage(req.id)}
                          className="w-9 h-9 rounded-lg bg-[#00B900] hover:bg-[#00a000] text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Activity Log */}
                  <div className="bg-white border border-gray-200 p-4 rounded-xl">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">{label('ประวัติการดำเนินการ', 'Activity Log', '操作记录')}</p>
                    <div className="space-y-0">
                      {req.log.map((log, idx) => (
                        <div key={idx} className="flex gap-3 relative">
                          {idx < req.log.length - 1 && <div className="absolute left-3 top-7 bottom-0 w-px bg-gray-200" />}
                          <div className="w-6 h-6 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center shrink-0 z-10">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          </div>
                          <div className="pb-4">
                            <p className="text-xs font-black text-gray-900">{log.event}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{log.actor} · {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
