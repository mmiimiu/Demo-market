'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Language, UserRole } from '@/lib/types';
import { PaymentRecord, MonthlyBill, CommissionRecord } from '@/lib/types/payment';
import {
  DepositPaymentModal,
  CommissionSplitModal,
  MonthlyPaymentModal,
  SlipConfirmModal,
  CommissionLedger,
  IssueBillModal
} from '@/components/payment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Shield,
  TrendingUp,
  FileText,
  DollarSign,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Settings,
  User,
  Users,
  Building2,
  ArrowRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TabPaymentProps {
  lang: Language;
  currentRole: UserRole;
  currentUser: any;
}

export function TabPayment({ lang, currentRole, currentUser }: TabPaymentProps) {
  const isTh = lang === 'th';
  
  // States for modals
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showIssueBillModal, setShowIssueBillModal] = useState(false);
  const [hasPendingCrd, setHasPendingCrd] = useState(false);
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [selectedBill, setSelectedBill] = useState<MonthlyBill | null>(null);
  
  // Data lists
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [bills, setBills] = useState<MonthlyBill[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  
  // Superadmin Configuration states
  const [platformFee, setPlatformFee] = useState('30');
  const [agentBaseFee, setAgentBaseFee] = useState('60');
  const [agentSoloFee, setAgentSoloFee] = useState('70');
  const [coAgentFee, setCoAgentFee] = useState('10');

  // Load mock database from localStorage
  const loadData = () => {
    try {
      const storedPayments = localStorage.getItem('primerent_payments');
      const storedBills = localStorage.getItem('primerent_bills');
      const storedCommissions = localStorage.getItem('primerent_commissions');
      
      const parsedPayments = storedPayments ? JSON.parse(storedPayments) : [];
      const parsedBills = storedBills ? JSON.parse(storedBills) : [];
      const parsedCommissions = storedCommissions ? JSON.parse(storedCommissions) : [];

      setPayments(parsedPayments);
      setBills(parsedBills);
      setCommissions(parsedCommissions);

      // Load config for Superadmin
      setPlatformFee(localStorage.getItem('primerent_cfg_platform_fee') || '30');
      setAgentBaseFee(localStorage.getItem('primerent_cfg_agent_base_fee') || '60');
      setAgentSoloFee(localStorage.getItem('primerent_cfg_agent_solo_fee') || '70');
      setCoAgentFee(localStorage.getItem('primerent_cfg_co_agent_fee') || '10');
    } catch (e) {
      console.error('Error loading payment data', e);
    }
  };

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      setHasPendingCrd(localStorage.getItem('primerent_pending_crd_deduction') === 'true');
    }
    
    // Set up standard mock bills and payments if empty
    const initMockData = () => {
      if (!localStorage.getItem('primerent_bills')) {
        const mockBills: MonthlyBill[] = [
          {
            id: 'bill_001',
            contractId: 'ctr_001',
            propertyId: 'prop_001',
            ownerId: 'owner_demo',
            tenantId: currentUser?.uid || 'tenant_demo',
            month: '2026-06',
            dueDate: '2026-06-25',
            items: [
              { type: 'rent', label: 'ค่าเช่าห้อง', amount: 15000 },
              { type: 'water', label: 'ค่าน้ำ (5 หน่วย)', amount: 90, unit: 5, ratePerUnit: 18 },
              { type: 'electric', label: 'ค่าไฟ (120 หน่วย)', amount: 840, unit: 120, ratePerUnit: 7 }
            ],
            totalAmount: 15930,
            hasUtilities: true,
            status: 'sent',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('primerent_bills', JSON.stringify(mockBills));
        setBills(mockBills);
      }
    };
    initMockData();
  }, [currentUser]);

  const handleConfigSave = () => {
    localStorage.setItem('primerent_cfg_platform_fee', platformFee);
    localStorage.setItem('primerent_cfg_agent_base_fee', agentBaseFee);
    localStorage.setItem('primerent_cfg_agent_solo_fee', agentSoloFee);
    localStorage.setItem('primerent_cfg_co_agent_fee', coAgentFee);
    toast({
      title: isTh ? 'บันทึกการตั้งค่าสำเร็จ' : 'Settings Saved',
      description: isTh ? 'โครงสร้างการแบ่งค่าคอมมิชชันได้รับการอัปเดต' : 'Commission split layout updated successfully.'
    });
  };

  const handleResetSystem = () => {
    if (window.confirm(isTh ? 'ต้องการรีเซ็ตข้อมูลธุรกรรมและบิลทั้งหมดใช่หรือไม่?' : 'Are you sure you want to reset all transaction and bill mock data?')) {
      localStorage.removeItem('primerent_payments');
      localStorage.removeItem('primerent_bills');
      localStorage.removeItem('primerent_commissions');
      loadData();
      toast({
        title: isTh ? 'รีเซ็ตข้อมูลสำเร็จ' : 'System Reset Done',
        description: isTh ? 'ข้อมูลธุรกรรมทั้งหมดถูกล้างแล้ว' : 'All transaction mock records have been cleared.'
      });
      window.location.reload();
    }
  };

  const typeLabel = (t: string) => ({
    deposit: isTh ? '🔒 มัดจำ (Pool 1)' : '🔒 Deposit (Pool 1)',
    advance_rent: isTh ? '💰 ล่วงหน้า (Pool 2)' : '💰 Advance (Pool 2)',
    monthly_rent: isTh ? '📅 รายเดือน (Pool 3)' : '📅 Monthly (Pool 3)',
  }[t] || t);

  const statusBadge = (s: string) => {
    const map: any = {
      pending_slip: ['bg-gray-100 text-gray-600', isTh ? 'รออัปโหลดสลิป' : 'Awaiting Slip'],
      slip_uploaded: ['bg-amber-100 text-amber-700 border-amber-200', isTh ? 'รอยืนยันสลิป' : 'Pending Verification'],
      confirmed: ['bg-green-100 text-green-700 border-green-200', isTh ? 'ชำระเงินสำเร็จ' : 'Paid & Confirmed'],
      rejected: ['bg-red-100 text-red-700 border-red-200', isTh ? 'สลิปไม่ถูกต้อง' : 'Slip Rejected'],
    };
    const [cls, label] = map[s] || ['bg-gray-100 text-gray-400', s];
    return <Badge className={`${cls} border font-black text-[10px] px-2 py-0.5 rounded-lg`}>{label}</Badge>;
  };

  const isUserAdmin = currentRole === 'admin' || currentRole === 'superadmin' || currentRole === 'sa';
  const isUserSuperAdmin = currentRole === 'superadmin' || currentRole === 'sa';
  const isUserOwner = currentRole === 'landlord' || currentRole === 'owner';
  const isUserAgent = currentRole === 'agent';
  const isUserRenter = currentRole === 'renter' || currentRole === 'user';

  // Filters based on roles
  const myOutstandingBills = bills.filter(b => b.tenantId === currentUser?.uid && b.status !== 'paid');
  const myCompletedBills = bills.filter(b => b.tenantId === currentUser?.uid && b.status === 'paid');
  
  const landlordBills = bills.filter(b => b.ownerId === currentUser?.uid);
  const landlordAwaitingPayments = payments.filter(p => p.payeeId === currentUser?.uid && p.status === 'slip_uploaded');

  const adminAwaitingPayments = payments.filter(p => p.status === 'slip_uploaded');

  return (
    <div className="space-y-6">
      {/* Role specific quick action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-4">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isTh ? 'บทบาทปัจจุบัน' : 'Current View'}</p>
          <p className="text-sm font-black text-gray-800 flex items-center gap-1.5 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            {isTh ? `ผู้ใช้งาน: ${currentRole.toUpperCase()}` : `User Role: ${currentRole.toUpperCase()}`}
          </p>
        </div>
        <div className="flex gap-2">
          {isUserRenter && (
            <Button onClick={() => setShowDepositModal(true)} size="sm" className="rounded-xl font-black gap-1.5 bg-green-600 text-white hover:bg-green-700 text-xs">
              <Shield className="w-3.5 h-3.5" />
              {isTh ? 'ชำระค่ามัดจำห้อง' : 'Pay Deposit'}
            </Button>
          )}
          {isUserOwner && (
            <Button onClick={() => setShowIssueBillModal(true)} size="sm" className="rounded-xl font-black gap-1.5 bg-primary text-white hover:bg-primary/95 text-xs">
              <Plus className="w-3.5 h-3.5" />
              {isTh ? 'ออกบิลรายเดือน' : 'Issue Invoice'}
            </Button>
          )}
          {isUserAgent && (
            <Button onClick={() => setShowCommissionModal(true)} size="sm" className="rounded-xl font-black gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 text-xs">
              <TrendingUp className="w-3.5 h-3.5" />
              {isTh ? 'บันทึกค่าคอมมิชชัน' : 'Split Commission'}
            </Button>
          )}
        </div>
      </div>

      {/* 5. CRD Pending Deduction Promotion Card for Owner/Agent */}
      {hasPendingCrd && (isUserAgent || isUserOwner || (currentRole as string) === 'coagent') && (
        <Card className="border border-emerald-200 bg-emerald-50/10 shadow-none rounded-2xl animate-in fade-in duration-300">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm font-black flex items-center gap-2 text-emerald-900">
              👮‍♂️ {isTh ? 'บัญชีสำรองจ่ายค่าตรวจประวัติอาชญากรรม (CRD)' : 'CRD Criminal Record Advance Ledger'}
            </CardTitle>
            <CardDescription className="text-[11px] font-bold text-emerald-700">
              {isTh 
                ? 'รายการค่าธรรมเนียมที่แพลตฟอร์มออกให้ก่อนในช่วงโปรโมชั่น 3 เดือนแรก และจะถูกหักคืนจากค่าคอมมิชชั่นปล่อยเช่าแรกของคุณ' 
                : 'Advanced fees paid by the platform during the first 3 months. To be recovered from your first rental commission.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-3">
            <div className="flex items-center justify-between border border-emerald-100 bg-white rounded-xl p-4 shadow-sm text-xs">
              <div>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-block mb-1">
                  {isTh ? 'สำรองจ่ายสำเร็จ' : 'Advanced Successfully'}
                </span>
                <p className="font-black text-gray-900 text-xs">
                  {isTh ? 'ค่าตรวจสอบประวัติบุคคล (CRD Check)' : 'Criminal Record Verification Fee'}
                </p>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                  {isTh ? 'สถานะ: รอหักคืนจากค่าคอมมิชชั่นก้อนแรก' : 'Status: Awaiting First Commission Deduction'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-emerald-950 text-sm">฿100</p>
                <p className="text-[9px] text-gray-400 font-bold mt-0.5">
                  {isTh ? 'ครบกำหนดหัก: ดีลแรก' : 'Deduction: First deal'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 1. RENTER / TENANT VIEW */}
      {isUserRenter && (
        <div className="space-y-6">
          {/* Unpaid Bills */}
          <Card className="border border-gray-200 shadow-none rounded-2xl">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-black flex items-center gap-2 text-gray-800">
                <FileText className="w-4 h-4 text-primary" />
                {isTh ? 'ค่าเช่าและสาธารณูปโภคที่ค้างชำระ' : 'Unpaid Rents & Bills'}
              </CardTitle>
              <CardDescription className="text-xs">{isTh ? 'บิลเรียกเก็บเงินประจำเดือนที่ยังไม่ได้แนบสลิปชำระเงิน' : 'Monthly invoices issued to you by the owner'}</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-3">
              {myOutstandingBills.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs font-bold">{isTh ? 'ไม่มีบิลค้างชำระในระบบ' : 'No outstanding bills'}</div>
              ) : (
                myOutstandingBills.map(b => (
                  <div key={b.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-black text-sm text-gray-900">{isTh ? `รอบบิลเดือน: ${b.month}` : `Billing Period: ${b.month}`}</p>
                      <p className="text-[10px] text-red-500 font-bold mt-1">⏳ {isTh ? 'ครบกำหนด:' : 'Due Date:'} {new Date(b.dueDate).toLocaleDateString(isTh ? 'th-TH' : 'en-US')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-black text-primary text-base">฿{b.totalAmount.toLocaleString()}</p>
                      <Button size="sm" className="rounded-xl font-black bg-primary text-white h-9 px-4 text-xs" onClick={() => setSelectedBill(b)}>
                        {isTh ? 'ชำระเงิน' : 'Pay Now'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="border border-gray-200 shadow-none rounded-2xl">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-black flex items-center gap-2 text-gray-800">
                <DollarSign className="w-4 h-4 text-green-600" />
                {isTh ? 'ประวัติการส่งสลิปชำระเงิน' : 'Your Payment History'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2">
              {payments.filter(p => p.payerId === currentUser?.uid).length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs font-bold">{isTh ? 'ยังไม่มีประวัติการทำรายการ' : 'No transaction records found'}</div>
              ) : (
                payments.filter(p => p.payerId === currentUser?.uid).map(p => (
                  <div key={p.id} className="flex items-center justify-between border border-gray-50 rounded-xl p-3 text-xs">
                    <div>
                      <p className="font-black text-gray-900">{typeLabel(p.type)}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">#{p.id.slice(-8)} · {new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-black text-primary">฿{p.amount.toLocaleString()}</p>
                      {statusBadge(p.status)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. OWNER / LANDLORD VIEW */}
      {isUserOwner && (
        <div className="space-y-6">
          {/* Slips to Approve */}
          <Card className="border border-amber-200 bg-amber-50/20 shadow-none rounded-2xl">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-black flex items-center gap-2 text-amber-900">
                <Clock className="w-4 h-4 text-amber-600" />
                {isTh ? 'สลิปโอนเงินที่ต้องตรวจสอบ' : 'Awaiting Slip Verification'}
              </CardTitle>
              <CardDescription className="text-xs text-amber-700">{isTh ? 'ผู้เช่าโอนตรงเข้าบัญชีคุณและแนบสลิปมา กรุณากดตรวจสอบเพื่อเปิดสัญญาหรืออัปเดตสถานะบิล' : 'Verify incoming deposit/rent transfers directly to your bank account'}</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-3">
              {landlordAwaitingPayments.length === 0 ? (
                <div className="text-center py-6 text-amber-700/50 text-xs font-bold">{isTh ? 'ไม่มีสลิปค้างตรวจสอบ' : 'No slips awaiting verification'}</div>
              ) : (
                landlordAwaitingPayments.map(p => (
                  <div key={p.id} className="flex items-center justify-between border border-amber-100 bg-white rounded-xl p-4 shadow-sm">
                    <div>
                      <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-[9px] mb-1.5">{typeLabel(p.type)}</Badge>
                      <p className="font-black text-xs text-gray-900">{isTh ? 'ผู้โอน: สมชาย มีทรัพย์' : 'Sender: Somchai'}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">#{p.id.slice(-8)} · {new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-black text-amber-900 text-sm">฿{p.amount.toLocaleString()}</p>
                      <Button size="sm" variant="outline" className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 font-black text-xs gap-1 h-9" onClick={() => setSelectedPayment(p)}>
                        <Eye className="w-3.5 h-3.5" />
                        {isTh ? 'ตรวจสลิป' : 'Review'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Billing Console / History */}
          <Card className="border border-gray-200 shadow-none rounded-2xl">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black flex items-center gap-2 text-gray-800">
                  <FileText className="w-4 h-4 text-primary" />
                  {isTh ? 'ประวัติการออกบิลและสถานะ' : 'Issued Bills & Invoices'}
                </CardTitle>
              </div>
              <Button onClick={() => setShowIssueBillModal(true)} size="sm" className="rounded-xl bg-primary text-white text-xs font-black h-8 gap-1">
                <Plus className="w-3 h-3" /> {isTh ? 'ออกบิลใหม่' : 'Create Bill'}
              </Button>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2">
              {landlordBills.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs font-bold">{isTh ? 'ยังไม่มีประวัติการออกบิลห้องพัก' : 'No bills issued yet'}</div>
              ) : (
                landlordBills.map(b => (
                  <div key={b.id} className="flex items-center justify-between border border-gray-50 rounded-xl p-3 text-xs">
                    <div>
                      <p className="font-black text-gray-900">{isTh ? `รอบบิล: ${b.month}` : `Period: ${b.month}`}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{isTh ? 'ส่งถึง: ผู้เช่า' : 'Sent to: Tenant'} · {new Date(b.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-black text-gray-900">฿{b.totalAmount.toLocaleString()}</p>
                      <Badge className={b.status === 'paid' ? 'bg-green-50 text-green-700 border-none' : 'bg-amber-50 text-amber-700 border-none'}>
                        {b.status === 'paid' ? (isTh ? '✓ จ่ายแล้ว' : '✓ Paid') : (isTh ? '⏳ ค้างชำระ' : '⏳ Sent')}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. AGENT / CO-AGENT VIEW */}
      {(isUserAgent || (currentRole as string) === 'coagent') && (
        <div className="space-y-6">
          <Card className="border border-gray-200 shadow-none rounded-2xl">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black flex items-center gap-2 text-indigo-900">
                  <TrendingUp className="w-4 h-4" />
                  {isTh ? 'บัญชีส่วนแบ่งค่าคอมมิชชัน' : 'My Commissions'}
                </CardTitle>
                <CardDescription className="text-xs">{isTh ? 'ค่าคอมมิชชันของคุณจาก Pool 2 (ค่าเช่าล่วงหน้า) ที่รอเว็บโอนออก' : 'Commission records linked to your deals'}</CardDescription>
              </div>
              <Button onClick={() => setShowCommissionModal(true)} size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black h-8 gap-1">
                <Plus className="w-3 h-3" /> {isTh ? 'แบ่งค่าคอม' : 'Split Comm'}
              </Button>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <CommissionLedger lang={lang} filterAgentId={currentUser?.uid || 'agent_001'} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. ADMIN / SUPERADMIN VIEW */}
      {isUserAdmin && (
        <div className="space-y-6">
          {/* Admin Escrow Verification Panel */}
          <Card className="border border-indigo-200 bg-indigo-50/10 shadow-none rounded-2xl">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-black flex items-center gap-2 text-indigo-900">
                <Shield className="w-4 h-4 text-indigo-600" />
                {isTh ? 'ระบบตรวจสอบสลิปของส่วนกลาง (Admin Escrow)' : 'Admin Escrow Slips Review'}
              </CardTitle>
              <CardDescription className="text-xs text-indigo-700">{isTh ? 'ตรวจสอบความถูกต้องของสลิปที่ต้องโอนผ่านระบบส่วนกลางเพื่อป้องกันการฉ้อโกง' : 'Verify system escrow slips before processing commission payouts'}</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-3">
              {adminAwaitingPayments.length === 0 ? (
                <div className="text-center py-6 text-indigo-600/50 text-xs font-bold">{isTh ? 'ไม่มีสลิปรอตรวจสอบในระบบส่วนกลาง' : 'No pending escrow slips'}</div>
              ) : (
                adminAwaitingPayments.map(p => (
                  <div key={p.id} className="flex items-center justify-between border border-indigo-100 bg-white rounded-xl p-4 shadow-sm">
                    <div>
                      <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold text-[9px] mb-1">{typeLabel(p.type)}</Badge>
                      <p className="font-black text-xs text-gray-900">{isTh ? `จากผู้ใช้ ID: ${p.payerId.substring(0,8)}` : `From User ID: ${p.payerId.substring(0,8)}`}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-mono">ID: #{p.id.slice(-8)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-black text-indigo-900 text-sm">฿{p.amount.toLocaleString()}</p>
                      <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs gap-1 h-9" onClick={() => setSelectedPayment(p)}>
                        <Eye className="w-3.5 h-3.5" />
                        {isTh ? 'ตรวจสอบ' : 'Verify'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Central Payouts Ledger */}
          <Card className="border border-gray-200 shadow-none rounded-2xl">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-base font-black flex items-center gap-2 text-gray-800">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                {isTh ? 'บัญชีส่วนแบ่งระบบและจ่ายเงินนายหน้า (Global Ledger)' : 'Global Commission Ledger'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <CommissionLedger lang={lang} />
            </CardContent>
          </Card>

          {/* 5. SUPERADMIN INFRASTRUCTURE CONFIGURATION */}
          {isUserSuperAdmin && (
            <Card className="border border-rose-200 bg-rose-50/10 shadow-none rounded-2xl">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-base font-black flex items-center gap-2 text-rose-900">
                  <Settings className="w-4 h-4 text-rose-600" />
                  {isTh ? 'ระบบตั้งค่าค่าธรรมเนียมแพลตฟอร์ม (Super Admin Only)' : 'Platform System Settings (Super Admin Only)'}
                </CardTitle>
                <CardDescription className="text-xs text-rose-700">{isTh ? 'แก้ไขสัดส่วนเปอร์เซ็นต์ค่าธรรมเนียมและค่าเช่าล่วงหน้า (Pool 2) ของระบบกลาง' : 'Configure platform commission cuts and reset transaction database'}</CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-3 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-black text-gray-700">{isTh ? 'ค่าธรรมเนียมระบบ (%)' : 'Website Fee (%)'}</Label>
                    <Input type="number" value={platformFee} onChange={e => setPlatformFee(e.target.value)} className="rounded-xl h-10 font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-black text-gray-700">{isTh ? 'นายหน้าหลัก (%)' : 'Agent Fee (%)'}</Label>
                    <Input type="number" value={agentBaseFee} onChange={e => setAgentBaseFee(e.target.value)} className="rounded-xl h-10 font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-black text-gray-700">{isTh ? 'นายหน้าเดี่ยว (%)' : 'Solo Agent (%)'}</Label>
                    <Input type="number" value={agentSoloFee} onChange={e => setAgentSoloFee(e.target.value)} className="rounded-xl h-10 font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-black text-gray-700">{isTh ? 'นายหน้าร่วม (%)' : 'Co-Agent (%)'}</Label>
                    <Input type="number" value={coAgentFee} onChange={e => setCoAgentFee(e.target.value)} className="rounded-xl h-10 font-bold" />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2 border-t border-rose-100">
                  <Button onClick={handleResetSystem} variant="outline" className="rounded-xl h-10 font-black border-red-200 text-red-600 hover:bg-red-50 text-xs">
                    {isTh ? '💥 ล้างฐานข้อมูลธุรกรรม' : '💥 Wipe Payment Data'}
                  </Button>
                  <Button onClick={handleConfigSave} className="rounded-xl h-10 font-black bg-rose-600 hover:bg-rose-700 text-white text-xs">
                    {isTh ? 'บันทึกการตั้งค่าโครงสร้าง' : 'Save Config Structure'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* MODAL WRAPPERS */}
      {showDepositModal && (
        <DepositPaymentModal
          open={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          contractId="ctr_demo_99"
          propertyName="คอนโด Sukhumvit 23 (Mock Lease)"
          ownerName="สมเกียรติ พูลสวัสดิ์"
          ownerBankAccount="KBank 732-2-12345-0"
          ownerPromptPay="082-999-8888"
          depositAmount={16000}
          payerId={currentUser?.uid || 'renter_uid'}
          payeeId="owner_demo"
          lang={lang}
          onSuccess={() => { setShowDepositModal(false); loadData(); }}
        />
      )}

      {showCommissionModal && (
        <CommissionSplitModal
          open={showCommissionModal}
          onClose={() => setShowCommissionModal(false)}
          contractId="ctr_demo_101"
          propertyId="prop_101"
          propertyName="Noble Recole Asoke (ห้อง 14B)"
          advanceRentAmount={28000}
          agentId={currentUser?.uid || 'agent_001'}
          agentName={currentUser?.displayName || 'นายหน้าใจซื่อ'}
          coAgentId="coagent_demo"
          coAgentName="สุนทร พาชมห้อง"
          lang={lang}
          onSuccess={() => { setShowCommissionModal(false); loadData(); }}
        />
      )}

      {showIssueBillModal && (
        <IssueBillModal
          open={showIssueBillModal}
          onClose={() => setShowIssueBillModal(false)}
          contractId="ctr_demo_99"
          propertyId="prop_99"
          ownerId={currentUser?.uid || 'owner_uid'}
          tenantId="tenant_demo"
          tenantName="สมชาย มีทรัพย์"
          baseRent={15000}
          hasUtilities={true}
          lang={lang}
          onBillCreated={() => { setShowIssueBillModal(false); loadData(); }}
        />
      )}

      {selectedBill && (
        <MonthlyPaymentModal
          open={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          bill={selectedBill}
          ownerName="สมเกียรติ พูลสวัสดิ์"
          ownerBankAccount="KBank 732-2-12345-0"
          ownerPromptPay="082-999-8888"
          lang={lang}
          onSuccess={() => { setSelectedBill(null); loadData(); }}
        />
      )}

      {selectedPayment && (
        <SlipConfirmModal
          open={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          payment={selectedPayment}
          tenantName="สมชาย มีทรัพย์"
          lang={lang}
          confirmedByUid={currentUser?.uid || 'owner_uid'}
          onConfirmed={() => { setSelectedPayment(null); loadData(); }}
          onRejected={() => { setSelectedPayment(null); loadData(); }}
        />
      )}
    </div>
  );
}