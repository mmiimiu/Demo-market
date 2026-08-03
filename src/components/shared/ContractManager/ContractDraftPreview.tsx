'use client';

import React from 'react';
import {
  ArrowLeft, Edit3, Send, Download, Building2, User, Users,
  CalendarDays, FileText, CheckCircle2, Scale, AlertCircle,
  Stamp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Language } from '@/lib/types';
import type { ContractDraft } from './ContractDraftManager';

interface ContractDraftPreviewProps {
  lang: Language;
  draft: ContractDraft;
  onBack: () => void;
  onEdit: () => void;
  onSend: () => void;
}

function formatDate(iso: string, lang: Language) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-black text-gray-500 shrink-0 w-2/5">{label}</span>
      <span className="text-xs font-bold text-gray-900 text-right flex-1">{value}</span>
    </div>
  );
}

export function ContractDraftPreview({ lang, draft, onBack, onEdit, onSend }: ContractDraftPreviewProps) {
  const isTh = lang === 'th';

  const typeLabel: Record<string, string> = {
    monthly:    isTh ? 'รายเดือน' : 'Monthly',
    annual:     isTh ? 'รายปี'     : 'Annual',
    short_term: isTh ? 'ระยะสั้น'  : 'Short-term',
  };

  const totalInventory = draft.inventoryItems.reduce((s, it) => s + (Number(it.value) || 0), 0);

  return (
    <div className="space-y-5">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-black text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isTh ? 'กลับ' : 'Back'}
        </button>
        <div className="flex gap-2">
          {draft.status !== 'signed' && (
            <Button onClick={onEdit} variant="outline" size="sm" className="font-black text-xs gap-1.5 rounded-xl">
              <Edit3 className="w-3.5 h-3.5" />
              {isTh ? 'แก้ไข' : 'Edit'}
            </Button>
          )}
          {draft.status === 'draft' && (
            <Button onClick={onSend} className="bg-violet-600 hover:bg-violet-700 font-black text-xs gap-1.5 rounded-xl">
              <Send className="w-3.5 h-3.5" />
              {isTh ? 'ส่งให้ลงนาม' : 'Send for Signing'}
            </Button>
          )}
        </div>
      </div>

      {/* ── Document Paper ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Document Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 px-8 py-7 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">PrimeRent</p>
                  <p className="text-[11px] font-black text-white/80">{isTh ? 'เอกสารสัญญาเช่า — ฉบับร่าง' : 'Rental Agreement — DRAFT'}</p>
                </div>
              </div>
              <h2 className="text-xl font-black text-white leading-tight">{draft.propertyName}</h2>
              <p className="text-[12px] text-white/60 font-semibold mt-1">{draft.propertyAddress}</p>
            </div>
            <div className="text-right">
              <div className="bg-amber-400/20 border border-amber-400/30 rounded-xl px-3 py-1.5 mb-2">
                <p className="text-amber-300 font-black text-[10px] uppercase tracking-widest">{isTh ? 'ฉบับร่าง' : 'DRAFT'}</p>
              </div>
              <p className="text-[10px] text-white/50 font-semibold">{draft.id}</p>
              <p className="text-[10px] text-white/50 font-semibold">{typeLabel[draft.contractType]}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* ── Article 1: Parties ── */}
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-600">1</span>
              {isTh ? 'คู่สัญญา' : 'Contracting Parties'}
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-0 divide-y divide-gray-100">
              <Row label={isTh ? 'ผู้ให้เช่า (เจ้าของ)' : 'Lessor (Landlord)'} value={draft.landlordName} />
              <Row label={isTh ? 'ผู้เช่า (ผู้ทำสัญญา)' : 'Lessee (Tenant)'} value={draft.tenantName} />
              {draft.agentName && (
                <Row label={isTh ? 'ตัวแทน/นายหน้า' : 'Agent / Broker'} value={draft.agentName} />
              )}
            </div>
          </div>

          {/* ── Article 2: Terms ── */}
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-600">2</span>
              {isTh ? 'เงื่อนไขสัญญา' : 'Contract Terms'}
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 divide-y divide-gray-100">
              <Row label={isTh ? 'ประเภทสัญญา' : 'Contract Type'} value={typeLabel[draft.contractType]} />
              <Row label={isTh ? 'วันเริ่มสัญญา' : 'Start Date'} value={formatDate(draft.startDate, lang)} />
              <Row label={isTh ? 'วันสิ้นสุดสัญญา' : 'End Date'} value={formatDate(draft.endDate, lang)} />
            </div>
          </div>

          {/* ── Article 3: Financial ── */}
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-600">3</span>
              {isTh ? 'ค่าเช่าและเงินประกัน' : 'Rent & Deposit'}
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-violet-500 mb-1">{isTh ? 'ค่าเช่า/เดือน' : 'Monthly Rent'}</p>
                <p className="text-base font-black text-violet-800">฿{draft.monthlyRent.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-gray-500 mb-1">{isTh ? 'เงินมัดจำ' : 'Security Deposit'}</p>
                <p className="text-base font-black text-gray-800">฿{draft.depositAmount.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-gray-500 mb-1">{isTh ? 'ล่วงหน้า' : 'Advance Rent'}</p>
                <p className="text-base font-black text-gray-800">฿{draft.advanceRentAmount.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-black text-white/60">{isTh ? 'ยอดชำระวันแรก (มัดจำ + ล่วงหน้า)' : 'Total First Payment'}</span>
              <span className="text-base font-black text-white">฿{(draft.depositAmount + draft.advanceRentAmount).toLocaleString()}</span>
            </div>
          </div>

          {/* ── Article 4: Special Terms ── */}
          {draft.specialTerms && (
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-600">4</span>
                {isTh ? 'ข้อกำหนดพิเศษ' : 'Special Conditions'}
              </h3>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-900 leading-relaxed whitespace-pre-wrap">{draft.specialTerms}</p>
              </div>
            </div>
          )}

          {/* ── Article 5: Standard Terms ── */}
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-600">{draft.specialTerms ? '5' : '4'}</span>
              {isTh ? 'ข้อตกลงมาตรฐาน' : 'Standard Agreement Clauses'}
            </h3>
            <div className="space-y-2">
              {[
                isTh ? 'ผู้เช่าต้องชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน' : 'Rent must be paid by the 5th of each month',
                isTh ? 'ผู้เช่าต้องไม่ดัดแปลงโครงสร้างของทรัพย์สินโดยไม่ได้รับอนุญาต' : 'Tenant must not alter the property structure without permission',
                isTh ? 'เงินมัดจำจะคืนภายใน 30 วันหลังสิ้นสุดสัญญา หากไม่มีความเสียหาย' : 'Security deposit will be returned within 30 days after contract end, if no damages',
                isTh ? 'ผู้เช่าต้องแจ้งก่อนล่วงหน้า 30 วันหากต้องการบอกเลิกสัญญา' : 'Tenant must give 30 days advance notice to terminate the contract',
                isTh ? 'ค่าสาธารณูปโภคเป็นความรับผิดชอบของผู้เช่า ยกเว้นกรณีตกลงพิเศษ' : 'Utilities are the tenant\'s responsibility unless otherwise agreed',
              ].map((clause, i) => (
                <div key={i} className="flex items-start gap-2.5 text-[11px] text-gray-600 font-semibold">
                  <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-black text-gray-500 shrink-0 mt-0.5">{i + 1}</span>
                  {clause}
                </div>
              ))}
            </div>
          </div>

          {/* ── Article 6: Inventory (if included) ── */}
          {draft.includeInventory && draft.inventoryItems.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-600">A</span>
                {isTh ? 'เอกสารแนบ: รายการทรัพย์สินและเฟอร์นิเจอร์' : 'Attachment A: Inventory & Furniture List'}
              </h3>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-black text-gray-600">{isTh ? 'รายการ' : 'Item'}</th>
                      <th className="text-right px-4 py-2.5 font-black text-gray-600">{isTh ? 'มูลค่าประเมิน (บาท)' : 'Est. Value (THB)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {draft.inventoryItems.map((it, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2.5 font-semibold text-gray-700">{it.item}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-gray-900">฿{Number(it.value).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-100">
                    <tr>
                      <td className="px-4 py-2.5 font-black text-gray-700">{isTh ? 'มูลค่ารวม' : 'Total Value'}</td>
                      <td className="px-4 py-2.5 text-right font-black text-violet-700">฿{totalInventory.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ── Signature Blocks ── */}
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Stamp className="w-3.5 h-3.5 text-gray-500" />
              {isTh ? 'ลายเซ็นคู่สัญญา' : 'Signatures'}
            </h3>
            <div className={`grid gap-4 ${draft.agentName ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {[
                { role: isTh ? 'ผู้ให้เช่า' : 'Lessor', name: draft.landlordName },
                { role: isTh ? 'ผู้เช่า' : 'Lessee',  name: draft.tenantName },
                ...(draft.agentName ? [{ role: isTh ? 'ตัวแทน' : 'Agent', name: draft.agentName }] : []),
              ].map((party, i) => (
                <div key={i} className="text-center">
                  <div className="h-16 border-b-2 border-dashed border-gray-300 mb-2 flex items-end justify-center pb-1">
                    {draft.status === 'signed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <span className="text-[10px] text-gray-300 font-semibold">{isTh ? '(ลายเซ็น)' : '(Signature)'}</span>
                    )}
                  </div>
                  <p className="text-[10px] font-black text-gray-700">{party.name}</p>
                  <p className="text-[9px] text-gray-400 font-semibold">{party.role}</p>
                  <p className="text-[9px] text-gray-300 font-semibold mt-1">{isTh ? 'วันที่ ___/___/___' : 'Date: ___/___/___'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Draft Watermark Note ── */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-black text-amber-800">
                {isTh ? '⚠️ นี่คือเอกสารฉบับร่าง ยังไม่มีผลบังคับใช้ทางกฎหมาย' : '⚠️ This is a DRAFT document and has no legal effect yet.'}
              </p>
              <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                {isTh
                  ? 'กดปุ่ม "ส่งให้ลงนาม" เพื่อส่งเอกสารให้ทุกฝ่ายลงนามดิจิทัลผ่าน PrimeRent เพื่อให้มีผลบังคับใช้'
                  : 'Click "Send for Signing" to send this document to all parties for digital signature via PrimeRent to make it legally binding.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Actions ── */}
      <div className="flex gap-3 pb-4">
        <Button onClick={onBack} variant="outline" className="flex-1 font-black text-sm rounded-xl h-11">
          {isTh ? 'กลับ' : 'Back'}
        </Button>
        {draft.status !== 'signed' && (
          <Button onClick={onEdit} variant="outline" className="flex-1 font-black text-sm rounded-xl h-11 gap-2 border-violet-200 text-violet-700 hover:bg-violet-50">
            <Edit3 className="w-4 h-4" />
            {isTh ? 'แก้ไขร่าง' : 'Edit Draft'}
          </Button>
        )}
        {draft.status === 'draft' && (
          <Button onClick={onSend} className="flex-1 bg-violet-600 hover:bg-violet-700 font-black text-sm rounded-xl h-11 gap-2">
            <Send className="w-4 h-4" />
            {isTh ? 'ส่งให้ลงนาม' : 'Send for Signing'}
          </Button>
        )}
      </div>
    </div>
  );
}
