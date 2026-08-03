'use client';

import React, { useState } from 'react';
import {
  ArrowLeft, Save, Plus, Trash2, Building2, User, Users,
  CalendarDays, FileText, ChevronDown, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Language } from '@/lib/types';
import type { ContractDraft } from './ContractDraftManager';

interface ContractDraftFormProps {
  lang: Language;
  currentRole: 'owner' | 'agent' | 'landlord';
  initialDraft: ContractDraft | null;
  onSave: (draft: ContractDraft) => void;
  onCancel: () => void;
}

const CONTRACT_TYPES = [
  { value: 'monthly',    labelTh: 'รายเดือน (ระยะ 1 ปี มาตรฐาน)',   labelEn: 'Monthly (Standard 12-month)' },
  { value: 'annual',     labelTh: 'รายปี (พร้อมข้อกำหนดปรับค่าเช่า)', labelEn: 'Annual (with increment clause)' },
  { value: 'short_term', labelTh: 'ระยะสั้น (รายสัปดาห์/รายวัน)',     labelEn: 'Short-term (Weekly/Daily)' },
] as const;

const DEFAULT_INVENTORY = [
  { item: 'เครื่องปรับอากาศ (Air Conditioner)', value: '15000' },
  { item: 'โทรทัศน์ (Television)', value: '10000' },
  { item: 'ตู้เย็น (Refrigerator)', value: '8000' },
  { item: 'เครื่องซักผ้า (Washing Machine)', value: '12000' },
  { item: 'เตียงและที่นอน (Bed & Mattress)', value: '15000' },
  { item: 'ตู้เสื้อผ้า (Wardrobe)', value: '10000' },
];

