import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChecklistSignaturePadProps } from './types';

export const ChecklistSignaturePad: React.FC<ChecklistSignaturePadProps> = ({
  lang,
  signatureImage,
  canvasRef,
  isDrawing,
  startDrawing,
  draw,
  stopDrawing,
  clearCanvas,
  saveSignature
}) => {
  const isThai = lang === 'th';

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-none space-y-4">
      <Label className="font-black text-gray-400 text-[10px] uppercase tracking-widest block">
        {isThai ? 'ลายมือชื่อผู้เช่า (Digital Signature Pad)' : 'Tenant Digital Signature Pad'}
      </Label>
      
      <div className="relative border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="bg-white cursor-crosshair border border-gray-200 touch-none shadow-inner"
        />
        <div className="flex gap-2 mt-4 w-full max-w-[400px]">
          <Button 
            type="button" 
            variant="outline" 
            onClick={clearCanvas} 
            className="flex-1 h-10 rounded-none font-bold text-xs border-gray-200 text-gray-600"
          >
            {isThai ? 'ล้างหน้าจอ' : 'Clear'}
          </Button>
          <Button 
            type="button" 
            onClick={saveSignature}
            className="flex-1 h-10 rounded-none font-bold text-xs bg-primary text-white hover:bg-primary/90"
          >
            {isThai ? 'ยืนยันลายมือชื่อ' : 'Confirm Signature'}
          </Button>
        </div>
      </div>
      
      {signatureImage && (
        <div className="flex flex-col items-center p-3 border border-green-200 bg-green-50/50 rounded-none animate-in fade-in duration-300">
          <p className="text-xs text-green-700 font-bold mb-2 flex items-center gap-1.5">✓ {isThai ? 'บันทึกลายมือชื่อสำเร็จ' : 'Signature Saved Successfully'}</p>
          <img src={signatureImage} className="h-16 border bg-white" alt="Signature Preview" />
        </div>
      )}
    </div>
  );
};
