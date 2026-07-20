"use client";

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, CheckCircle2, CheckCheck, Clock, XCircle, TrendingUp, Eye,
  Wallet, ArrowUpRight, BarChart2, History, Building2, Users, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

type Bill = {
  id: string;
  label: string;
  subtext: string;
  amount: number;
  isPayable: boolean;
  isSelected: boolean;
  badgeType: 'external' | 'info' | null;
};

type SlipItem = {
  id: string;
  tenantName: string;
  room: string;
  amount: number;
  ownerReceives: number;  // amount after escrow split
  escrowHeld: number;     // held in escrow
  date: string;
  status: 'pending' | 'approved' | 'rejected';
};

type CommissionDeal = {
  id: string;
  propertyName: string;
  tenantName: string;
  monthlyRent: number;
  commissionPct: number;
  commissionAmount: number;
  date: string;
  status: 'pending' | 'reviewing' | 'paid';
};

type PayoutRecord = {
  id: string;
  date: string;
  amount: number;
  deals: number;
  note: string;
};

// ─── Agent Commission Dashboard ───────────────────────────────────────────────
function AgentCommissionView() {
  const router = useRouter();

  const deals: CommissionDeal[] = [
    { id: 'd1', propertyName: 'Ideo Mix Sukhumvit 103', tenantName: 'ณัฐพล ใจสู้', monthlyRent: 11500, commissionPct: 5, commissionAmount: 5750, date: '15 มิ.ย. 2569', status: 'pending' },
    { id: 'd2', propertyName: 'Chiang Mai Villa', tenantName: 'Mary K.', monthlyRent: 9200, commissionPct: 5, commissionAmount: 4600, date: '12 มิ.ย. 2569', status: 'reviewing' },
    { id: 'd3', propertyName: 'Sathorn Loft A1', tenantName: 'James L.', monthlyRent: 6500, commissionPct: 5, commissionAmount: 3250, date: '3 มิ.ย. 2569', status: 'paid' },
    { id: 'd4', propertyName: 'On Nut Condo B2', tenantName: 'สุภาพร ทองดี', monthlyRent: 8000, commissionPct: 5, commissionAmount: 4000, date: '28 พ.ค. 2569', status: 'paid' },
  ];

  const payoutHistory: PayoutRecord[] = [
    { id: 'p1', date: '5 มิ.ย. 2569', amount: 7250, deals: 2, note: 'โอนผ่าน PromptPay' },
    { id: 'p2', date: '5 พ.ค. 2569', amount: 5600, deals: 2, note: 'โอนผ่าน PromptPay' },
  ];

  const pendingAmount = deals.filter(d => d.status === 'pending' || d.status === 'reviewing').reduce((s, d) => s + d.commissionAmount, 0);
  const paidAmount = deals.filter(d => d.status === 'paid').reduce((s, d) => s + d.commissionAmount, 0);
  const totalAmount = deals.reduce((s, d) => s + d.commissionAmount, 0);

  const statusConfig = {
    pending:   { label: 'รอจ่าย',           color: 'text-amber-600 bg-amber-50 border-amber-100', dot: 'bg-amber-400' },
    reviewing: { label: 'ระหว่างตรวจสอบ', color: 'text-blue-600 bg-blue-50 border-blue-100',   dot: 'bg-blue-400' },
    paid:      { label: 'จ่ายแล้ว',          color: 'text-emerald-600 bg-emerald-50 border-emerald-100', dot: 'bg-emerald-400' },
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-semibold text-slate-900">คอมมิชชั่นของฉัน</span>
        <div className="w-9" />
      </header>

      <main className="flex-1 p-4 space-y-4 pb-10">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg shadow-amber-200">
            <div className="flex items-center gap-1.5 mb-2">
              <Wallet className="w-4 h-4 opacity-80" />
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider">รอรับ</p>
            </div>
            <p className="text-2xl font-black">฿{pendingAmount.toLocaleString()}</p>
            <p className="text-[10px] opacity-70 mt-1">ค้างอยู่ใน Escrow</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-4 text-white shadow-lg shadow-emerald-200">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCheck className="w-4 h-4 opacity-80" />
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider">รับแล้ว</p>
            </div>
            <p className="text-2xl font-black">฿{paidAmount.toLocaleString()}</p>
            <p className="text-[10px] opacity-70 mt-1">ทั้งหมด {deals.filter(d=>d.status==='paid').length} ดีล</p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-400" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">ภาพรวมคอมมิชชั่น</p>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">รายได้รวมทั้งหมด</span>
            <span className="font-black text-slate-900">฿{totalAmount.toLocaleString()}</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-400 rounded-l-full transition-all" style={{ width: `${(paidAmount / totalAmount) * 100}%` }} />
            <div className="h-full bg-amber-400 transition-all" style={{ width: `${(pendingAmount / totalAmount) * 100}%` }} />
          </div>
          <div className="flex gap-4 text-[10px] font-bold">
            <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 bg-emerald-400 rounded-full" />จ่ายแล้ว</span>
            <span className="flex items-center gap-1 text-amber-600"><span className="w-2 h-2 bg-amber-400 rounded-full" />รอจ่าย</span>
          </div>
        </div>

        {/* Deals List */}
        <div className="space-y-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider px-1 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" /> รายการดีลทั้งหมด
          </p>
          {deals.map(deal => {
            const cfg = statusConfig[deal.status];
            return (
              <div key={deal.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{deal.propertyName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3 h-3 text-slate-400" />
                      <p className="text-xs text-slate-500">{deal.tenantName}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{deal.date} · ค่าเช่า ฿{deal.monthlyRent.toLocaleString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-base text-slate-900">+฿{deal.commissionAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">{deal.commissionPct}% คอมมิชชั่น</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`flex items-center gap-1.5 text-[10px] font-black border rounded-full px-2.5 py-1 ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  {deal.status === 'pending' && (
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Info className="w-3 h-3" /> Admin จะโอนให้เองแบบ manual
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payout History */}
        <div className="space-y-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider px-1 flex items-center gap-2">
            <History className="w-3.5 h-3.5" /> ประวัติการรับเงิน
          </p>
          {payoutHistory.map(payout => (
            <div key={payout.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">฿{payout.amount.toLocaleString()}</p>
                <p className="text-xs text-slate-500">{payout.date} · {payout.deals} ดีล</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{payout.note}</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-500">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-black text-emerald-600">รับแล้ว</span>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

// ─── Owner Billing View (with Escrow Breakdown, read-only) ────────────────────
interface OwnerBillingViewProps {
  onSwitchToTenant?: () => void;
}

function OwnerBillingView({ onSwitchToTenant }: OwnerBillingViewProps) {
  const router = useRouter();
  const ESCROW_PCT = 0.15; // 15% goes to Escrow

  const [slips] = useState<SlipItem[]>([
    {
      id: 's1', tenantName: 'ณัฐพล ใจสู้', room: 'A-1204', amount: 11500,
      ownerReceives: Math.round(11500 * (1 - ESCROW_PCT)),
      escrowHeld: Math.round(11500 * ESCROW_PCT),
      date: '29 มิ.ย. 2569', status: 'pending'
    },
    {
      id: 's2', tenantName: 'สุภาพร ทองดี', room: 'B-0801', amount: 8000,
      ownerReceives: Math.round(8000 * (1 - ESCROW_PCT)),
      escrowHeld: Math.round(8000 * ESCROW_PCT),
      date: '28 มิ.ย. 2569', status: 'pending'
    },
    {
      id: 's3', tenantName: 'Mary K.', room: 'C-0305', amount: 9200,
      ownerReceives: Math.round(9200 * (1 - ESCROW_PCT)),
      escrowHeld: Math.round(9200 * ESCROW_PCT),
      date: '27 มิ.ย. 2569', status: 'approved'
    },
    {
      id: 's4', tenantName: 'James L.', room: 'A-0102', amount: 6500,
      ownerReceives: Math.round(6500 * (1 - ESCROW_PCT)),
      escrowHeld: Math.round(6500 * ESCROW_PCT),
      date: '25 มิ.ย. 2569', status: 'approved'
    },
    {
      id: 's5', tenantName: 'วิภาวี เดชสง', room: 'D-1105', amount: 7800,
      ownerReceives: Math.round(7800 * (1 - ESCROW_PCT)),
      escrowHeld: Math.round(7800 * ESCROW_PCT),
      date: '24 มิ.ย. 2569', status: 'rejected'
    },
  ]);

  const approved = slips.filter(s => s.status === 'approved');
  const pending  = slips.filter(s => s.status === 'pending');
  const totalOwnerReceived = approved.reduce((s, sl) => s + sl.ownerReceives, 0);
  const totalEscrow        = approved.reduce((s, sl) => s + sl.escrowHeld, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-semibold text-slate-900">รายรับ & ยอดเงินเข้า</span>
        <div className="w-9" />
      </header>

      <main className="flex-1 p-4 space-y-4 pb-10">

        {/* Dual Role Switch Switcher */}
        {onSwitchToTenant && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-black text-indigo-950">คุณมีบทบาทผู้เช่าของห้องอื่นด้วย</span>
            </div>
            <button
              onClick={onSwitchToTenant}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 animate-pulse"
            >
              🔄 สลับไปยังโหมดผู้เช่า (ชำระค่าเช่า)
            </button>
          </div>
        )}

        {/* Monthly Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-5 py-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-sm">สรุปรายรับ มิถุนายน 2569</span>
            </div>
            <p className="text-2xl font-black text-emerald-400">
              ฿{totalOwnerReceived.toLocaleString()}
              <span className="text-sm font-medium text-slate-400 ml-2">ได้รับแล้ว</span>
            </p>
          </div>

          {/* Escrow Breakdown Info */}
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-700">
              <span className="font-black">ส่วน Escrow ฿{totalEscrow.toLocaleString()}</span> ถูกหักไว้ในระบบอัตโนมัติ (15%) เพื่อชำระค่าคอมมิชชั่นเอเจนต์และค่าบริการแพลตฟอร์ม
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-100 text-center py-4">
            <div>
              <p className="text-xl font-black text-slate-900">{slips.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ทั้งหมด</p>
            </div>
            <div>
              <p className="text-xl font-black text-emerald-600">{approved.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">เข้าแล้ว</p>
            </div>
            <div>
              <p className="text-xl font-black text-amber-500">{pending.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">รอยืนยัน</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-4">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>ความคืบหน้ายอดโอนเข้า</span>
            <span className="text-slate-900">{approved.length}/{slips.length} ห้อง</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(approved.length / slips.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Slip List */}
        <div className="space-y-3">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">รายการสลิปทั้งหมด (ตรวจสอบโดยระบบ/Admin)</p>
          {slips.map((slip) => (
            <div key={slip.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{slip.tenantName}</p>
                    <p className="text-xs text-slate-500">ห้อง {slip.room} · {slip.date}</p>
                  </div>
                  <div className="text-right">
                    {slip.status === 'approved' && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
                        <CheckCheck className="w-3 h-3" /> ยืนยันแล้ว
                      </span>
                    )}
                    {slip.status === 'rejected' && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-50 border border-red-100 rounded-full px-2.5 py-1">
                        <XCircle className="w-3 h-3" /> ปฏิเสธ
                      </span>
                    )}
                    {slip.status === 'pending' && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1">
                        <Clock className="w-3 h-3" /> รอตรวจสอบ
                      </span>
                    )}
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs border border-slate-100">
                  <div className="flex justify-between text-slate-500">
                    <span>ยอดชำระรวม</span>
                    <span className="font-bold text-slate-800">฿{slip.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span className="font-bold">→ ส่วนที่คุณได้รับ (85%)</span>
                    <span className="font-black">฿{slip.ownerReceives.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-600">
                    <span className="font-bold">→ ดำเนินการในระบบ (15%)</span>
                    <span className="font-black">฿{slip.escrowHeld.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => router.push(`/liff/owner/verify?slipId=${slip.id}`)}
                    className="text-[11px] font-black text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Eye className="w-3 h-3" /> ดูสลิปหลักฐาน
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ─── Tenant Billing View (unchanged) ──────────────────────────────────────────
interface TenantBillingViewProps {
  isDualRole?: boolean;
  onSwitchToOwner?: () => void;
}

function TenantBillingView({ isDualRole, onSwitchToOwner }: TenantBillingViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || 'prop-1';

  const PROP_1_BILLS: Bill[] = [
    { id: 'rent',    label: 'ค่าเช่า',     subtext: 'ห้อง A-1204',          amount: 8000, isPayable: true,  isSelected: true,  badgeType: null },
    { id: 'water',   label: 'ค่าน้ำ',      subtext: 'ยูนิต 102 - 110',      amount: 300,  isPayable: true,  isSelected: true,  badgeType: null },
    { id: 'elec',    label: 'ค่าไฟ',       subtext: 'ยูนิต 405 - 550',      amount: 1200, isPayable: true,  isSelected: true,  badgeType: null },
    { id: 'common',  label: 'ค่าส่วนกลาง', subtext: 'รายปี',                 amount: 2000, isPayable: true,  isSelected: true,  badgeType: null },
    { id: 'deposit', label: 'เงินประกัน',  subtext: 'สำหรับแรกเข้า',        amount: 5000, isPayable: true,  isSelected: true,  badgeType: null },
  ];

  const PROP_2_BILLS: Bill[] = [
    { id: 'rent',  label: 'ค่าเช่า', subtext: 'บ้านเลขที่ 5',            amount: 6500, isPayable: true,  isSelected: true,  badgeType: null },
    { id: 'water', label: 'ค่าน้ำ',  subtext: 'จ่ายตรงกับการประปา',     amount: 0,    isPayable: false, isSelected: false, badgeType: 'external' },
    { id: 'elec',  label: 'ค่าไฟ',   subtext: 'จ่ายตรงกับการไฟฟ้า',    amount: 0,    isPayable: false, isSelected: false, badgeType: 'external' },
  ];

  const initialBills = propertyId === 'prop-2' ? PROP_2_BILLS : PROP_1_BILLS;
  const [bills, setBills] = useState<Bill[]>(initialBills);

  const toggleBill = (id: string) => {
    setBills(prev => prev.map(bill =>
      (bill.id === id && bill.isPayable) ? { ...bill, isSelected: !bill.isSelected } : bill
    ));
  };

  const totalSelectedAmount = useMemo(() => {
    return bills.filter(b => b.isSelected).reduce((sum, b) => sum + b.amount, 0);
  }, [bills]);

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-semibold text-slate-900">เลือกรายการชำระ</span>
        <div className="w-9" />
      </header>

      <main className="flex-1 p-4 pb-24 space-y-4">

        {/* Switch back to Owner view if Dual Role */}
        {isDualRole && onSwitchToOwner && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-emerald-950">คุณอยู่ในโหมดชำระค่าเช่าของห้องอื่น</span>
            </div>
            <button
              onClick={onSwitchToOwner}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              🔄 สลับกลับไปยังโหมดเจ้าของ (ดูยอดเงินเข้า)
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-5 py-4 text-white flex justify-between">
            <span className="font-medium">INV-2026-06</span>
            <span className="text-slate-300 text-sm">{propertyId === 'prop-2' ? 'Chiang Mai Villa' : 'Sukhumvit 71'}</span>
          </div>

          <div className="p-5 space-y-5">
            {bills.map((bill) => (
              <React.Fragment key={bill.id}>
                {bill.isPayable ? (
                  <div className="flex justify-between items-center cursor-pointer group" onClick={() => toggleBill(bill.id)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${bill.isSelected ? 'bg-[#00B900] border-[#00B900]' : 'border-slate-300 bg-white group-hover:border-[#00B900]'}`}>
                        {bill.isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{bill.label}</p>
                        {bill.subtext && <p className="text-xs text-slate-500">{bill.subtext}</p>}
                      </div>
                    </div>
                    <p className="font-semibold text-slate-900">{bill.amount.toLocaleString()} บาท</p>
                  </div>
                ) : (
                  <div className="flex justify-between items-center opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-md border border-slate-200 bg-slate-100 shrink-0" />
                      <div>
                        <p className={`font-medium text-slate-900 ${bill.badgeType === 'external' ? 'line-through' : ''}`}>{bill.label}</p>
                        {bill.badgeType === 'external' && (
                          <p className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block uppercase tracking-wider">ชำระบิลแยก</p>
                        )}
                      </div>
                    </div>
                    <p className="font-medium text-slate-400">{bill.amount.toLocaleString()} บาท</p>
                  </div>
                )}
                <div className="h-px bg-slate-100 w-full" />
              </React.Fragment>
            ))}
          </div>

          <div className="bg-slate-50 p-5 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-1">ยอดชำระทั้งหมด</p>
            <p className="text-3xl font-bold text-[#00B900]">{totalSelectedAmount.toLocaleString()} <span className="text-lg text-slate-500">บาท</span></p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-20">
        <div className="max-w-md mx-auto">
          <Button
            onClick={() => router.push(`/liff/payment/method?amount=${totalSelectedAmount}`)}
            disabled={totalSelectedAmount === 0}
            className={`w-full rounded-xl h-14 text-lg font-bold shadow-sm transition-colors ${totalSelectedAmount > 0 ? 'bg-[#00B900] hover:bg-[#00a000] text-white' : 'bg-slate-100 text-slate-400'}`}
          >
            ดำเนินการชำระเงิน
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Root Component with Role Detection & Switching ───────────────────────────
function PaymentSelectContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'tenant';
  const [activeRole, setActiveRole] = useState(initialRole);

  // Sync state if parameter changes
  useEffect(() => {
    setActiveRole(initialRole);
  }, [initialRole]);

  if (activeRole === 'agent') return <AgentCommissionView />;
  if (activeRole === 'owner') {
    return (
      <OwnerBillingView 
        onSwitchToTenant={() => setActiveRole('tenant')} 
      />
    );
  }
  return (
    <TenantBillingView 
      isDualRole={initialRole === 'owner'} 
      onSwitchToOwner={() => setActiveRole('owner')}
    />
  );
}

export default function LiffPaymentSelect() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">กำลังโหลดข้อมูล...</div>}>
      <PaymentSelectContent />
    </Suspense>
  );
}

