'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus, FileText, Trash2, Edit3, Send, Clock, CheckCircle2,
  Building2, User, Users, CalendarDays, BadgeCheck, AlertCircle,
  Copy, MoreVertical, Eye, ChevronRight, Search, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ContractDraftForm } from './ContractDraftForm';
import { ContractDraftPreview } from './ContractDraftPreview';
import type { Language } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ContractDraft {
  id: string;
  draftName: string;
  propertyName: string;
  propertyAddress: string;
  landlordName: string;
  landlordId: string;
  tenantName: string;
  tenantId: string;
  agentName?: string;
  monthlyRent: number;
  depositAmount: number;
  advanceRentAmount: number;
  startDate: string;
  endDate: string;
  contractType: 'monthly' | 'annual' | 'short_term';
  specialTerms: string;
  includeInventory: boolean;
  inventoryItems: { item: string; value: string }[];
  status: 'draft' | 'sent' | 'signed';
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
}

interface ContractDraftManagerProps {
  lang: Language;
  currentRole: 'owner' | 'agent' | 'landlord';
}

const CONTRACT_TYPE_LABELS: Record<string, { th: string; en: string; color: string }> = {
  monthly:    { th: 'รายเดือน',  en: 'Monthly',    color: 'bg-blue-100 text-blue-700 border-blue-200' },
  annual:     { th: 'รายปี',     en: 'Annual',      color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  short_term: { th: 'ระยะสั้น', en: 'Short-Term',  color: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const STATUS_CONFIG: Record<string, { label: string; labelTh: string; icon: React.ReactNode; color: string }> = {
  draft:  { label: 'Draft',  labelTh: 'ร่าง',        icon: <Clock className="w-3 h-3" />,         color: 'bg-gray-100 text-gray-600 border-gray-200' },
  sent:   { label: 'Sent',   labelTh: 'ส่งแล้ว',      icon: <Send className="w-3 h-3" />,          color: 'bg-blue-100 text-blue-600 border-blue-200' },
  signed: { label: 'Signed', labelTh: 'ลงนามแล้ว',   icon: <CheckCircle2 className="w-3 h-3" />,  color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_DRAFTS: ContractDraft[] = [
  {
    id: 'draft_001',
    draftName: 'ร่างสัญญา - ห้อง 1204 สุขุมวิท (นายณัฐพล)',
    propertyName: 'คอนโดสุขุมวิท 101 ชั้น 12 ห้อง 1204',
    propertyAddress: '101 ถ.สุขุมวิท แขวงบางนา เขตบางนา กรุงเทพฯ 10260',
    landlordName: 'นาย สมชาย ใจดี',
    landlordId: 'owner_somchai',
    tenantName: 'นาย ณัฐพล ใจสู้',
    tenantId: 'tenant_nattapon',
    agentName: 'PrimeRent Agent',
    monthlyRent: 18000,
    depositAmount: 36000,
    advanceRentAmount: 18000,
    startDate: '2026-08-01',
    endDate: '2027-07-31',
    contractType: 'monthly',
    specialTerms: 'ห้ามเลี้ยงสัตว์ ห้ามสูบบุหรี่ในห้อง',
    includeInventory: true,
    inventoryItems: [
      { item: 'เครื่องปรับอากาศ', value: '15000' },
      { item: 'โทรทัศน์', value: '10000' },
      { item: 'ตู้เย็น', value: '8000' },
      { item: 'เครื่องซักผ้า', value: '12000' },
    ],
    status: 'draft',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'draft_002',
    draftName: 'ร่างสัญญา - ทาวน์เฮาส์พระราม 9 (นางสาวมาลี)',
    propertyName: 'ทาวน์เฮาส์ พระราม 9 ซอย 10',
    propertyAddress: '55/2 ถ.พระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
    landlordName: 'นาย สมชาย ใจดี',
    landlordId: 'owner_somchai',
    tenantName: 'นางสาว มาลี สวัสดี',
    tenantId: 'tenant_malee',
    monthlyRent: 22000,
    depositAmount: 44000,
    advanceRentAmount: 22000,
    startDate: '2026-09-01',
    endDate: '2027-08-31',
    contractType: 'annual',
    specialTerms: 'ผู้เช่ารับผิดชอบค่าน้ำ ค่าไฟ ค่าอินเทอร์เน็ต',
    includeInventory: false,
    inventoryItems: [],
    status: 'sent',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'draft_003',
    draftName: 'ร่างสัญญา - อพาร์ทเม้นท์อ่อนนุช (นายวิชัย)',
    propertyName: 'อพาร์ทเม้นท์ อ่อนนุช ชั้น 3 ห้อง 301',
    propertyAddress: '88 ถ.อ่อนนุช แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ 10250',
    landlordName: 'นางสาว พิมพ์ใจ รักดี',
    landlordId: 'owner_pimjai',
    tenantName: 'นาย วิชัย มั่นคง',
    tenantId: 'tenant_wichai',
    agentName: 'PrimeRent Agent',
    monthlyRent: 9500,
    depositAmount: 19000,
    advanceRentAmount: 9500,
    startDate: '2026-07-15',
    endDate: '2026-10-14',
    contractType: 'short_term',
    specialTerms: '',
    includeInventory: true,
    inventoryItems: [
      { item: 'เครื่องปรับอากาศ', value: '15000' },
      { item: 'โทรทัศน์', value: '8000' },
    ],
    status: 'signed',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function loadDrafts(): ContractDraft[] {
  if (typeof window === 'undefined') return MOCK_DRAFTS;
  try {
    const stored = localStorage.getItem('primerent_contract_drafts');
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem('primerent_contract_drafts', JSON.stringify(MOCK_DRAFTS));
  return MOCK_DRAFTS;
}

function saveDrafts(drafts: ContractDraft[]) {
  localStorage.setItem('primerent_contract_drafts', JSON.stringify(drafts));
}

function formatDate(iso: string, lang: Language) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ContractDraftManager({ lang, currentRole }: ContractDraftManagerProps) {
  const [drafts, setDrafts] = useState<ContractDraft[]>([]);
  const [view, setView] = useState<'list' | 'form' | 'preview'>('list');
  const [selectedDraft, setSelectedDraft] = useState<ContractDraft | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'sent' | 'signed'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const isTh = lang === 'th';

  useEffect(() => { setDrafts(loadDrafts()); }, []);

  const filteredDrafts = drafts.filter(d => {
    const matchSearch = d.draftName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tenantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleCreateNew = () => {
    setSelectedDraft(null);
    setView('form');
  };

  const handleEdit = (draft: ContractDraft) => {
    setSelectedDraft(draft);
    setView('form');
    setOpenMenuId(null);
  };

  const handlePreview = (draft: ContractDraft) => {
    setSelectedDraft(draft);
    setView('preview');
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    const updated = drafts.filter(d => d.id !== id);
    setDrafts(updated);
    saveDrafts(updated);
    setOpenMenuId(null);
    toast({ title: isTh ? '🗑️ ลบร่างสัญญาแล้ว' : 'Draft deleted', description: '' });
  };

  const handleDuplicate = (draft: ContractDraft) => {
    const copy: ContractDraft = {
      ...draft,
      id: `draft_${Date.now()}`,
      draftName: `${draft.draftName} (สำเนา)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [copy, ...drafts];
    setDrafts(updated);
    saveDrafts(updated);
    setOpenMenuId(null);
    toast({ title: isTh ? '📋 คัดลอกร่างสัญญาแล้ว' : 'Draft duplicated' });
  };

  const handleSend = (draft: ContractDraft) => {
    const updated = drafts.map(d =>
      d.id === draft.id ? { ...d, status: 'sent' as const, sentAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : d
    );
    setDrafts(updated);
    saveDrafts(updated);
    setOpenMenuId(null);
    toast({
      title: isTh ? '📨 ส่งสัญญาแล้ว' : 'Contract Sent',
      description: isTh ? `ส่งให้ ${draft.tenantName} และ ${draft.landlordName} เพื่อลงนามแล้ว` : `Sent to ${draft.tenantName} for signing`,
    });
  };

  const handleSaveDraft = (draft: ContractDraft) => {
    let updated: ContractDraft[];
    const exists = drafts.find(d => d.id === draft.id);
    if (exists) {
      updated = drafts.map(d => d.id === draft.id ? { ...draft, updatedAt: new Date().toISOString() } : d);
    } else {
      updated = [{ ...draft, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...drafts];
    }
    setDrafts(updated);
    saveDrafts(updated);
    setView('list');
    toast({ title: isTh ? '💾 บันทึกร่างสัญญาแล้ว' : 'Draft Saved', description: draft.draftName });
  };

  // ── Status Counts ──────────────────────────────────────────────────────────
  const counts = { all: drafts.length, draft: 0, sent: 0, signed: 0 };
  drafts.forEach(d => { counts[d.status]++; });

  // ── Render ─────────────────────────────────────────────────────────────────
  if (view === 'form') {
    return (
      <ContractDraftForm
        lang={lang}
        currentRole={currentRole}
        initialDraft={selectedDraft}
        onSave={handleSaveDraft}
        onCancel={() => setView('list')}
      />
    );
  }

  if (view === 'preview' && selectedDraft) {
    return (
      <ContractDraftPreview
        lang={lang}
        draft={selectedDraft}
        onBack={() => setView('list')}
        onEdit={() => { setView('form'); }}
        onSend={() => { handleSend(selectedDraft); setView('list'); }}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-violet-600" />
            </div>
            {isTh ? 'ร่างสัญญาเช่า' : 'Contract Drafts'}
          </h3>
          <p className="text-xs text-gray-500 mt-1 font-semibold">
            {isTh
              ? 'สร้างและจัดการร่างสัญญาก่อนส่งให้คู่สัญญาลงนาม'
              : 'Create and manage contract drafts before sending for signatures'}
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="bg-violet-600 hover:bg-violet-700 text-white font-black text-xs gap-2 rounded-xl shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          {isTh ? 'สร้างร่างสัญญาใหม่' : 'New Draft'}
        </Button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-4 gap-3">
        {(['all', 'draft', 'sent', 'signed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-xl p-3 border text-center transition-all ${
              filterStatus === s
                ? 'bg-violet-50 border-violet-200 shadow-sm'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <p className={`text-xl font-black ${filterStatus === s ? 'text-violet-700' : 'text-gray-800'}`}>
              {counts[s]}
            </p>
            <p className="text-[10px] font-bold text-gray-500 mt-0.5">
              {s === 'all' ? (isTh ? 'ทั้งหมด' : 'All')
                : s === 'draft' ? (isTh ? 'ร่าง' : 'Draft')
                : s === 'sent' ? (isTh ? 'ส่งแล้ว' : 'Sent')
                : (isTh ? 'ลงนามแล้ว' : 'Signed')}
            </p>
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={isTh ? 'ค้นหาร่างสัญญา ทรัพย์ ผู้เช่า...' : 'Search drafts, property, tenant...'}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 bg-white"
        />
      </div>

      {/* ── Draft List ── */}
      {filteredDrafts.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-black text-gray-400 text-sm">
            {searchQuery ? (isTh ? 'ไม่พบร่างสัญญาที่ค้นหา' : 'No drafts found') : (isTh ? 'ยังไม่มีร่างสัญญา' : 'No contract drafts yet')}
          </p>
          {!searchQuery && (
            <Button onClick={handleCreateNew} variant="outline" className="text-xs font-black gap-1.5 rounded-xl border-dashed">
              <Plus className="w-3.5 h-3.5" />
              {isTh ? 'สร้างร่างสัญญาแรก' : 'Create your first draft'}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDrafts.map(draft => {
            const statusCfg = STATUS_CONFIG[draft.status];
            const typeCfg = CONTRACT_TYPE_LABELS[draft.contractType];

            return (
              <div
                key={draft.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-violet-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                          {statusCfg.icon}
                          {isTh ? statusCfg.labelTh : statusCfg.label}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${typeCfg.color}`}>
                          {isTh ? typeCfg.th : typeCfg.en}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-gray-900 truncate leading-tight">{draft.draftName}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold">
                          <Building2 className="w-3 h-3" />
                          {draft.propertyName}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold">
                          <User className="w-3 h-3" />
                          {draft.tenantName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-black text-violet-700">
                          ฿{draft.monthlyRent.toLocaleString()}<span className="text-gray-400 font-semibold">/เดือน</span>
                        </span>
                        <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {formatDate(draft.startDate, lang)} – {formatDate(draft.endDate, lang)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {draft.status === 'draft' && (
                      <Button
                        onClick={() => handleSend(draft)}
                        size="sm"
                        className="bg-violet-600 hover:bg-violet-700 text-white font-black text-[10px] h-7 px-3 gap-1 rounded-lg hidden sm:flex"
                      >
                        <Send className="w-3 h-3" />
                        {isTh ? 'ส่งลงนาม' : 'Send'}
                      </Button>
                    )}
                    <button
                      onClick={() => handlePreview(draft)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                      title={isTh ? 'ดูตัวอย่าง' : 'Preview'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {draft.status !== 'signed' && (
                      <button
                        onClick={() => handleEdit(draft)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        title={isTh ? 'แก้ไข' : 'Edit'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {/* Overflow menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === draft.id ? null : draft.id)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                      {openMenuId === draft.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1">
                            <button
                              onClick={() => handleDuplicate(draft)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {isTh ? 'คัดลอกร่างสัญญา' : 'Duplicate Draft'}
                            </button>
                            {draft.status === 'draft' && (
                              <button
                                onClick={() => handleSend(draft)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-50 sm:hidden"
                              >
                                <Send className="w-3.5 h-3.5" />
                                {isTh ? 'ส่งให้ลงนาม' : 'Send for Signing'}
                              </button>
                            )}
                            {draft.status !== 'signed' && (
                              <button
                                onClick={() => handleDelete(draft.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                {isTh ? 'ลบร่างสัญญา' : 'Delete Draft'}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer meta */}
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {isTh ? 'แก้ไขล่าสุด' : 'Updated'}: {formatDate(draft.updatedAt, lang)}
                  </span>
                  {draft.status === 'sent' && draft.sentAt && (
                    <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      {isTh ? 'ส่งเมื่อ' : 'Sent'} {formatDate(draft.sentAt, lang)}
                    </span>
                  )}
                  {draft.status === 'signed' && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {isTh ? 'ลงนามครบแล้ว' : 'All Signed'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Info Banner ── */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black text-amber-800">
            {isTh ? 'เกี่ยวกับร่างสัญญา' : 'About Contract Drafts'}
          </p>
          <p className="text-[11px] text-amber-700 font-semibold mt-0.5 leading-relaxed">
            {isTh
              ? 'ร่างสัญญาใช้สำหรับเตรียมเอกสารก่อนส่งให้คู่สัญญาลงนาม เมื่อส่งแล้วทุกฝ่ายจะได้รับการแจ้งเตือนผ่าน LINE เพื่อลงนามดิจิทัล'
              : 'Contract drafts are used to prepare documents before sending to parties for signature. Once sent, all parties will receive LINE notifications to digitally sign.'}
          </p>
        </div>
      </div>
    </div>
  );
}
