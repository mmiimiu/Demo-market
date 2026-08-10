'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Send, Zap, Droplets, Home, DollarSign } from 'lucide-react';
import { Language } from '@/lib/types';
import { MonthlyBill, MonthlyBillItem, calcBillTotal } from '@/lib/types/payment';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  contractId: string;
  propertyId: string;
  ownerId: string;
  tenantId: string;
  tenantName: string;
  baseRent: number;
  hasUtilities: boolean; // owner-configured: does this room include utilities?
  lang: Language;
  onBillCreated?: (bill: MonthlyBill) => void;
}

export function IssueBillModal({
  open, onClose, contractId, propertyId, ownerId, tenantId, tenantName, baseRent, hasUtilities, lang, onBillCreated,
}: Props) {
  const isTh = lang === 'th';
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [month, setMonth] = useState(defaultMonth);
  const [dueDate, setDueDate] = useState(() => { const d = new Date(now.getFullYear(), now.getMonth(), 25); return d.toISOString().slice(0, 10); });
  
  // Utilities toggles
  const [includeWater, setIncludeWater] = useState(hasUtilities);
  const [includeElec, setIncludeElec] = useState(hasUtilities);
  const [includeCommon, setIncludeCommon] = useState(false);

  // Values
  const [waterUnit, setWaterUnit] = useState('');
  const [waterRate, setWaterRate] = useState('18');
  const [elecUnit, setElecUnit] = useState('');
  const [elecRate, setElecRate] = useState('7');
  const [commonFee, setCommonFee] = useState('');

  const waterAmt = includeWater ? (Number(waterUnit) * Number(waterRate)) : 0;
  const elecAmt = includeElec ? (Number(elecUnit) * Number(elecRate)) : 0;
  const commonAmt = includeCommon ? Number(commonFee) : 0;
  const total = baseRent + waterAmt + elecAmt + commonAmt;

  const handleIssue = () => {
    const items: MonthlyBillItem[] = [
      { type: 'rent', label: isTh ? 'ค่าเช่า' : 'Rent', amount: baseRent },
      ...(includeWater && waterUnit ? [{ type: 'water' as const, label: isTh ? 'ค่าน้ำ' : 'Water', amount: waterAmt, unit: Number(waterUnit), ratePerUnit: Number(waterRate) }] : []),
      ...(includeElec && elecUnit ? [{ type: 'electric' as const, label: isTh ? 'ค่าไฟ' : 'Electricity', amount: elecAmt, unit: Number(elecUnit), ratePerUnit: Number(elecRate) }] : []),
      ...(includeCommon && commonFee ? [{ type: 'common_fee' as const, label: isTh ? 'ค่าส่วนกลาง' : 'Common Fee', amount: commonAmt }] : []),
    ];
    const bill: MonthlyBill = {
      id: `bill_${Date.now()}`,
      contractId, propertyId, ownerId, tenantId,
      month, dueDate,
      items, totalAmount: calcBillTotal(items),
      hasUtilities: includeWater || includeElec,
      status: 'sent',
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      const stored = JSON.parse(localStorage.getItem('primerent_bills') || '[]');
      stored.push(bill);
      localStorage.setItem('primerent_bills', JSON.stringify(stored));
    } catch {}
    toast({ title: isTh ? 'ส่งบิลสำเร็จ' : 'Bill Issued', description: `${tenantName} — ฿${bill.totalAmount.toLocaleString()}` });
    onBillCreated?.(bill);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl font-thai">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            {isTh ? `ออกบิลประจำเดือน — ${tenantName}` : `Issue Monthly Bill — ${tenantName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Month + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-black text-xs">{isTh ? 'รอบบิล (เดือน)' : 'Billing Month'}</Label>
              <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="rounded-xl h-10 font-bold" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-black text-xs">{isTh ? 'วันครบกำหนด' : 'Due Date'}</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="rounded-xl h-10 font-bold" />
            </div>
          </div>

          {/* Base Rent */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              <p className="font-black text-gray-900">{isTh ? 'ค่าเช่า (คงที่)' : 'Base Rent (Fixed)'}</p>
            </div>
            <p className="font-black text-primary text-lg">฿{baseRent.toLocaleString()}</p>
          </div>

          {/* Utilities Section */}
          <div className="space-y-3">
            <h4 className="font-black text-sm text-gray-700">{isTh ? '⚙️ รายการสาธารณูปโภค (เลือกได้)' : '⚙️ Utilities (Optional)'}</h4>

            {/* Water */}
            <div className={`border rounded-xl p-4 space-y-3 transition-colors ${includeWater ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <Label className="font-black text-sm cursor-pointer" onClick={() => setIncludeWater(v => !v)}>{isTh ? 'ค่าน้ำ' : 'Water'}</Label>
                </div>
                <button onClick={() => setIncludeWater(v => !v)} className={`w-10 h-5 rounded-full transition-colors ${includeWater ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${includeWater ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {includeWater && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-gray-500">{isTh ? 'หน่วยที่ใช้' : 'Units Used'}</Label>
                    <Input type="number" value={waterUnit} onChange={e => setWaterUnit(e.target.value)} placeholder="0" className="rounded-xl h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-gray-500">{isTh ? 'ราคา/หน่วย (฿)' : 'Rate/Unit (฿)'}</Label>
                    <Input type="number" value={waterRate} onChange={e => setWaterRate(e.target.value)} className="rounded-xl h-9 text-sm" />
                  </div>
                  {waterUnit && <p className="col-span-2 text-xs font-black text-blue-700 text-right">= ฿{waterAmt.toLocaleString()}</p>}
                </div>
              )}
            </div>

            {/* Electricity */}
            <div className={`border rounded-xl p-4 space-y-3 transition-colors ${includeElec ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <Label className="font-black text-sm cursor-pointer" onClick={() => setIncludeElec(v => !v)}>{isTh ? 'ค่าไฟ' : 'Electricity'}</Label>
                </div>
                <button onClick={() => setIncludeElec(v => !v)} className={`w-10 h-5 rounded-full transition-colors ${includeElec ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${includeElec ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {includeElec && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-gray-500">{isTh ? 'หน่วยที่ใช้ (kWh)' : 'Units Used (kWh)'}</Label>
                    <Input type="number" value={elecUnit} onChange={e => setElecUnit(e.target.value)} placeholder="0" className="rounded-xl h-9 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-gray-500">{isTh ? 'ราคา/หน่วย (฿)' : 'Rate/Unit (฿)'}</Label>
                    <Input type="number" value={elecRate} onChange={e => setElecRate(e.target.value)} className="rounded-xl h-9 text-sm" />
                  </div>
                  {elecUnit && <p className="col-span-2 text-xs font-black text-yellow-700 text-right">= ฿{elecAmt.toLocaleString()}</p>}
                </div>
              )}
            </div>

            {/* Common Fee */}
            <div className={`border rounded-xl p-4 space-y-3 transition-colors ${includeCommon ? 'border-gray-300 bg-gray-50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <Label className="font-black text-sm cursor-pointer" onClick={() => setIncludeCommon(v => !v)}>{isTh ? 'ค่าส่วนกลาง' : 'Common Fee'}</Label>
                </div>
                <button onClick={() => setIncludeCommon(v => !v)} className={`w-10 h-5 rounded-full transition-colors ${includeCommon ? 'bg-gray-600' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${includeCommon ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {includeCommon && (
                <Input type="number" value={commonFee} onChange={e => setCommonFee(e.target.value)} placeholder="0" className="rounded-xl h-9 text-sm" />
              )}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between">
            <p className="font-black text-white">{isTh ? 'ยอดรวมสุทธิ' : 'Total Amount'}</p>
            <p className="text-2xl font-black text-green-400">฿{total.toLocaleString()}</p>
          </div>

          <Button onClick={handleIssue} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black gap-2">
            <Send className="w-4 h-4" />{isTh ? 'ส่งบิลให้ผู้เช่า' : 'Send Bill to Tenant'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
