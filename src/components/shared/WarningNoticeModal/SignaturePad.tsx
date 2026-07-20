'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SignaturePadProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  startDrawing: (e: any) => void;
  draw: (e: any) => void;
  stopDrawing: () => void;
  clearCanvas: () => void;
  onSave: () => void;
  onClose: () => void;
  isTh: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  canvasRef, startDrawing, draw, stopDrawing, clearCanvas, onSave, onClose, isTh
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C2030]/65 backdrop-blur-md p-4">
    <Card className="w-full max-w-md rounded-2xl border border-[#E8E5DD] shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-[#FAF9F5] overflow-hidden animate-in zoom-in-95 duration-200">
      <CardHeader className="p-5 border-b border-[#E8E5DD] bg-white flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-black text-[#1C2030]">
          {isTh ? '✍️ ลงลายมือชื่อเจ้าของห้อง' : '✍️ Landlord Signature Pad'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
          <X className="w-4 h-4 text-gray-500" />
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="border border-dashed border-[#E8E5DD] rounded-xl bg-white flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            width={360}
            height={160}
            className="cursor-crosshair w-full"
          />
        </div>
        <p className="text-[10px] text-gray-400 font-bold text-center">
          {isTh ? 'ใช้นิ้วหรือเมาส์วาดลายเซ็นภายในช่องสี่เหลี่ยมด้านบน' : 'Draw your signature using touch or mouse'}
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={clearCanvas} className="flex-1 rounded-xl font-bold h-11 border-[#E8E5DD] hover:bg-[#FAF9F5]">
            {isTh ? 'ล้างช่อง' : 'Clear'}
          </Button>
          <Button type="button" onClick={onSave} className="flex-1 bg-[#1C2030] hover:bg-[#2D334E] text-white font-bold text-xs h-11 rounded-xl shadow-sm">
            {isTh ? '💾 ยืนยันลายเซ็น' : '💾 Confirm'}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
