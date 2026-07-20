'use client';

import React from 'react';
import { User, Phone, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookingFormData } from './types';
import { getBookingTranslations } from './translations';

interface Step2PersonalInfoProps {
  formData: BookingFormData;
  lang: 'th' | 'en' | 'cn';
  onFormChange: (updates: Partial<BookingFormData>) => void;
}

export function Step2PersonalInfo({ formData, lang, onFormChange }: Step2PersonalInfoProps) {
  const t = getBookingTranslations(lang);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="guestName" className="font-bold">{t.guestName}</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="guestName"
            value={formData.guestName}
            onChange={(e) => onFormChange({ guestName: e.target.value })}
            className="pl-10 rounded-none font-bold"
            placeholder={lang === 'th' ? 'ชื่อ-นามสกุล' : lang === 'cn' ? '姓名' : 'Full Name'}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestPhone" className="font-bold">{t.guestPhone}</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="guestPhone"
            type="tel"
            value={formData.guestPhone}
            onChange={(e) => onFormChange({ guestPhone: e.target.value })}
            className="pl-10 rounded-none font-bold"
            placeholder="08x-xxx-xxxx"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestEmail" className="font-bold">{t.guestEmail}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="guestEmail"
            type="email"
            value={formData.guestEmail}
            onChange={(e) => onFormChange({ guestEmail: e.target.value })}
            className="pl-10 rounded-none font-bold"
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod" className="font-bold">{t.paymentMethod}</Label>
        <Select value={formData.paymentMethod} onValueChange={(value) => onFormChange({ paymentMethod: value })}>
          <SelectTrigger className="rounded-none font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none font-bold">
            <SelectItem value="transfer" className="rounded-none">{t.transfer}</SelectItem>
            <SelectItem value="cash" className="rounded-none">{t.cash}</SelectItem>
            <SelectItem value="creditCard" className="rounded-none">{t.creditCard}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialRequests" className="font-bold">{t.specialRequests}</Label>
        <Textarea
          id="specialRequests"
          value={formData.specialRequests}
          onChange={(e) => onFormChange({ specialRequests: e.target.value })}
          placeholder={lang === 'th' ? 'ข้อความเพิ่มเติม...' : lang === 'cn' ? '其他要求...' : 'Additional requests...'}
          rows={3}
          className="rounded-none font-bold"
        />
      </div>
    </div>
  );
}
