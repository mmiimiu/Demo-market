'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { PaymentItem } from './types';

interface PaymentsListProps {
  payments: PaymentItem[];
  label: (th: string, en: string, cn: string) => string;
  isTh: boolean;
}

function StatusBadge({ status, isTh }: { status: string; isTh: boolean }) {
  if (status === 'paid') return (
    <Badge className="bg-[#EAFDF3] text-[#1E854A] hover:bg-[#EAFDF3] border border-[#D1F7E2] text-[9px] font-bold rounded-xl px-2.5 py-0.5">
      {isTh ? '✓ ชำระแล้ว' : '✓ Paid'}
    </Badge>
  );
  if (status === 'pending') return (
    <Badge className="bg-[#FFF9E6] text-[#A66E0A] hover:bg-[#FFF9E6] border border-[#FEEBB4] text-[9px] font-bold rounded-xl px-2.5 py-0.5">
      {isTh ? '⏳ รอชำระ' : '⏳ Pending'}
    </Badge>
  );
  return (
    <Badge className="bg-[#FFF0ED] text-[#D9381E] hover:bg-[#FFF0ED] border border-[#FFE2DA] text-[9px] font-bold rounded-xl px-2.5 py-0.5">
      {isTh ? '❌ เกินกำหนด' : '❌ Overdue'}
    </Badge>
  );
}

export function PaymentsList({ payments, label, isTh }: PaymentsListProps) {
  return (
    <Card className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
      <CardContent className="p-6">
        <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider mb-4">
          {label('ประวัติการชำระเงิน', 'Payment History', '付款历史')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">{label('รอบบิล', 'Billing Month', '账期')}</th>
                <th className="pb-3">{label('ยอดเงิน', 'Amount', '金额')}</th>
                <th className="pb-3">{label('สถานะ', 'Status', '状态')}</th>
                <th className="pb-3">{label('วันที่ทำรายการ', 'Date', '日期')}</th>
                <th className="pb-3 text-right">{label('ใบเสร็จ', 'Invoice', '发票')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-600 font-bold">
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 text-gray-900 font-black">{payment.month}</td>
                  <td className="py-3.5">฿{payment.amount.toLocaleString()}</td>
                  <td className="py-3.5"><StatusBadge status={payment.status} isTh={isTh} /></td>
                  <td className="py-3.5 text-gray-400">{payment.date}</td>
                  <td className="py-3.5 text-right">
                    {payment.status === 'paid' ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#E51D53] rounded-xl hover:bg-[#E51D53]/10">
                        <Download className="w-4 h-4" />
                      </Button>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
