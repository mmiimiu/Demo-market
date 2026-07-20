"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText, ShieldCheck, Clock, Download, PenTool, CheckCircle2,
  Edit2, X, AlertTriangle, Share2, History, Eye, ChevronDown,
  ChevronUp, Copy, Check, RotateCcw, Layers, Stamp, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContractManagerProps {
  contractId: string;
  lang: 'th' | 'en' | 'cn';
  isCompact?: boolean;
  forceRole?: 'tenant' | 'owner' | 'agent';
  canEdit?: boolean;
}

type ContractTemplate = 'monthly' | 'annual' | 'short_term';

interface AuditEvent {
  event: 'contract_created' | 'terms_edited' | 'signature_added' | 'contract_activated';
  actor: string;
  timestamp: string;
  detail: string;
}

// ─── Template Config ──────────────────────────────────────────────────────────

const TEMPLATES: Record<ContractTemplate, { label: string; labelTh: string; color: string; description: string; descriptionTh: string }> = {
  monthly: {
    label: 'Monthly',
    labelTh: 'รายเดือน',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Standard 12-month lease agreement',
    descriptionTh: 'สัญญาเช่ามาตรฐาน 12 เดือน',
  },
  annual: {
    label: 'Annual',
    labelTh: 'รายปี',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description: 'Long-term lease with annual increment clause',
    descriptionTh: 'สัญญาระยะยาวพร้อมข้อกำหนดการปรับค่าเช่ารายปี',
  },
  short_term: {
    label: 'Short-term',
    labelTh: 'ระยะสั้น',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    description: 'Weekly / daily serviced apartment style',
    descriptionTh: 'สำหรับอพาร์ทเม้นท์แบบรายสัปดาห์หรือรายวัน',
  },
};

// ─── Audit Event Labels ───────────────────────────────────────────────────────

