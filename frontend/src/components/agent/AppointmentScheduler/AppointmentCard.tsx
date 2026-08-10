'use client';

import React from 'react';
import { Calendar, Clock, MapPin, Phone, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Appointment } from './types';
import { translations } from './translations';

interface AppointmentCardProps {
  appointment: Appointment;
  lang: 'th' | 'en' | 'cn';
  onStatusChange?: (id: string, status: Appointment['status']) => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (id: string) => void;
}

export function AppointmentCard({ appointment, lang, onStatusChange, onEdit, onDelete }: AppointmentCardProps) {
  const t = translations[lang];

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-green-100 text-green-700 border-green-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(lang === 'th' ? 'th-TH' : lang === 'cn' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#E51D53]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#E51D53]" />
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-sm">{appointment.title}</h4>
            <p className="text-xs text-gray-500">{appointment.propertyName}</p>
          </div>
        </div>
        <Badge className={cn('text-[9px] font-bold rounded-xl px-2.5 py-0.5', statusColors[appointment.status])}>
          {t[appointment.status]}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="w-3.5 h-3.5 text-[#E51D53]" />
          <span className="font-medium">{formatDate(appointment.date)} • {appointment.time} ({appointment.duration} min)</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-medium">{appointment.location || 'Property Location'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-medium">{appointment.clientName}</span>
          {appointment.clientPhone && <span className="text-gray-400">• {appointment.clientPhone}</span>}
        </div>
      </div>

      {appointment.notes && (
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{appointment.notes}</p>
      )}

      <div className="flex items-center gap-2">
        {appointment.status === 'pending' && (
          <Button
            size="sm"
            className="flex-1 h-9 rounded-xl bg-[#E51D53] hover:bg-[#D41B4D] text-white font-bold text-xs"
            onClick={() => onStatusChange?.(appointment.id, 'confirmed')}
          >
            {t.confirm}
          </Button>
        )}
        {appointment.status === 'confirmed' && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 rounded-xl border-gray-200 text-xs font-bold"
            onClick={() => onStatusChange?.(appointment.id, 'completed')}
          >
            {t.complete}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-9 w-9 rounded-xl p-0"
          onClick={() => onEdit?.(appointment)}
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </Button>
      </div>
    </div>
  );
}
