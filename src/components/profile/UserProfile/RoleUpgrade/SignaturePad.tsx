'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSignatureCanvas } from '@/components/contract/DigitalContractView/useSignatureCanvas';
import { ShieldCheck, RotateCcw, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  lang: 'th' | 'en' | 'cn';
  onSignatureConfirm: (signatureDataUrl: string) => void;
  onClear: () => void;
}

export function SignaturePad({ lang, onSignatureConfirm, onClear }: SignaturePadProps) {
  const isTh = lang === 'th';
  const [saveToMemory, setSaveToMemory] = useState(true);
  const [savedSig, setSavedSig] = useState<string | null>(null);
  const [useSaved, setUseSaved] = useState(false);
  const [signMethod, setSignMethod] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [customTypedDataUrl, setCustomTypedDataUrl] = useState<string | null>(null);

  const {
    canvasRef, startDrawing, draw, stopDrawing, clearCanvas, isCanvasEmpty
  } = useSignatureCanvas();

  useEffect(() => {
    const saved = localStorage.getItem('primerent_saved_signature');
    if (saved) {
      setSavedSig(saved);
      setUseSaved(true);
      onSignatureConfirm(saved);
    }
  }, [onSignatureConfirm]);

  const handleConfirm = () => {
    if (useSaved && savedSig) {
      onSignatureConfirm(savedSig);
      toast({
        title: isTh ? 'ใช้ลายเซ็นที่บันทึกไว้' : 'Using saved signature',
      });
      return;
    }

    if (signMethod === 'type') {
      if (!typedName.trim() || !customTypedDataUrl) {
        toast({
          variant: 'destructive',
          title: isTh ? 'กรุณากรอกชื่อสะกดก่อนยืนยัน' : 'Please type your name before confirming',
        });
        return;
      }
      if (saveToMemory) {
        localStorage.setItem('primerent_saved_signature', customTypedDataUrl);
        setSavedSig(customTypedDataUrl);
      }
      onSignatureConfirm(customTypedDataUrl);
      toast({
        title: isTh ? 'ยืนยันและบันทึกลายเซ็นเรียบร้อย' : 'Signature confirmed and saved',
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || isCanvasEmpty()) {
      toast({
        variant: 'destructive',
        title: isTh ? 'กรุณาเซ็นลายมือชื่อก่อนยืนยัน' : 'Please sign before confirming',
      });
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    if (saveToMemory) {
      localStorage.setItem('primerent_saved_signature', dataUrl);
      setSavedSig(dataUrl);
      toast({
        title: isTh ? 'บันทึกลายเซ็นเรียบร้อย' : 'Signature saved to memory',
      });
    }

    onSignatureConfirm(dataUrl);
  };

  const handleReset = () => {
    clearCanvas();
    setTypedName('');
    setCustomTypedDataUrl(null);
    if (useSaved) {
      setUseSaved(false);
    }
    onClear();
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setTypedName(text);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!text.trim()) {
      setCustomTypedDataUrl(null);
      onClear();
      return;
    }

    ctx.font = "italic 32px 'Brush Script MT', 'Dancing Script', 'Georgia', cursive";
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Decorative underline signature line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, canvas.height / 2 + 20);
    ctx.quadraticCurveTo(canvas.width / 2, canvas.height / 2 + 30, canvas.width / 2 + 100, canvas.height / 2 + 18);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const dataUrl = canvas.toDataURL('image/png');
    setCustomTypedDataUrl(dataUrl);
    onSignatureConfirm(dataUrl);
  };

  const handleMethodChange = (method: 'draw' | 'type') => {
    setSignMethod(method);
    handleReset();
  };

  const titleText = isTh ? 'กระดานลงลายมือชื่อดิจิทัล' : 'Digital Signature Pad';
  const clearText = isTh ? 'เซ็นใหม่ / ล้างหน้าจอ' : 'Clear & Sign Again';

  return (
    <div className="border border-gray-100 rounded-none p-5 bg-gray-50/50 space-y-4">
      {/* Selector Tabs */}
      {!useSaved && (
        <div className="flex border-b border-gray-200">
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
            {isTh ? '✍️ วาดลายมือชื่อ' : '✍️ Draw'}
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
            {isTh ? '⌨️ พิมพ์ชื่อสะกด' : '⌨️ Type'}
          </button>
        </div>
      )}

      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          {titleText}
        </span>
        <button type="button" onClick={handleReset} className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1">
          <RotateCcw className="w-3 h-3" />
          {clearText}
        </button>
      </div>

      {useSaved && savedSig ? (
        <div className="w-full h-[150px] bg-white border border-gray-100 flex flex-col items-center justify-center p-4 relative">
          <img src={savedSig} alt="Saved Signature" className="max-h-[110px] object-contain opacity-90" />
          <span className="absolute bottom-2 right-3 text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 border border-green-200">
            LOADED FROM MEMORY
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {signMethod === 'type' && (
            <input
              type="text"
              value={typedName}
              onChange={handleTypeChange}
              placeholder={isTh ? 'กรอกชื่อ-นามสกุลจริงเพื่อสร้างลายเซ็น' : 'Type full name to generate signature'}
              className="w-full border border-gray-200 px-3 py-2 text-sm font-bold focus:outline-none focus:border-primary rounded-none text-gray-900 bg-white"
            />
          )}
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            onMouseDown={signMethod === 'draw' ? startDrawing : undefined}
            onMouseMove={signMethod === 'draw' ? draw : undefined}
            onMouseUp={signMethod === 'draw' ? stopDrawing : undefined}
            onMouseOut={signMethod === 'draw' ? stopDrawing : undefined}
            onTouchStart={signMethod === 'draw' ? startDrawing : undefined}
            onTouchMove={signMethod === 'draw' ? draw : undefined}
            onTouchEnd={signMethod === 'draw' ? stopDrawing : undefined}
            className={cn(
              "w-full bg-white touch-none border border-gray-200 h-[150px] transition-all duration-300",
              signMethod === 'draw' ? "cursor-crosshair animate-pulse" : "pointer-events-none"
            )}
          />
        </div>
      )}

      {!useSaved && (
        <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveToMemory}
            onChange={(e) => setSaveToMemory(e.target.checked)}
            className="w-4 h-4 rounded accent-primary cursor-pointer"
          />
          {isTh ? 'จำลายเซ็นนี้ไว้ใช้กับเอกสารอื่นโดยไม่ต้องเขียนซ้ำ' : 'Remember this signature for future documents'}
        </label>
      )}

      {savedSig && !useSaved && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setUseSaved(true);
            onSignatureConfirm(savedSig);
          }}
          className="w-full text-xs font-bold border-gray-200 rounded-none h-10"
        >
          {isTh ? 'ดึงลายเซ็นที่จำไว้มาใช้' : 'Reuse Saved Signature'}
        </Button>
      )}

      <Button
        type="button"
        onClick={handleConfirm}
        className="w-full bg-gray-900 text-white hover:bg-gray-800 font-black rounded-none h-11 text-xs"
      >
        {isTh ? 'ยืนยันความถูกต้องของลายมือชื่อ' : 'Confirm Signature Authenticity'}
      </Button>
    </div>
  );
}
