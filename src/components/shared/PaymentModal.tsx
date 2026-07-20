'use client';

/**
 * @fileOverview Payment Modal UI — PromptPay QR Code + countdown
 */

import React, { useState, useEffect } from 'react';
import { X, QrCode, AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/types';
import type { PromptPayQRResult, ChargeStatus } from '@/lib/omise';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  paymentDetails: {
    amountTHB: number;
    description: string;
    metadata?: Record<string, string>;
  } | null;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  lang,
  paymentDetails,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<PromptPayQRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useState<ChargeStatus>('pending');

  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  useEffect(() => {
    if (isOpen && paymentDetails && !qrData && !loading) {
      const fetchQR = async () => {
        setLoading(true); setError(null);
        try {
          const res = await fetch('/api/payment/promptpay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentDetails),
          });
          const data = await res.json();
          if (data.success && data.data) {
            setQrData(data.data);
            setStatus(data.data.status);
            const expiry = new Date(data.data.expiresAt).getTime();
            setTimeLeft(Math.max(0, Math.floor((expiry - Date.now()) / 1000)));
          } else {
            setError(data.error || 'Failed to generate QR code');
          }
        } catch {
          setError('Network error');
        } finally {
          setLoading(false);
        }
      };
      fetchQR();
    }
  }, [isOpen, paymentDetails]);

  useEffect(() => {
    if (timeLeft > 0 && status === 'pending') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timer); setStatus('expired'); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, status]);

  useEffect(() => {
    if (qrData && status === 'pending') {
      const poll = setInterval(async () => {
        try {
          const res = await fetch(`/api/payment/verify?paymentId=${qrData.chargeId}`);
          const data = await res.json();
          if (data.status === 'successful') {
            setStatus('successful');
            clearInterval(poll);
          }
        } catch (err) {
          console.error('Error polling payment status:', err);
        }
      }, 3000);
      return () => clearInterval(poll);
    }
  }, [qrData, status, onSuccess]);

  if (!isOpen) return null;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const pct = timeLeft > 0 ? Math.round((timeLeft / 900) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[360px] shadow-[0_32px_80px_-8px_rgba(0,0,0,0.35)] animate-in zoom-in-95 duration-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900">
                {isTh ? 'ชำระเงิน PromptPay' : isCn ? '支付' : 'PromptPay Payment'}
              </h2>
              {paymentDetails?.description && (
                <p className="text-[10px] text-gray-400 font-medium">{paymentDetails.description}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount strip */}
        {paymentDetails && (
          <div className="px-5 py-3 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
              {isTh ? 'ยอดชำระ' : isCn ? '金额' : 'Amount'}
            </span>
            <span className="text-xl font-black text-primary">
              ฿{paymentDetails.amountTHB.toLocaleString()}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-6">

          {/* Loading */}
          {loading && (
            <div className="py-12 flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-gray-100 border-t-primary rounded-full animate-spin" />
              <p className="text-xs font-bold text-gray-400">
                {isTh ? 'กำลังสร้าง QR Code...' : 'Generating QR Code...'}
              </p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="py-8 flex flex-col items-center gap-4 text-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm font-bold text-gray-700">{error}</p>
              <button onClick={onClose}
                className="px-6 py-2 border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                {isTh ? 'ปิด' : 'Close'}
              </button>
            </div>
          )}

          {/* QR + countdown */}
          {qrData && status === 'pending' && !loading && (
            <div className="space-y-5 text-center">
              {/* QR box */}
              <div className="border-2 border-gray-100 p-4 inline-block">
                <img src={qrData.qrCodeBase64} alt="PromptPay QR" className="w-44 h-44 object-contain" />
              </div>

              {/* Countdown */}
              <div>
                <div className="w-full bg-gray-100 h-1.5 mb-2">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-center gap-1.5 text-orange-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-black">
                    {isTh ? 'หมดอายุใน' : 'Expires in'} {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400 font-medium">
                {isTh ? 'เปิดแอปธนาคารเพื่อสแกนและชำระเงิน' : 'Open your banking app to scan and pay'}
              </p>
            </div>
          )}

          {/* Success */}
          {status === 'successful' && (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 bg-green-50 border-2 border-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-black text-gray-900">
                {isTh ? 'ชำระเงินสำเร็จ!' : isCn ? '支付成功！' : 'Payment Successful!'}
              </h3>
              <p className="text-sm text-gray-400 font-medium">
                {isTh ? 'ระบบได้รับยอดเงินเรียบร้อยแล้ว' : 'We have received your payment'}
              </p>
              <button
                onClick={() => { onClose(); if (onSuccess) onSuccess(); }}
                className="w-full mt-2 py-3 bg-primary text-white text-sm font-black hover:bg-primary/90 transition-colors"
              >
                {isTh ? 'ตกลง' : isCn ? '确定' : 'OK'}
              </button>
            </div>
          )}

          {/* Expired */}
          {status === 'expired' && (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 bg-gray-50 border-2 border-gray-100 flex items-center justify-center">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-black text-gray-800">
                {isTh ? 'QR Code หมดอายุ' : isCn ? 'QR码已过期' : 'QR Code Expired'}
              </h3>
              <p className="text-sm text-gray-400 font-medium">
                {isTh ? 'กรุณาสร้าง QR ใหม่อีกครั้ง' : 'Please generate a new QR code'}
              </p>
              <button
                onClick={() => { setQrData(null); setStatus('pending'); setError(null); }}
                className="flex items-center gap-2 px-6 py-2 border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {isTh ? 'ลองใหม่' : 'Try Again'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
