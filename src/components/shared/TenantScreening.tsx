'use client';

import React, { useState } from 'react';
import {
  User, Briefcase, Home, Shield, Users, Star, TrendingUp,
  CheckCircle2, AlertTriangle, XCircle, Loader2, FileText, Download, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface TenantScreeningProps {
  lang?: 'th' | 'en' | 'cn';
  tenantName?: string;
  tenantId?: string;
  onComplete?: (result: ScreeningResult) => void;
}

interface ScreeningResult {
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  incomeScore: number;
  employmentScore: number;
  rentalHistoryScore: number;
  kycScore: number;
  referenceScore: number;
  recommendation: 'approve' | 'review' | 'reject';
  summary: string;
}

interface FormData {
  // Income
  monthlyIncome: string;
  monthlyRent: string;
  incomeProof: string;
  // Employment
  employmentStatus: string;
  employer: string;
  yearsEmployed: string;
  // Rental History
  previousRentals: string;
  reasonForLeaving: string;
  evictionHistory: string;
  // KYC
  idType: string;
  idNumber: string;
  kycVerified: boolean;
  // References
  ref1Name: string;
  ref1Phone: string;
  ref1Relation: string;
  ref2Name: string;
  ref2Phone: string;
  ref2Relation: string;
}

function calculateScore(form: FormData): ScreeningResult {
  // 1. Income Score (0-20)
  const income = parseFloat(form.monthlyIncome) || 0;
  const rent = parseFloat(form.monthlyRent) || 1;
  const ratio = income / rent;
  const incomeScore = ratio >= 3 ? 20 : ratio >= 2.5 ? 17 : ratio >= 2 ? 13 : ratio >= 1.5 ? 8 : 3;

  // 2. Employment Score (0-20)
  const empMap: Record<string, number> = { 'permanent': 20, 'contract': 15, 'self': 13, 'freelance': 10, 'unemployed': 0 };
  const years = parseFloat(form.yearsEmployed) || 0;
  const empBase = empMap[form.employmentStatus] || 5;
  const yearsBonus = years >= 2 ? 3 : years >= 1 ? 1 : 0;
  const employmentScore = Math.min(empBase + yearsBonus, 20);

  // 3. Rental History Score (0-20)
  const prevMap: Record<string, number> = { '3+': 20, '2': 17, '1': 13, '0': 10, 'first': 8 };
  const evictionPenalty = form.evictionHistory === 'yes' ? -15 : 0;
  const rentalHistoryScore = Math.max((prevMap[form.previousRentals] || 8) + evictionPenalty, 0);

  // 4. KYC Score (0-20)
  const kycScore = form.kycVerified ? 20 : form.idNumber ? 10 : 0;

  // 5. Reference Score (0-20)
  const hasRef1 = form.ref1Name && form.ref1Phone ? 10 : 0;
  const hasRef2 = form.ref2Name && form.ref2Phone ? 10 : 0;
  const referenceScore = hasRef1 + hasRef2;

  const totalScore = incomeScore + employmentScore + rentalHistoryScore + kycScore + referenceScore;

  const grade: 'A' | 'B' | 'C' | 'D' | 'F' =
    totalScore >= 85 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 55 ? 'C' : totalScore >= 40 ? 'D' : 'F';

  const recommendation: 'approve' | 'review' | 'reject' =
    totalScore >= 70 ? 'approve' : totalScore >= 45 ? 'review' : 'reject';

  const summaries: Record<string, string> = {
    approve: `ผู้เช่ามีคะแนน ${totalScore}/100 — แนะนำให้อนุมัติ ผู้เช่ามีความสามารถในการชำระค่าเช่าและประวัติที่ดี`,
    review: `ผู้เช่ามีคะแนน ${totalScore}/100 — ควรตรวจสอบเพิ่มเติม โปรดพิจารณาเอกสารและอ้างอิงก่อนตัดสินใจ`,
    reject: `ผู้เช่ามีคะแนน ${totalScore}/100 — ไม่แนะนำให้อนุมัติ มีความเสี่ยงสูงในการค้างชำระ`,
  };

  return { totalScore, grade, incomeScore, employmentScore, rentalHistoryScore, kycScore, referenceScore, recommendation, summary: summaries[recommendation] };
}

const GRADE_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  A: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', label: 'ยอดเยี่ยม', icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
  B: { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', label: 'ดี', icon: <CheckCircle2 className="w-5 h-5 text-blue-600" /> },
  C: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'พอใช้', icon: <AlertTriangle className="w-5 h-5 text-amber-600" /> },
  D: { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', label: 'ต่ำกว่ามาตรฐาน', icon: <AlertTriangle className="w-5 h-5 text-orange-600" /> },
  F: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'ไม่ผ่าน', icon: <XCircle className="w-5 h-5 text-red-600" /> },
};

