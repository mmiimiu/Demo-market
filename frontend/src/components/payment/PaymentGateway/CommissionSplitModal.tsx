'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, User, Globe, Users, Check, ChevronRight, Loader2 } from 'lucide-react';
import { Language } from '@/lib/types';
import { calcCommission, CommissionRecord } from '@/lib/types/payment';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  contractId: string;
  propertyId: string;
  propertyName: string;
  advanceRentAmount: number;
  agentId: string;
  agentName: string;
  coAgentId?: string;
  coAgentName?: string;
  lang: Language;
  onSuccess?: (commission: CommissionRecord) => void;
}

export function CommissionSplitModal({
  open, onClose, contractId, propertyId, propertyName,
  advanceRentAmount, agentId, agentName, coAgentId, coAgentName, lang, onSuccess,
}: Props) {
  const isTh = lang === 'th';
  const [done, setDone] = useState(false);
  const [processing, setProcessing] = useState(false);

  const split = calcCommission(advanceRentAmount, agentId, coAgentId);

  const handleConfirm = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1000));
    const now = new Date().toISOString();
    const commission: CommissionRecord = {
      id: `comm_${Date.now()}`,
      contractId,
      propertyId,
      status: 'pending_payout',
      createdAt: now,
      ...split,
    };
    try {
      const stored = JSON.parse(localStorage.getItem('primerent_commissions') || '[]');
      stored.push(commission);
      localStorage.setItem('primerent_commissions', JSON.stringify(stored));
    } catch {}
    setProcessing(false);
    setDone(true);
    onSuccess?.(commission);
    toast({ title: isTh ? 'บันทึกค่าคอมมิชชันสำเร็จ' : 'Commission Recorded', description: isTh ? 'รอ Admin อนุมัติ Payout' : 'Pending Admin payout approval.' });
  };

  const handleClose = () => { setDone(false); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl font-thai">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            {isTh ? 'ค่าคอมมิชชัน (Pool 2 — ค่าล่วงหน้า)' : 'Commission Split (Pool 2 — Advance Rent)'}
          </DialogTitle>
        </DialogHeader>

        {!done ? (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-indigo-700 mb-1">{isTh ? 'ค่าเช่าล่วงหน้า (แบ่งค่าคอม)' : 'Advance Rent (Commission Pool)'}</p>
              <p className="text-3xl font-black text-indigo-900">฿{advanceRentAmount.toLocaleString()}</p>
              <p className="text-xs text-indigo-700 mt-1">{propertyName}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-black text-sm text-gray-700">{isTh ? '💰 สัดส่วนการแบ่ง' : '💰 Commission Breakdown'}</h4>

              {/* Agent */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">{agentName}</p>
                    <Badge className="bg-blue-100 text-blue-700 border-none text-[9px] font-black mt-0.5">Agent</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-blue-900">฿{split.agentAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-blue-600 font-bold">{split.agentPercent}%</p>
                </div>
              </div>

              {/* Co-Agent */}
              {coAgentId && split.coAgentAmount != null && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">{coAgentName}</p>
                      <Badge className="bg-purple-100 text-purple-700 border-none text-[9px] font-black mt-0.5">Co-Agent</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-purple-900">฿{split.coAgentAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-purple-600 font-bold">{split.coAgentPercent}%</p>
                  </div>
                </div>
              )}

              {/* Website */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-sm">PrimeRent Platform</p>
                    <Badge className="bg-gray-200 text-gray-600 border-none text-[9px] font-black mt-0.5">Service Fee</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">฿{split.websiteAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-600 font-bold">{split.websitePercent}%</p>
                </div>
              </div>

              {/* Total Check */}
              <div className="border-t pt-2 flex justify-between items-center">
                <p className="text-sm font-black text-gray-700">{isTh ? 'รวม' : 'Total'}</p>
                <p className="font-black text-gray-900">฿{(split.agentAmount + (split.coAgentAmount || 0) + split.websiteAmount).toLocaleString()}</p>
              </div>
            </div>

            <Button onClick={handleConfirm} disabled={processing} className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black gap-2">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              {processing ? (isTh ? 'กำลังบันทึก...' : 'Processing...') : (isTh ? 'ยืนยันและบันทึกค่าคอม' : 'Confirm & Record Commission')}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900">{isTh ? 'บันทึกค่าคอมสำเร็จ!' : 'Commission Recorded!'}</h3>
            <p className="text-sm text-gray-500 font-bold">{isTh ? 'Admin จะดำเนินการ Payout ให้ Agent ในลำดับถัดไป' : 'Admin will process payout to agents shortly.'}</p>
            <Button onClick={handleClose} className="w-full h-12 rounded-xl font-black">{isTh ? 'ปิด' : 'Close'}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
