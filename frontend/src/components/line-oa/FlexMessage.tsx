'use client';

import React from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import type { LineMessage, PaymentStatus } from './types';

interface FlexMessageProps {
  msg: LineMessage;
  activeRole: string;
  paymentStatus: PaymentStatus;
  selectedTotal: number;
  onOpenBilling: () => void;
  onOpenContracts: () => void;
  onApproveSlip: () => void;
}

export default function FlexMessage({ msg, activeRole, paymentStatus, selectedTotal, onOpenBilling, onOpenContracts, onApproveSlip }: FlexMessageProps) {
  const headerLabel: string = {
    bill: 'บิลเรียกเก็บเงินใหม่',
    slip: 'หลักฐานการชำระเงิน',
    slip_notify: '🔔 แจ้งเตือน: สลิปรอตรวจสอบ',
    payment_approved: '🎉 การชำระเงินได้รับการอนุมัติ',
    booking_payment: 'บิลมัดจำการจองห้องพัก',
    contract_expiry: 'แจ้งเตือนสัญญาใกล้หมด',
    appointment_confirmed: 'ยืนยันการนัดหมาย',
    qr_payment: 'สแกน QR ชำระเงิน',
    contract_sign: 'แจ้งเตือนทำสัญญาเช่า',
  }[msg.flexType ?? 'bill'] ?? 'แจ้งเตือน';

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden w-64 text-gray-800">
      <div className={`p-3 text-white ${
        msg.flexType === 'slip_notify' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
        msg.flexType === 'payment_approved' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
        'bg-gradient-to-r from-emerald-500 to-[#06c755]'
      }`}>
        <h4 className="font-black text-xs flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" />
          {headerLabel}
        </h4>
      </div>

      <div className="p-3.5 space-y-2.5 text-xs">
        {msg.flexType === 'bill' && (
          <>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-gray-400 font-bold">ห้องพัก</span>
              <span className="font-black text-gray-900">{msg.flexData?.room}</span>
            </div>
            <div className="space-y-1 text-gray-600 font-semibold">
              {['rent','water','electric'].map(k => msg.flexData?.[k] > 0 && (
                <div key={k} className="flex justify-between">
                  <span>{k === 'rent' ? 'ค่าห้อง' : k === 'water' ? 'ค่าน้ำ' : 'ค่าไฟ'}:</span>
                  <span>฿{msg.flexData[k].toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t pt-2 font-black text-sm text-green-700">
              <span>ยอดรวม:</span><span>฿{msg.flexData?.total?.toLocaleString()}</span>
            </div>
            <Button onClick={onOpenBilling} className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-black text-[10px] h-8 rounded-lg">
              👁️ เปิดบิลและชำระเงิน
            </Button>
          </>
        )}

        {msg.flexType === 'slip' && (
          <>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-gray-400 font-bold">จำนวนโอน</span>
              <span className="font-black text-emerald-600 text-sm">฿{msg.flexData?.amount?.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-gray-500 font-medium">
              <span className="font-bold text-gray-700 block">รายการ:</span>{msg.flexData?.items}
            </div>
            {/* CSS-based KBank e-Slip Mockup Card */}
            <div className="mt-2 rounded-xl border border-gray-200 bg-slate-50 p-3 shadow-sm space-y-2 text-[10px] w-full">
              <div className="flex justify-between items-center border-b border-gray-250 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-4.5 h-4.5 bg-[#00A950] rounded-full flex items-center justify-center text-white font-black text-[9px] px-1">K</div>
                  <span className="font-black text-gray-900 text-[9px]">K-Plus e-Slip</span>
                </div>
                <span className="text-[8px] text-[#00A950] font-black bg-emerald-50 px-1 py-0.5 rounded">สำเร็จ</span>
              </div>
              <div className="space-y-1 font-bold text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">จาก:</span>
                  <span className="text-gray-900">คุณผู้เช่า (Tenant)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ไปยัง:</span>
                  <span className="text-gray-900">โครงการ RentFlow</span>
                </div>
                <div className="border-t border-dashed pt-1.5 mt-1.5 flex justify-between items-center">
                  <span className="text-gray-400">ยอดเงิน:</span>
                  <span className="text-xs font-black text-[#00A950]">฿{msg.flexData?.amount?.toLocaleString()}.00</span>
                </div>
              </div>
            </div>
            {(activeRole === 'owner' || activeRole === 'agent') && paymentStatus === 'pending_verification' && (
              <Button onClick={onApproveSlip} className="w-full bg-[#06c755] hover:bg-[#05b34c] text-white font-black text-[10px] h-8 rounded-lg mt-2">
                ✅ อนุมัติยอดเงินเข้า
              </Button>
            )}
          </>
        )}

        {/* slip_notify: Flex แจ้งเจ้าของ/เอเจนต์ว่ามีสลิปรอตรวจ */}
        {msg.flexType === 'slip_notify' && (
          <>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-gray-400 font-bold">ห้อง</span>
              <span className="font-black text-gray-900">{msg.flexData?.room}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-gray-400 font-bold">ยอดชำระ</span>
              <span className="font-black text-amber-600 text-sm">฿{msg.flexData?.amount?.toLocaleString()}</span>
            </div>
            <div className="text-[10px] text-gray-500 font-medium pb-1.5">
              <span className="font-bold text-gray-700 block">รายการ:</span>{msg.flexData?.items}
            </div>
            {/* CSS-based KBank e-Slip Mockup Card */}
            <div className="mt-1 mb-2 rounded-xl border border-gray-200 bg-slate-50 p-3 shadow-sm space-y-2 text-[10px] w-full">
              <div className="flex justify-between items-center border-b border-gray-250 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-4.5 h-4.5 bg-[#00A950] rounded-full flex items-center justify-center text-white font-black text-[9px] px-1">K</div>
                  <span className="font-black text-gray-900 text-[9px]">K-Plus e-Slip</span>
                </div>
                <span className="text-[8px] text-[#00A950] font-black bg-emerald-50 px-1 py-0.5 rounded">สำเร็จ</span>
              </div>
              <div className="space-y-1 font-bold text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">จาก:</span>
                  <span className="text-gray-900">คุณผู้เช่า (Tenant)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ไปยัง:</span>
                  <span className="text-gray-900">โครงการ RentFlow</span>
                </div>
                <div className="border-t border-dashed pt-1.5 mt-1.5 flex justify-between items-center">
                  <span className="text-gray-400">ยอดเงิน:</span>
                  <span className="text-xs font-black text-[#00A950]">฿{msg.flexData?.amount?.toLocaleString()}.00</span>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[10px] text-amber-700 font-bold text-center">
              🔔 รอการตรวจสอบและอนุมัติ
            </div>
            {(activeRole === 'owner' || activeRole === 'agent') && paymentStatus === 'pending_verification' && (
              <Button onClick={onApproveSlip} className="w-full bg-[#06c755] hover:bg-[#05b34c] text-white font-black text-[10px] h-8 rounded-lg mt-2">
                ✅ อนุมัติยอดชำระ
              </Button>
            )}
          </>
        )}

        {msg.flexType === 'booking_payment' && (
          <>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-gray-400 font-bold">ห้องพัก</span>
              <span className="font-black text-gray-900 truncate max-w-[130px]">{msg.flexData?.room}</span>
            </div>
            <div className="text-[10px] text-gray-500 font-semibold text-center py-1">ใบแจ้งยอดมัดจำการจองห้องพัก เพื่อรักษาสิทธิ์</div>
            <div className="flex justify-between border-t pt-2 font-black text-sm text-primary">
              <span>ยอดมัดจำ:</span><span>฿{msg.flexData?.amount?.toLocaleString()}</span>
            </div>
            <Button onClick={onOpenBilling} className="w-full bg-[#06c755] hover:bg-[#05b34c] text-white font-black text-[10px] h-8 rounded-lg mt-2">
              💳 อัปโหลดสลิปชำระมัดจำ
            </Button>
          </>
        )}

        {msg.flexType === 'contract_expiry' && (
          <>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-gray-400 font-bold">ห้องพัก</span>
              <span className="font-black text-gray-900">{msg.flexData?.room}</span>
            </div>
            <div className="text-[10px] text-gray-500 font-semibold text-center py-1">
              สัญญาสิ้นสุดวันที่ <span className="text-red-500 font-black">{msg.flexData?.expiryDate}</span>
            </div>
            <Button onClick={onOpenContracts} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] h-8 rounded-lg mt-1">
              📝 ตรวจสอบ / ต่อสัญญา
            </Button>
          </>
        )}

        {msg.flexType === 'appointment_confirmed' && (
          <>
            <div className="space-y-1.5 font-bold text-gray-700">
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-400">📅 วันเวลา:</span>
                <span className="text-gray-900 font-black">{msg.flexData?.dateTime}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-400">📍 สถานที่:</span>
                <a href={msg.flexData?.mapLink} target="_blank" rel="noreferrer" className="text-blue-600 underline font-black truncate max-w-[120px]">
                  {msg.flexData?.location}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">✨ Agent:</span>
                <span className="text-gray-900 font-black">{msg.flexData?.agentName}</span>
              </div>
            </div>
            <div className="flex gap-1.5 mt-2">
              <Button onClick={() => toast({ title: '⏰ แจ้งเตือนล่วงหน้า 24 ชม.', description: 'เปิดระบบตั้งแจ้งเตือนเรียบร้อยแล้ว' })}
                variant="outline" className="flex-1 text-[8px] font-black h-7">เตือน 24 ชม.</Button>
              <Button onClick={() => toast({ title: '⏰ แจ้งเตือนล่วงหน้า 1 ชม.', description: 'เปิดระบบตั้งแจ้งเตือนเรียบร้อยแล้ว' })}
                variant="outline" className="flex-1 text-[8px] font-black h-7">เตือน 1 ชม.</Button>
            </div>
          </>
        )}

        {/* payment_approved: Flex แจ้งกลับผู้เช่าว่าการชำระเงินสำเร็จ */}
        {msg.flexType === 'payment_approved' && (
          <>
            <div className="flex flex-col items-center py-2 gap-1.5">
              <span className="text-3xl">🎉</span>
              <p className="font-black text-sm text-emerald-700">ชำระเงินสำเร็จ!</p>
              <p className="text-[10px] text-gray-500 font-bold">ยอด ฿{msg.flexData?.amount?.toLocaleString()} ได้รับการยืนยันแล้ว</p>
            </div>
            <div className="flex justify-between border-t pt-1.5">
              <span className="text-gray-400 font-bold text-[10px]">ห้อง</span>
              <span className="font-black text-gray-900 text-[10px]">{msg.flexData?.room}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-[10px] text-emerald-700 font-bold text-center">
              ✅ อนุมัติโดยเจ้าของห้องแล้ว
            </div>
          </>
        )}

        {msg.flexType === 'qr_payment' && (
          <>
            <div className="flex flex-col items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {/* PromptPay Header Banner */}
              <div className="w-full bg-[#0a1e3f] text-white py-1.5 px-3 flex justify-between items-center text-[9px] font-black tracking-wider uppercase">
                <span>Prompt Pay</span>
                <span className="text-[7px] opacity-75">Thai QR Payment</span>
              </div>
              <div className="p-4 bg-white flex flex-col items-center gap-1.5 w-full">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://primerent.flow/pay/${msg.flexData?.amount || 0}`} 
                  alt="PromptPay QR Code" 
                  className="w-32 h-32 object-contain"
                />
                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">สแกนเพื่อชำระเงิน</span>
              </div>
            </div>
            <div className="flex justify-between font-black text-xs pt-1.5">
              <span>ยอดเงิน:</span><span className="text-[#06c755]">฿{msg.flexData?.amount?.toLocaleString()}</span>
            </div>
            <Button onClick={onApproveSlip} className="w-full bg-[#06c755] hover:bg-[#05b34c] text-white font-black text-[10px] h-8 rounded-lg mt-2">
              Confirm Payment (Webhook)
            </Button>
          </>
        )}

        {msg.flexType === 'contract_sign' && (
          <>
            <div className="text-[10px] text-gray-500 font-bold text-center leading-relaxed">
              สัญญาร่างเสร็จสมบูรณ์แล้ว<br />กรุณาเซ็นชื่ออิเล็กทรอนิกส์เพื่อเริ่มสัญญาเช่า
            </div>
            <Button onClick={onOpenContracts} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] h-8 rounded-lg mt-1.5">
              ✍️ กดเซ็นสัญญา e-Sign ได้ทันที
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
