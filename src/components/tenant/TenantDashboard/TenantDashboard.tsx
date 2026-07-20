'use client';

import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { LeaseRenewalAlert } from '@/components/shared/LeaseRenewalAlert';
import { Notifications } from '@/components/shared/Notifications';
import { Notification } from '@/components/shared/Notifications/types';
import { LeaseHero } from './LeaseHero';
import { KpiStats } from './KpiStats';
import { PaymentsList } from './PaymentsList';
import { ChecklistSection } from './ChecklistSection';
import { PitchedRoomsList } from './PitchedRoomsList';
import { TenantPreferences } from './TenantPreferences';
import { TenantSidebar, ActiveTab } from './TenantSidebar';
import { MaintenanceTab } from './MaintenanceTab';
import { TenantDashboardProps } from './types';
import { MOCK_LEASE, MOCK_PAYMENTS, MOCK_CHECKLIST } from './mockData';
import { daysUntil } from './utils/dateUtils';
import { useOverdueInvoices } from './hooks/useOverdueInvoices';
import { OverdueAlert } from './components/OverdueAlert';

export function TenantDashboard({ lang }: TenantDashboardProps) {
  const isTh = lang === 'th';
  const isCn = lang === 'cn';
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const { overdueInvoices } = useOverdueInvoices(isTh);

  const { notifications: globalNotifications, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  const filteredNotifications = globalNotifications
    .filter(n => {
      // Tenants should not see admin alerts or landlord property expiry warnings
      return !n.id.startsWith('mock_admin_') && !n.id.startsWith('mock_expiry_');
    })
    .map(n => {
      let destUrl = undefined;
      if (n.id.startsWith('welcome_signup_') || n.id === 'mock_welcome_signup') {
        destUrl = '/profile';
      } else if (n.id === 'mock_price_wishlist') {
        destUrl = '/profile';
      } else if (n.id === 'mock_new_in_zone' || n.id === 'mock_saved_search_match') {
        destUrl = '/listings';
      } else if (n.id === 'mock_line_chat_message') {
        destUrl = '/chat';
      } else if (n.id.startsWith('mock_appointment_')) {
        destUrl = '/tenant/dashboard';
      } else if (n.id === 'mock_contract_expiry_30_days') {
        destUrl = '/tenant/contract';
      } else if (n.id === 'mock_monthly_invoice_alert') {
        destUrl = '/tenant/billing';
      }

      return {
        id: n.id,
        type: (n.type === 'new_property' || n.type === 'property_update' || n.type === 'chat_message' || n.type === 'booking' || n.type === 'system')
          ? 'info' as const
          : n.type as 'success' | 'error' | 'warning' | 'info',
        title: n.title,
        message: n.message,
        timestamp: n.timestamp,
        read: n.read,
        actionLabel: n.action?.label || (destUrl ? (isTh ? 'เปิดดู' : 'View') : undefined),
        actionUrl: destUrl || (n.action ? '#' : undefined),
        _original: n
      };
    });

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (id: string) => {
    removeNotification(id);
  };

  const handleActionClick = (notification: any) => {
    const orig = notification._original;
    if (orig && orig.action && orig.action.onClick) {
      orig.action.onClick();
    } else if (notification.actionUrl && notification.actionUrl !== '#') {
      window.location.href = notification.actionUrl;
    }
  };

  const label = (th: string, en: string, cn: string) => isTh ? th : isCn ? cn : en;
  const daysLeft = daysUntil(MOCK_LEASE.endDate);
  const nextPaymentDays = daysUntil(MOCK_PAYMENTS.find(p => p.status === 'pending')?.date || '');
  const checklistDone = MOCK_CHECKLIST.filter(c => c.done).length;
  const totalPaid = MOCK_PAYMENTS.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const monthsPaid = MOCK_PAYMENTS.filter(p => p.status === 'paid').length;

  const combinedPayments = [...MOCK_PAYMENTS];
  overdueInvoices.forEach(inv => {
    if (!combinedPayments.some(p => p.id === inv.id)) {
      combinedPayments.unshift({
        id: inv.id,
        month: inv.billingMonth,
        amount: inv.total,
        status: 'overdue',
        date: inv.dueDate || inv.createdAt
      });
    }
  });

  return (
    <div className="flex h-[calc(100vh-80px)] lg:h-[calc(100vh-100px)] overflow-hidden bg-gray-50 font-thai pt-4 lg:pt-0">
      <div className="hidden lg:block p-4">
        <TenantSidebar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {activeTab === 'overview' && (
            <>
              <LeaseRenewalAlert lang={lang} />

              <OverdueAlert overdueInvoices={overdueInvoices} label={label} isTh={isTh} />

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
                {/* Bento Box: Lease Hero (Spans full width) */}
                <div className="col-span-1 md:col-span-2 xl:col-span-3">
                  <LeaseHero lease={MOCK_LEASE} daysLeft={daysLeft} isTh={isTh} label={label} />
                </div>
                
                {/* Left Column Widgets (col-span-2) */}
                <div className="col-span-1 md:col-span-2 xl:col-span-2 flex flex-col gap-6">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-200/50 p-6">
                    <MaintenanceTab lang={lang} />
                  </div>
                  <PaymentsList payments={combinedPayments} label={label} isTh={isTh} />
                </div>
                
                {/* Right Column Widgets (col-span-1) */}
                <div className="col-span-1 flex flex-col gap-6">
                  <KpiStats monthsPaid={monthsPaid} totalPaid={totalPaid} nextPaymentDays={nextPaymentDays} checklistDone={checklistDone} checklistTotal={MOCK_CHECKLIST.length} label={label} />
                  <ChecklistSection checklist={MOCK_CHECKLIST} doneCount={checklistDone} totalCount={MOCK_CHECKLIST.length} label={label} />
                  <TenantPreferences label={label} />
                  <PitchedRoomsList label={label} />
                </div>
              </div>
            </>
          )}

          {activeTab === 'maintenance' && <MaintenanceTab lang={lang} />}

          {activeTab === 'notifications' && (
            <Notifications
              lang={lang}
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDelete={handleDelete}
              onActionClick={handleActionClick}
            />
          )}

          {activeTab !== 'overview' && activeTab !== 'maintenance' && activeTab !== 'notifications' && (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-none">
              <p className="text-gray-500 font-medium">
                {label('กำลังพัฒนาระบบส่วนนี้...', 'Coming Soon...', '即将推出...')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
