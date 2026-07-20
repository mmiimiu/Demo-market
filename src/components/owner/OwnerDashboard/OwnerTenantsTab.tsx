'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const mockTenants = [
  { id: 't1', name: 'สมชาย มีทรัพย์', phone: '081-234-5678', email: 'somchai@email.com', propertyName: 'คอนโด Sukhumvit 42', roomNo: '1204', contractPeriod: '1 ม.ค. 2026 - 31 ธ.ค. 2026', rentAmount: 18000, paymentStatus: 'paid' },
  { id: 't2', name: 'รัชดา แสนดี', phone: '089-876-5432', email: 'ratchada@email.com', propertyName: 'ทาวน์เฮ้าส์ บางนา', roomNo: '15/3', contractPeriod: '15 มี.ค. 2026 - 14 มี.ค. 2027', rentAmount: 25000, paymentStatus: 'unpaid' },
];

export function OwnerTenantsTab({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const { openChat } = useApp();
  const isThai = lang === 'th';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-[#EAFDF3] text-[#1E854A] hover:bg-[#EAFDF3] border-none rounded-lg font-bold text-[9px] px-2.5 py-0.5">{isThai ? '✓ จ่ายแล้ว' : '✓ Paid'}</Badge>;
      case 'overdue':
        return <Badge className="bg-[#FFF0ED] text-[#D9381E] hover:bg-[#FFF0ED] border-none rounded-lg font-bold text-[9px] px-2.5 py-0.5">{isThai ? '🚨 เกินกำหนด' : '🚨 Overdue'}</Badge>;
      default:
        return <Badge className="bg-[#FFF9E6] text-[#A66E0A] hover:bg-[#FFF9E6] border-none rounded-lg font-bold text-[9px] px-2.5 py-0.5">{isThai ? '⏳ ค้างชำระ' : '⏳ Pending'}</Badge>;
    }
  };

  return (
    <div className="space-y-6 md:col-span-3">
      <Card className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-8">
          <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-wider mb-6 flex items-center gap-2">
            {isThai ? 'รายชื่อผู้เช่าปัจจุบัน' : 'Active Tenant Directory'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-4">{isThai ? 'ผู้เช่า/ข้อมูลติดต่อ' : 'Tenant Contact'}</th>
                  <th className="pb-4">{isThai ? 'ห้อง / ทรัพย์สิน' : 'Unit & Residence'}</th>
                  <th className="pb-4">{isThai ? 'ระยะเวลาสัญญาเช่า' : 'Lease Period'}</th>
                  <th className="pb-4">{isThai ? 'ค่าเช่าหลัก' : 'Monthly Rent'}</th>
                  <th className="pb-4">{isThai ? 'สถานะจ่ายเงิน' : 'Payment Status'}</th>
                  <th className="pb-4 text-right">{isThai ? 'แชทติดต่อ' : 'Contact'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600 font-bold">
                {mockTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-5">
                      <div className="font-black text-gray-900 text-sm group-hover:text-primary transition-colors">{t.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold mt-1">{t.phone} · {t.email}</div>
                    </td>
                    <td className="py-5">
                      <span className="text-gray-900 font-bold">{t.propertyName}</span>
                      <div className="text-[10px] text-gray-400 font-bold mt-1">ห้อง {t.roomNo}</div>
                    </td>
                    <td className="py-5 text-xs font-semibold text-gray-400">{t.contractPeriod}</td>
                    <td className="py-5 font-black text-[#1E293B] text-sm">฿{t.rentAmount.toLocaleString()}</td>
                    <td className="py-5">{getStatusBadge(t.paymentStatus)}</td>
                    <td className="py-5 text-right">
                      <Button size="sm" variant="ghost" onClick={() => openChat({ id: 1, name: t.propertyName }, 'owner', t.name)} className="h-9 rounded-xl font-bold text-xs text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] gap-2 transition-colors">
                        <MessageCircle className="w-4 h-4" /> {isThai ? 'แชท' : 'Chat'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
