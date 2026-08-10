'use client';

import React from 'react';
import { Clock, X, RefreshCcw, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLeaseRenewal } from '@/hooks/useLeaseRenewal';

interface LeaseRenewalAlertProps {
  lang?: 'th' | 'en' | 'cn';
  onRenew?: (contractId: string) => void;
}

export function LeaseRenewalAlert({ lang = 'th', onRenew }: LeaseRenewalAlertProps) {
  const isThai = lang === 'th';
  const { alerts, dismiss } = useLeaseRenewal();

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map(alert => {
        const isUrgent = alert.daysLeft <= 7;
        const isWarning = alert.daysLeft <= 14;

        return (
          <div
            key={alert.id}
            className={cn(
              'relative flex items-start gap-4 p-4 rounded-2xl border animate-in slide-in-from-top-2 duration-400 shadow-sm shadow-gray-200/50',
              isUrgent
                ? 'bg-white border-gray-100 border-l-4 border-l-[#E51D53]'
                : isWarning
                ? 'bg-white border-gray-100 border-l-4 border-l-amber-500'
                : 'bg-white border-gray-100 border-l-4 border-l-gray-400'
            )}
            role="alert"
          >
            {/* Icon */}
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gray-100'
            )}>
              {isUrgent || isWarning
                ? <AlertTriangle className="w-4 h-4 text-gray-600" />
                : <Clock className="w-4 h-4 text-gray-600" />
              }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-semibold text-gray-900">
                  {isUrgent
                    ? (isThai ? 'สัญญาใกล้หมดเร่งด่วน' : 'Urgent: Lease Expiring Soon')
                    : isWarning
                    ? (isThai ? 'สัญญาใกล้หมด' : 'Lease Expiring Soon')
                    : (isThai ? 'แจ้งเตือนการต่อสัญญา' : 'Lease Renewal Reminder')
                  }
                </p>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-xl bg-gray-100 text-gray-700">
                  {alert.daysLeft} {isThai ? 'วันที่เหลือ' : 'days left'}
                </span>
              </div>
              <p className="text-xs mt-0.5 text-gray-700">
                <span className="font-medium">{alert.propertyName}</span>
                {alert.tenantName && <> · {alert.tenantName}</>}
                {alert.monthlyRent && <> · ฿{alert.monthlyRent.toLocaleString()}/เดือน</>}
              </p>
              <p className="text-[10px] mt-0.5 text-gray-500">
                {isThai ? 'วันหมดสัญญา:' : 'Expiry:'} {alert.endDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={() => {
                    if (onRenew) {
                      onRenew(alert.id);
                    } else {
                      // ⭐ Navigate to Contracts tab in Profile — resets correctly on refresh
                      window.location.href = `/profile?tab=contracts`;
                    }
                  }}
                  className="flex items-center gap-1 text-[10px] font-medium px-3 py-1.5 rounded-xl bg-[#E51D53] text-white hover:bg-[#D41B4D] transition-colors"
                >
                  <RefreshCcw className="w-3 h-3" />
                  {isThai ? 'ต่ออายุสัญญา' : 'Renew Lease'}
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => dismiss(alert.id)}
                  className="text-[10px] font-medium text-gray-500 hover:text-gray-700 transition-colors px-2 py-1.5"
                >
                  {isThai ? 'รับทราบ' : 'Dismiss'}
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => dismiss(alert.id)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              aria-label={isThai ? 'ปิดแจ้งเตือน' : 'Close alert'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
