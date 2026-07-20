'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Appointment } from './types';
import { translations } from './translations';

interface CalendarViewProps {
  appointments: Appointment[];
  lang: 'th' | 'en' | 'cn';
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function CalendarView({ appointments, lang, currentDate, onDateChange, onAppointmentClick }: CalendarViewProps) {
  const t = translations[lang];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const goToPreviousMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString(lang === 'th' ? 'th-TH' : lang === 'cn' ? 'zh-CN' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  const weekDays = lang === 'th'
    ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    : lang === 'cn'
    ? ['日', '一', '二', '三', '四', '五', '六']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-900">{t.calendarView}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday} className="rounded-xl border-gray-200 font-bold text-xs">
            {t.today}
          </Button>
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="rounded-xl">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold text-gray-900 min-w-[120px] text-center">{monthName}</span>
          <Button variant="ghost" size="icon" onClick={goToNextMonth} className="rounded-xl">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50 p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-24" />;
            }

            const dayAppointments = getAppointmentsForDate(date);
            const isToday = date.toDateString() === today.toDateString();
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();

            return (
              <div
                key={index}
                onClick={() => onDateChange(date)}
                className={cn(
                  'h-24 p-2 rounded-xl border cursor-pointer transition-all hover:shadow-md',
                  isToday ? 'bg-[#E51D53]/10 border-[#E51D53]' : 'border-gray-100 hover:border-gray-200',
                  !isCurrentMonth && 'opacity-40'
                )}
              >
                <div className={cn('text-xs font-bold mb-1', isToday ? 'text-[#E51D53]' : 'text-gray-900')}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <div
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(apt);
                      }}
                      className={cn(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded truncate',
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      )}
                    >
                      {apt.time}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-[9px] font-bold text-gray-400">
                      +{dayAppointments.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
