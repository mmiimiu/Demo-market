'use client';

import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useNotification } from '@/hooks/use-notification';
import { BookingFormProps, BookingFormData } from './types';
import { getBookingTranslations } from './translations';
import { Step1Dates } from './Step1Dates';
import { Step2PersonalInfo } from './Step2PersonalInfo';
import { Step3Summary } from './Step3Summary';
import { calculateTotal, getNewPeriodDates } from './utils';

export function BookingForm({ property, onClose, lang, currency }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    moveInDate: '',
    moveOutDate: '',
    rentalPeriod: '6months',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    specialRequests: '',
    paymentMethod: 'transfer',
  });
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notification = useNotification();
  const t = getBookingTranslations(lang);

  const handleFormChange = (updates: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleCalculateTotal = () => calculateTotal(formData, property);

  const handlePeriodChange = (value: string) => {
    setFormData(prev => {
      const moveOutDate = getNewPeriodDates(value, prev.moveInDate);
      return moveOutDate ? { ...prev, rentalPeriod: value, moveOutDate } : { ...prev, rentalPeriod: value };
    });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      // Automatically generate a contract when the booking is submitted
      fetch('/api/contract/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: String(property.id),
          propertyName: property.name,
          ownerId: 'mock_owner_id',
          tenantId: 'mock_tenant_id',
          monthlyRent: property.price,
          depositAmount: property.price * 2,
          advanceRentAmount: property.price,
          startDate: formData.moveInDate || new Date().toISOString(),
          endDate: formData.moveOutDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        })
      })
      .then(res => res.json())
      .then(data => {
        const booking = {
          id: Date.now(), propertyId: property.id, propertyName: property.name,
          ...formData, total: handleCalculateTotal(),
          status: paymentStatus === 'paid' ? 'paid' : 'pending',
          createdAt: new Date().toISOString(),
        };
        const existing = JSON.parse(localStorage.getItem('bookings') || '[]');
        localStorage.setItem('bookings', JSON.stringify([...existing, booking]));

        if (data.success) {
          const contracts = JSON.parse(localStorage.getItem('contracts') || '[]');
          contracts.push({
            id: data.contractId,
            propertyId: String(property.id),
            propertyName: property.name,
            ownerId: 'mock_owner_id',
            tenantId: 'mock_tenant_id',
            monthlyRent: property.price,
            depositAmount: property.price * 2,
            advanceRentAmount: property.price,
            startDate: new Date(formData.moveInDate || Date.now()),
            endDate: new Date(formData.moveOutDate || (Date.now() + 180 * 24 * 60 * 60 * 1000)),
            signatures: {},
            status: 'pending_signatures',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          localStorage.setItem('contracts', JSON.stringify(contracts));
          localStorage.setItem('last_contract_id', data.contractId); // Save for quick redirect

          notification.booking(
            t.success,
            lang === 'th' ? `จอง ${property.name} สำเร็จและสร้างแบบร่างสัญญาแล้ว` : `Booked ${property.name} & draft contract generated`,
            { 
              label: lang === 'th' ? 'ลงนามสัญญาเช่า' : 'Sign Contract', 
              onClick: () => {
                window.location.href = `/contract/${data.contractId}`;
              } 
            }
          );
        } else {
          notification.booking(
            t.success,
            lang === 'th' ? `จอง ${property.name} สำเร็จแล้ว` : lang === 'cn' ? `已成功预订 ${property.name}` : `Successfully booked ${property.name}`,
            { label: lang === 'th' ? 'ดูการจอง' : lang === 'cn' ? '查看预订' : 'View Booking', onClick: () => console.log('View booking') }
          );
        }
      })
      .catch(err => {
        console.error('[BookingForm] generate contract error:', err);
        notification.booking(
          t.success,
          lang === 'th' ? `จอง ${property.name} สำเร็จแล้ว` : lang === 'cn' ? `已成功预订 ${property.name}` : `Successfully booked ${property.name}`,
          { label: lang === 'th' ? 'ดูการจอง' : lang === 'cn' ? '查看预订' : 'View Booking', onClick: () => console.log('View booking') }
        );
      });

      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  const handleSimulatePayment = () => {
    setPaymentStatus('paid');
    notification.success(
      lang === 'th' ? 'ชำระเงินมัดจำเสร็จสิ้น' : 'Deposit Paid Successfully',
      lang === 'th' ? 'ระบบตรวจรับเงินโอนพร้อมปลดล็อคขั้นตอนการย้ายเข้าแล้ว' : 'The system verified your PromptPay transfer'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-none border-none">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black">{t.title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-none">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                )}>
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={cn('w-12 h-1 mx-1', step > s ? 'bg-primary' : 'bg-gray-200')} />}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {step === 1 && (
            <Step1Dates
              property={property} formData={formData} lang={lang} currency={currency}
              onFormChange={handleFormChange} onPeriodChange={handlePeriodChange}
            />
          )}
          {step === 2 && (
            <Step2PersonalInfo formData={formData} lang={lang} onFormChange={handleFormChange} />
          )}
          {step === 3 && (
            <Step3Summary
              property={property} formData={formData} lang={lang} currency={currency}
              paymentStatus={paymentStatus} calculateTotal={handleCalculateTotal}
              onSimulatePayment={handleSimulatePayment}
            />
          )}
        </CardContent>

        <div className="p-6 border-t flex justify-between">
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1} className="rounded-none font-bold">
            {t.back}
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="rounded-none font-bold">{t.next}</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-none font-bold">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {lang === 'th' ? 'กำลังส่ง...' : lang === 'cn' ? '提交中...' : 'Submitting...'}
                </div>
              ) : t.submit}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
