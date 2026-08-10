'use client';

import React from 'react';
import { CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookingFormData, RENTAL_PERIODS, CURRENCY_SYMBOLS } from './types';
import { getBookingTranslations } from './translations';

interface Step1DatesProps {
  property: { name: string; price: number; type: string };
  formData: BookingFormData;
  lang: 'th' | 'en' | 'cn';
  currency: 'THB' | 'USD' | 'CNY';
  onFormChange: (updates: Partial<BookingFormData>) => void;
  onPeriodChange: (value: string) => void;
}

export function Step1Dates({ property, formData, lang, currency, onFormChange, onPeriodChange }: Step1DatesProps) {
  const t = getBookingTranslations(lang);
  const symbol = CURRENCY_SYMBOLS[currency];

  const rentalPeriods = [
    { value: '3months', label: t.months3, months: 3 },
    { value: '6months', label: t.months6, months: 6 },
    { value: '12months', label: t.months12, months: 12 },
    { value: '24months', label: t.months24, months: 24 },
    { value: 'custom', label: t.custom, months: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 rounded-none p-4">
        <h3 className="font-bold text-gray-900 mb-2">{property.name}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-none">{property.type}</Badge>
          <span className="text-lg font-black text-primary">
            {symbol}{property.price.toLocaleString()}/{t.month}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="moveInDate" className="font-bold">{t.moveInDate}</Label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="moveInDate"
              type="date"
              value={formData.moveInDate}
              onChange={(e) => {
                onFormChange({ moveInDate: e.target.value });
                if (formData.rentalPeriod !== 'custom') {
                  onPeriodChange(formData.rentalPeriod);
                }
              }}
              className="pl-10 rounded-none font-bold"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="moveOutDate" className="font-bold">{t.moveOutDate}</Label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="moveOutDate"
              type="date"
              value={formData.moveOutDate}
              onChange={(e) => onFormChange({ moveOutDate: e.target.value })}
              className="pl-10 rounded-none font-bold"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rentalPeriod" className="font-bold">{t.rentalPeriod}</Label>
        <Select value={formData.rentalPeriod} onValueChange={onPeriodChange}>
          <SelectTrigger className="rounded-none font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none font-bold">
            {rentalPeriods.map(period => (
              <SelectItem key={period.value} value={period.value} className="rounded-none">
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 font-medium">
          {lang === 'th' ? 'สำหรับการเช่าระยะยาว แนะนำ 6 เดือนขึ้นไป' : lang === 'cn' ? '长期租赁建议 6 个月或以上' : 'For long-term rental, recommend 6 months or more'}
        </p>
      </div>
    </div>
  );
}
