import React, { useState, useRef } from 'react';
import { PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onSigned: (dataUrl: string) => void;
  onClear: () => void;
  hasSigned: boolean;
  lang: 'th' | 'en' | 'cn';
}

export function SignaturePad({ onSigned, onClear, hasSigned, lang }: SignaturePadProps) {
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
    if ('touches' in e) return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
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
    if (!text.trim()) { onClear(); return; }
    const fontStyles = { elegant: "italic 36px 'Dancing Script', cursive", formal: "italic 32px 'Brush Script MT', cursive", modern: "italic 32px 'Georgia', serif" };
    ctx.font = fontStyles[fontId];
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    onSigned(canvas.toDataURL('image/png'));
  };

  return (
    <div className="space-y-3">
      <div className="flex border-b border-gray-100">
        <button type="button" onClick={() => { setSignMethod('draw'); handleClear(); }} className={cn("flex-1 py-2 text-xs font-bold uppercase border-b-2 text-center transition-all", signMethod === 'draw' ? "border-primary text-primary" : "border-transparent text-gray-400")}>{lang === 'th' ? '✍️ วาดลายมือชื่อ' : '✍️ Draw Signature'}</button>
        <button type="button" onClick={() => { setSignMethod('type'); handleClear(); }} className={cn("flex-1 py-2 text-xs font-bold uppercase border-b-2 text-center transition-all", signMethod === 'type' ? "border-primary text-primary" : "border-transparent text-gray-400")}>{lang === 'th' ? '⌨️ พิมพ์ชื่อสะกด' : '⌨️ Type to Sign'}</button>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><PenTool className="w-3.5 h-3.5 text-primary" />{lang === 'th' ? 'ลายเซ็นดิจิทัล' : 'Digital Signature'}</span>
        <button type="button" onClick={handleClear} className="text-xs text-gray-400 hover:text-red-500 font-medium">{lang === 'th' ? 'ล้าง' : 'Clear'}</button>
      </div>
      <canvas ref={canvasRef} width={400} height={150} className="border-2 border-dashed border-gray-200 rounded-lg bg-white cursor-crosshair touch-none" onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
      {signMethod === 'type' && (
        <div className="space-y-2">
          <input type="text" value={typedName} onChange={(e) => handleTypeChange(e.target.value, selectedFont)} placeholder={lang === 'th' ? 'พิมพ์ชื่อของคุณ...' : 'Type your name...'} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" />
          <div className="flex gap-2">
            {(['elegant', 'formal', 'modern'] as const).map((font) => (
              <button key={font} type="button" onClick={() => setSelectedFont(font)} className={cn("flex-1 px-3 py-1.5 text-xs border rounded-lg", selectedFont === font ? "border-primary bg-primary/5 text-primary font-medium" : "border-gray-200 text-gray-600")}>{font.charAt(0).toUpperCase() + font.slice(1)}</button>
            ))}
          </div>
        </div>
      )}
      {hasSigned && <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{lang === 'th' ? 'ลายเซ็นบันทึกเรียบร้อย' : 'Signature saved'}</div>}
    </div>
  );
}
