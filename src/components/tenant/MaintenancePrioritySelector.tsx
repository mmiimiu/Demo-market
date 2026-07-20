import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/types';

interface MaintenancePrioritySelectorProps {
  priority: 'low' | 'medium' | 'high';
  setPriority: (val: 'low' | 'medium' | 'high') => void;
  lang: Language;
}

export function MaintenancePrioritySelector({ priority, setPriority, lang }: MaintenancePrioritySelectorProps) {
  const priorities = [
    { id: 'low' as const, label: lang === 'th' ? 'รอนานได้' : 'Low', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
    { id: 'medium' as const, label: lang === 'th' ? 'ปานกลาง' : 'Medium', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
    { id: 'high' as const, label: lang === 'th' ? 'ด่วนมาก!' : 'High', color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
  ];

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {lang === 'th' ? 'ระดับความรุนแรง' : 'Priority Level'}
      </label>
      <div className="grid grid-cols-3 gap-3">
        {priorities.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPriority(p.id)}
            className={cn(
              'py-3 px-2 rounded-xl border-2 text-sm font-bold transition-all text-center',
              priority === p.id ? p.color : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
            )}
          >
            {priority === p.id && p.id === 'high' && <AlertCircle className="w-4 h-4 inline-block mr-1 -mt-0.5" />}
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
