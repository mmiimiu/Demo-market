'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useUser } from '@/firebase';
import { CommissionLedger, IssueBillModal, SlipConfirmModal, DepositPaymentModal, CommissionSplitModal } from '@/components/payment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TrendingUp, FileText, DollarSign, Shield, Plus, Eye } from 'lucide-react';
import { PaymentRecord, MonthlyBill } from '@/lib/types/payment';

export default function PaymentPage() {
  const { lang } = useApp();
  const { user } = useUser();
  const isTh = lang === 'th';
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [bills, setBills] = useState<MonthlyBill[]>([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showCommission, setShowCommission] = useState(false);
  const [showIssueBill, setShowIssueBill] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    try {
      setPayments(JSON.parse(localStorage.getItem('primerent_payments') || '[]'));
      setBills(JSON.parse(localStorage.getItem('primerent_bills') || '[]'));
    } catch {}
  }, []);

  const statusBadge = (s: string) => {
    const map: any = {
      pending_slip: ['bg-gray-100 text-gray-600', isTh ? 'รอสลิป' : 'Awaiting Slip'],
      slip_uploaded: ['bg-amber-100 text-amber-700', isTh ? 'รอยืนยัน' : 'Pending Confirm'],
      confirmed: ['bg-green-100 text-green-700', isTh ? 'ยืนยันแล้ว' : 'Confirmed'],
      rejected: ['bg-red-100 text-red-700', isTh ? 'ปฏิเสธ' : 'Rejected'],
    };
    const [cls, label] = map[s] || ['bg-gray-100 text-gray-400', s];
    return <Badge className={`${cls} border-none font-black text-[10px]`}>{label}</Badge>;
  };

  const typeLabel = (t: string) => ({
    deposit: isTh ? '🔒 มัดจำ' : '🔒 Deposit',
    advance_rent: isTh ? '💰 ล่วงหน้า' : '💰 Advance',
    monthly_rent: isTh ? '📅 รายเดือน' : '📅 Monthly',
  }[t] || t);

  // Mock data for demo
  const mockBillConfig = {
    contractId: 'ctr_demo_001', propertyId: 'prop_001',
    ownerId: user?.uid || 'owner_demo', tenantId: 'tenant_demo',
    tenantName: 'สมชาย มีทรัพย์', baseRent: 12000, hasUtilities: true,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-thai">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{isTh ? '💳 ระบบการชำระเงิน' : '💳 Payment Gateway'}</h1>
            <p className="text-sm text-gray-400 font-bold mt-1">{isTh ? 'จัดการเงิน 3 ก้อน: มัดจำ · ล่วงหน้า · รายเดือน' : 'Manage 3 payment pools: Deposit · Advance · Monthly'}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button onClick={() => setShowDeposit(true)} size="sm" className="rounded-xl font-bold gap-1 bg-green-600 text-white hover:bg-green-700">
              <Shield className="w-4 h-4" />{isTh ? 'ชำระมัดจำ' : 'Pay Deposit'}
            </Button>
            <Button onClick={() => setShowCommission(true)} size="sm" className="rounded-xl font-bold gap-1 bg-indigo-600 text-white hover:bg-indigo-700">
              <TrendingUp className="w-4 h-4" />{isTh ? 'บันทึกค่าคอม' : 'Record Commission'}
            </Button>
            <Button onClick={() => setShowIssueBill(true)} size="sm" className="rounded-xl font-bold gap-1 bg-primary text-white">
              <Plus className="w-4 h-4" />{isTh ? 'ออกบิล' : 'Issue Bill'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="payments">
          <TabsList className="rounded-xl bg-gray-100">
            <TabsTrigger value="payments" className="rounded-xl font-bold data-[state=active]:bg-white">{isTh ? 'ประวัติการชำระ' : 'Payments'}</TabsTrigger>
            <TabsTrigger value="commissions" className="rounded-xl font-bold data-[state=active]:bg-white">{isTh ? 'Commission Ledger' : 'Commissions'}</TabsTrigger>
            <TabsTrigger value="bills" className="rounded-xl font-bold data-[state=active]:bg-white">{isTh ? 'บิลรายเดือน' : 'Monthly Bills'}</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-3 mt-4">
            {payments.length === 0 && (
              <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                <DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-bold text-gray-400 text-sm">{isTh ? 'ยังไม่มีประวัติการชำระเงิน' : 'No payment records yet'}</p>
              </div>
            )}
            {payments.map(p => (
              <Card key={p.id} className="rounded-2xl border border-gray-100 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-black text-gray-900 text-sm">{typeLabel(p.type)}</p>
                    <p className="text-xs text-gray-400 font-bold mt-0.5">#{p.id.slice(-8)} · {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-black text-primary">฿{p.amount.toLocaleString()}</p>
                    {statusBadge(p.status)}
                    {p.status === 'slip_uploaded' && (
                      <Button size="sm" variant="outline" className="rounded-xl font-bold gap-1 text-xs" onClick={() => setSelectedPayment(p)}>
                        <Eye className="w-3 h-3" />{isTh ? 'ตรวจสลิป' : 'Review'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="commissions" className="mt-4">
            <CommissionLedger lang={lang} />
          </TabsContent>

          <TabsContent value="bills" className="space-y-3 mt-4">
            {bills.length === 0 && (
              <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-bold text-gray-400 text-sm">{isTh ? 'ยังไม่มีบิล' : 'No bills yet'}</p>
              </div>
            )}
            {bills.map(b => (
              <Card key={b.id} className="rounded-2xl border border-gray-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-black text-gray-900 text-sm">{b.month} — ฿{b.totalAmount.toLocaleString()}</p>
                    <Badge className={b.status === 'paid' ? 'bg-green-100 text-green-700 border-none font-black text-[10px]' : 'bg-amber-100 text-amber-700 border-none font-black text-[10px]'}>
                      {b.status === 'paid' ? (isTh ? '✓ ชำระแล้ว' : '✓ Paid') : (isTh ? '⏳ ค้างชำระ' : '⏳ Pending')}
                    </Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {b.items.map((item, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-bold">{item.label}: ฿{item.amount.toLocaleString()}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <DepositPaymentModal
        open={showDeposit} onClose={() => setShowDeposit(false)}
        contractId="ctr_demo_001" propertyName="คอนโดหรู ใกล้ BTS อโศก"
        ownerName="สมยศ ใจดี" ownerBankAccount="SCB 123-4-56789-0"
        ownerPromptPay="089-123-4567" depositAmount={24000}
        payerId={user?.uid || 'tenant_demo'} payeeId="owner_demo"
        lang={lang} onSuccess={p => setPayments(prev => [p, ...prev])}
      />

      <CommissionSplitModal
        open={showCommission} onClose={() => setShowCommission(false)}
        contractId="ctr_demo_001" propertyId="prop_001"
        propertyName="คอนโดหรู ใกล้ BTS อโศก" advanceRentAmount={12000}
        agentId="agent_001" agentName="นัทธ์ สมาร์ทเอเจ้น"
        coAgentId="coagent_001" coAgentName="เปรม ช่วยงาน"
        lang={lang}
      />

      <IssueBillModal
        open={showIssueBill} onClose={() => setShowIssueBill(false)}
        {...mockBillConfig} lang={lang}
        onBillCreated={b => setBills(prev => [b, ...prev])}
      />

      {selectedPayment && (
        <SlipConfirmModal
          open={!!selectedPayment} onClose={() => setSelectedPayment(null)}
          payment={selectedPayment} tenantName="ผู้เช่า"
          confirmedByUid={user?.uid || 'owner_demo'} lang={lang}
          onConfirmed={() => { setSelectedPayment(null); setPayments(JSON.parse(localStorage.getItem('primerent_payments') || '[]')); }}
        />
      )}
    </div>
  );
}
