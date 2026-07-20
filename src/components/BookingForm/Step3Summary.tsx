'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingFormData, RENTAL_PERIODS, CURRENCY_SYMBOLS } from './types';
import { getBookingTranslations } from './translations';

interface Step3SummaryProps {
  property: { id: number; name: string; price: number; type: string };
  formData: BookingFormData;
  lang: 'th' | 'en' | 'cn';
  currency: 'THB' | 'USD' | 'CNY';
  paymentStatus: 'pending' | 'paid';
  calculateTotal: () => number;
  onSimulatePayment: () => void;
}

export function Step3Summary({
  property, formData, lang, currency, paymentStatus, calculateTotal, onSimulatePayment,
}: Step3SummaryProps) {
  const t = getBookingTranslations(lang);
  const symbol = CURRENCY_SYMBOLS[currency];

  const rentalPeriods = [
    { value: '3months', label: t.months3 },
    { value: '6months', label: t.months6 },
    { value: '12months', label: t.months12 },
    { value: '24months', label: t.months24 },
    { value: 'custom', label: t.custom },
  ];

  const total = calculateTotal();

  const [qrUrl, setQrUrl] = React.useState<string | null>(null);
  const [loadingQr, setLoadingQr] = React.useState(true);
  const [qrError, setQrError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchQR() {
      try {
        setLoadingQr(true);
        setQrError(null);
        
        let token = null;
        const { auth } = await import('@/firebase/config');
        if (auth.currentUser) {
          token = await auth.currentUser.getIdToken();
        }

        const response = await fetch('/api/payments/qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            amount: total + property.price * 2,
            description: `Deposit for booking property: ${property.name}`,
            type: 'deposit',
            propertyId: String(property.id || ''),
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate PromptPay QR code');
        }

        const resData = await response.json();
        if (resData.success && resData.data?.qrCodeUrl) {
          setQrUrl(resData.data.qrCodeUrl);
        } else {
          throw new Error(resData.error?.message || 'Invalid QR response');
        }
      } catch (err: any) {
        console.error('Error fetching PromptPay QR:', err);
        setQrError(err.message || 'Error generating QR');
        // Fallback to static client generation if API fails
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=promptpay://transfer?amount=${total + property.price * 2}`);
      } finally {
        setLoadingQr(false);
      }
    }

    fetchQR();
  }, [total, property.price, property.name, property.id]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-primary/5 rounded-none p-6 border border-primary/10">
        <h3 className="font-black text-lg mb-4 text-gray-900">{t.summary}</h3>
        <div className="space-y-3 font-bold">
          <div className="flex justify-between">
            <span className="text-gray-500">{property.name}</span>
            <Badge variant="secondary" className="rounded-none bg-primary/10 text-primary border-none">{property.type}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t.moveInDate}</span>
            <span className="text-gray-900">{formData.moveInDate || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t.moveOutDate}</span>
            <span className="text-gray-900">{formData.moveOutDate || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t.rentalPeriod}</span>
            <span className="text-gray-900">
              {rentalPeriods.find(p => p.value === formData.rentalPeriod)?.label}
            </span>
          </div>
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-black text-lg text-gray-900">{t.total}</span>
              <span className="font-black text-2xl text-primary">{symbol}{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{t.deposit} (2 {t.months})</span>
              <span>{symbol}{(property.price * 2).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 border border-dashed border-primary/30 bg-gray-50 rounded-none space-y-4">
        <h4 className="font-black text-sm text-gray-900 flex items-center gap-2">
          📱 ชำระมัดจำการจอง (PromptPay QR Payment)
        </h4>

        {paymentStatus === 'paid' ? (
          <div className="flex flex-col items-center justify-center p-6 bg-white border border-green-200 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-2 animate-bounce" />
            <p className="text-sm font-black text-green-700">ชำระเงินสำเร็จ (Payment Success)</p>
            <p className="text-xs text-gray-400 font-bold mt-1">มัดจำได้รับการยืนยันผ่านระบบ Omise</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 min-h-[220px]">
            {loadingQr ? (
              <div className="w-36 h-36 flex items-center justify-center border bg-gray-50">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <img
                src={qrUrl || ''}
                alt="PromptPay QR Code"
                className="w-36 h-36 border p-2 bg-white object-contain"
              />
            )}
            <p className="text-xs font-bold text-gray-400 mt-2">สแกนเพื่อชำระเงินค่ามัดจำ + ค่าเช่าล่วงหน้า</p>
            <p className="text-xl font-black text-primary mt-1">
              ฿{(total + property.price * 2).toLocaleString()}
            </p>
            <div className="mt-4 flex flex-col gap-2 w-full">
              <Button
                type="button"
                onClick={onSimulatePayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-xs px-4 h-9 rounded-none shadow-md shadow-green-600/15"
              >
                🧪 [DEV] Simulate Payment Success
              </Button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-2 text-[9px] text-gray-400 font-bold uppercase tracking-wider">หรือ (OR)</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  const totalAmount = total + property.price * 2;
                  const intent = {
                    type: 'booking_payment',
                    propertyId: property.id,
                    propertyName: property.name || (property as any).title || 'คอนโดมิเนียมหรูใจกลางเมือง',
                    amount: totalAmount,
                    price: property.price
                  };
                  localStorage.setItem('primerent_pending_line_chat', JSON.stringify(intent));
                  window.location.href = '/chat/line-oa';
                }}
                className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-xs px-4 h-9 rounded-none flex items-center justify-center gap-1.5 shadow-md shadow-green-500/10"
              >
                🟢 ชำระเงิน & รับบิลบน LINE OA
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-none p-4">
        <p className="text-xs font-bold text-yellow-800">
          {lang === 'th'
            ? '⚠️ การจองนี้จะเสร็จสมบูรณ์เมื่อผู้เช่าสแกนจ่ายเงินมัดจำเรียบร้อยแล้ว'
            : lang === 'cn'
            ? '⚠️ 支付完成前，该预订不会生效。'
            : '⚠️ This booking will be finalized once the deposit is paid.'}
        </p>
      </div>
    </div>
  );
}
