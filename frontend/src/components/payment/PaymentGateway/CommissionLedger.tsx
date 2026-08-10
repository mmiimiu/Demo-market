'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, User, Globe, Users, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { Language } from '@/lib/types';
import { CommissionRecord } from '@/lib/types/payment';

interface Props { lang: Language; filterAgentId?: string; }

const MOCK_COMMISSIONS: CommissionRecord[] = [
  {
    id: 'comm_001', contractId: 'ctr_001', propertyId: 'prop_001',
    advanceRentAmount: 18000,
    agentId: 'agent_001', agentPercent: 60, agentAmount: 10800,
    coAgentId: 'coagent_001', coAgentPercent: 10, coAgentAmount: 1800,
    websitePercent: 30, websiteAmount: 5400,
    status: 'pending_payout', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'comm_002', contractId: 'ctr_002', propertyId: 'prop_002',
    advanceRentAmount: 25000,
    agentId: 'agent_002', agentPercent: 70, agentAmount: 17500,
    websitePercent: 30, websiteAmount: 7500,
    status: 'paid', createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), payoutAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

export function CommissionLedger({ lang, filterAgentId }: Props) {
  const isTh = lang === 'th';
  const [records, setRecords] = useState<CommissionRecord[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('primerent_commissions') || '[]');
      const combined = [...MOCK_COMMISSIONS, ...stored];
      const seen = new Set<string>();
      const deduped = combined.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
      setRecords(filterAgentId ? deduped.filter(r => r.agentId === filterAgentId || r.coAgentId === filterAgentId) : deduped);
    } catch {
      setRecords(MOCK_COMMISSIONS);
    }
  }, [filterAgentId]);

  const totalPending = records.filter(r => r.status === 'pending_payout').reduce((s, r) => s + r.agentAmount + (r.coAgentAmount || 0), 0);
  const totalPaid = records.filter(r => r.status === 'paid').reduce((s, r) => s + r.agentAmount + (r.coAgentAmount || 0), 0);
  const totalWebsite = records.reduce((s, r) => s + r.websiteAmount, 0);

  const handleMarkPaid = (id: string) => {
    try {
      const stored = JSON.parse(localStorage.getItem('primerent_commissions') || '[]');
      const idx = stored.findIndex((r: any) => r.id === id);
      if (idx !== -1) { stored[idx].status = 'paid'; stored[idx].payoutAt = new Date().toISOString(); localStorage.setItem('primerent_commissions', JSON.stringify(stored)); }
    } catch {}
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'paid', payoutAt: new Date().toISOString() } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">{isTh ? 'Commission Ledger' : 'Commission Ledger'}</h2>
          <p className="text-xs text-gray-400 font-bold">{isTh ? 'ประวัติและสถานะค่าคอมมิชชันของทุก Deal' : 'Commission history and payout status for all deals'}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-2xl border-none shadow-sm bg-amber-50">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-amber-700">{isTh ? 'รอ Payout' : 'Pending Payout'}</p>
            <p className="text-lg font-black text-amber-900">฿{totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-sm bg-green-50">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-green-700">{isTh ? 'จ่ายแล้ว' : 'Paid Out'}</p>
            <p className="text-lg font-black text-green-900">฿{totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-sm bg-gray-100">
          <CardContent className="p-4 text-center">
            <Globe className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-gray-600">{isTh ? 'รายได้เว็บ' : 'Website Revenue'}</p>
            <p className="text-lg font-black text-gray-900">฿{totalWebsite.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Records */}
      <div className="space-y-3">
        {records.map(r => (
          <Card key={r.id} className="rounded-2xl border border-gray-100 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-black text-gray-900 text-sm">Deal: #{r.contractId}</p>
                  <p className="text-xs text-gray-400 font-bold mt-0.5">{isTh ? 'ค่าล่วงหน้า:' : 'Advance Rent:'} ฿{r.advanceRentAmount.toLocaleString()}</p>
                </div>
                <Badge className={r.status === 'paid' ? 'bg-green-100 text-green-700 border-none font-black' : 'bg-amber-100 text-amber-700 border-none font-black'}>
                  {r.status === 'paid' ? (isTh ? '✓ จ่ายแล้ว' : '✓ Paid') : (isTh ? '⏳ รอ Payout' : '⏳ Pending')}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <User className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-[9px] font-black text-blue-700 uppercase">Agent {r.agentPercent}%</p>
                  <p className="font-black text-blue-900 text-sm">฿{r.agentAmount.toLocaleString()}</p>
                </div>
                {r.coAgentAmount != null ? (
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <Users className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                    <p className="text-[9px] font-black text-purple-700 uppercase">Co-Agent {r.coAgentPercent}%</p>
                    <p className="font-black text-purple-900 text-sm">฿{r.coAgentAmount.toLocaleString()}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-3 text-center opacity-40">
                    <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-[9px] font-black text-gray-400 uppercase">No Co-Agent</p>
                    <p className="font-black text-gray-400 text-sm">-</p>
                  </div>
                )}
                <div className="bg-gray-100 rounded-xl p-3 text-center">
                  <Globe className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                  <p className="text-[9px] font-black text-gray-500 uppercase">Website {r.websitePercent}%</p>
                  <p className="font-black text-gray-700 text-sm">฿{r.websiteAmount.toLocaleString()}</p>
                </div>
              </div>

              {r.status === 'pending_payout' && (
                <Button onClick={() => handleMarkPaid(r.id)} size="sm" className="w-full rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-10 shadow-lg shadow-indigo-600/10">
                  <CheckCircle2 className="w-4 h-4" />{isTh ? 'อนุมัติสั่งจ่ายเงินแบ่ง 3 ฝ่าย (Release 3-Way Split Payout)' : 'Confirm & Release 3-Way Payout'}
                </Button>
              )}
              {r.status === 'paid' && r.payoutAt && (
                <p className="text-[10px] text-gray-400 font-bold text-center">{isTh ? 'จ่ายออกเมื่อ:' : 'Paid out:'} {new Date(r.payoutAt).toLocaleDateString()}</p>
              )}
            </CardContent>
          </Card>
        ))}
        {records.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <DollarSign className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-400">{isTh ? 'ยังไม่มีบันทึกค่าคอมมิชชัน' : 'No commission records yet'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
