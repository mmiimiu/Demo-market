'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

export const initialInvoices = [
  { id: 'inv001', tenantName: 'สมชาย มีทรัพย์', propertyName: 'คอนโด Sukhumvit 42', roomNo: '1204', billingMonth: 'มิถุนายน 2026', rent: 18000, commonFee: 800, water: 150, electricity: 1200, total: 20150, status: 'paid', createdAt: '2026-06-01' },
  { id: 'inv002', tenantName: 'รัชดา แสนดี', propertyName: 'ทาวน์เฮ้าส์ บางนา', roomNo: '15/3', billingMonth: 'มิถุนายน 2026', rent: 25000, commonFee: 1200, water: 220, electricity: 1850, total: 28270, status: 'pending', createdAt: '2026-06-15' },
];

export function OwnerBillingTab({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const isThai = lang === 'th';
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showIssueBillModal, setShowIssueBillModal] = useState(false);

  useEffect(() => {
    const savedInvoices = localStorage.getItem('primerent_invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    } else {
      setInvoices(initialInvoices);
      localStorage.setItem('primerent_invoices', JSON.stringify(initialInvoices));
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-[#EAFDF3] text-[#1E854A] border-none rounded-lg font-bold text-[9px] px-2.5 py-0.5">{isThai ? '✓ จ่ายแล้ว' : '✓ Paid'}</Badge>;
      case 'overdue': return <Badge className="bg-[#FFF0ED] text-[#D9381E] border-none rounded-lg font-bold text-[9px] px-2.5 py-0.5">{isThai ? '🚨 เกินกำหนด' : '🚨 Overdue'}</Badge>;
      default: return <Badge className="bg-[#FFF9E6] text-[#A66E0A] border-none rounded-lg font-bold text-[9px] px-2.5 py-0.5">{isThai ? '⏳ ค้างชำระ' : '⏳ Pending'}</Badge>;
    }
  };

  return (
    <div className="space-y-6 md:col-span-3">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
        <div>
          <h2 className="text-xl font-black text-[#1E293B]">{isThai ? '💵 การเงินและใบเรียกเก็บเงิน' : '💵 Billing Console'}</h2>
          <p className="text-sm text-gray-400 font-bold mt-1">{isThai ? 'ออกใบแจ้งหนี้ค่าเช่าประจำเดือนและค่าสาธารณูปโภค' : 'Issue and review utility & rent monthly bills.'}</p>
        </div>
        <Button onClick={() => setShowIssueBillModal(true)} className="rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold gap-2 h-11 px-6 shadow-md hover:scale-[1.02] transition-transform">
          <Plus className="w-5 h-5" /> {isThai ? 'ออกใบเรียกเก็บเงิน' : 'Issue New Invoice'}
        </Button>
      </div>

      <Card className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-4">{isThai ? 'เลขที่บิล' : 'Bill ID'}</th>
                  <th className="pb-4">{isThai ? 'ผู้เช่า / รอบบิล' : 'Tenant & Month'}</th>
                  <th className="pb-4">{isThai ? 'ห้องพัก' : 'Unit'}</th>
                  <th className="pb-4">{isThai ? 'น้ำ/ไฟ/ส่วนกลาง' : 'Utilities'}</th>
                  <th className="pb-4">{isThai ? 'ยอดรวมสุทธิ' : 'Total Net'}</th>
                  <th className="pb-4">{isThai ? 'สถานะจ่ายเงิน' : 'Status'}</th>
                  <th className="pb-4">{isThai ? 'วันที่ออกบิล' : 'Issued Date'}</th>
                  <th className="pb-4 text-right">{isThai ? 'จัดการ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-semibold text-[#1E293B]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-5 text-xs font-mono text-gray-400">#{inv.id.substring(0, 8)}</td>
                    <td className="py-5">
                      <div className="font-black text-gray-900 group-hover:text-primary transition-colors">{inv.tenantName}</div>
                      <span className="text-[10px] bg-slate-100 text-gray-500 px-2 py-0.5 rounded-lg mt-1 inline-block">{inv.billingMonth}</span>
                    </td>
                    <td className="py-5">
                      <div className="text-gray-900 font-bold">{inv.propertyName}</div>
                      <div className="text-[10px] text-gray-400 mt-1">ห้อง {inv.roomNo}</div>
                    </td>
                    <td className="py-5 text-xs font-bold text-gray-400">
                      <div>💧 ฿{inv.water} · ⚡ ฿{inv.electricity}</div>
                      <div className="mt-1">🏢 ฿{inv.commonFee}</div>
                    </td>
                    <td className="py-5 font-black text-[#1E293B] text-sm">฿{inv.total.toLocaleString()}</td>
                    <td className="py-5">{getStatusBadge(inv.status)}</td>
                    <td className="py-5 text-gray-400">{inv.createdAt}</td>
                    <td className="py-5 text-right">
                      <Button size="sm" variant="outline" className="rounded-lg text-xs font-bold border-gray-200 hover:bg-gray-50 transition-colors">
                        {isThai ? 'ดูรายละเอียด' : 'View'}
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
