'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/firebase';
import { useNotifications } from './use-notifications';
import { toast } from './use-toast';

export interface ArrearsWarning {
  id: string;
  tenantName: string;
  propertyName: string;
  roomNo: string;
  billingMonth: string;
  rent: number;
  commonFee: number;
  water: number;
  electricity: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  createdAt: string;
  dueDate: string;
  daysOverdue: number;
}

const STORAGE_KEY = 'primerent_invoices';
const DISMISSED_KEY = 'primerent_dismissed_arrears';

export function useArrearsWarnings() {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [warnings, setWarnings] = useState<ArrearsWarning[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const loadWarnings = useCallback(() => {
    if (!user) return;
    try {
      const storedDismissed = localStorage.getItem(DISMISSED_KEY);
      if (storedDismissed) setDismissed(new Set(JSON.parse(storedDismissed)));

      let invoices: any[] = [];
      const storedInvoices = localStorage.getItem(STORAGE_KEY);
      if (storedInvoices) invoices = JSON.parse(storedInvoices);

      if (user.isMock && !invoices.some(inv => inv.status === 'overdue')) {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 12);
        
        const demoOverdue = {
          id: 'inv_demo_overdue_1',
          tenantName: 'คุณอานนท์ ดีงาม',
          propertyName: 'Sukhumvit Luxury Condo 2BR',
          roomNo: '305',
          billingMonth: 'มิถุนายน 2026',
          rent: 12000,
          commonFee: 800,
          water: 270,
          electricity: 1120,
          total: 14190,
          status: 'overdue',
          createdAt: new Date(tenDaysAgo.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dueDate: tenDaysAgo.toISOString().split('T')[0],
        };
        invoices.push(demoOverdue);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
      }

      const foundWarnings: ArrearsWarning[] = [];
      const now = new Date();

      invoices.forEach(inv => {
        if (inv.status !== 'overdue') return;
        const dueDateStr = inv.dueDate || inv.createdAt;
        const dueDate = new Date(dueDateStr);
        const diffTime = now.getTime() - dueDate.getTime();
        const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (daysOverdue >= 10) {
          foundWarnings.push({
            ...inv,
            dueDate: dueDateStr,
            daysOverdue: daysOverdue > 0 ? daysOverdue : 10,
          });
        }
      });
      setWarnings(foundWarnings);
    } catch (e) {
      console.error('Failed to load arrears warnings:', e);
    }
  }, [user]);

  useEffect(() => {
    loadWarnings();
  }, [loadWarnings]);

  const dismiss = (id: string) => {
    setDismissed(prev => {
      const updated = new Set([...prev, id]);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(updated)));
      return updated;
    });
  };

  const notifyAgent = (id: string) => {
    const warning = warnings.find(w => w.id === id);
    if (!warning) return;
    addNotification({
      type: 'payment',
      title: '🚨 ผู้เช่าค้างชำระค่าเช่าเกิน 10 วัน',
      description: `ผู้เช่า ${warning.tenantName} (${warning.propertyName} ห้อง ${warning.roomNo}) ค้างจ่ายค่าเช่า ฿${warning.total.toLocaleString()} เกิน 10 วันแล้ว กรุณาช่วยติดตาม`,
      href: '/agent/dashboard',
    });
    toast({
      title: '📱 ส่งแจ้งเตือนนายหน้าสำเร็จ',
      description: `ระบบส่งแจ้งเตือนและข้อความ LINE OA ไปยังนายหน้าผู้ดูแลยูนิตนี้เรียบร้อยแล้ว`,
    });
  };

  const sendTenantLine = (id: string) => {
    const warning = warnings.find(w => w.id === id);
    if (!warning) return;
    toast({
      title: '💬 ส่งแจ้งเตือนผู้เช่าสำเร็จ',
      description: `ส่งหนังสือบอกกล่าวทวงถามหนี้และลิงก์เตือนความจำให้คุณ ${warning.tenantName} ผ่านทาง LINE OA แล้ว`,
    });
  };

  return {
    warnings: warnings.filter(w => !dismissed.has(w.id)),
    allWarnings: warnings,
    dismiss,
    notifyAgent,
    sendTenantLine,
    refresh: loadWarnings
  };
}