const AUDIT_CONFIG = {
  contract_created: { icon: '📝', color: 'text-blue-500 bg-blue-50 border-blue-100' },
  terms_edited: { icon: '✏️', color: 'text-amber-500 bg-amber-50 border-amber-100' },
  signature_added: { icon: '✍️', color: 'text-primary bg-primary/5 border-primary/10' },
  contract_activated: { icon: '✅', color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
};

// ─── Mock Audit Log ───────────────────────────────────────────────────────────

const MOCK_AUDIT_LOG: AuditEvent[] = [
  {
    event: 'contract_created',
    actor: 'PrimeRent System',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    detail: 'สร้างสัญญาเช่าใหม่โดยระบบอัตโนมัติ (Auto-generated lease agreement)',
  },
  {
    event: 'terms_edited',
    actor: 'Somchai Jaidee (Owner)',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    detail: 'แก้ไขค่าเช่าจาก ฿15,000 → ฿18,000 และปรับวันเริ่มสัญญา',
  },
  {
    event: 'signature_added',
    actor: 'Somchai Jaidee (Owner)',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    detail: 'เจ้าของที่พักลงนามในสัญญาเรียบร้อยแล้ว · IP: 49.228.x.x',
  },
];

// ─── Canvas Signature Pad Component ──────────────────────────────────────────

interface SignaturePadProps {
  onSigned: (dataUrl: string) => void;
  onClear: () => void;
  hasSigned: boolean;
  lang: 'th' | 'en' | 'cn';
}

function SignaturePad({ onSigned, onClear, hasSigned, lang }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [signMethod, setSignMethod] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState<'elegant' | 'formal' | 'modern'>('elegant');

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (signMethod !== 'draw') return;
    e.preventDefault();
    setIsDrawing(true);
    setLastPos(getPos(e));
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (signMethod !== 'draw') return;
    e.preventDefault();
    if (!isDrawing || !lastPos) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setLastPos(pos);
    onSigned(canvas!.toDataURL('image/png'));
  };

  const endDraw = () => setIsDrawing(false);

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTypedName('');
    onClear();
  };

  const handleTypeChange = (text: string, fontId: 'elegant' | 'formal' | 'modern') => {
    setTypedName(text);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!text.trim()) {
      onClear();
      return;
    }

    const fontStyles = {
      elegant: "italic 36px 'Dancing Script', cursive",
      formal: "italic 32px 'Brush Script MT', 'Courier New', cursive",
      modern: "italic 32px 'Georgia', serif"
    };

    ctx.font = fontStyles[fontId];
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Decorative underline signature line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, canvas.height / 2 + 25);
    ctx.quadraticCurveTo(canvas.width / 2, canvas.height / 2 + 35, canvas.width / 2 + 100, canvas.height / 2 + 22);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    onSigned(canvas.toDataURL('image/png'));
  };

  const handleMethodChange = (method: 'draw' | 'type') => {
    setSignMethod(method);
    handleClear();
  };

  const placeholder = lang === 'th' ? 'วาดลายเซ็นของคุณที่นี่' : lang === 'cn' ? '在此处绘制您的签名' : 'Draw your signature here';
  const clearLabel = lang === 'th' ? 'ล้าง' : lang === 'cn' ? '清除' : 'Clear';

  return (
    <div className="space-y-3">
      {/* Selector Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          type="button"
          onClick={() => handleMethodChange('draw')}
          className={cn(
            "flex-1 py-2 text-xs font-black tracking-wider uppercase border-b-2 text-center transition-all",
            signMethod === 'draw'
              ? "border-primary text-primary"
              : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          {lang === 'th' ? '✍️ วาดลายมือชื่อ' : lang === 'cn' ? '✍️ 绘制签名' : '✍️ Draw Signature'}
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange('type')}
          className={cn(
            "flex-1 py-2 text-xs font-black tracking-wider uppercase border-b-2 text-center transition-all",
            signMethod === 'type'
              ? "border-primary text-primary"
              : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          {lang === 'th' ? '⌨️ พิมพ์ชื่อสะกด' : lang === 'cn' ? '⌨️ 输入姓名' : '⌨️ Type to Sign'}
        </button>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-primary" />
          {signMethod === 'draw'
            ? (lang === 'th' ? 'วาดลายเซ็นด้านล่าง' : lang === 'cn' ? '在下方绘制签名' : 'Draw signature below')
            : (lang === 'th' ? 'พิมพ์ชื่อจริงด้านล่าง' : lang === 'cn' ? '输入您的名字' : 'Type your name below')
          }
        </span>
        {hasSigned && (
          <button
            onClick={handleClear}
            className="text-[10px] font-black text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100/80 border border-red-100 px-2 py-1 uppercase tracking-wider transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            {clearLabel}
          </button>
        )}
      </div>

      {signMethod === 'type' && (
        <div className="space-y-2">
          <input
            type="text"
            value={typedName}
            onChange={(e) => handleTypeChange(e.target.value, selectedFont)}
            placeholder={lang === 'th' ? 'เช่น นายสมชาย ใจดี' : lang === 'cn' ? '例如 张伟' : 'e.g. John Doe'}
            className="w-full border border-gray-200 px-3 py-2 text-sm font-bold focus:outline-none focus:border-primary rounded-none text-gray-900"
          />
        </div>
      )}

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={560}
          height={140}
          className={cn(
            "w-full h-[140px] border-2 border-dashed touch-none transition-all duration-300 bg-gray-50/50",
            signMethod === 'draw' ? "cursor-crosshair animate-pulse" : "pointer-events-none",
            hasSigned ? "border-primary/40 bg-white" : "border-gray-200 hover:border-primary/30"
          )}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasSigned && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs pointer-events-none uppercase tracking-widest text-center w-full">
            {signMethod === 'draw' ? placeholder : (lang === 'th' ? 'พิมพ์ด้านบนเพื่อแสดงลายเซ็นที่นี่' : 'Type above to generate signature here')}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Document Preview Modal ───────────────────────────────────────────────────

interface DocumentPreviewProps {
  contract: any;
  contractId: string;
  lang: 'th' | 'en' | 'cn';
  template: ContractTemplate;
}

function DocumentPreviewModal({ contract, contractId, lang, template }: DocumentPreviewProps) {
  const isTh = lang === 'th';
  const isSigned = contract?.status === 'active';

  const sDate = contract?.startDate ? format(new Date(contract.startDate), 'dd MMMM yyyy') : 'N/A';
  const eDate = contract?.endDate ? format(new Date(contract.endDate), 'dd MMMM yyyy') : 'N/A';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-none h-10 font-bold gap-2 border-gray-200">
          <Eye className="w-4 h-4" />
          {isTh ? 'ดูเอกสารสัญญา' : lang === 'cn' ? '查看合同' : 'View Document'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-none border-none">
        <div className="bg-white">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-black text-gray-900 text-sm">
                {isTh ? 'เอกสารสัญญาเช่าดิจิทัล' : 'Digital Lease Agreement'}
              </span>
              <Badge variant="outline" className="rounded-none text-xs font-black border-primary/20 text-primary">
                {contractId}
              </Badge>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-none h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>

          {/* A4-like Document */}
          <div className="p-8 bg-gray-100 min-h-[600px]">
            <div className="bg-white shadow-2xl mx-auto max-w-2xl p-12 relative min-h-[800px] border border-gray-200">
              
              {/* Watermark */}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center pointer-events-none select-none",
                "opacity-[0.04] rotate-[-35deg]"
              )}>
                <span className="text-8xl font-black text-gray-900 tracking-widest uppercase">
                  {isSigned ? (isTh ? 'บังคับใช้' : 'ACTIVE') : (isTh ? 'ร่าง' : 'DRAFT')}
                </span>
              </div>

              {/* Document Header */}
              <div className="text-center border-b-2 border-gray-900 pb-6 mb-8">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2">PrimeRent Digital Platform</div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  {isTh ? 'สัญญาเช่าที่พักอาศัย' : lang === 'cn' ? '住宅租赁合同' : 'Residential Lease Agreement'}
                </h1>
                <div className="text-xs text-gray-500 font-bold mt-2">
                  {isTh ? 'รหัสสัญญา' : 'Contract ID'}: {contractId} &nbsp;·&nbsp;
                  {isTh ? 'ประเภท' : 'Type'}: {isTh ? TEMPLATES[template].labelTh : TEMPLATES[template].label}
                </div>
              </div>

              {/* Section 1: Parties */}
              <section className="mb-8">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">
                  1. {isTh ? 'คู่สัญญา' : 'Parties to Agreement'}
                </h2>
                <div className="grid grid-cols-2 gap-6 text-sm font-bold">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isTh ? 'ผู้ให้เช่า (Landlord)' : 'Landlord / Owner'}</p>
                    <p className="text-gray-800">ID: {contract?.ownerId || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isTh ? 'ผู้เช่า (Tenant)' : 'Tenant'}</p>
                    <p className="text-gray-800">ID: {contract?.tenantId || 'N/A'}</p>
                  </div>
                  {contract?.agentId && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isTh ? 'ตัวแทน (Agent)' : 'Agent'}</p>
                      <p className="text-gray-800">ID: {contract.agentId}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Section 2: Property */}
              <section className="mb-8">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">
                  2. {isTh ? 'รายละเอียดที่พัก' : 'Property Details'}
                </h2>
                <div className="text-sm font-bold space-y-1">
                  <p><span className="text-gray-400">{isTh ? 'ชื่อที่พัก' : 'Property'}:</span> <span className="text-gray-900">{contract?.propertyName || 'N/A'}</span></p>
                  <p><span className="text-gray-400">{isTh ? 'รหัสทรัพย์' : 'Property ID'}:</span> <span className="text-gray-900">{contract?.propertyId || 'N/A'}</span></p>
                </div>
              </section>

              {/* Section 3: Terms */}
              <section className="mb-8">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">
                  3. {isTh ? 'ข้อกำหนดสัญญาเช่า' : 'Lease Terms'}
                </h2>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 border border-gray-200 p-4 mb-4">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isTh ? 'ค่าเช่า/เดือน' : 'Monthly Rent'}</p>
                    <p className="text-lg font-black text-primary">฿{Number(contract?.monthlyRent || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isTh ? 'เงินมัดจำ' : 'Deposit'}</p>
                    <p className="text-lg font-black text-gray-800">฿{Number(contract?.depositAmount || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isTh ? 'เช่าล่วงหน้า' : 'Advance'}</p>
                    <p className="text-lg font-black text-gray-800">฿{Number(contract?.advanceRentAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isTh ? 'วันเริ่มสัญญา' : 'Start Date'}</p>
                    <p className="text-gray-900">{sDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{isTh ? 'วันสิ้นสุดสัญญา' : 'End Date'}</p>
                    <p className="text-gray-900">{eDate}</p>
                  </div>
                </div>
              </section>

              {/* Section 4: Terms & Conditions by Template */}
              <section className="mb-8">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">
                  4. {isTh ? 'ข้อตกลงและเงื่อนไข' : 'Terms & Conditions'}
                </h2>
                <div className="space-y-2 text-xs font-bold text-gray-600 leading-relaxed">
                  <p>4.1 {isTh ? 'ผู้เช่าตกลงชำระค่าเช่าภายในวันที่ 5 ของทุกเดือน มิเช่นนั้นจะถูกปรับ 2% ต่อวันที่เกินกำหนด' : 'Tenant agrees to pay rent by the 5th of each month. Late payment incurs 2% per day penalty.'}</p>
                  <p>4.2 {isTh ? 'เงินมัดจำจะคืนภายใน 30 วันนับจากวันสิ้นสุดสัญญา หลังหักค่าเสียหาย (ถ้ามี)' : 'Security deposit will be refunded within 30 days after lease end, minus any damages.'}</p>
                  <p>4.3 {isTh ? 'ห้ามดัดแปลงต่อเติมห้องโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากเจ้าของ' : 'No modifications to the property without written consent from the landlord.'}</p>
                  {template === 'annual' && (
                    <p>4.4 {isTh ? 'ค่าเช่าจะปรับขึ้นไม่เกิน 5% ในปีถัดไปตามดัชนีราคาผู้บริโภค' : 'Annual rent increase not exceeding 5% per consumer price index.'}</p>
                  )}
                  {template === 'short_term' && (
                    <p>4.4 {isTh ? 'สัญญาระยะสั้นไม่มีการต่ออายุอัตโนมัติ ต้องแจ้งต่อสัญญาล่วงหน้า 48 ชั่วโมง' : 'Short-term lease does not auto-renew. 48-hour notice required for renewal.'}</p>
                  )}
                  <p className={template === 'monthly' ? "block" : "hidden"}>4.4 {isTh ? 'ผู้เช่าต้องแจ้งยกเลิกสัญญาล่วงหน้าอย่างน้อย 30 วัน' : 'Tenant must provide 30 days notice of lease termination.'}</p>
                </div>
              </section>

              {/* Section 5: Signature Blocks */}
              <section className="mt-12">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-6">
                  5. {isTh ? 'ลายเซ็นผู้มีอำนาจลงนาม (Main Contract)' : 'Authorized Signatures'}
                </h2>
                <div className={cn(
                  "grid gap-6",
                  contract?.agentId ? "grid-cols-3" : "grid-cols-2"
                )}>
                  {[
                    { role: 'owner', label: isTh ? 'เจ้าของที่พัก' : 'Landlord', sig: contract?.signatures?.owner },
                    { role: 'tenant', label: isTh ? 'ผู้เช่า' : 'Tenant', sig: contract?.signatures?.tenant },
                    ...(contract?.agentId ? [{ role: 'agent', label: isTh ? 'ตัวแทน' : 'Agent', sig: contract?.signatures?.agent }] : []),
                  ].map((p) => (
                    <div key={p.role} className="space-y-2">
                      {p.sig ? (
                        <>
                          <div className="h-20 border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                            <img
                              src={p.sig.signatureDataUrl}
                              alt="signature"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="border-t border-gray-400 pt-2">
                            <p className="text-[10px] font-black text-gray-900">{p.sig.name}</p>
                            <p className="text-[9px] text-gray-400 font-bold">{format(new Date(p.sig.signedAt), 'dd MMM yyyy HH:mm')}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-20 border-2 border-dashed border-gray-300 bg-gray-50/50 flex items-center justify-center">
                            <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">
                              {isTh ? 'รอลงนาม' : 'Pending'}
                            </span>
                          </div>
                          <div className="border-t border-gray-300 pt-2">
                            <p className="text-[10px] font-black text-gray-400">{p.label}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Attachments Pages */}
              {contract?.attachments?.map((att: any, index: number) => (
                <div key={att.id} className="mt-16 pt-16 border-t-2 border-dashed border-gray-300 page-break-before">
                  <div className="text-center border-b-2 border-gray-900 pb-6 mb-8">
                    <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2">PrimeRent Digital Platform</div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                      {isTh ? 'เอกสารแนบท้ายที่' : 'Attachment'} {index + 1}
                    </h1>
                    <div className="text-sm text-gray-900 font-bold mt-2">
                      {att.title}
                    </div>
                  </div>
                  
                  <div className="whitespace-pre-wrap text-sm font-bold text-gray-700 leading-relaxed min-h-[200px]">
                    {att.content}
                  </div>

                  {/* Attachment Signature Blocks */}
                  <section className="mt-12">
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-6">
                      {isTh ? 'ลายเซ็นรับทราบเอกสารแนบท้าย' : 'Attachment Signatures'}
                    </h2>
                    <div className={cn(
                      "grid gap-6",
                      contract?.agentId ? "grid-cols-3" : "grid-cols-2"
                    )}>
                      {[
                        { role: 'owner', label: isTh ? 'เจ้าของที่พัก' : 'Landlord', sig: contract?.signatures?.owner },
                        { role: 'tenant', label: isTh ? 'ผู้เช่า' : 'Tenant', sig: contract?.signatures?.tenant },
                        ...(contract?.agentId ? [{ role: 'agent', label: isTh ? 'ตัวแทน' : 'Agent', sig: contract?.signatures?.agent }] : []),
                      ].map((p) => (
                        <div key={p.role} className="space-y-2">
                          {p.sig ? (
                            <>
                              <div className="h-20 border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                <img
                                  src={p.sig.signatureDataUrl}
                                  alt="signature"
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                              <div className="border-t border-gray-400 pt-2">
                                <p className="text-[10px] font-black text-gray-900">{p.sig.name}</p>
                                <p className="text-[9px] text-gray-400 font-bold">{format(new Date(p.sig.signedAt), 'dd MMM yyyy HH:mm')}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="h-20 border-2 border-dashed border-gray-300 bg-gray-50/50 flex items-center justify-center">
                                <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">
                                  {isTh ? 'รอลงนาม' : 'Pending'}
                                </span>
                              </div>
                              <div className="border-t border-gray-300 pt-2">
                                <p className="text-[10px] font-black text-gray-400">{p.label}</p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              ))}

              {/* Footer */}
              <div className="mt-12 pt-4 border-t border-gray-200 text-center">
                <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.2em]">
                  🔒 Digitally Secured &amp; Encrypted · PrimeRent Digital Platform · {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Template Selector ────────────────────────────────────────────────────────

interface TemplateSelectorProps {
  value: ContractTemplate;
  onChange: (t: ContractTemplate) => void;
  lang: 'th' | 'en' | 'cn';
}

function TemplateSelector({ value, onChange, lang }: TemplateSelectorProps) {
  const isTh = lang === 'th';
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(TEMPLATES) as ContractTemplate[]).map((key) => {
        const t = TEMPLATES[key];
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "px-3 py-1.5 text-xs font-black border transition-all rounded-none",
              value === key ? t.color : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
            )}
          >
            {isTh ? t.labelTh : t.label}
          </button>
        );
      })}
    </div>
  );
}

const ContractField = ({ value, onChange, placeholder, disabled, onBlur }: { value: string, onChange?: (val: string) => void, placeholder?: string, disabled: boolean, onBlur?: () => void }) => {
  if (disabled) {
    return (
      <span className="font-bold text-slate-950 mx-1 inline-block">
        {value || placeholder || '...'}
      </span>
    );
  }

  const width = Math.max((value || '').length * 6 + 12, 50);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      style={{ width: `${width}px` }}
      className="inline-block border-b-2 border-emerald-500 mx-0.5 px-1 py-0.5 text-center font-bold bg-emerald-50/20 text-slate-950 focus:outline-none focus:border-emerald-600 focus:bg-emerald-50/50 transition-all rounded hover:bg-emerald-50/40"
    />
  );
};

const formatThaiDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

// ─── Main ContractManager Component ──────────────────────────────────────────

export function ContractManager({ contractId, lang, isCompact = false, forceRole }: ContractManagerProps) {
  const isTh = lang === 'th';
  const { user } = useUser();
  const db = useFirestore();
  const { addNotification } = useNotifications();

  const { data: dbContract, loading: dbLoading } = useDoc<any>(
    db && user && !user.isMock && contractId ? `contracts/${contractId}` : null
  );

  // ── Core State
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [signingRole, setSigningRole] = useState<'tenant' | 'owner' | 'agent' | null>(null);
  const [template, setTemplate] = useState<ContractTemplate>('monthly');
  const [auditLog, setAuditLog] = useState<AuditEvent[]>(MOCK_AUDIT_LOG);
  const [showAudit, setShowAudit] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // ── Signature State
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [hasSigned, setHasSigned] = useState(false);

  // ── Edit Form State
  const [editMonthlyRent, setEditMonthlyRent] = useState('');
  const [editDepositAmount, setEditDepositAmount] = useState('');
  const [editAdvanceRentAmount, setEditAdvanceRentAmount] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editAttachments, setEditAttachments] = useState<{id: string, title: string, content: string}[]>([]);
  const [editLandlordName, setEditLandlordName] = useState('');
  const [editTenantName, setEditTenantName] = useState('');
  const [editAgentName, setEditAgentName] = useState('');
  const [editPropertyName, setEditPropertyName] = useState('');
  const [renewalInputDate, setRenewalInputDate] = useState('');

  const loadContractData = useCallback(() => {
    if (user && !user.isMock && dbContract) {
      setContract(dbContract);
      setLoading(false);
      return;
    }
    
    let match = null;
    let contracts: any[] = [];
    const storedContracts = localStorage.getItem('contracts');
    if (storedContracts) {
      try {
        contracts = JSON.parse(storedContracts);
        match = contracts.find((c: any) => c.id === contractId);
      } catch (err) {
        console.error('Error parsing mock contracts:', err);
      }
    }

    if (match) {
      setContract(match);
    } else if (contractId.startsWith('mock_ctr_') || contractId === 'mock_ctr_1') {
      // Create a beautifully simulated active contract with complete signatures
      const simulated = {
        id: contractId,
        propertyId: '1',
        propertyName: 'คอนโดหรู ใกล้ BTS อโศก สุขุมวิท',
        ownerId: 'owner_somyot',
        tenantId: 'tenant_tattap',
        monthlyRent: 12000,
        depositAmount: 24000,
        advanceRentAmount: 12000,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        signatures: {
          owner: {
            name: 'สมยศ ใจดี (Owner)',
            signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqWDpaAAAACXBIWXMAAAsTAAALEwEAmpwYAAABeklEQVR4nO2aTWrDMBSFP6t9G12ErKI30E10IXkDOyvIDbILySr2bXSReAO5gS7C90Ukh1aUOMWx6sA9B4QY2Y9PT0+WnFJKHMdxHMdxHMdxHMdxHNvFDHAATg34vQMeO8H6gCPwZcHzG/gAps04rpg58ArMmsM34A54teC6KqaAM2C2OHqLzS7A1YLrq5gC1qT3M1uMvcf2DHgC7gU2xTADPAEPwLgYc1fR4o5U5lM8i78g64c7UrWfYm7HqvgLst7cqaobNlV2q/gNf7W4V3U/t1Z2q/gN99b4V3U/t1Z2q/gN32pxu25/Fv9a3Gpx72F/q8VdxW941uKeiz/E3I6L/Cnm6R1HqvhzzO24yL9int5xpIp+w18t7lXdL22q7FbxG77V4nbd/iz+tbiq7u/Wyq6K/9p7Vffzqaq+Kj1Wpcf2Lw8qPUyFh6XwYCo87ApPrsKjrvAkFZ5ChZeHrvA0FZ62wtNW+P8pjuM4juM4juM4juM4tuf4AQ+Yd6n2XwYJAAAAAElFTkSuQmCC',
            signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            ipAddress: '182.52.12.98'
          },
          tenant: {
            name: 'ทัตเทพ แสนสุข (Tenant)',
            signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqWDpaAAAACXBIWXMAAAsTAAALEwEAmpwYAAABeklEQVR4nO2aTWrDMBSFP6t9G12ErKI30E10IXkDOyvIDbILySr2bXSReAO5gS7C90Ukh1aUOMWx6sA9B4QY2Y9PT0+WnFJKHMdxHMdxHMdxHMdxHNvFDHAATg34vQMeO8H6gCPwZcHzG/gAps04rpg58ArMmsM34A54teC6KqaAM2C2OHqLzS7A1YLrq5gC1qT3M1uMvcf2DHgC7gU2xTADPAEPwLgYc1fR4o5U5lM8i78g64c7UrWfYm7HqvgLst7cqaobNlV2q/gNf7W4V3U/t1Z2q/gN99b4V3U/t1Z2q/gN32pxu25/Fv9a3Gpx72F/q8VdxW941uKeiz/E3I6L/Cnm6R1HqvhzzO24yL9int5xpIp+w18t7lXdL22q7FbxG77V4nbd/iz+tbiq7u/Wyq6K/9p7Vffzqaq+Kj1Wpcf2Lw8qPUyFh6XwYCo87ApPrsKjrvAkFZ5ChZeHrvA0FZ62wtNW+P8pjuM4juM4juM4juM4tuf4AQ+Yd6n2XwYJAAAAAElFTkSuQmCC',
            signedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            ipAddress: '49.228.45.112'
          }
        },
        attachments: [
          { id: 'def_1', title: 'เครื่องปรับอากาศ (Air Conditioner)', content: '15000' },
          { id: 'def_2', title: 'โทรทัศน์ (Television)', content: '10000' },
          { id: 'def_3', title: 'ตู้เย็น (Refrigerator)', content: '8000' },
          { id: 'def_4', title: 'เครื่องซักผ้า (Washing Machine)', content: '12000' },
          { id: 'def_5', title: 'เตียงและที่นอน (Bed & Mattress)', content: '15000' },
          { id: 'def_6', title: 'ตู้เสื้อผ้า (Wardrobe)', content: '10000' },
          { id: 'def_7', title: 'ชุดโซฟา (Sofa Set)', content: '8000' },
          { id: 'def_8', title: 'ไมโครเวฟ (Microwave)', content: '3000' },
          { id: 'def_9', title: 'เครื่องทำน้ำอุ่น (Water Heater)', content: '4000' },
          { id: 'def_10', title: 'โต๊ะอาหารและเก้าอี้ (Dining Table Set)', content: '5000' }
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setContract(simulated);
      contracts.push(simulated);
      localStorage.setItem('contracts', JSON.stringify(contracts));
    }
    setLoading(false);
  }, [dbContract, user, contractId]);

  useEffect(() => { loadContractData(); }, [loadContractData]);

  useEffect(() => {
    if (contract) {
      setEditMonthlyRent(contract.monthlyRent?.toString() || '');
      setEditDepositAmount(contract.depositAmount?.toString() || '');
      setEditAdvanceRentAmount(contract.advanceRentAmount?.toString() || '');
      const sDate = contract.startDate ? new Date(contract.startDate) : new Date();
      const eDate = contract.endDate ? new Date(contract.endDate) : new Date();
      setEditStartDate(sDate.toISOString().substring(0, 10));
      setEditEndDate(eDate.toISOString().substring(0, 10));

      if (contract.endDate) {
        const d = new Date(contract.endDate);
        d.setFullYear(d.getFullYear() + 1);
        setRenewalInputDate(d.toISOString().substring(0, 10));
      }

      const defaultAttachments = [
        { id: 'def_1', title: 'เครื่องปรับอากาศ (Air Conditioner)', content: '15000' },
        { id: 'def_2', title: 'โทรทัศน์ (Television)', content: '10000' },
        { id: 'def_3', title: 'ตู้เย็น (Refrigerator)', content: '8000' },
        { id: 'def_4', title: 'เครื่องซักผ้า (Washing Machine)', content: '12000' },
        { id: 'def_5', title: 'เตียงและที่นอน (Bed & Mattress)', content: '15000' },
        { id: 'def_6', title: 'ตู้เสื้อผ้า (Wardrobe)', content: '10000' },
        { id: 'def_7', title: 'ชุดโซฟา (Sofa Set)', content: '8000' },
        { id: 'def_8', title: 'ไมโครเวฟ (Microwave)', content: '3000' },
        { id: 'def_9', title: 'เครื่องทำน้ำอุ่น (Water Heater)', content: '4000' },
        { id: 'def_10', title: 'โต๊ะอาหารและเก้าอี้ (Dining Table Set)', content: '5000' }
      ];
      setEditAttachments(contract.attachments?.length > 0 ? contract.attachments : defaultAttachments);
      setEditLandlordName(contract.landlordName || 'สมชาย มืออาชีพ (Agent)');
      setEditTenantName(contract.tenantName || 'นาย ณัฐพล ใจสู้');
      setEditAgentName(contract.agentName || 'PrimeRent Agent');
      setEditPropertyName(contract.propertyName || 'คอนโดหรู ใกล้ BTS อโศก สุขุมวิท');
      if (contract.template) setTemplate(contract.template);
      if (contract.auditLog) setAuditLog(contract.auditLog);
    }
  }, [contract]);

  // ── Loading / Error States
  if (loading || dbLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-400">กำลังโหลดเอกสารสัญญา...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="py-20 text-center border border-dashed rounded-none p-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="font-black text-gray-700 text-lg">ไม่พบข้อมูลสัญญาเช่า</p>
        <p className="text-xs text-gray-400 mt-1">รหัสสัญญา {contractId} ไม่มีอยู่ในระบบ</p>
      </div>
    );
  }

  const signaturesCount = Object.keys(contract.signatures || {}).length;
  const isSigned = contract.status === 'active';
  const isMockEnv = !user || user.isMock;
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('primerent_user_role') : null;
  const mappedStoredRole = (storedRole === 'owner' || storedRole === 'landlord') ? 'owner' : storedRole === 'agent' ? 'agent' : 'tenant';

  const currentUserRole = forceRole || (isMockEnv
    ? mappedStoredRole
    : (user.uid === contract?.ownerId ? 'owner' : user.uid === contract?.tenantId ? 'tenant' : 'agent'));

  // ── Handlers

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFields = {
      monthlyRent: Number(editMonthlyRent),
      depositAmount: Number(editDepositAmount),
      advanceRentAmount: Number(editAdvanceRentAmount),
      startDate: new Date(editStartDate).toISOString(),
      endDate: new Date(editEndDate).toISOString(),
      attachments: editAttachments,
      signatures: {}, // Reset all signatures upon editing
      status: 'pending_signatures',
      updatedAt: new Date().toISOString(),
    };
    try {
      if (user && !user.isMock && db) {
        const res = await fetch('/api/contract/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractId, ...updatedFields }),
        });
        if (!res.ok) throw new Error('Failed to update contract');
      } else {
        const stored = localStorage.getItem('contracts');
        if (stored) {
          const contracts = JSON.parse(stored);
          const idx = contracts.findIndex((c: any) => c.id === contractId);
          if (idx !== -1) { contracts[idx] = { ...contracts[idx], ...updatedFields }; localStorage.setItem('contracts', JSON.stringify(contracts)); }
        }
      }
      const newAudit: AuditEvent = {
        event: 'terms_edited',
        actor: user?.displayName || 'Owner',
        timestamp: new Date().toISOString(),
        detail: `แก้ไขเงื่อนไขสัญญา → ค่าเช่า ฿${Number(editMonthlyRent).toLocaleString()}/เดือน`,
      };
      setAuditLog(prev => [newAudit, ...prev]);
      setContract((prev: any) => ({ ...prev, ...updatedFields }));
      setIsEditing(false);
      toast({ title: isTh ? 'แก้ไขสัญญาสำเร็จ' : 'Contract Updated', description: isTh ? 'รายละเอียดสัญญาถูกอัปเดตและรีเซ็ตลายเซ็นแล้ว' : 'Contract details saved and signatures reset.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: isTh ? 'เกิดข้อผิดพลาด' : 'Error', description: err.message });
    }
  };

  const handleRequestRenewal = () => {
    const updatedContract = {
      ...contract,
      renewalRequested: true,
      updatedAt: new Date().toISOString(),
    };
    
    if (contractId.startsWith('mock_ctr_')) {
      const stored = localStorage.getItem('contracts');
      if (stored) {
        const contracts = JSON.parse(stored);
        const idx = contracts.findIndex((c: any) => c.id === contractId);
        if (idx !== -1) {
          contracts[idx] = updatedContract;
          localStorage.setItem('contracts', JSON.stringify(contracts));
        }
      }
    }
    
    setContract(updatedContract);
    
    const newAudit: AuditEvent = {
      event: 'terms_edited',
      actor: contract.tenantName || 'Tenant',
      timestamp: new Date().toISOString(),
      detail: 'ผู้เช่าได้ส่งคำร้องขอต่ออายุสัญญาเช่าห้องพัก',
    };
    setAuditLog(prev => [newAudit, ...prev]);

    // Send notifications to Owner and Agent
    addNotification({
      type: 'warning',
      title: '📝 คำขอต่ออายุสัญญาเช่า',
      message: `ผู้เช่าได้ส่งคำร้องขอต่ออายุสัญญาสำหรับห้องพัก ${contract.propertyName || ''} (ห้อง ${contract.roomNumber || ''}) กรุณาระบุวันสิ้นสุดสัญญาใหม่เพื่อเริ่มกระบวนการลงนาม`,
      action: {
        label: '✍️ จัดการสัญญา',
        url: '/profile?tab=contracts'
      }
    });

    toast({
      title: isTh ? 'ส่งคำขอต่อสัญญาแล้ว' : 'Renewal Requested',
      description: isTh ? 'ระบบได้ส่งการแจ้งเตือนไปยังเจ้าของห้องและตัวแทนเพื่ออัปเดตสัญญากลางแล้ว' : 'Notification sent to Owner and Agent to update the contract.',
    });
  };

  const handleApproveRenewal = (newEndDateStr: string) => {
    if (!newEndDateStr) {
      toast({ variant: 'destructive', title: isTh ? 'กรุณาระบุวันที่' : 'Please specify date' });
      return;
    }
    
    const originalEndDate = new Date(contract.endDate);
    const newStartDate = new Date(originalEndDate.getTime() + 24 * 60 * 60 * 1000);
    const newEndDate = new Date(newEndDateStr);

    if (newEndDate <= newStartDate) {
      toast({ 
        variant: 'destructive', 
        title: isTh ? 'วันสิ้นสุดสัญญาไม่ถูกต้อง' : 'Invalid End Date', 
        description: isTh ? 'วันสิ้นสุดสัญญาใหม่ต้องอยู่หลังวันเริ่มต้นสัญญาต่ออายุ' : 'New end date must be after the new start date.'
      });
      return;
    }

    const updatedContract = {
      ...contract,
      startDate: newStartDate.toISOString(),
      endDate: newEndDate.toISOString(),
      signatures: {}, // Reset all signatures upon renewal agreement
      status: 'pending_signatures',
      renewalRequested: false,
      isRenewed: true,
      updatedAt: new Date().toISOString(),
    };

    if (contractId.startsWith('mock_ctr_')) {
      const stored = localStorage.getItem('contracts');
      if (stored) {
        const contracts = JSON.parse(stored);
        const idx = contracts.findIndex((c: any) => c.id === contractId);
        if (idx !== -1) {
          contracts[idx] = updatedContract;
          localStorage.setItem('contracts', JSON.stringify(contracts));
        }
      }
    }

    setContract(updatedContract);
    setEditStartDate(newStartDate.toISOString().substring(0, 10));
    setEditEndDate(newEndDate.toISOString().substring(0, 10));

    const newAudit: AuditEvent = {
      event: 'terms_edited',
      actor: user?.displayName || (currentUserRole === 'owner' ? 'Owner' : 'Agent'),
      timestamp: new Date().toISOString(),
      detail: `อนุมัติคำขอต่อสัญญาและอัปเดตวันสิ้นสุดสัญญาใหม่เป็น ${format(newEndDate, 'dd MMMM yyyy')}`,
    };
    setAuditLog(prev => [newAudit, ...prev]);

    // Send notifications to all parties to sign
    const notifyMsg = `สัญญาต่ออายุสำหรับห้องพัก ${contract.propertyName || ''} ได้รับการปรับปรุงแล้ว กรุณาลงนามออนไลน์เพื่อเปิดใช้งานสัญญาใหม่`;
    addNotification({
      type: 'warning',
      title: '✍️ กรุณาลงนามสัญญาต่ออายุ',
      message: notifyMsg,
      action: {
        label: '✍️ ลงนามสัญญา',
        url: '/profile?tab=contracts'
      }
    });

    toast({
      title: isTh ? 'อนุมัติการต่อสัญญาแล้ว' : 'Renewal Approved',
      description: isTh ? 'รีเซ็ตลายเซ็นและส่งคำขอลงนามไปยังทุกฝ่ายแล้ว' : 'Signatures reset and signing request sent to all parties.',
    });
  };

  const handleSignSubmit = async () => {
    if (!hasSigned || !signatureDataUrl || !signingRole) return;
    try {
      if (user && !user.isMock && db) {
        const res = await fetch('/api/contract/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractId, role: signingRole, signatureDataUrl, uid: user.uid, name: user.displayName, ipAddress: '127.0.0.1' }),
        });
        if (!res.ok) throw new Error('Failed to submit signature');
      }
      const updatedSigs = {
        ...contract.signatures,
        [signingRole]: {
          uid: user?.uid || 'mock_user_id',
          name: user?.displayName || (signingRole === 'owner' ? 'สมชาย ใจดี' : signingRole === 'tenant' ? 'ณัฐพล ใจสู้' : 'PrimeRent Agent'),
          role: signingRole,
          signedAt: new Date().toISOString(),
          signatureDataUrl,
          ipAddress: '127.0.0.1',
        },
      };
      const totalSigsNeeded = contract.agentId ? 3 : 2;
      const isCompleted = Object.keys(updatedSigs).length >= totalSigsNeeded;
      const newStatus = isCompleted ? 'active' : 'pending_signatures';
      const newAudit: AuditEvent = {
        event: isCompleted ? 'contract_activated' : 'signature_added',
        actor: user?.displayName || (signingRole === 'owner' ? 'เจ้าของห้อง' : signingRole === 'tenant' ? 'ผู้เช่า' : 'ตัวแทน'),
        timestamp: new Date().toISOString(),
        detail: `${signingRole === 'owner' ? 'เจ้าของ' : signingRole === 'tenant' ? 'ผู้เช่า' : 'ตัวแทน'}ลงนามในสัญญาเรียบร้อย${isCompleted ? ' · สัญญามีผลสมบูรณ์แล้ว!' : ''}`,
      };
      const updatedContract = { ...contract, signatures: updatedSigs, status: newStatus, updatedAt: new Date().toISOString() };
      if (!user || user.isMock) {
        const stored = localStorage.getItem('contracts');
        if (stored) {
          const contracts = JSON.parse(stored);
          const idx = contracts.findIndex((c: any) => c.id === contractId);
          if (idx !== -1) { contracts[idx] = updatedContract; localStorage.setItem('contracts', JSON.stringify(contracts)); }
        }
      }
      setContract(updatedContract);
      setAuditLog(prev => [newAudit, ...prev]);
      setSigningRole(null);
      setSignatureDataUrl('');
      setHasSigned(false);

      // Trigger custom pending / completed sign status alerts
      if (!isCompleted) {
        const pendingRoles = ['tenant', 'owner'];
        if (contract.agentId) pendingRoles.push('agent');
        const missing = pendingRoles.filter(r => !updatedSigs[r]);
        const missingThai = missing.map(r => r === 'tenant' ? 'ผู้เช่า' : r === 'owner' ? 'เจ้าของห้อง' : 'ตัวแทน');
        
        addNotification({
          type: 'warning',
          title: '🚨 สัญญาเช่ารอลงนาม (ยังเซ็นไม่ครบ)',
          message: `สัญญาสำหรับห้องพัก ${contract.propertyName || ''} ยังไม่ได้ลงนามจาก: ${missingThai.join(', ')}`,
          action: {
            label: '✍️ ไปลงนาม',
            url: '/profile?tab=contracts'
          }
        });
      } else {
        addNotification({
          type: 'success',
          title: '🎉 สัญญาเช่าต่ออายุสำเร็จ!',
          message: `สัญญาเช่าต่ออายุสำหรับห้องพัก ${contract.propertyName || ''} ได้รับการลงนามครบทุกฝ่ายและมีผลสมบูรณ์แล้ว!`,
          action: {
            label: '📄 ดูสัญญาเช่า',
            url: '/profile?tab=contracts'
          }
        });
      }

      toast({
        title: isTh ? 'ลงนามสำเร็จ' : 'Signature Saved',
        description: isCompleted ? (isTh ? 'สัญญามีผลใช้งานสมบูรณ์แล้ว!' : 'Contract is now fully active!') : (isTh ? 'บันทึกลายเซ็นเรียบร้อยแล้ว' : 'Signature recorded.'),
      });
    } catch (err: any) {
      toast({ variant: 'destructive', title: isTh ? 'ลงนามไม่สำเร็จ' : 'Signature Failed', description: err.message });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('RESIDENTIAL LEASE AGREEMENT', 105, 18, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Contract ID: ${contractId}  |  Template: ${TEMPLATES[template].label}`, 105, 24, { align: 'center' });
      doc.line(20, 30, 190, 30);

      doc.setFont('Helvetica', 'bold');
      doc.text('1. PROPERTY & PARTIES', 20, 40);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Property: ${contract.propertyName || 'N/A'}`, 25, 47);
      doc.text(`Owner ID: ${contract.ownerId || 'N/A'}`, 25, 53);
      doc.text(`Tenant ID: ${contract.tenantId || 'N/A'}`, 25, 59);

      doc.setFont('Helvetica', 'bold');
      doc.text('2. LEASE TERMS', 20, 70);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Monthly Rent: THB ${Number(contract.monthlyRent || 0).toLocaleString()}`, 25, 77);
      doc.text(`Security Deposit: THB ${Number(contract.depositAmount || 0).toLocaleString()}`, 25, 83);
      doc.text(`Advance Rent: THB ${Number(contract.advanceRentAmount || 0).toLocaleString()}`, 25, 89);
      const sDate = contract.startDate ? format(new Date(contract.startDate), 'dd MMMM yyyy') : 'N/A';
      const eDate = contract.endDate ? format(new Date(contract.endDate), 'dd MMMM yyyy') : 'N/A';
      doc.text(`Start Date: ${sDate}`, 25, 95);
      doc.text(`End Date: ${eDate}`, 25, 101);

      doc.line(20, 108, 190, 108);
      doc.setFont('Helvetica', 'bold');
      doc.text('3. E-SIGNATURE CONFIRMATION', 20, 118);

      const printSignatures = (startY: number) => {
        let sigY = startY;
        const roles = ['tenant', 'owner'];
        if (contract.agentId) roles.push('agent');

        for (const r of roles) {
          if (sigY > 250) {
            doc.addPage();
            sigY = 20;
          }
          const sig = contract.signatures?.[r];
          doc.setFont('Helvetica', 'bold');
          doc.text(`${r.toUpperCase()}:`, 25, sigY);
          doc.setFont('Helvetica', 'normal');
          if (sig) {
            doc.text(`Name: ${sig.name}`, 30, sigY + 6);
            doc.text(`Signed At: ${format(new Date(sig.signedAt), 'dd MMM yyyy HH:mm')}`, 30, sigY + 11);
            doc.text(`IP Address: ${sig.ipAddress}`, 30, sigY + 16);
            if (sig.signatureDataUrl && sig.signatureDataUrl.startsWith('data:image')) {
              try {
                doc.addImage(sig.signatureDataUrl, 'PNG', 30, sigY + 20, 60, 20);
                sigY += 50;
              } catch {
                sigY += 28;
              }
            } else {
              sigY += 28;
            }
          } else {
            doc.text('PENDING SIGNATURE (รอการลงนาม)', 30, sigY + 6);
            sigY += 20;
          }
        }
      };

      printSignatures(128);

      // Attachments Pages
      if (contract.attachments && contract.attachments.length > 0) {
        contract.attachments.forEach((att: any, index: number) => {
          doc.addPage();
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(14);
          doc.text(`ATTACHMENT ${index + 1}: ${att.title}`, 20, 20);
          
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(10);
          
          // Basic text wrapping for attachment content
          const splitText = doc.splitTextToSize(att.content, 170);
          doc.text(splitText, 20, 30);
          
          // Determine Y position for signatures based on content height
          let sigStartY = 30 + (splitText.length * 5) + 10;
          if (sigStartY > 200) {
            doc.addPage();
            sigStartY = 20;
          }
          
          doc.line(20, sigStartY - 5, 190, sigStartY - 5);
          doc.setFont('Helvetica', 'bold');
          doc.text('ATTACHMENT SIGNATURES', 20, sigStartY);
          
          printSignatures(sigStartY + 10);
        });
      }

      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text('🔒 Digitally Secured & Encrypted by PrimeRent Digital Platform', 105, 280, { align: 'center' });

      doc.save(`Contract_${contractId}.pdf`);
      toast({ title: isTh ? 'ดาวน์โหลด PDF สำเร็จ' : 'PDF Downloaded', description: isTh ? 'สัญญาพร้อมลายเซ็นบันทึกเรียบร้อยแล้ว' : 'Contract with signatures saved.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Download Failed', description: err.message });
    }
  };

  const handleShareLine = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const lineText = encodeURIComponent(
      isTh ? `📄 ลิงก์สัญญาเช่า (PrimeRent):\n${shareUrl}` : `📄 Lease Contract Link (PrimeRent):\n${shareUrl}`
    );
    // Copy to clipboard
    try { await navigator.clipboard.writeText(shareUrl); } catch {}
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    // Open LINE share
    window.open(`https://line.me/R/msg/text/?${lineText}`, '_blank');
    toast({ title: isTh ? 'คัดลอกลิงก์แล้ว' : 'Link Copied', description: isTh ? 'ลิงก์สัญญาถูกคัดลอกและเปิด LINE แล้ว' : 'Contract link copied & LINE opened.' });
  };

  // ── Render

  // ── Render

  const canEdit = currentUserRole === 'owner' || currentUserRole === 'agent';
  const hasAgent = !!contract.agentId;

  const handleInlineSave = (overrides?: Partial<any>) => {
    const updated: any = {
      monthlyRent: Number(editMonthlyRent),
      depositAmount: Number(editDepositAmount),
      advanceRentAmount: Number(editAdvanceRentAmount),
      startDate: new Date(editStartDate).toISOString(),
      endDate: new Date(editEndDate).toISOString(),
      attachments: editAttachments,
      landlordName: editLandlordName,
      tenantName: editTenantName,
      agentName: editAgentName,
      propertyName: editPropertyName,
      ...overrides
    };

    if (!contract) return;

    // Check if there are actual changes
    const isChanged = 
      contract.monthlyRent !== updated.monthlyRent ||
      contract.depositAmount !== updated.depositAmount ||
      new Date(contract.startDate).toISOString() !== updated.startDate ||
      new Date(contract.endDate).toISOString() !== updated.endDate ||
      contract.landlordName !== updated.landlordName ||
      contract.tenantName !== updated.tenantName ||
      contract.agentName !== updated.agentName ||
      contract.propertyName !== updated.propertyName ||
      JSON.stringify(contract.attachments) !== JSON.stringify(updated.attachments) ||
      !!overrides;

    if (!isChanged) return;

    let signaturesCleared = false;
    if (contract.signatures && (contract.signatures.tenant || contract.signatures.owner)) {
      updated.signatures = {};
      signaturesCleared = true;
    }

    if (contractId.startsWith('mock_ctr_')) {
      const stored = localStorage.getItem('contracts');
      if (stored) {
        let arr = JSON.parse(stored);
        arr = arr.map((c: any) => c.id === contractId ? { ...c, ...updated } : c);
        localStorage.setItem('contracts', JSON.stringify(arr));
        setContract({ ...contract, ...updated });
        
        if (signaturesCleared) {
          toast({ 
            title: isTh ? 'ระบบรีเซ็ตลายเซ็นแล้ว' : 'Signatures Reset', 
            description: isTh ? 'เอกสารมีการเปลี่ยนแปลง ระบบได้ลบลายเซ็นเดิมและส่งแจ้งเตือนให้ผู้เช่าเข้ามาเซ็นใหม่เรียบร้อยแล้ว' : 'Contract was edited. Previous signatures were cleared and notification sent to tenant to re-sign.',
            variant: 'destructive'
          });
        } else {
          toast({ title: isTh ? 'บันทึกข้อมูลสัญญาแล้ว' : 'Contract details saved' });
        }
      }
    } else {
      toast({ title: 'Saved in DB' });
    }
  };

  return (
    <div className={cn("mx-auto font-thai bg-white text-gray-900 shadow-sm", isCompact ? "p-5 rounded-2xl border border-gray-150" : "p-8 md:p-12 shadow-md max-w-4xl border rounded-3xl")}>
      
      {/* ─── Renewal Flow Status Banners & Actions ─── */}
      <div className="mb-6 space-y-4">
        {/* Status: Active Contract - Tenant can request renewal */}
        {contract.status === 'active' && !contract.renewalRequested && !contract.isRenewed && currentUserRole === 'tenant' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-blue-900 uppercase tracking-wider mb-1">💡 ต่ออายุสัญญาเช่า (Lease Renewal)</p>
              <p className="text-[11px] text-blue-700 font-medium font-thai">สัญญาปัจจุบันของคุณใกล้สิ้นสุดแล้ว คุณต้องการส่งคำร้องเพื่อขอต่อสัญญากับเจ้าของห้องและตัวแทนหรือไม่?</p>
            </div>
            <Button onClick={handleRequestRenewal} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shrink-0 font-thai">
              ขอต่ออายุสัญญา
            </Button>
          </div>
        )}

        {/* Status: Tenant sent renewal request - awaiting Owner/Agent action */}
        {contract.renewalRequested && (
          <>
            {currentUserRole === 'tenant' ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl font-thai">
                <p className="text-xs font-black text-amber-900 uppercase tracking-wider mb-1">📬 ส่งคำขอต่อสัญญาเช่าแล้ว</p>
                <p className="text-[11px] text-amber-700 font-medium">อยู่ระหว่างรอเจ้าของห้องหรือตัวแทนอัปเดตกำหนดวันสิ้นสุดสัญญาใหม่เพื่อเข้าสู่ขั้นตอนลงนามร่วมกัน</p>
              </div>
            ) : (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 font-thai">
                <div>
                  <p className="text-xs font-black text-amber-900 uppercase tracking-wider mb-1">📝 คำขอต่ออายุสัญญาเช่า (Lease Renewal Request)</p>
                  <p className="text-[11px] text-amber-700 font-medium">ผู้เช่าได้ยื่นคำร้องขอขยายเวลาสัญญาเช่านี้ กรุณาระบุวันสิ้นสุดสัญญาใหม่เพื่อรีเซ็ตลายเซ็นและเริ่มต้นการลงนามใหม่</p>
                </div>
                <div className="flex flex-col sm:flex-row items-end gap-3 max-w-md">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-amber-950 uppercase tracking-widest">วันสิ้นสุดสัญญาใหม่:</label>
                    <input 
                      type="date" 
                      value={renewalInputDate} 
                      onChange={e => setRenewalInputDate(e.target.value)} 
                      className="w-full text-xs font-bold border border-amber-300 bg-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800" 
                    />
                  </div>
                  <Button 
                    onClick={() => handleApproveRenewal(renewalInputDate)} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-xl"
                  >
                    อนุมัติและส่งให้ทุกฝ่ายลงนาม
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Status: Renewal in progress (Awaiting Signatures) */}
        {contract.status === 'pending_signatures' && contract.isRenewed && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 font-thai">
            <div>
              <p className="text-xs font-black text-rose-950 uppercase tracking-wider mb-0.5">✍️ สัญญาต่ออายุอยู่ระหว่างการลงนามออนไลน์</p>
              <p className="text-[11px] text-rose-800 font-medium">กรุณาลงนามกำกับด้านล่างของสัญญาเพื่อให้มีผลสมบูรณ์</p>
            </div>
            
            {/* Show pending signatures count & list who signed */}
            <div className="flex gap-2 flex-wrap pt-1">
              <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", contract.signatures?.owner ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200")}>
                {contract.signatures?.owner ? "✓ เจ้าของลงนามแล้ว" : "✗ รอเจ้าของลงนาม"}
              </span>
              <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", contract.signatures?.tenant ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200")}>
                {contract.signatures?.tenant ? "✓ ผู้เช่าลงนามแล้ว" : "✗ รอผู้เช่าลงนาม"}
              </span>
              {contract.agentId && (
                <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", contract.signatures?.agent ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200")}>
                  {contract.signatures?.agent ? "✓ ตัวแทนลงนามแล้ว" : "✗ รอตัวแทนลงนาม"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Status: Renewed & Active */}
        {contract.status === 'active' && contract.isRenewed && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl font-thai">
            <p className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-0.5">🎉 สัญญาต่ออายุสำเร็จและมีผลสมบูรณ์แล้ว!</p>
            <p className="text-[11px] text-emerald-800 font-medium">ได้รับการลงนามครบถ้วนทุกฝ่ายแล้ว สัญญารอบใหม่เริ่มวันที่ {formatThaiDate(contract.startDate)} ถึง {formatThaiDate(contract.endDate)}</p>
          </div>
        )}
      </div>

      {/* Document Header */}
      <div className="relative text-center mb-6 md:mb-8 border-b pb-4 md:pb-6">
        <h1 className="text-base md:text-lg font-black mb-1 md:mb-2 text-slate-900">หนังสือสัญญาเช่าที่พักอาศัย</h1>
        <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider font-thai">ทำขึ้น ณ แพลตฟอร์ม PrimeRent (สัญญาเช่าฉบับสมบูรณ์)</p>
        
      </div>

      <div className="space-y-3 md:space-y-4 text-[11px] md:text-[12px] leading-relaxed md:leading-loose text-slate-800 font-medium">
        <div className="indent-6 leading-relaxed md:leading-loose">
          สัญญาเช่าฉบับนี้ทำขึ้นระหว่าง 
          <ContractField value={editLandlordName} onChange={setEditLandlordName} onBlur={handleInlineSave} placeholder="ชื่อผู้ให้เช่า" disabled={!(canEdit && isEditing)} />
          (ซึ่งต่อไปในสัญญานี้จะเรียกว่า "ผู้ให้เช่า") ฝ่ายหนึ่ง กับ 
          <ContractField value={editTenantName} onChange={setEditTenantName} onBlur={handleInlineSave} placeholder="ชื่อผู้เช่า" disabled={!(canEdit && isEditing)} />
          (ซึ่งต่อไปในสัญญานี้จะเรียกว่า "ผู้เช่า") อีกฝ่ายหนึ่ง โดยมี 
          <ContractField value={editAgentName} onChange={setEditAgentName} onBlur={handleInlineSave} placeholder="ชื่อตัวแทน/พยาน" disabled={!(canEdit && isEditing)} />
          เป็นตัวแทนและพยานผู้ประสานงานร่วมดูแล
        </div>

        <div className="indent-6 leading-relaxed md:leading-loose">
          ทั้งสองฝ่ายตกลงทำสัญญาเช่าทรัพย์สินประเภทห้องพัก โครงการ 
          <ContractField value={editPropertyName} onChange={setEditPropertyName} onBlur={handleInlineSave} placeholder="ชื่อโครงการที่พัก" disabled={!(canEdit && isEditing)} />
          โดยมีเงื่อนไขรายละเอียดดังนี้:
        </div>
      </div>

      {/* Financials Box */}
      <div className="my-5 bg-slate-50/50 p-4 rounded-xl border border-gray-200 mx-auto max-w-sm shadow-sm">
        <div className="space-y-3.5 text-[11px] md:text-[12px]">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100/80">
            <span className="font-bold text-gray-600">อัตราค่าเช่ารายเดือน:</span>
            {(canEdit && isEditing) ? (
              <div className="flex items-center gap-1">
                <input type="number" value={editMonthlyRent} onChange={e => setEditMonthlyRent(e.target.value)} onBlur={handleInlineSave} className="w-20 text-center border-b-2 border-emerald-500 bg-emerald-50/20 font-bold text-slate-950 focus:outline-none focus:border-emerald-600 focus:bg-emerald-50/50 hover:bg-emerald-50/40 transition-all px-1 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <span className="font-bold text-gray-500">บาท/เดือน</span>
              </div>
            ) : (
              <span className="font-bold text-slate-900">฿{Number(editMonthlyRent || 0).toLocaleString()} บาท/เดือน</span>
            )}
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-100/80">
            <span className="font-bold text-gray-600">เงินประกันความเสียหาย (มัดจำ):</span>
            {(canEdit && isEditing) ? (
              <div className="flex items-center gap-1">
                <input type="number" value={editDepositAmount} onChange={e => setEditDepositAmount(e.target.value)} onBlur={handleInlineSave} className="w-20 text-center border-b-2 border-emerald-500 bg-emerald-50/20 font-bold text-slate-950 focus:outline-none focus:border-emerald-600 focus:bg-emerald-50/50 hover:bg-emerald-50/40 transition-all px-1 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <span className="font-bold text-gray-500">บาท</span>
              </div>
            ) : (
              <span className="font-bold text-slate-900">฿{Number(editDepositAmount || 0).toLocaleString()} บาท</span>
            )}
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-100/80">
            <span className="font-bold text-gray-600">ระยะเวลาเช่าเริ่มต้น:</span>
            {(canEdit && isEditing) ? (
              <input type="date" value={editStartDate} onChange={e => setEditStartDate(e.target.value)} onBlur={handleInlineSave} className="w-24 text-center border-b-2 border-emerald-500 bg-emerald-50/20 font-bold text-slate-950 focus:outline-none focus:border-emerald-600 focus:bg-emerald-50/50 hover:bg-emerald-50/40 transition-all px-1 py-0.5" />
            ) : (
              <span className="font-bold text-slate-900">{formatThaiDate(editStartDate)}</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-600">ระยะเวลาเช่าสิ้นสุด:</span>
            {(canEdit && isEditing) ? (
              <input type="date" value={editEndDate} onChange={e => setEditEndDate(e.target.value)} onBlur={handleInlineSave} className="w-24 text-center border-b-2 border-emerald-500 bg-emerald-50/20 font-bold text-slate-950 focus:outline-none focus:border-emerald-600 focus:bg-emerald-50/50 hover:bg-emerald-50/40 transition-all px-1 py-0.5" />
            ) : (
              <span className="font-bold text-slate-900">{formatThaiDate(editEndDate)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="my-4 md:my-6 space-y-3 md:space-y-4 text-[11px] md:text-[12px]">
        <h3 className="font-black text-[12px] md:text-[14px]">ข้อตกลงและหน้าที่เพิ่มเติม:</h3>
        <ol className="list-decimal pl-5 md:pl-6 space-y-2 md:space-y-3 text-gray-700 leading-relaxed md:leading-loose font-medium">
          <li>ผู้เช่าตกลงชำระเงินค่าเช่าล่วงหน้าภายในวันที่ 5 ของทุกเดือน หากล่าช้าจะยินยอมให้ปรับวันละ 100 บาท</li>
          <li>ผู้เช่าตกลงรับผิดชอบชำระค่าสาธารณูปโภค ค่าน้ำ ค่าไฟ ตามหน่วยวัดอัตราที่ทางการเรียกเก็บ</li>
          <li>ห้ามมิให้ผู้เช่านำทรัพย์สินไปให้ผู้อื่นเช่าช่วง หรือใช้ประกอบกิจการผิดกฎหมาย</li>
        </ol>
      </div>

      {/* Agent Checkbox */}
      {currentUserRole === 'owner' && (
        <div 
          className={cn("my-4 md:my-6 border p-3 md:p-4 rounded-lg flex items-center gap-2 md:gap-3", canEdit ? 'cursor-pointer hover:bg-gray-50 transition-colors' : '', !contract.agentId ? "bg-blue-50/50 border-blue-100" : "bg-gray-50 border-gray-200")}
          onClick={() => {
             if (canEdit) {
                const newContract = { ...contract };
                if (newContract.agentId) {
                  delete newContract.agentId;
                } else {
                  newContract.agentId = 'mock_agent_123';
                }
                setContract(newContract);
                const stored = localStorage.getItem('contracts');
                if (stored) {
                   const arr = JSON.parse(stored);
                   const cidx = arr.findIndex((c:any) => c.id === contract.id);
                   if(cidx !== -1) {
                      if (newContract.agentId) {
                        arr[cidx].agentId = newContract.agentId;
                      } else {
                        delete arr[cidx].agentId;
                      }
                      localStorage.setItem('contracts', JSON.stringify(arr));
                   }
                }
             }
          }}
        >
          <div className={cn("w-3 h-3 md:w-4 md:h-4 rounded flex items-center justify-center text-white shrink-0", !contract.agentId ? "bg-blue-600" : "bg-gray-300")}>
            {!contract.agentId && <Check className="w-1.5 h-1.5 md:w-2 md:h-2" />}
          </div>
          <span className={cn("font-bold text-[10px] md:text-[11px]", !contract.agentId ? "text-blue-900" : "text-gray-600")}>
             ปล่อยเช่าเอง ไม่มีนายหน้า (สัญญาสองฝ่าย)
          </span>
        </div>
      )}

      {canEdit && (
        <div className="mt-6 mb-2 space-y-3">
          <Button 
            variant={isEditing ? "default" : "outline"} 
            className={cn("w-full py-6 rounded-xl text-[14px] font-black border-2 border-gray-300", isEditing ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-lg shadow-emerald-500/20" : "")}
            onClick={() => setIsEditing(!isEditing)} 
          >
            {isEditing ? <><CheckCircle2 className="w-5 h-5 mr-2" /> บันทึกและเสร็จสิ้น</> : <><Edit2 className="w-5 h-5 mr-2" /> แก้ไขสัญญา</>}
          </Button>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-xl text-[14px] shadow-lg shadow-blue-500/20"
            onClick={async () => {
              try {
                const payload = {
                  contractId: contract.id,
                  startDate: editStartDate,
                  endDate: editEndDate,
                  monthlyRent: editMonthlyRent,
                  addendums: {
                    furniture: editAttachments.map(a => ({ item: a.title, penaltyPrice: Number(a.content) || 0 })),
                    others: []
                  },
                  updatedByRole: currentUserRole,
                  updatedByUid: 'web-user'
                };
                
                const res = await fetch('/api/contract/update', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                  // Reset local signatures
                  const updated = { ...contract, signatures: {}, status: 'pending_signatures' };
                  setContract(updated);
                  
                  const stored = localStorage.getItem('contracts');
                  if (stored) {
                    const arr = JSON.parse(stored);
                    const cidx = arr.findIndex((c:any) => c.id === contract.id);
                    if (cidx !== -1) {
                      arr[cidx] = updated;
                      localStorage.setItem('contracts', JSON.stringify(arr));
                    }
                  }
                  toast({
                    title: isTh ? 'บันทึกสำเร็จ & ส่งแจ้งเตือนแล้ว' : 'Saved & Notified',
                    description: isTh ? 'ระบบเคลียร์ลายเซ็นและส่ง LINE แจ้งให้ทุกฝ่ายเซ็นใหม่แล้ว' : 'Signatures reset and LINE notification sent.',
                  });
                } else {
                  toast({ variant: 'destructive', title: 'Error', description: 'Failed to update contract.' });
                }
              } catch (e) {
                console.error(e);
                toast({ variant: 'destructive', title: 'Error', description: 'Network error.' });
              }
            }}
          >
            <Save className="w-5 h-5 mr-2" />
            {isTh ? 'บันทึกข้อมูลและส่งแจ้งเตือนให้ทุกฝ่ายเซ็นใหม่' : 'Save & Request New Signatures'}
          </Button>
        </div>
      )}

      {/* Signatures */}
      <div className={cn("grid gap-2 md:gap-4 mt-6", contract.agentId ? "grid-cols-3" : "grid-cols-2")}>
        {/* Owner */}
        <div className="flex flex-col items-center justify-center p-2 md:p-3 border border-gray-100 rounded-lg bg-gray-50 text-center">
          <span className="text-[9px] md:text-[10px] font-bold text-gray-400 mb-1">ลายมือชื่อเจ้าของห้อง (OWNER)</span>
          {contract.signatures?.owner ? (
            <div className="flex flex-col items-center">
              <img src={contract.signatures.owner.signatureDataUrl} alt="Owner Signature" className="h-6 md:h-8 object-contain" />
              <span className="text-[9px] text-emerald-600 font-bold">ลงนามแล้ว</span>
            </div>
          ) : (
            <>
              {currentUserRole === 'owner' ? (
                <Button className="w-full font-bold bg-primary hover:bg-primary/90 rounded text-[9px] md:text-[10px] py-0 h-5 md:h-6 text-white mt-1" onClick={() => setSigningRole('owner')}>
                  กดเพื่อลงนาม
                </Button>
              ) : (
                <span className="text-[9px] text-red-400 font-bold mt-1">รอเจ้าของห้องลงนาม</span>
              )}
            </>
          )}
        </div>

        {/* Tenant */}
        <div className="flex flex-col items-center justify-center p-2 md:p-3 border border-gray-100 rounded-lg bg-gray-50 text-center">
          <span className="text-[9px] md:text-[10px] font-bold text-gray-400 mb-1">ลายมือชื่อผู้เช่า (TENANT)</span>
          {contract.signatures?.tenant ? (
            <div className="flex flex-col items-center">
              <img src={contract.signatures.tenant.signatureDataUrl} alt="Tenant Signature" className="h-6 md:h-8 object-contain" />
              <span className="text-[9px] text-emerald-600 font-bold">ลงนามแล้ว</span>
            </div>
          ) : (
            <>
              {currentUserRole === 'tenant' ? (
                <Button className="w-full font-bold bg-primary hover:bg-primary/90 rounded text-[9px] md:text-[10px] py-0 h-5 md:h-6 text-white mt-1" onClick={() => setSigningRole('tenant')}>
                  กดเพื่อลงนาม
                </Button>
              ) : (
                <span className="text-[9px] text-red-400 font-bold mt-1">รอผู้เช่าลงนาม</span>
              )}
            </>
          )}
        </div>

        {/* Agent */}
        {contract.agentId && (
          <div className="flex flex-col items-center justify-center p-2 md:p-3 border border-gray-100 rounded-lg bg-gray-50 text-center">
            <span className="text-[9px] md:text-[10px] font-bold text-gray-400 mb-1">ลายมือชื่อตัวแทน (AGENT ถ้ามี)</span>
            {contract.signatures?.agent ? (
              <div className="flex flex-col items-center">
                <img src={contract.signatures.agent.signatureDataUrl} alt="Agent Signature" className="h-6 md:h-8 object-contain" />
                <span className="text-[9px] text-emerald-600 font-bold">ลงนามแล้ว</span>
              </div>
            ) : (
              <>
                {currentUserRole === 'agent' ? (
                  <Button className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] md:text-[10px] py-0 h-5 md:h-6 mt-1" onClick={() => setSigningRole('agent')}>
                    กดเพื่อลงนาม
                  </Button>
                ) : (
                  <span className="text-[9px] text-red-400 font-bold mt-1">รอตัวแทนลงนาม</span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Attachments (Inventory) */}
      <div className="my-3 md:my-4 border-t border-dashed border-gray-300 pt-4 md:pt-5">
        <h3 className="font-black text-[11px] md:text-[12px] mb-1.5">เอกสารแนบท้าย 1: รายการเฟอร์นิเจอร์และประเมินค่าเสียหาย</h3>
        <p className="text-[10px] md:text-[11px] text-gray-500 mb-3 md:mb-4">รายละเอียดทรัพย์สินภายในห้องพัก หากเกิดความเสียหายผู้เช่ายินยอมชดใช้ตามมูลค่าที่ระบุด้านล่าง</p>
        <div className="space-y-1.5 md:space-y-2 text-[11px] md:text-[12px] max-w-md mx-auto">
          {editAttachments.length === 0 && !canEdit && (
            <div className="text-gray-400 italic text-center py-2">ไม่มีรายการเอกสารแนบท้าย</div>
          )}
          {editAttachments.map((att, i) => (
            <div key={att.id} className="flex items-center gap-1 md:gap-2 mb-1.5 group relative">
              <span className="w-3 md:w-4 text-right text-gray-500 font-bold text-[11px] md:text-[12px] shrink-0">{i + 1}.</span>
              {canEdit ? (
                <>
                  <PenTool className="w-3 h-3 text-amber-500 absolute -left-3 md:-left-4 opacity-70" />
                  <input type="text" value={att.title} onChange={e => {
                    const newAtt = [...editAttachments]; newAtt[i].title = e.target.value; setEditAttachments(newAtt);
                  }} onBlur={handleInlineSave} style={{ fontSize: '10px' }} className="flex-[2] border-b border-gray-300 border-dashed bg-transparent px-1 font-normal focus:outline-none focus:bg-amber-50 focus:border-amber-400 !text-[10px] transition-colors text-gray-800" placeholder="รายการ (เช่น Sofa)" />
                  <div className="flex-1 mx-1 md:mx-2 shrink-0" />
                  <input type="text" value={att.content} onChange={e => {
                    const newAtt = [...editAttachments]; newAtt[i].content = e.target.value; setEditAttachments(newAtt);
                  }} onBlur={handleInlineSave} style={{ fontSize: '10px' }} className="w-14 md:w-20 border-b border-gray-300 border-dashed bg-transparent px-1 font-bold focus:outline-none focus:bg-amber-50 focus:border-amber-400 !text-[10px] text-center transition-colors text-amber-700" placeholder="0" />
                  <span className="text-gray-700 font-bold !text-[10px] w-6 md:w-8 shrink-0">บาท</span>
                  <Button variant="ghost" size="icon" onClick={() => {
                    const newList = editAttachments.filter((_, idx) => idx !== i);
                    setEditAttachments(newList);
                    handleInlineSave({ attachments: newList });
                  }} className="text-red-400 hover:text-red-600 hover:bg-red-50 h-5 w-5 shrink-0 ml-1 rounded-full">
                    <X className="w-3 h-3" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-[2] font-normal text-gray-800 !text-[10px] pl-1" style={{ fontSize: '10px' }}>{att.title}</span>
                  <div className="flex-1 mx-1 md:mx-2 shrink-0" />
                  <span className="font-bold text-amber-700 !text-[10px] px-2 text-center" style={{ fontSize: '10px' }}>{Number(att.content || 0).toLocaleString()}</span>
                  <div className="flex-1 mx-1 md:mx-2 shrink-0" />
                  <span className="text-gray-700 font-bold !text-[10px] w-6 md:w-8 shrink-0 text-right">บาท</span>
                </>
              )}
            </div>
          ))}
          {canEdit && (
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => setEditAttachments([...editAttachments, { id: `att_${Date.now()}`, title: '', content: '' }])} className="w-[120px] h-7 text-[11px] border-dashed font-bold border-gray-300">
                + เพิ่มรายการ
              </Button>
            </div>
          )}
        </div>


      </div>

      {/* Attachments (Images) */}
      {canEdit && (
      <div className="my-3 md:my-4 border-t border-dashed border-gray-300 pt-4 md:pt-5">
        <h3 className="font-black text-[11px] md:text-[12px] mb-2 md:mb-3">เอกสารแนบท้าย 2: รูปภาพและเอกสารเพิ่มเติม</h3>
        {canEdit ? (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-2 md:p-3 text-center text-[10px] md:text-[11px] text-gray-400 font-bold bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition-colors max-w-sm mx-auto">
            <FileText className="w-4 h-4 mx-auto mb-1 opacity-50 text-gray-500" />
            คลิกเพื่ออัปโหลดไฟล์ (PDF, JPG, PNG)
            <p className="text-[10px] font-normal mt-0.5 opacity-70">รองรับขนาดสูงสุด 5MB</p>
          </div>
        ) : (
          <div className="text-gray-400 italic text-center py-2 text-[11px] md:text-[12px]">ไม่มีเอกสารเพิ่มเติม</div>
        )}

        {/* Attachment 2 Mini Signatures (Only show if files are uploaded) */}
        {false && (
          <div className={cn("mt-6 grid gap-2 md:gap-4", contract.agentId ? "grid-cols-3" : "grid-cols-2")}>
          <div className="flex flex-col items-center justify-center p-2 border border-gray-100 rounded-lg bg-gray-50 text-center">
            <span className="text-[9px] md:text-[10px] font-bold text-gray-400 mb-1">ลายเซ็นผู้ให้เช่า (Owner)</span>
            {contract.signatures?.owner ? <img src={contract.signatures.owner.signatureDataUrl} className="h-6 md:h-8 object-contain" /> : <span className="text-[9px] text-red-400 font-bold">รอลงนาม</span>}
          </div>
          <div className="flex flex-col items-center justify-center p-2 border border-gray-100 rounded-lg bg-gray-50 text-center">
            <span className="text-[9px] md:text-[10px] font-bold text-gray-400 mb-1">ลายเซ็นผู้เช่า (Tenant)</span>
            {contract.signatures?.tenant ? <img src={contract.signatures.tenant.signatureDataUrl} className="h-6 md:h-8 object-contain" /> : <span className="text-[9px] text-red-400 font-bold">รอลงนาม</span>}
          </div>
          {contract.agentId && (
            <div className="flex flex-col items-center justify-center p-2 border border-gray-100 rounded-lg bg-gray-50 text-center">
              <span className="text-[9px] md:text-[10px] font-bold text-gray-400 mb-1">ลายเซ็นตัวแทน (Agent)</span>
              {contract.signatures?.agent ? <img src={contract.signatures.agent.signatureDataUrl} className="h-6 md:h-8 object-contain" /> : <span className="text-[9px] text-red-400 font-bold">รอลงนาม</span>}
            </div>
          )}
        </div>
        )}
      </div>
      )}

      {/* Signature Modal */}
      <Dialog open={!!signingRole} onOpenChange={(open) => { if(!open) setSigningRole(null); }}>
        <DialogContent className="max-w-md rounded-2xl p-6 border-none">
          <DialogHeader>
            <DialogTitle className="font-black text-center text-lg text-gray-900 flex items-center justify-center gap-2">
              <Stamp className="w-5 h-5 text-primary" />
              {isTh ? 'ระบบลงนามอิเล็กทรอนิกส์' : 'E-Signature'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-inner min-h-[220px]">
              <SignaturePad onSigned={(url) => { setSignatureDataUrl(url); setHasSigned(true); }} onClear={() => { setSignatureDataUrl(''); setHasSigned(false); }} lang={lang} hasSigned={hasSigned || !!signatureDataUrl} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setSigningRole(null)} className="rounded-xl font-bold border-gray-200">
              {isTh ? 'ยกเลิก' : 'Cancel'}
            </Button>
            <Button onClick={handleSignSubmit} disabled={!signatureDataUrl} className="rounded-xl font-bold bg-primary hover:bg-primary/95 text-white shadow-md">
              {isTh ? 'ยืนยันลายเซ็น' : 'Confirm Signature'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
