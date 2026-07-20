"use client";

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Building, Copy, Upload, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ManualPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount') || '0';

  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>('idle');

  const handleUploadClick = () => {
    // Simulate file picker and upload delay
    setUploadState('uploading');
    setTimeout(() => {
      setUploadState('success');
    }, 1500);
  };

  const handleSubmit = () => {
    router.push('/liff/payment/success?method=manual');
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="font-semibold text-slate-900">แนบสลิปโอนเงิน</span>
        <div className="w-9" />
      </header>

      <main className="flex-1 p-4 pb-24 space-y-6">
        
        {/* Step 1: Bank Details */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">ขั้นตอนที่ 1: โอนเงิน</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                  SCB
                </div>
                <div>
                  <p className="font-bold text-slate-900">Siam Commercial Bank</p>
                  <p className="text-xs text-slate-500">RentFlow Co., Ltd.</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-lg text-slate-700 tracking-wider">123-4-56789-0</span>
                <button className="text-[#00B900] flex items-center gap-1 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-md">
                  <Copy className="w-4 h-4" /> คัดลอก
                </button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-slate-500">จำนวนเงิน</span>
                <span className="font-bold text-lg text-[#00B900]">{Number(amount).toLocaleString()} บาท</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Upload Slip */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">ขั้นตอนที่ 2: แนบสลิป</h2>

          {uploadState === 'idle' && (
            <div 
              onClick={handleUploadClick}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-[#00B900] transition-colors"
            >
              <Upload className="w-8 h-8 text-slate-400 mb-3" />
              <p className="font-medium text-slate-700">แตะเพื่ออัปโหลดสลิป</p>
              <p className="text-xs text-slate-400 mt-1">รองรับไฟล์ JPG, PNG สูงสุด 5MB</p>
            </div>
          )}

          {uploadState === 'uploading' && (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50">
              <Loader2 className="w-10 h-10 text-[#00B900] animate-spin mb-3" />
              <p className="font-medium text-slate-700">กำลังอัปโหลด...</p>
            </div>
          )}

          {uploadState === 'success' && (
            <div className="border-2 border-[#00B900] bg-emerald-50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white rounded-lg shadow-sm border border-emerald-100 flex items-center justify-center mb-3 relative overflow-hidden">
                <ImageIcon className="w-8 h-8 text-emerald-600 opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent" />
              </div>
              <p className="font-bold text-emerald-700 mb-1 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" /> อัปโหลดสำเร็จ
              </p>
              <p className="text-xs text-emerald-600/80">slip_20260626.jpg</p>
              
              <button 
                onClick={() => setUploadState('idle')}
                className="text-xs text-slate-500 mt-4 underline decoration-slate-300"
              >
                อัปโหลดสลิปใหม่
              </button>
            </div>
          )}
        </div>

      </main>

      {/* Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleSubmit}
            disabled={uploadState !== 'success'}
            className={`w-full rounded-xl h-14 text-lg font-bold shadow-sm transition-colors ${uploadState === 'success' ? 'bg-[#00B900] hover:bg-[#00a000] text-white' : 'bg-slate-100 text-slate-400'}`}
          >
            ส่งหลักฐานการโอน
          </Button>
        </div>
      </div>

    </div>
  );
}

export default function LiffPaymentManual() {
  return (
    <Suspense fallback={<div className="p-8 text-center">กำลังโหลดข้อมูล...</div>}>
      <ManualPaymentContent />
    </Suspense>
  );
}
