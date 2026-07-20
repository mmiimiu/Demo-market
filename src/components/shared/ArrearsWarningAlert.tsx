'use client';

import React, { useState } from 'react';
import { AlertTriangle, Send, ShieldAlert, X, FileText, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArrearsWarnings } from '@/hooks/useArrearsWarnings';
import { WarningNoticeModal } from './WarningNoticeModal';

interface ArrearsWarningAlertProps {
  lang?: 'th' | 'en' | 'cn';
}

export function ArrearsWarningAlert({ lang = 'th' }: ArrearsWarningAlertProps) {
  const isTh = lang === 'th';
  const { warnings, dismiss, notifyAgent, sendTenantLine } = useArrearsWarnings();
  const [selectedWarningId, setSelectedWarningId] = useState<string | null>(null);

  if (warnings.length === 0) return null;

  const currentWarning = warnings.find(w => w.id === selectedWarningId);

  return (
    <div className="space-y-3">
      {warnings.map(warning => {
        const isHighlyUrgent = warning.daysOverdue >= 15;

        return (
          <div
            key={warning.id}
            className={cn(
              'relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border border-l-4 rounded-2xl animate-in slide-in-from-top-2 duration-400 shadow-sm',
              isHighlyUrgent
                ? 'bg-red-50 border-red-100 border-l-red-500'
                : 'bg-amber-50 border-amber-100 border-l-amber-500'
            )}
          >
            {/* Left Content Column */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm',
                isHighlyUrgent ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
              )}>
                {isHighlyUrgent ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={cn('text-xs font-bold tracking-wider uppercase', isHighlyUrgent ? 'text-red-700' : 'text-amber-700')}>
                    {isTh
                      ? `⚠️ เตือนค้างชำระค่าเช่าเกิน ${warning.daysOverdue} วัน`
                      : `⚠️ Rent Arrears Overdue by ${warning.daysOverdue} Days`
                    }
                  </p>
                  <span className={cn(
                    'text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-lg border',
                    isHighlyUrgent
                      ? 'bg-red-100/50 text-red-600 border-red-100'
                      : 'bg-amber-100/50 text-amber-700 border-amber-100'
                  )}>
                    {isTh ? 'แจ้งเตือนกฎหมาย' : 'Legal Alert'}
                  </span>
                </div>
                <p className="text-sm font-black text-gray-900 mt-1.5">
                  {warning.propertyName} (ห้อง {warning.roomNo}) · {warning.tenantName}
                </p>
                <p className="text-xs font-bold text-gray-500 mt-0.5">
                  {isTh ? 'ยอดค้างชำระทั้งหมด:' : 'Total Overdue:'} <span className="text-red-600 font-black">฿{warning.total.toLocaleString()}</span>
                  {` (${isTh ? 'รอบบิล' : 'Billing Period'}: ${warning.billingMonth})`}
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => setSelectedWarningId(warning.id)}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-[#E51D53] text-white hover:bg-[#D41B4D] transition-colors rounded-xl h-10 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                {isTh ? 'ดูหนังสือเตือน' : 'View Notice'}
              </button>
              <button
                onClick={() => notifyAgent(warning.id)}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors rounded-xl h-10 shadow-sm"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-600" />
                {isTh ? 'แจ้งนายหน้า' : 'Notify Agent'}
              </button>
              <button
                onClick={() => sendTenantLine(warning.id)}
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-[#E51D53] text-white hover:bg-[#D41B4D] transition-colors rounded-xl h-10 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                {isTh ? 'ส่ง LINE' : 'Send LINE'}
              </button>
              <button
                onClick={() => dismiss(warning.id)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-xl shrink-0"
                title={isTh ? 'ซ่อนแจ้งเตือน' : 'Dismiss Alert'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Render Warning Notice Modal when selected */}
      {currentWarning && (
        <WarningNoticeModal
          isOpen={true}
          onClose={() => setSelectedWarningId(null)}
          lang={lang}
          warningData={currentWarning}
          onSendLine={() => {
            sendTenantLine(currentWarning.id);
            setSelectedWarningId(null);
          }}
        />
      )}
    </div>
  );
}
