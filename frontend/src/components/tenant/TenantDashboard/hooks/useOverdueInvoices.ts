/**
 * Hook for managing overdue invoices in TenantDashboard
 */

import { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

interface OverdueInvoice {
  id: string;
  total: number;
  billingMonth: string;
  dueDate?: string;
  createdAt: string;
}

export function useOverdueInvoices(isTh: boolean) {
  const { addNotification, notifications } = useNotifications();
  const [overdueInvoices, setOverdueInvoices] = useState<OverdueInvoice[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('primerent_invoices');
      if (stored) {
        const parsed = JSON.parse(stored);
        const overdue = parsed.filter((inv: any) => inv.status === 'overdue');
        setOverdueInvoices(overdue);

        if (overdue.length > 0) {
          const mainOverdue = overdue[0];
          const hasNotif = notifications.some(n => n.type === 'warning' && n.message.includes(mainOverdue.billingMonth));
          if (!hasNotif) {
            addNotification({
              type: 'warning',
              title: isTh ? '🚨 แจ้งเตือนยอดค้างชำระค่าเช่า' : '🚨 Rent Arrears Notice',
              message: isTh
                ? `คุณมียอดค้างชำระค่าเช่ารวม ฿${mainOverdue.total.toLocaleString()} สำหรับรอบบิล ${mainOverdue.billingMonth}`
                : `You have an overdue rent payment of THB ${mainOverdue.total.toLocaleString()} for the billing period of ${mainOverdue.billingMonth}`,
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [addNotification, notifications, isTh]);

  return { overdueInvoices };
}
