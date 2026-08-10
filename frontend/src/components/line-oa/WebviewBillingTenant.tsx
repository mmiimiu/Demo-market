'use client';

import React from 'react';
import { Check, Upload, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import type { BillLineItem } from './types';

interface TenantBillingProps {
  sharedBillConfig: BillLineItem[];
  slipImage: string | null;
  slipUploaded: boolean;
  onUploadSlip: () => void;
  paymentStatus: 'unpaid' | 'pending_verification' | 'paid';
  paidAmount: number;
  onSendQR: (amount: number, room: string) => void;
}

export default function WebviewBillingTenant({
  sharedBillConfig, slipImage, slipUploaded, onUploadSlip, paymentStatus, paidAmount, onSendQR
}: TenantBillingProps) {
  const fixed = sharedBillConfig.filter(i => i.section === 'fixed' && i.enabled);
  const utility = sharedBillConfig.filter(i => i.section === 'utility' && i.enabled);
  const fixedTotal = fixed.reduce((s, i) => s + i.amount, 0);
  const utilityTotal = utility.reduce((s, i) => s + i.amount, 0);
  const grandTotal = fixedTotal + utilityTotal;

  const Row = ({ item }: { item: BillLineItem }) => (
    <div className="flex items-center justify-between p-3 border border-[#06c755]/40 rounded-xl bg-emerald-50/20">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-[#06c755] rounded flex items-center justify-center shrink-0">
          <Check className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-bold text-gray-800">{item.label}</span>
      </div>
      <span className="text-xs font-black text-gray-900">฿{item.amount.toLocaleString()}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-500 to-[#06c755] rounded-xl p-4 text-white shadow-sm">
        <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">ยอดที่ต้องชำระเดือนนี้</span>
        <h3 className="text-3xl font-black mt-0.5">฿{grandTotal.toLocaleString()}</h3>
        <div className="flex gap-3 mt-2 text-[10px] opacity-80 font-semibold">
          <span>ค่าเช่า ฿{fixedTotal.toLocaleString()}</span>
          {utilityTotal > 0 && <span>· สาธารณูปโภค ฿{utilityTotal.toLocaleString()}</span>}
        </div>
        <p className="text-[10px] opacity-70 font-semibold mt-1">
          ห้อง A-1204 · {paymentStatus === 'paid' ? '✅ ชำระแล้ว' : paymentStatus === 'pending_verification' ? '⏳ รอตรวจสอบ' : '🔴 ค้างชำระ'}
        </p>
      </div>

      {paymentStatus === 'paid' ? (
        <div className="p-8 border border-dashed border-green-300 rounded-xl text-center space-y-2 bg-green-50/50">
          <span className="text-3xl">🎉</span>
          <h4 className="font-black text-sm text-green-800">ชำระเงินเสร็จสิ้น!</h4>
          <p className="text-xs text-green-700 font-bold">ยอด ฿{paidAmount.toLocaleString()} อนุมัติแล้ว</p>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">ส่วนที่ 1 — ค่าเช่าห้อง</span>
            {fixed.map(item => <Row key={item.id} item={item} />)}
          </div>

          {utility.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">ส่วนที่ 2 — ค่าสาธารณูปโภค</span>
              {utility.map(item => <Row key={item.id} item={item} />)}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => onSendQR(grandTotal, 'A-1204')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs h-9">
              <QrCode className="w-4 h-4 mr-1.5" /> ขอรับ QR Code
            </Button>
            <Button onClick={onUploadSlip} variant="outline" className="flex-1 border-gray-300 text-gray-700 font-black text-xs h-9">
              <Upload className="w-4 h-4 mr-1.5" /> อัปโหลดสลิป
            </Button>
          </div>

          {slipUploaded && (
            <div className="relative border rounded-xl overflow-hidden bg-slate-50 p-4 max-w-xs mx-auto shadow-sm space-y-3">
              {/* Green KBank Style e-Slip Header */}
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-[#00A950] rounded-full flex items-center justify-center text-white font-black text-[9px]">K</div>
                  <span className="font-black text-gray-900 text-[10px]">K-Plus e-Slip</span>
                </div>
                <span className="text-[9px] text-[#00A950] font-black bg-emerald-50 px-1.5 py-0.5 rounded">โอนเงินสำเร็จ</span>
              </div>
              <div className="space-y-1.5 text-[10px] font-bold text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">วันที่-เวลา:</span>
                  <span className="text-gray-900">{new Date().toLocaleString('th-TH')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">จาก:</span>
                  <span className="text-gray-900">คุณผู้เช่า (Tenant)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ไปยัง:</span>
                  <span className="text-gray-900">โครงการ RentFlow</span>
                </div>
                <div className="border-t border-dashed pt-2 mt-2 flex justify-between items-center">
                  <span className="text-gray-400">จำนวนเงิน:</span>
                  <span className="text-sm font-black text-[#00A950]">฿{grandTotal.toLocaleString()}.00</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-black rounded-xl">
                ⏳ รอการอนุมัติสลิป
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
