'use client';

import React from 'react';
import { Calendar, CreditCard, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyStepperHeaderProps {
  activeTab: 'showing' | 'booking' | 'checklist';
  onTabChange: (tab: 'showing' | 'booking' | 'checklist') => void;
  bookingCompleted: boolean;
  bookingPaid: boolean;
  checklistCompleted: boolean;
  t: any;
}

export function JourneyStepperHeader({
  activeTab, onTabChange, bookingCompleted, bookingPaid, checklistCompleted, t
}: JourneyStepperHeaderProps) {
  const steps = [
    { id: 'showing', label: t.stepShowing, icon: Calendar, active: activeTab === 'showing', done: bookingCompleted },
    { id: 'booking', label: t.stepBooking, icon: CreditCard, active: activeTab === 'booking', done: bookingPaid, disabled: !bookingCompleted },
    { id: 'checklist', label: t.stepChecklist, icon: ClipboardCheck, active: activeTab === 'checklist', done: checklistCompleted, disabled: !bookingPaid }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {steps.map((stepItem) => (
        <button
          key={stepItem.id}
          type="button"
          disabled={stepItem.disabled}
          onClick={() => onTabChange(stepItem.id as any)}
          className={cn(
            "flex items-center gap-3 p-4 border text-left transition-all rounded-xl",
            stepItem.active 
              ? "border-primary bg-primary/5 text-primary shadow-sm" 
              : stepItem.disabled
                ? "border-gray-100 bg-gray-50/50 text-gray-400 cursor-not-allowed"
                : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0",
            stepItem.done 
              ? "bg-green-500 text-white" 
              : stepItem.active
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-500"
          )}>
            {stepItem.done ? '✓' : <stepItem.icon className="w-4 h-4" />}
          </div>
          <span className="font-bold text-xs tracking-wider uppercase">{stepItem.label}</span>
        </button>
      ))}
    </div>
  );
}
