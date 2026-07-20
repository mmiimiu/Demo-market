'use client';

/**
 * @fileOverview Admin Escrow Management Panel
 *
 * Route: /admin/escrow
 * จัดการ Escrow ที่ถูกหักจากการชำระค่าเช่า เพื่อแบ่งจ่ายให้เอเจนต์และแพลตฟอร์ม
 */

import { useState } from 'react';
import { 
  Wallet, CheckCheck, Clock, ArrowUpRight, ChevronDown, ChevronUp,
  Building2, Users, Percent, Filter, Info, X
} from 'lucide-react';

type EscrowStatus = 'held' | 'disbursed' | 'reviewing';

type EscrowRecord = {
  id: string;
  propertyName: string;
  tenantName: string;
  agentName: string;
  totalRent: number;
  ownerPaid: number;
  escrowAmount: number;
  agentCommission: number;
  platformFee: number;
  date: string;
  status: EscrowStatus;
};

const MOCK_ESCROW: EscrowRecord[] = [
  {
    id: 'e1', propertyName: 'Ideo Mix Sukhumvit 103', tenantName: 'ณัฐพล ใจสู้',
    agentName: 'สมพร เอเจนต์', totalRent: 11500,
    ownerPaid: 9775, escrowAmount: 1725,
    agentCommission: 1150, platformFee: 575,
    date: '29 มิ.ย. 2569', status: 'held'
  },
  {
    id: 'e2', propertyName: 'Chiang Mai Villa', tenantName: 'Mary K.',
    agentName: 'สมพร เอเจนต์', totalRent: 9200,
    ownerPaid: 7820, escrowAmount: 1380,
    agentCommission: 920, platformFee: 460,
    date: '27 มิ.ย. 2569', status: 'held'
  },
  {
    id: 'e3', propertyName: 'Sathorn Loft A1', tenantName: 'James L.',
    agentName: 'วิชัย นายหน้า', totalRent: 6500,
    ownerPaid: 5525, escrowAmount: 975,
    agentCommission: 650, platformFee: 325,
    date: '15 มิ.ย. 2569', status: 'reviewing'
  },
  {
    id: 'e4', propertyName: 'On Nut Condo B2', tenantName: 'สุภาพร ทองดี',
    agentName: 'สมพร เอเจนต์', totalRent: 8000,
    ownerPaid: 6800, escrowAmount: 1200,
    agentCommission: 800, platformFee: 400,
    date: '5 มิ.ย. 2569', status: 'disbursed'
  },
  {
    id: 'e5', propertyName: 'Silom Suite D3', tenantName: 'Akira T.',
    agentName: 'วิชัย นายหน้า', totalRent: 7200,
    ownerPaid: 6120, escrowAmount: 1080,
    agentCommission: 720, platformFee: 360,
    date: '3 มิ.ย. 2569', status: 'disbursed'
  },
];

