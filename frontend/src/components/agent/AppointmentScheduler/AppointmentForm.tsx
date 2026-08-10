'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AppointmentFormData } from './types';
import { translations } from './translations';

interface AppointmentFormProps {
  lang: 'th' | 'en' | 'cn';
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => void;
  initialData?: AppointmentFormData;
}

export function AppointmentForm({ lang, isOpen, onClose, onSubmit, initialData }: AppointmentFormProps) {
  const t = translations[lang];
  const [formData, setFormData] = React.useState<AppointmentFormData>(
    initialData || {
      title: '',
      propertyId: '',
      propertyName: '',
      clientName: '',
      clientPhone: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      duration: 30,
      notes: '',
      location: '',
    }
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-gray-900">{t.newAppointment}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-bold text-gray-500 mb-1.5">{t.title}</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="rounded-xl border-gray-100 focus:border-[#E51D53] focus:ring-[#E51D53]/20"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-gray-500 mb-1.5">{t.property}</Label>
            <Input
              value={formData.propertyName}
              onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
              className="rounded-xl border-gray-100 focus:border-[#E51D53] focus:ring-[#E51D53]/20"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-gray-500 mb-1.5">{t.client}</Label>
            <Input
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="rounded-xl border-gray-100 focus:border-[#E51D53] focus:ring-[#E51D53]/20"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-gray-500 mb-1.5">{t.phone}</Label>
            <Input
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              className="rounded-xl border-gray-100 focus:border-[#E51D53] focus:ring-[#E51D53]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold text-gray-500 mb-1.5">{t.date}</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="rounded-xl border-gray-100 focus:border-[#E51D53] focus:ring-[#E51D53]/20"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-500 mb-1.5">{t.time}</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="rounded-xl border-gray-100 focus:border-[#E51D53] focus:ring-[#E51D53]/20"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-gray-500 mb-1.5">{t.duration} (min)</Label>
            <Input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="rounded-xl border-gray-100 focus:border-[#E51D53] focus:ring-[#E51D53]/20"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-gray-500 mb-1.5">{t.location}</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="rounded-xl border-gray-100 focus:border-[#E51D53] focus:ring-[#E51D53]/20"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-gray-500 mb-1.5">{t.notes}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-xl border-gray-100 focus:border-[#E51D53] focus:ring-[#E51D53]/20 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl border-gray-200 font-bold"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-[#E51D53] hover:bg-[#D41B4D] text-white font-bold"
            >
              {t.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
