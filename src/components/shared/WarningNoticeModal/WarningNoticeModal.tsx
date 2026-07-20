'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Send, Edit3, Trash2, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSignatureCanvas } from '@/components/contract/DigitalContractView/useSignatureCanvas';
import { toast } from '@/hooks/use-toast';
import { WarningNoticeModalProps } from './types';
import { NoticePaper } from './NoticePaper';
import { SignaturePad } from './SignaturePad';
import { exportNoticeToPDF } from './pdfGenerator';

export function WarningNoticeModal({ isOpen, onClose, lang = 'th', warningData, onSendLine }: WarningNoticeModalProps) {
  const isTh = lang === 'th';
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const { canvasRef, startDrawing, draw, stopDrawing, clearCanvas, isCanvasEmpty } = useSignatureCanvas();

  useEffect(() => {
    const saved = localStorage.getItem('primerent_landlord_sig');
    if (saved) setSignatureUrl(saved);
  }, []);

  if (!isOpen) return null;

  const handleSaveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isCanvasEmpty()) {
      toast({ variant: 'destructive', title: isTh ? 'กรุณาเซ็นชื่อก่อนยืนยัน' : 'Please sign before confirming' });
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureUrl(dataUrl);
    localStorage.setItem('primerent_landlord_sig', dataUrl);
    setIsSigning(false);
    toast({ title: isTh ? 'ลงนามสำเร็จ' : 'Signed successfully' });
  };

  const handleClearSignature = () => {
    setSignatureUrl(null);
    localStorage.removeItem('primerent_landlord_sig');
    toast({ title: isTh ? 'ลบลายเซ็นแล้ว' : 'Signature cleared' });
  };

  const handleDownloadPDF = async () => {
    await exportNoticeToPDF(warningData, signatureUrl);
    toast({ title: isTh ? 'ดาวน์โหลด PDF สำเร็จ' : 'PDF Downloaded Successfully' });
  };

  const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const now = new Date();
  const thaiDateString = `${now.getDate()} ${thaiMonths[now.getMonth()]} ${now.getFullYear() + 543}`;
  const dueDate = new Date(warningData.dueDate);
  const thaiDueDateString = `${dueDate.getDate()} ${thaiMonths[dueDate.getMonth()]} ${dueDate.getFullYear() + 543}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C2030]/65 backdrop-blur-md p-4 overflow-y-auto">
      <Card className="w-full max-w-3xl rounded-2xl border border-[#E8E5DD] shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-[#FAF9F5] flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <CardHeader className="p-5 bg-white text-[#1C2030] border-b border-[#E8E5DD] flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <CardTitle className="text-sm font-black tracking-wider uppercase text-[#1C2030]">
              {isTh ? 'ร่างหนังสือเตือนบอกกล่าวค้างชำระค่าเช่า' : 'Draft Legal Arrears Notice'}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" onClick={handleDownloadPDF} className="text-[#1C2030] hover:bg-[#FAF9F5] border border-[#E8E5DD] rounded-xl h-9 text-xs font-bold gap-1">
              <Download className="w-3.5 h-3.5" />
              {isTh ? 'ดาวน์โหลด PDF' : 'Download PDF'}
            </Button>
            {onSendLine && (
              <Button size="sm" onClick={onSendLine} className="bg-[#1E854A] hover:bg-[#166F3B] text-white rounded-xl h-9 text-xs font-black gap-1">
                <Send className="w-3.5 h-3.5" />
                {isTh ? 'ส่ง LINE OA' : 'Send LINE'}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:bg-slate-100 rounded-full w-9 h-9">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex justify-center bg-[#FAF9F5]/40 border-b border-[#E8E5DD]">
          <NoticePaper
            ref={printAreaRef}
            warningData={warningData}
            signatureUrl={signatureUrl}
            thaiDateString={thaiDateString}
            thaiDueDateString={thaiDueDateString}
            isTh={isTh}
          />
        </div>

        <div className="p-5 bg-white border-t border-[#E8E5DD] flex flex-row items-center justify-between gap-4 shrink-0">
          {signatureUrl ? (
            <Button variant="destructive" size="sm" onClick={handleClearSignature} className="rounded-xl h-10 font-bold bg-[#FFF5F2] hover:bg-[#FFF5F2]/80 text-[#E55B3C] border border-[#FFE2DA] gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              {isTh ? 'ลบลายเซ็น' : 'Clear Signature'}
            </Button>
          ) : (
            <Button onClick={() => setIsSigning(true)} className="bg-[#1C2030] hover:bg-[#2D334E] text-white rounded-xl h-10 font-bold text-xs gap-1.5 shadow-sm">
              <Edit3 className="w-3.5 h-3.5" />
              {isTh ? '✍️ ลงชื่อออนไลน์' : '✍️ Sign'}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="rounded-xl font-bold text-[#1C2030] border-[#E8E5DD] bg-white hover:bg-[#FAF9F5] h-10 px-5">
            {isTh ? 'ปิดหน้าต่าง' : 'Close'}
          </Button>
        </div>

        {isSigning && (
          <SignaturePad
            canvasRef={canvasRef}
            startDrawing={startDrawing}
            draw={draw}
            stopDrawing={stopDrawing}
            clearCanvas={clearCanvas}
            onSave={handleSaveSignature}
            onClose={() => setIsSigning(false)}
            isTh={isTh}
          />
        )}
      </Card>
    </div>
  );
}
