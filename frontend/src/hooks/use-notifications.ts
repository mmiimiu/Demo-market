'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'viewing' | 'contract' | 'payment' | 'maintenance' | 'review' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  href?: string;
}

const STORAGE_KEY = 'primerent_notifications';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'contract',
    title: 'สัญญาเช่าพร้อมลงนาม',
    description: 'สัญญาห้อง #1204 สุขุมวิท รอลายเซ็นของคุณ',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    href: '/contract/contract_prop_1',
  },
  {
    id: 'n2',
    type: 'payment',
    title: 'ชำระค่าเช่าเดือน ก.ค.',
    description: 'ครบกำหนดชำระ ฿18,000 ภายใน 3 วัน',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
    href: '/payment',
  },
  {
    id: 'n3',
    type: 'viewing',
    title: 'นัดดูห้องได้รับการยืนยัน',
    description: 'คอนโดสุขุมวิท · วันจันทร์ 14:00',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'n4',
    type: 'maintenance',
    title: 'คำขอซ่อมได้รับการดำเนินการ',
    description: 'ช่างจะเข้าซ่อมแอร์พรุ่งนี้ 10:00',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        setNotifications(MOCK_NOTIFICATIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_NOTIFICATIONS));
      }
    } catch {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, []);

  const save = useCallback((items: Notification[]) => {
    setNotifications(items);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newN: Notification = {
      ...n,
      id: `n_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => {
      const updated = [newN, ...prev];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markRead, markAllRead, addNotification };
}
