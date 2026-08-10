'use client';

import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import type { ActiveRole, BillLineItem } from './types';
import { DEFAULT_BILL_CONFIG } from './types';
import WebviewBillingTenant from './WebviewBillingTenant';
import WebviewBillingAgent from './WebviewBillingAgent';

interface WebviewBillingProps {
  activeRole: ActiveRole;
  slipImage: string | null;
  slipUploaded: boolean;
  onUploadSlip: () => void;
  paymentStatus: 'unpaid' | 'pending_verification' | 'paid';
  paidAmount: number;
  onSendQR?: (amount: number, room: string) => void;
}

// Persist shared config
export let sharedBillConfig: BillLineItem[] = DEFAULT_BILL_CONFIG.map(i => ({ ...i }));

function OwnerBillingView() {
  const [items, setItems] = useState<BillLineItem[]>(sharedBillConfig.map(i => ({ ...i })));
  const [waterPrev, setWaterPrev] = useState(120);
  const [waterCurr, setWaterCurr] = useState(135);
  const [elecPrev, setElecPrev] = useState(1450);
  const [elecCurr, setElecCurr] = useState(1680);

  const toggle = (id: string) => setItems(p => p.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
  const setAmt  = (id: string, v: string) => setItems(p => p.map(i => i.id === id ? { ...i, amount: parseFloat(v) || 0 } : i));

  // Auto calculate based on meter reading inputs
  const waterUsed = Math.max(0, waterCurr - waterPrev);
  const waterCost = waterUsed * 18; // 18 THB per unit
  const elecUsed = Math.max(0, elecCurr - elecPrev);
  const elecCost = elecUsed * 6; // 6 THB per unit

  const fixed = items.filter(i => i.section === 'fixed');
  const utility = items.filter(i => i.section === 'utility').map(i => {
    if (i.id === 'water') return { ...i, amount: waterCost };
    if (i.id === 'electric') return { ...i, amount: elecCost };
    return i;
  });

  const fixedTotal = fixed.filter(i => i.enabled).reduce((s, i) => s + i.amount, 0);
  const utilityTotal = utility.filter(i => i.enabled).reduce((s, i) => s + i.amount, 0);
  const grandTotal = fixedTotal + utilityTotal;

  const handleSend = () => {
    sharedBillConfig = [...fixed, ...utility];
    toast({ title: '📝 บันทึกและส่งบิลเรียบร้อย', description: `ยอดรวม ฿${grandTotal.toLocaleString()} ถูกส่งผ่าน LINE OA แล้ว` });
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-xl p-4 text-white">
        <h4 className="font-black text-sm">กำหนดบิล & จดมิเตอร์น้ำ-ไฟ</h4>
        <p className="text-[10px] text-slate-400 font-semibold">กรอกเลขมิเตอร์เพื่อคำนวณราคาค่าน้ำประปาและค่าไฟฟ้าอัตโนมัติ</p>
      </div>

      {/* Meter readings */}
      <div className="border rounded-xl p-3 bg-gray-50/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">📊 บันทึกเลขมิเตอร์ประจำเดือน</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold">💧 มิเตอร์น้ำ</span>
              <button onClick={() => toggle('water')} className="text-gray-400 hover:text-blue-500 transition-colors">
                {utility.find(i => i.id === 'water')?.enabled ? <ToggleRight className="w-5 h-5 text-blue-500" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
            </div>
            {utility.find(i => i.id === 'water')?.enabled && (
              <>
                <div className="flex gap-1.5"><Input type="number" value={waterPrev} onChange={e => setWaterPrev(parseInt(e.target.value) || 0)} className="h-8 text-xs font-bold" placeholder="ก่อน" /><Input type="number" value={waterCurr} onChange={e => setWaterCurr(parseInt(e.target.value) || 0)} className="h-8 text-xs font-bold" placeholder="หลัง" /></div>
                <p className="text-[10px] text-gray-400 font-bold">ใช้ไป {waterUsed} หน่วย = ฿{waterCost.toLocaleString()}</p>
              </>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold">⚡ มิเตอร์ไฟ</span>
              <button onClick={() => toggle('electric')} className="text-gray-400 hover:text-orange-500 transition-colors">
                {utility.find(i => i.id === 'electric')?.enabled ? <ToggleRight className="w-5 h-5 text-orange-500" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
            </div>
            {utility.find(i => i.id === 'electric')?.enabled && (
              <>
                <div className="flex gap-1.5"><Input type="number" value={elecPrev} onChange={e => setElecPrev(parseInt(e.target.value) || 0)} className="h-8 text-xs font-bold" placeholder="ก่อน" /><Input type="number" value={elecCurr} onChange={e => setElecCurr(parseInt(e.target.value) || 0)} className="h-8 text-xs font-bold" placeholder="หลัง" /></div>
                <p className="text-[10px] text-gray-400 font-bold">ใช้ไป {elecUsed} หน่วย = ฿{elecCost.toLocaleString()}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">📋 รายการบิลที่จะเรียกเก็บ</span>
        {fixed.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-xl bg-white text-xs font-black">
            <span>{item.label}</span>
            <span>฿{item.amount.toLocaleString()}</span>
          </div>
        ))}
        {utility.filter(i => i.enabled).map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-xl bg-emerald-50/20 border-[#06c755] text-xs font-black">
            <span>{item.label}</span>
            <span>฿{item.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center bg-gray-50 border-2 border-[#06c755]/30 rounded-xl p-3.5">
        <span className="text-sm font-black text-gray-800">ยอดรวมที่ผู้เช่าต้องจ่าย</span>
        <span className="text-lg font-black text-[#06c755]">฿{grandTotal.toLocaleString()}</span>
      </div>

      <Button onClick={handleSend} className="w-full bg-[#06c755] hover:bg-[#05b34c] text-white font-black text-xs h-10">
        📝 บันทึกและส่งบิลให้ผู้เช่า
      </Button>
    </div>
  );
}

export default function WebviewBilling(props: WebviewBillingProps) {
  const dummyOnSendQR = (amount: number, room: string) => {
    if (props.onSendQR) props.onSendQR(amount, room);
  };

  if (props.activeRole === 'owner') return <OwnerBillingView />;
  if (props.activeRole === 'agent') return <WebviewBillingAgent onSendQR={dummyOnSendQR} />;
  return (
    <WebviewBillingTenant
      sharedBillConfig={sharedBillConfig}
      slipImage={props.slipImage}
      slipUploaded={props.slipUploaded}
      onUploadSlip={props.onUploadSlip}
      paymentStatus={props.paymentStatus}
      paidAmount={props.paidAmount}
      onSendQR={dummyOnSendQR}
    />
  );
}
