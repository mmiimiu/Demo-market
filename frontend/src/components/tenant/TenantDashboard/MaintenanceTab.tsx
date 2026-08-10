import React, { useState } from 'react';
import { Plus, Clock, CheckCircle, Wrench, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MaintenanceForm } from '../MaintenanceForm';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/types';

interface MaintenanceTabProps {
  lang: Language;
}

const MOCK_HISTORY = [
  { id: 'M-1002', issue: 'แอร์ไม่เย็น (AC not cooling)', date: '2026-06-20', status: 'in_progress', priority: 'medium' },
  { id: 'M-1001', issue: 'ท่อน้ำรั่วซึม (Leaking pipe)', date: '2026-05-15', status: 'resolved', priority: 'high' }
];

export function MaintenanceTab({ lang }: MaintenanceTabProps) {
  const [showForm, setShowForm] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'in_progress':
        return { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100', label: lang === 'th' ? 'กำลังดำเนินการ' : 'In Progress' };
      case 'resolved':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: lang === 'th' ? 'แก้ไขแล้ว' : 'Resolved' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: status };
    }
  };

  if (showForm) {
    return (
      <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={() => setShowForm(false)}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <MaintenanceForm 
          lang={lang} 
          propertyId="PROP-1" 
          tenantId="TEN-1" 
          onSubmitSuccess={() => setShowForm(false)} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900">
            {lang === 'th' ? 'ระบบแจ้งซ่อม' : 'Maintenance'}
          </h2>
          <p className="text-gray-500 font-medium">
            {lang === 'th' ? 'ติดตามสถานะและแจ้งปัญหาใหม่ได้ที่นี่' : 'Track status and report new issues here'}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#E51D53] hover:bg-[#D41B4D] text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-[#E51D53]/20 gap-2"
        >
          <Plus className="w-5 h-5" />
          {lang === 'th' ? 'แจ้งซ่อมใหม่' : 'New Request'}
        </Button>
      </div>

      <div className="space-y-4">
        {MOCK_HISTORY.map(req => {
          const config = getStatusConfig(req.status);
          const Icon = config.icon;
          return (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
              <div className="flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", config.bg, config.color)}>
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{req.issue}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm font-medium">
                    <span className="text-gray-500">#{req.id}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500">{req.date}</span>
                  </div>
                </div>
              </div>
              
              <div className={cn("px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold", config.bg, config.color)}>
                <Icon className="w-4 h-4" />
                {config.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