function buildEmptyDraft(): ContractDraft {
  const now = new Date();
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 1);
  return {
    id: `draft_${Date.now()}`,
    draftName: '',
    propertyName: '',
    propertyAddress: '',
    landlordName: '',
    landlordId: '',
    tenantName: '',
    tenantId: '',
    agentName: '',
    monthlyRent: 0,
    depositAmount: 0,
    advanceRentAmount: 0,
    startDate: now.toISOString().substring(0, 10),
    endDate: end.toISOString().substring(0, 10),
    contractType: 'monthly',
    specialTerms: '',
    includeInventory: true,
    inventoryItems: DEFAULT_INVENTORY,
    status: 'draft',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
          {icon}
        </div>
        <h4 className="font-black text-sm text-gray-800">{title}</h4>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-black text-gray-700">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 font-semibold">{hint}</p>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ContractDraftForm({ lang, currentRole, initialDraft, onSave, onCancel }: ContractDraftFormProps) {
  const isTh = lang === 'th';
  const [form, setForm] = useState<ContractDraft>(initialDraft ?? buildEmptyDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof ContractDraft>(key: K, val: ContractDraft[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  // Auto-calculate deposit when rent changes
  const handleRentChange = (val: string) => {
    const rent = Number(val) || 0;
    set('monthlyRent', rent);
    if (form.depositAmount === 0 || form.depositAmount === form.monthlyRent * 2) {
      set('depositAmount', rent * 2);
    }
    if (form.advanceRentAmount === 0 || form.advanceRentAmount === form.monthlyRent) {
      set('advanceRentAmount', rent);
    }
  };

  // Inventory operations
  const addInventoryItem = () => {
    set('inventoryItems', [...form.inventoryItems, { item: '', value: '' }]);
  };

  const removeInventoryItem = (i: number) => {
    set('inventoryItems', form.inventoryItems.filter((_, idx) => idx !== i));
  };

  const updateInventoryItem = (i: number, field: 'item' | 'value', val: string) => {
    const updated = form.inventoryItems.map((it, idx) => idx === i ? { ...it, [field]: val } : it);
    set('inventoryItems', updated);
  };

  // Validate
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.draftName.trim()) errs.draftName = isTh ? 'กรุณาระบุชื่อร่าง' : 'Draft name is required';
    if (!form.propertyName.trim()) errs.propertyName = isTh ? 'กรุณาระบุชื่อทรัพย์สิน' : 'Property name is required';
    if (!form.landlordName.trim()) errs.landlordName = isTh ? 'กรุณาระบุชื่อเจ้าของ' : 'Landlord name is required';
    if (!form.tenantName.trim()) errs.tenantName = isTh ? 'กรุณาระบุชื่อผู้เช่า' : 'Tenant name is required';
    if (!form.monthlyRent || form.monthlyRent <= 0) errs.monthlyRent = isTh ? 'กรุณาระบุค่าเช่า' : 'Monthly rent is required';
    if (!form.startDate) errs.startDate = isTh ? 'กรุณาระบุวันเริ่มสัญญา' : 'Start date is required';
    if (!form.endDate) errs.endDate = isTh ? 'กรุณาระบุวันสิ้นสุดสัญญา' : 'End date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
  };

  return (
    <div className="space-y-5">
      {/* ── Back Header ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm font-black text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isTh ? 'กลับ' : 'Back'}
        </button>
        <h3 className="text-base font-black text-gray-900">
          {initialDraft ? (isTh ? 'แก้ไขร่างสัญญา' : 'Edit Draft') : (isTh ? 'สร้างร่างสัญญาใหม่' : 'New Contract Draft')}
        </h3>
        <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 font-black text-xs gap-2 rounded-xl">
          <Save className="w-3.5 h-3.5" />
          {isTh ? 'บันทึกร่าง' : 'Save Draft'}
        </Button>
      </div>

      {/* ── Section 1: Draft Name ── */}
      <Section title={isTh ? 'ชื่อร่างสัญญา' : 'Draft Name'} icon={<FileText className="w-3.5 h-3.5" />}>
        <Field
          label={isTh ? 'ชื่อร่างสัญญา (ใช้อ้างอิงภายใน)' : 'Draft Name (Internal reference)'}
          hint={isTh ? 'ตัวอย่าง: ร่างสัญญา - ห้อง 1204 สุขุมวิท (นายสมชาย)' : 'e.g. Draft - Room 1204 Sukhumvit (Mr. John)'}
        >
          <Input
            value={form.draftName}
            onChange={e => set('draftName', e.target.value)}
            placeholder={isTh ? 'ระบุชื่อร่างสัญญา...' : 'Enter draft name...'}
            className={`font-semibold text-sm ${errors.draftName ? 'border-red-300' : ''}`}
          />
          {errors.draftName && <p className="text-[11px] text-red-500 font-bold">{errors.draftName}</p>}
        </Field>

        <div className="grid grid-cols-3 gap-3">
          {CONTRACT_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => set('contractType', t.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                form.contractType === t.value
                  ? 'border-violet-300 bg-violet-50 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <p className={`text-[11px] font-black ${form.contractType === t.value ? 'text-violet-700' : 'text-gray-700'}`}>
                {isTh ? t.labelTh : t.labelEn}
              </p>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Section 2: Property ── */}
      <Section title={isTh ? 'ข้อมูลทรัพย์สิน' : 'Property Information'} icon={<Building2 className="w-3.5 h-3.5" />}>
        <Field label={isTh ? 'ชื่อทรัพย์สิน / ห้อง' : 'Property / Room Name'}>
          <Input
            value={form.propertyName}
            onChange={e => set('propertyName', e.target.value)}
            placeholder={isTh ? 'เช่น คอนโดสุขุมวิท 101 ชั้น 12 ห้อง 1204' : 'e.g. Sukhumvit 101 Condo Floor 12, Room 1204'}
            className={`font-semibold text-sm ${errors.propertyName ? 'border-red-300' : ''}`}
          />
          {errors.propertyName && <p className="text-[11px] text-red-500 font-bold">{errors.propertyName}</p>}
        </Field>
        <Field label={isTh ? 'ที่อยู่ทรัพย์สิน' : 'Property Address'}>
          <Input
            value={form.propertyAddress}
            onChange={e => set('propertyAddress', e.target.value)}
            placeholder={isTh ? 'เลขที่ ถนน แขวง เขต จังหวัด รหัสไปรษณีย์' : 'Street address, district, city, zip code'}
            className="font-semibold text-sm"
          />
        </Field>
      </Section>

      {/* ── Section 3: Parties ── */}
      <Section title={isTh ? 'คู่สัญญา' : 'Contracting Parties'} icon={<Users className="w-3.5 h-3.5" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={isTh ? 'ชื่อเจ้าของ/ผู้ให้เช่า (ผู้เช่าช่วง)' : 'Landlord / Lessor Name'}>
            <Input
              value={form.landlordName}
              onChange={e => set('landlordName', e.target.value)}
              placeholder={isTh ? 'ชื่อ-นามสกุล เจ้าของ' : "Landlord's full name"}
              className={`font-semibold text-sm ${errors.landlordName ? 'border-red-300' : ''}`}
            />
            {errors.landlordName && <p className="text-[11px] text-red-500 font-bold">{errors.landlordName}</p>}
          </Field>
          <Field label={isTh ? 'ชื่อผู้เช่า (ผู้ทำสัญญา)' : 'Tenant / Lessee Name'}>
            <Input
              value={form.tenantName}
              onChange={e => set('tenantName', e.target.value)}
              placeholder={isTh ? 'ชื่อ-นามสกุล ผู้เช่า' : "Tenant's full name"}
              className={`font-semibold text-sm ${errors.tenantName ? 'border-red-300' : ''}`}
            />
            {errors.tenantName && <p className="text-[11px] text-red-500 font-bold">{errors.tenantName}</p>}
          </Field>
        </div>
        {currentRole === 'agent' && (
          <Field label={isTh ? 'ชื่อตัวแทน/นายหน้า (ถ้ามี)' : 'Agent Name (if applicable)'}>
            <Input
              value={form.agentName || ''}
              onChange={e => set('agentName', e.target.value)}
              placeholder={isTh ? 'ชื่อตัวแทน หรือชื่อบริษัท' : 'Agent or company name'}
              className="font-semibold text-sm"
            />
          </Field>
        )}
      </Section>

      {/* ── Section 4: Financial Terms ── */}
      <Section title={isTh ? 'เงื่อนไขทางการเงิน' : 'Financial Terms'} icon={<FileText className="w-3.5 h-3.5" />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label={isTh ? 'ค่าเช่า/เดือน (บาท)' : 'Monthly Rent (THB)'}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">฿</span>
              <Input
                type="number"
                value={form.monthlyRent || ''}
                onChange={e => handleRentChange(e.target.value)}
                placeholder="0"
                className={`pl-7 font-bold text-sm ${errors.monthlyRent ? 'border-red-300' : ''}`}
              />
            </div>
            {errors.monthlyRent && <p className="text-[11px] text-red-500 font-bold">{errors.monthlyRent}</p>}
          </Field>
          <Field label={isTh ? 'เงินมัดจำ (บาท)' : 'Security Deposit (THB)'} hint={isTh ? 'ปกติ 2 เดือน' : 'Usually 2 months'}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">฿</span>
              <Input
                type="number"
                value={form.depositAmount || ''}
                onChange={e => set('depositAmount', Number(e.target.value))}
                placeholder="0"
                className="pl-7 font-bold text-sm"
              />
            </div>
          </Field>
          <Field label={isTh ? 'ค่าเช่าล่วงหน้า (บาท)' : 'Advance Rent (THB)'} hint={isTh ? 'ปกติ 1 เดือน' : 'Usually 1 month'}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">฿</span>
              <Input
                type="number"
                value={form.advanceRentAmount || ''}
                onChange={e => set('advanceRentAmount', Number(e.target.value))}
                placeholder="0"
                className="pl-7 font-bold text-sm"
              />
            </div>
          </Field>
        </div>

        {/* Total summary */}
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-3.5 flex items-center justify-between">
          <span className="text-xs font-black text-violet-700">
            {isTh ? 'ยอดรวมชำระวันแรก (มัดจำ + ล่วงหน้า)' : 'Total First Payment (Deposit + Advance)'}
          </span>
          <span className="text-base font-black text-violet-900">
            ฿{(form.depositAmount + form.advanceRentAmount).toLocaleString()}
          </span>
        </div>
      </Section>

      {/* ── Section 5: Duration ── */}
      <Section title={isTh ? 'ระยะเวลาสัญญา' : 'Contract Duration'} icon={<CalendarDays className="w-3.5 h-3.5" />}>
        <div className="grid grid-cols-2 gap-4">
          <Field label={isTh ? 'วันเริ่มสัญญา' : 'Start Date'}>
            <Input
              type="date"
              value={form.startDate}
              onChange={e => set('startDate', e.target.value)}
              className={`font-semibold text-sm ${errors.startDate ? 'border-red-300' : ''}`}
            />
          </Field>
          <Field label={isTh ? 'วันสิ้นสุดสัญญา' : 'End Date'}>
            <Input
              type="date"
              value={form.endDate}
              onChange={e => set('endDate', e.target.value)}
              className={`font-semibold text-sm ${errors.endDate ? 'border-red-300' : ''}`}
            />
          </Field>
        </div>
      </Section>

      {/* ── Section 6: Special Terms ── */}
      <Section title={isTh ? 'ข้อกำหนดพิเศษ' : 'Special Terms & Conditions'} icon={<Info className="w-3.5 h-3.5" />}>
        <Field
          label={isTh ? 'ข้อกำหนดพิเศษเพิ่มเติม' : 'Additional Special Conditions'}
          hint={isTh ? 'เช่น ห้ามเลี้ยงสัตว์ ห้ามสูบบุหรี่ ผู้เช่ารับผิดชอบค่าน้ำค่าไฟ ฯลฯ' : 'e.g. No pets, No smoking, Tenant pays utilities, etc.'}
        >
          <textarea
            value={form.specialTerms}
            onChange={e => set('specialTerms', e.target.value)}
            rows={3}
            placeholder={isTh ? 'ระบุเงื่อนไขพิเศษที่ต้องการ...' : 'Enter special conditions...'}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
          />
        </Field>
      </Section>

      {/* ── Section 7: Inventory ── */}
      <Section title={isTh ? 'รายการทรัพย์สินและเฟอร์นิเจอร์ (เอกสารแนบ)' : 'Inventory List (Attachment)'} icon={<FileText className="w-3.5 h-3.5" />}>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div
            onClick={() => set('includeInventory', !form.includeInventory)}
            className={`w-10 h-5 rounded-full transition-colors relative ${form.includeInventory ? 'bg-violet-500' : 'bg-gray-200'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow ${form.includeInventory ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-black text-gray-700">
            {isTh ? 'แนบรายการเฟอร์นิเจอร์และประเมินค่าเสียหาย' : 'Include furniture inventory & damage assessment'}
          </span>
        </label>

        {form.includeInventory && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500">
                {isTh ? `รายการทั้งหมด ${form.inventoryItems.length} รายการ` : `${form.inventoryItems.length} items total`}
              </p>
              <Button
                onClick={addInventoryItem}
                variant="outline"
                size="sm"
                className="font-black text-[10px] gap-1 h-7 rounded-lg"
              >
                <Plus className="w-3 h-3" />
                {isTh ? 'เพิ่มรายการ' : 'Add Item'}
              </Button>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_120px_32px] gap-2 px-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{isTh ? 'รายการ' : 'Item'}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{isTh ? 'มูลค่า (บาท)' : 'Value (THB)'}</p>
                <span />
              </div>
              {form.inventoryItems.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_120px_32px] gap-2 items-center">
                  <Input
                    value={it.item}
                    onChange={e => updateInventoryItem(i, 'item', e.target.value)}
                    placeholder={isTh ? 'ชื่อสิ่งของ...' : 'Item name...'}
                    className="h-8 text-xs font-semibold"
                  />
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">฿</span>
                    <Input
                      type="number"
                      value={it.value}
                      onChange={e => updateInventoryItem(i, 'value', e.target.value)}
                      placeholder="0"
                      className="h-8 text-xs font-bold pl-5"
                    />
                  </div>
                  <button
                    onClick={() => removeInventoryItem(i)}
                    className="w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Total inventory value */}
              {form.inventoryItems.length > 0 && (
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <span className="text-xs font-black text-gray-700">
                    {isTh ? 'มูลค่ารวม: ' : 'Total value: '}
                    <span className="text-violet-700">
                      ฿{form.inventoryItems.reduce((s, it) => s + (Number(it.value) || 0), 0).toLocaleString()}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* ── Action Buttons ── */}
      <div className="flex gap-3 pb-4">
        <Button onClick={onCancel} variant="outline" className="flex-1 font-black text-sm rounded-xl h-11">
          {isTh ? 'ยกเลิก' : 'Cancel'}
        </Button>
        <Button onClick={handleSave} className="flex-1 bg-violet-600 hover:bg-violet-700 font-black text-sm rounded-xl h-11 gap-2">
          <Save className="w-4 h-4" />
          {isTh ? 'บันทึกร่างสัญญา' : 'Save Draft'}
        </Button>
      </div>
    </div>
  );
}