const statusConfig: Record<EscrowStatus, { label: string; color: string; badge: string; dot: string }> = {
  held:       { label: 'ค้างในระบบ',        color: 'text-amber-700',  badge: 'bg-amber-50 border-amber-200 text-amber-700',    dot: 'bg-amber-400' },
  reviewing:  { label: 'ระหว่างตรวจสอบ', color: 'text-blue-700',   badge: 'bg-blue-50 border-blue-200 text-blue-700',       dot: 'bg-blue-400' },
  disbursed:  { label: 'จ่ายแล้ว',          color: 'text-emerald-700',badge: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-400' },
};

export default function AdminEscrowPage() {
  const [records, setRecords] = useState<EscrowRecord[]>(MOCK_ESCROW);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<EscrowStatus | 'all'>('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = filterStatus === 'all' ? records : records.filter(r => r.status === filterStatus);

  const totalHeld      = records.filter(r => r.status === 'held' || r.status === 'reviewing').reduce((s, r) => s + r.escrowAmount, 0);
  const totalDisbursed = records.filter(r => r.status === 'disbursed').reduce((s, r) => s + r.escrowAmount, 0);
  const totalAgent     = records.reduce((s, r) => s + r.agentCommission, 0);
  const totalPlatform  = records.reduce((s, r) => s + r.platformFee, 0);

  const handleDisburse = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'disbursed' } : r));
    setConfirmId(null);
    setExpandedId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">💰 Escrow Management</h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">จัดการเงินค้างในระบบ — สั่งจ่ายคอมมิชชั่น & ค่าบริการ</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" /> รอจ่าย (Escrow)
            </p>
            <p className="text-2xl font-black text-amber-600">฿{totalHeld.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCheck className="w-3.5 h-3.5" /> จ่ายแล้วรวม
            </p>
            <p className="text-2xl font-black text-emerald-600">฿{totalDisbursed.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> ค่าคอมมิชชั่นรวม
            </p>
            <p className="text-2xl font-black text-blue-600">฿{totalAgent.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5" /> ค่าบริการแพลตฟอร์ม
            </p>
            <p className="text-2xl font-black text-purple-600">฿{totalPlatform.toLocaleString()}</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <span className="font-black">โครงสร้างการแบ่งเงิน:</span> จากค่าเช่าทั้งหมด → 
            <span className="font-bold"> 85% เจ้าของ</span> (โอนทันทีหลังยืนยันสลิป) + 
            <span className="font-bold"> 10% คอมมิชชั่นเอเจนต์</span> + 
            <span className="font-bold"> 5% ค่าบริการแพลตฟอร์ม</span> (รอ Admin สั่งจ่าย)
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'held', 'reviewing', 'disbursed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                filterStatus === s 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {s === 'all' ? 'ทั้งหมด' : statusConfig[s].label}
              <span className="ml-1.5 text-[10px] opacity-70">
                ({s === 'all' ? records.length : records.filter(r => r.status === s).length})
              </span>
            </button>
          ))}
        </div>

        {/* Escrow Records */}
        <div className="space-y-3">
          {filtered.map(record => {
            const cfg = statusConfig[record.status];
            const isExpanded = expandedId === record.id;

            return (
              <div key={record.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Record Header */}
                <div 
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`flex items-center gap-1.5 text-[10px] font-black border rounded-full px-2.5 py-0.5 ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm truncate">{record.propertyName}</p>
                    <p className="text-xs text-slate-500">{record.tenantName} · {record.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400 font-bold">Escrow</p>
                    <p className="font-black text-slate-900">฿{record.escrowAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
                    
                    {/* Full Breakdown */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs">
                      <p className="font-black text-slate-500 uppercase tracking-wider text-[10px]">สรุปการแบ่งเงิน</p>
                      <div className="flex justify-between text-slate-700">
                        <span>ค่าเช่ารวม</span>
                        <span className="font-black text-slate-900">฿{record.totalRent.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-slate-100" />
                      <div className="flex justify-between text-emerald-600">
                        <span className="font-bold">→ เจ้าของได้รับ (85%)</span>
                        <span className="font-black">฿{record.ownerPaid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-blue-600">
                        <span className="font-bold">→ คอมมิชชั่นเอเจนต์ (10%)</span>
                        <span className="font-black">฿{record.agentCommission.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-purple-600">
                        <span className="font-bold">→ ค่าบริการแพลตฟอร์ม (5%)</span>
                        <span className="font-black">฿{record.platformFee.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Agent Info */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <p className="font-black text-slate-500 uppercase tracking-wider text-[10px] mb-2">เอเจนต์ผู้รับคอมมิชชั่น</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-black">
                          {record.agentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{record.agentName}</p>
                          <p className="text-[10px] text-slate-400">Agent · รับ ฿{record.agentCommission.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Disburse Action */}
                    {record.status !== 'disbursed' && (
                      <div>
                        {confirmId === record.id ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                            <p className="text-sm font-bold text-amber-800">
                              ยืนยันการจ่ายคอมมิชชั่น ฿{record.agentCommission.toLocaleString()} ให้ {record.agentName}?
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setConfirmId(null)}
                                className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                              >
                                ยกเลิก
                              </button>
                              <button
                                onClick={() => handleDisburse(record.id)}
                                className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                              >
                                ✓ ยืนยันการจ่าย
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(record.id)}
                            className="w-full py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                            สั่งจ่ายคอมมิชชั่น ฿{record.agentCommission.toLocaleString()}
                          </button>
                        )}
                      </div>
                    )}

                    {record.status === 'disbursed' && (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                        <p className="text-xs font-bold text-emerald-700">จ่ายคอมมิชชั่นให้เอเจนต์เรียบร้อยแล้ว</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
