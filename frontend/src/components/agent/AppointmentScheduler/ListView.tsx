'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Appointment } from './types';
import { translations } from './translations';
import { AppointmentCard } from './AppointmentCard';

interface ListViewProps {
  appointments: Appointment[];
  lang: 'th' | 'en' | 'cn';
  onStatusChange?: (id: string, status: Appointment['status']) => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (id: string) => void;
  onNewAppointment?: () => void;
}

export function ListView({ appointments, lang, onStatusChange, onEdit, onDelete, onNewAppointment }: ListViewProps) {
  const t = translations[lang];

  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const dateKey = new Date(appointment.date).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-900">{t.listView}</h3>
        <Button
          onClick={onNewAppointment}
          className="bg-[#E51D53] hover:bg-[#D41B4D] text-white font-bold rounded-xl h-10 px-4 shadow-lg shadow-[#E51D53]/20 gap-2"
        >
          <Plus className="w-4 h-4" />
          {t.newAppointment}
        </Button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 font-medium">{t.noAppointments}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => (
            <div key={dateKey}>
              <h4 className="text-sm font-bold text-gray-500 mb-3">
                {new Date(dateKey).toLocaleDateString(lang === 'th' ? 'th-TH' : lang === 'cn' ? 'zh-CN' : 'en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h4>
              <div className="grid gap-3">
                {groupedAppointments[dateKey].map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    lang={lang}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
