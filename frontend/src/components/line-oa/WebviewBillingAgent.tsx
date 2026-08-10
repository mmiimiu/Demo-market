'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { QrCode } from 'lucide-react';

interface AgentBillingProps {
  onSendQR: (amount: number, room: string) => void;
}

export default function WebviewBillingAgent({ onSendQR }: AgentBillingProps) {
  const jobs = [
    { room: 'ห้อง A-1204 (BTS อโศก)', amount: 13800, status: 'unpaid' },
    { room: 'ห้อง B-0201 (ลาดพร้าว)', amount: 9500, status: 'unpaid' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl p-4 text-white">
        <h4 className="font-black text-sm">💼 ทรัพย์สินที่ดูแล & เรียกเก็บเงิน</h4>
        <p className="text-[10px] opacity-80 mt-0.5">กดส่ง QR code เรียกเก็บเงินแบบ Flex Message ไปยัง LINE ลูกค้าได้ทันที</p>
      </div>

      <div className="space-y-2.5">
        {jobs.map((j, i) => (
          <div key={i} className="border rounded-xl p-3 bg-white shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-black text-xs text-gray-900">{j.room}</p>
                <p className="text-[10px] text-gray-500 font-bold">ยอดเรียกเก็บ: ฿{j.amount.toLocaleString()}</p>
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">ค้างชำระ</span>
            </div>
            <Button onClick={() => onSendQR(j.amount, j.room)} className="w-full bg-[#06c755] hover:bg-[#05b34c] text-white font-black text-[10px] h-8">
              <QrCode className="w-3.5 h-3.5 mr-1" /> ส่ง PromptPay QR Flex ให้ลูกค้า
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