const RECOMMEND_CONFIG = {
  approve: { label: '✅ แนะนำให้อนุมัติ', color: 'bg-green-500 text-white' },
  review: { label: '⚠️ ตรวจสอบเพิ่มเติม', color: 'bg-amber-500 text-white' },
  reject: { label: '❌ ไม่แนะนำให้อนุมัติ', color: 'bg-red-500 text-white' },
};

export function TenantScreening({ lang = 'th', tenantName = '', onComplete }: TenantScreeningProps) {
  const isThai = lang === 'th';
  const [activeSection, setActiveSection] = useState<number>(0);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState<FormData>({
    monthlyIncome: '', monthlyRent: '', incomeProof: 'payslip',
    employmentStatus: 'permanent', employer: '', yearsEmployed: '',
    previousRentals: '1', reasonForLeaving: '', evictionHistory: 'no',
    idType: 'national_id', idNumber: '', kycVerified: false,
    ref1Name: '', ref1Phone: '', ref1Relation: '',
    ref2Name: '', ref2Phone: '', ref2Relation: '',
  });

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleCalculate = () => {
    const r = calculateScore(form);
    setResult(r);
    onComplete?.(r);
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    setGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ format: 'a4', unit: 'mm' });

      doc.setFillColor(26, 86, 219);
      doc.rect(0, 0, 210, 32, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('PrimeRent — Tenant Screening Report', 12, 14);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString('th-TH')} | Tenant: ${tenantName || 'N/A'}`, 12, 25);

      // Score Box
      const scoreColor = result.grade === 'A' ? [22, 163, 74] : result.grade === 'B' ? [37, 99, 235] : result.grade === 'C' ? [217, 119, 6] : [220, 38, 38];
      doc.setFillColor(...scoreColor as [number, number, number]);
      doc.roundedRect(10, 40, 60, 35, 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text(`${result.totalScore}`, 24, 63);
      doc.setFontSize(10);
      doc.text(`Grade ${result.grade}`, 40, 63);

      // Breakdown
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Score Breakdown', 80, 50);
      const breakdown = [
        ['Income Score', result.incomeScore, 20],
        ['Employment', result.employmentScore, 20],
        ['Rental History', result.rentalHistoryScore, 20],
        ['KYC Verification', result.kycScore, 20],
        ['References', result.referenceScore, 20],
      ];
      let y = 58;
      breakdown.forEach(([label, score, max]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`${label}:`, 80, y);
        doc.setFont('helvetica', 'bold');
        doc.text(`${score}/${max}`, 160, y);
        y += 7;
      });

      // Recommendation
      doc.setFillColor(240, 244, 255);
      doc.roundedRect(10, 85, 190, 20, 3, 3, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 86, 219);
      doc.text(`Recommendation: ${result.recommendation.toUpperCase()}`, 14, 97);

      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const summaryLines = doc.splitTextToSize(result.summary, 186);
      doc.text(summaryLines, 14, 116);

      doc.save(`Screening_Report_${tenantName || 'Tenant'}_${Date.now()}.pdf`);
      toast({ title: isThai ? '📄 ดาวน์โหลดรายงานแล้ว' : '📄 Report Downloaded' });
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const sections = [
    {
      icon: <TrendingUp className="w-4 h-4" />,
      title: isThai ? 'รายได้และการเงิน' : 'Income & Financial',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">รายได้ต่อเดือน (บาท)</label>
            <Input value={form.monthlyIncome} onChange={e => set('monthlyIncome', e.target.value)} placeholder="เช่น 60000" type="number" className="h-9 rounded-lg text-sm border-gray-200" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">ค่าเช่าที่ต้องการ (บาท)</label>
            <Input value={form.monthlyRent} onChange={e => set('monthlyRent', e.target.value)} placeholder="เช่น 20000" type="number" className="h-9 rounded-lg text-sm border-gray-200" />
          </div>
          {form.monthlyIncome && form.monthlyRent && (
            <div className="col-span-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs font-bold text-blue-700">
                Income Ratio: {(parseFloat(form.monthlyIncome) / parseFloat(form.monthlyRent)).toFixed(1)}x
                {parseFloat(form.monthlyIncome) / parseFloat(form.monthlyRent) >= 3 ? ' ✅ ดีเยี่ยม' : parseFloat(form.monthlyIncome) / parseFloat(form.monthlyRent) >= 2 ? ' ✓ ผ่าน' : ' ⚠️ ต่ำกว่ามาตรฐาน'}
              </p>
            </div>
          )}
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-semibold text-gray-600">หลักฐานรายได้</label>
            <div className="flex gap-2">
              {[['payslip', 'สลิปเงินเดือน'], ['tax', 'ใบกรอกภาษี'], ['bank', 'Statement ธนาคาร'], ['other', 'อื่นๆ']].map(([v, l]) => (
                <button key={v} onClick={() => set('incomeProof', v)}
                  className={cn('flex-1 py-2 rounded-lg border text-[10px] font-semibold transition-all',
                    form.incomeProof === v ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/30')}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      icon: <Briefcase className="w-4 h-4" />,
      title: isThai ? 'ประวัติการทำงาน' : 'Employment History',
      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">สถานะการจ้างงาน</label>
            <div className="grid grid-cols-2 gap-2">
              {[['permanent', 'พนักงานประจำ'], ['contract', 'สัญญาจ้าง'], ['self', 'ธุรกิจส่วนตัว'], ['freelance', 'Freelance'], ['unemployed', 'ไม่ได้ทำงาน']].map(([v, l]) => (
                <button key={v} onClick={() => set('employmentStatus', v)}
                  className={cn('py-2 rounded-lg border text-xs font-semibold transition-all',
                    form.employmentStatus === v ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/30')}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">ชื่อนายจ้าง/บริษัท</label>
              <Input value={form.employer} onChange={e => set('employer', e.target.value)} placeholder="เช่น บริษัท ABC จำกัด" className="h-9 rounded-lg text-sm border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">อายุงาน (ปี)</label>
              <Input value={form.yearsEmployed} onChange={e => set('yearsEmployed', e.target.value)} placeholder="เช่น 3" type="number" className="h-9 rounded-lg text-sm border-gray-200" />
            </div>
          </div>
        </div>
      )
    },
    {
      icon: <Home className="w-4 h-4" />,
      title: isThai ? 'ประวัติเช่าที่พัก' : 'Rental History',
      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">จำนวนครั้งที่เคยเช่าที่พัก</label>
            <div className="flex gap-2">
              {[['first', 'ครั้งแรก'], ['0', '0'], ['1', '1'], ['2', '2'], ['3+', '3+']].map(([v, l]) => (
                <button key={v} onClick={() => set('previousRentals', v)}
                  className={cn('flex-1 py-2 rounded-lg border text-xs font-semibold transition-all',
                    form.previousRentals === v ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/30')}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">เหตุผลที่ย้ายออกจากที่พักก่อน</label>
            <Input value={form.reasonForLeaving} onChange={e => set('reasonForLeaving', e.target.value)} placeholder="เช่น สัญญาหมด, ย้ายที่ทำงาน" className="h-9 rounded-lg text-sm border-gray-200" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">เคยถูกไล่ออก (evicted) หรือไม่?</label>
            <div className="flex gap-2">
              {[['no', 'ไม่เคย'], ['yes', 'เคย']].map(([v, l]) => (
                <button key={v} onClick={() => set('evictionHistory', v)}
                  className={cn('flex-1 py-2 rounded-lg border text-xs font-semibold transition-all',
                    form.evictionHistory === v
                      ? v === 'yes' ? 'bg-red-500 text-white border-red-500' : 'bg-green-500 text-white border-green-500'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      icon: <Shield className="w-4 h-4" />,
      title: isThai ? 'ยืนยันตัวตน' : 'Identity Verification (KYC)',
      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">ประเภทเอกสาร</label>
            <div className="flex gap-2">
              {[['national_id', 'บัตรประชาชน'], ['passport', 'Passport'], ['work_permit', 'Work Permit']].map(([v, l]) => (
                <button key={v} onClick={() => set('idType', v)}
                  className={cn('flex-1 py-2 rounded-lg border text-xs font-semibold transition-all',
                    form.idType === v ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/30')}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">เลขที่เอกสาร</label>
            <Input value={form.idNumber} onChange={e => set('idNumber', e.target.value)} placeholder="1-xxxx-xxxxx-xx-x" className="h-9 rounded-lg text-sm border-gray-200" />
          </div>
          <label className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl cursor-pointer hover:bg-green-100 transition-colors">
            <input type="checkbox" checked={form.kycVerified} onChange={e => set('kycVerified', e.target.checked)} className="w-4 h-4 accent-green-600" />
            <span className="text-xs font-semibold text-green-700">✓ ยืนยันเอกสารตัวจริงแล้ว (KYC Verified)</span>
          </label>
        </div>
      )
    },
    {
      icon: <Users className="w-4 h-4" />,
      title: isThai ? 'References' : 'References (ผู้รับรอง)',
      content: (
        <div className="space-y-5">
          {[
            { prefix: 'ref1', label: 'ผู้รับรองคนที่ 1' },
            { prefix: 'ref2', label: 'ผู้รับรองคนที่ 2' },
          ].map(({ prefix, label }) => (
            <div key={prefix} className="space-y-3">
              <p className="text-xs font-bold text-gray-600">{label}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400">ชื่อ</label>
                  <Input value={(form as any)[`${prefix}Name`]} onChange={e => set(`${prefix}Name` as any, e.target.value)} placeholder="ชื่อ-นามสกุล" className="h-8 rounded-lg text-xs border-gray-200" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400">เบอร์โทร</label>
                  <Input value={(form as any)[`${prefix}Phone`]} onChange={e => set(`${prefix}Phone` as any, e.target.value)} placeholder="08x-xxx-xxxx" className="h-8 rounded-lg text-xs border-gray-200" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400">ความสัมพันธ์</label>
                  <Input value={(form as any)[`${prefix}Relation`]} onChange={e => set(`${prefix}Relation` as any, e.target.value)} placeholder="เช่น หัวหน้างาน" className="h-8 rounded-lg text-xs border-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-gray-900">{isThai ? 'ตรวจสอบผู้เช่า (Tenant Screening)' : 'Tenant Screening'}</h3>
        {tenantName && <Badge className="bg-primary/10 text-primary border-none font-semibold text-xs px-3 rounded-full">{tenantName}</Badge>}
      </div>

      {/* Section Accordion */}
      <div className="space-y-2">
        {sections.map((section, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setActiveSection(activeSection === i ? -1 : i)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold',
                  activeSection === i ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                )}>{i + 1}</span>
                <span className="text-sm font-semibold text-gray-800">{section.title}</span>
              </div>
              {activeSection === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {activeSection === i && (
              <div className="px-5 pb-5 border-t border-gray-100">
                <div className="pt-4">{section.content}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button onClick={handleCalculate} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 gap-2">
        <Star className="w-4 h-4" /> {isThai ? 'คำนวณคะแนน Tenant Score' : 'Calculate Tenant Score'}
      </Button>

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={cn('border rounded-2xl p-6', GRADE_CONFIG[result.grade].bg)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Score</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={cn('text-5xl font-black', GRADE_CONFIG[result.grade].color)}>{result.totalScore}</span>
                  <span className="text-gray-400 font-medium">/100</span>
                </div>
                <p className={cn('text-xl font-bold mt-1', GRADE_CONFIG[result.grade].color)}>Grade {result.grade} — {GRADE_CONFIG[result.grade].label}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {GRADE_CONFIG[result.grade].icon}
                <span className={cn('px-3 py-1.5 rounded-xl text-xs font-bold', RECOMMEND_CONFIG[result.recommendation].color)}>
                  {RECOMMEND_CONFIG[result.recommendation].label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mt-5 pt-4 border-t border-current/10">
              {[
                ['Income', result.incomeScore, 20],
                ['Employment', result.employmentScore, 20],
                ['History', result.rentalHistoryScore, 20],
                ['KYC', result.kycScore, 20],
                ['References', result.referenceScore, 20],
              ].map(([label, score, max], i) => (
                <div key={i} className="text-center">
                  <p className={cn('text-base font-black', GRADE_CONFIG[result.grade].color)}>{score}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
                  <p className="text-[9px] text-gray-300">/{max}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-600 leading-relaxed">{result.summary}</p>
          </div>

          <Button onClick={handleDownloadPDF} disabled={generating} variant="outline" className="w-full rounded-xl border-gray-200 font-semibold text-gray-700 gap-2 h-10 text-sm">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {isThai ? 'ดาวน์โหลดรายงาน PDF' : 'Download PDF Report'}
          </Button>
        </div>
      )}
    </div>
  );
}
