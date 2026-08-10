'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert, ShieldCheck, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { SignaturePadModalProps } from './types';
import { useSignatureCanvas } from './useSignatureCanvas';

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  lang, contractId, currentUserRole, onClose, onSignComplete
}) => {
  const { user, userData, updateProfile } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [saveSigMemory, setSaveSigMemory] = useState(true);
  const [savedSig, setSavedSig] = useState<string | null>(null);
  const [useSaved, setUseSaved] = useState(false);
  
  const isKycVerified = (userData as any)?.kycStatus === 'verified' || 
                        userData?.verified?.ndid ||
                        (typeof window !== 'undefined' && localStorage.getItem('primerent_mock_kyc') === 'verified');
  const isThai = lang === 'th';

  const {
    canvasRef, startDrawing, draw, stopDrawing, clearCanvas, isCanvasEmpty
  } = useSignatureCanvas();

  useEffect(() => {
    const saved = localStorage.getItem('primerent_saved_signature');
    if (saved) {
      setSavedSig(saved);
      setUseSaved(true);
    }
  }, []);

  const saveSignature = async () => {
    let dataUrl = '';
    if (useSaved && savedSig) {
      dataUrl = savedSig;
    } else {
      const canvas = canvasRef.current;
      if (!canvas || isCanvasEmpty()) {
        toast({ variant: "destructive", title: isThai ? 'กรุณาเซ็นลายมือชื่อก่อนยืนยัน' : 'Please sign before confirming' });
        return;
      }
      dataUrl = canvas.toDataURL('image/png');
      if (saveSigMemory) {
        localStorage.setItem('primerent_saved_signature', dataUrl);
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contract/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId,
          role: currentUserRole,
          signatureDataUrl: dataUrl,
          uid: user?.uid || userData?.id || 'mock_uid',
          name: user?.displayName || userData?.profile?.displayName || 'Unknown Signer',
          ipAddress: '127.0.0.1'
        })
      });
      
      const data = await res.json();
      if (data.success) {
        addNotification({
          type: 'success',
          title: isThai ? 'ลงนามสัญญาสำเร็จ' : 'Contract Signed',
          message: isThai ? `คุณในฐานะ ${currentUserRole} ได้ลงนามในสัญญา #${contractId} แล้ว` : `You signed contract #${contractId} as ${currentUserRole}.`,
        });
        toast({
          title: isThai ? 'ระบบได้ส่งการแจ้งเตือน LINE OA' : 'LINE OA Notification Sent',
          description: isThai ? 'ส่งแจ้งเตือนเตือนความจำสัญญา (Contract Reminder) ให้ฝ่ายอื่นๆ เรียบร้อยแล้ว' : 'Reminded other parties via LINE OA.',
        });
        if (onSignComplete) onSignComplete();
      } else {
        toast({ variant: "destructive", title: isThai ? 'เกิดข้อผิดพลาด' : 'Error', description: data.error });
      }
    } catch {
      toast({ variant: "destructive", title: isThai ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ' : 'Network Error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateKyc = async () => {
    setLoading(true);
    localStorage.setItem('primerent_mock_kyc', 'verified');
    toast({ title: isThai ? 'จำลอง KYC สำเร็จ' : 'KYC Simulated', description: isThai ? 'บัญชีผ่านการยืนยันแล้ว สามารถเซ็นชื่อได้ทันที' : 'Your account is verified.' });
    setLoading(false);
  };

  if (!isKycVerified) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 border border-orange-200 rounded-none p-6 text-center text-gray-900 space-y-4">
        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-none flex items-center justify-center mx-auto"><ShieldAlert className="w-6 h-6" /></div>
        <h4 className="text-lg font-black">{isThai ? 'ต้องยืนยันตัวตน (KYC) ก่อนลงนาม' : 'KYC Verification Required'}</h4>
        <p className="text-xs text-gray-500 font-semibold leading-relaxed">
          {isThai ? 'ตามระเบียบความปลอดภัย คุณต้องยืนยันตัวตนผ่านระบบก่อนลงลายมือชื่อในสัญญาดิจิทัล' : 'Please complete identity verification first.'}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-none">{isThai ? 'ยกเลิก' : 'Cancel'}</Button>
          <Button onClick={handleSimulateKyc} disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-none font-bold">{isThai ? 'จำลองการผ่าน KYC' : 'Verify KYC (Mock)'}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-none p-4 border border-gray-100 space-y-4">
      <div className="flex justify-between items-center px-2 py-2 text-gray-900 border-b border-gray-50">
        <span className="font-bold text-sm flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-500" />{isThai ? 'ลงนามสัญญาดิจิทัล' : 'Digital Signature Pad'}</span>
        <button onClick={() => { clearCanvas(); setUseSaved(false); }} className="text-xs text-gray-500 hover:text-red-500 font-bold flex items-center gap-1"><RotateCcw className="w-3 h-3" />{isThai ? 'ล้าง' : 'Clear'}</button>
      </div>
      
      {useSaved && savedSig ? (
        <div className="w-full h-[150px] bg-gray-50 border border-gray-100 flex items-center justify-center p-4 relative">
          <img src={savedSig} alt="Saved Signature" className="max-h-[120px] object-contain opacity-90" />
          <span className="absolute bottom-2 right-3 text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 border border-green-200">SAVED SIGNATURE LOADED</span>
        </div>
      ) : (
        <canvas
          ref={canvasRef} width={400} height={150}
          onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing}
          onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
          className="w-full bg-gray-50 rounded-none cursor-crosshair touch-none border border-gray-100 h-[150px]"
        />
      )}

      {!useSaved && (
        <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
          <input type="checkbox" checked={saveSigMemory} onChange={(e) => setSaveSigMemory(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
          {isThai ? 'จำลายเซ็นนี้เพื่อใช้งานครั้งต่อไป' : 'Remember this signature'}
        </label>
      )}

      {savedSig && !useSaved && (
        <Button variant="outline" onClick={() => setUseSaved(true)} className="w-full rounded-none h-10 text-xs font-bold">{isThai ? 'ใช้ลายเซ็นเดิมที่บันทึกไว้' : 'Use Saved Signature'}</Button>
      )}
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button variant="outline" onClick={onClose} className="text-gray-900 rounded-none">{isThai ? 'ยกเลิก' : 'Cancel'}</Button>
        <Button onClick={saveSignature} disabled={loading} className="bg-primary text-white font-bold rounded-none">{loading ? '...' : (isThai ? 'ยืนยันลงนาม' : 'Confirm Signature')}</Button>
      </div>
    </div>
  );
};
