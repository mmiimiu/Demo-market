'use client';

import React, { useState } from 'react';
import { Calendar, List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { translations } from './translations';
import { Appointment, AppointmentFormData } from './types';
import { ListView } from './ListView';
import { CalendarView } from './CalendarView';
import { AppointmentForm } from './AppointmentForm';
import { AppointmentSchedulerProps } from './types';

export function AppointmentScheduler({ lang }: AppointmentSchedulerProps) {
  const t = translations[lang];
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      title: 'Property Viewing',
      propertyId: 'PROP-1',
      propertyName: 'Ideo Mobi Sukhumvit 81',
      clientName: 'Somchai',
      clientPhone: '081-234-5678',
      date: new Date(2026, 5, 27),
      time: '10:00',
      duration: 30,
      status: 'pending',
      location: 'Lobby',
      notes: 'Client interested in 2-bedroom unit',
    },
    {
      id: '2',
      title: 'Contract Signing',
      propertyId: 'PROP-2',
      propertyName: 'The Base Park East',
      clientName: 'Nipa',
      clientPhone: '082-345-6789',
      date: new Date(2026, 5, 28),
      time: '14:00',
      duration: 60,
      status: 'confirmed',
      location: 'Office',
      notes: 'Bring lease agreement',
    },
  ]);

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    setAppointments(appointments.map((apt) => (apt.id === id ? { ...apt, status } : apt)));
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setAppointments(appointments.filter((apt) => apt.id !== id));
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setShowForm(true);
  };

  const handleFormSubmit = (data: AppointmentFormData) => {
    if (editingAppointment) {
      setAppointments(
        appointments.map((apt) =>
          apt.id === editingAppointment.id
            ? { ...apt, ...data, date: new Date(data.date) }
            : apt
        )
      );
    } else {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        ...data,
        date: new Date(data.date),
        status: 'pending',
      };
      setAppointments([...appointments, newAppointment]);
    }
    setShowForm(false);
    setEditingAppointment(null);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900">{t.title}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
            className={cn(
              'rounded-xl font-bold',
              view === 'list' ? 'bg-[#E51D53] hover:bg-[#D41B4D] text-white' : 'border-gray-200'
            )}
          >
            <List className="w-4 h-4 mr-2" />
            {t.listView}
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('calendar')}
            className={cn(
              'rounded-xl font-bold',
              view === 'calendar' ? 'bg-[#E51D53] hover:bg-[#D41B4D] text-white' : 'border-gray-200'
            )}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {t.calendarView}
          </Button>
        </div>
      </div>

      {view === 'list' ? (
        <ListView
          appointments={appointments}
          lang={lang}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onNewAppointment={handleNewAppointment}
        />
      ) : (
        <CalendarView
          appointments={appointments}
          lang={lang}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onAppointmentClick={handleAppointmentClick}
        />
      )}

      {view === 'calendar' && (
        <Button
          onClick={handleNewAppointment}
          className="w-full bg-[#E51D53] hover:bg-[#D41B4D] text-white font-bold rounded-xl h-12 shadow-lg shadow-[#E51D53]/20 gap-2"
        >
          <Plus className="w-5 h-5" />
          {t.newAppointment}
        </Button>
      )}

      <AppointmentForm
        lang={lang}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingAppointment(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingAppointment ? {
          title: editingAppointment.title,
          propertyId: editingAppointment.propertyId,
          propertyName: editingAppointment.propertyName,
          clientName: editingAppointment.clientName,
          clientPhone: editingAppointment.clientPhone,
          date: editingAppointment.date.toISOString().split('T')[0],
          time: editingAppointment.time,
          duration: editingAppointment.duration,
          notes: editingAppointment.notes,
          location: editingAppointment.location,
        } : undefined}
      />
    </div>
  );
}
