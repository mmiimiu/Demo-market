'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export interface ContractAlert {
  id: string;
  propertyName: string;
  roomNumber?: string;
  endDate: Date;
  daysLeft: number;
  tenantName?: string;
  ownerId?: string;
  tenantId?: string;
  monthlyRent?: number;
}

const ALERT_THRESHOLD_DAYS = 30;

export function useLeaseRenewal() {
  const { user } = useUser();
  const db = useFirestore();
  const [alerts, setAlerts] = useState<ContractAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // ⚠️ [TEST MODE] Load demo data regardless of user state for testing
    loadContracts();
  }, [user, db]);

  const loadContracts = async () => {
    const now = new Date();
    const threshold = new Date(now.getTime() + ALERT_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);
    const foundAlerts: ContractAlert[] = [];

    // Try Firestore first
    if (db && !user?.isMock) {
      try {
        const q = query(
          collection(db, 'contracts'),
          where('status', '==', 'active')
        );
        const snap = await getDocs(q);
        snap.docs.forEach(doc => {
          const data = doc.data() as any;
          if (data.ownerId !== user?.uid && data.tenantId !== user?.uid) return;
          const endDate = data.endDate?.toDate?.() || (data.endDate ? new Date(data.endDate) : null);
          if (!endDate) return;
          const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= ALERT_THRESHOLD_DAYS && daysLeft > 0) {
            const roomSuffix = data.roomNumber ? ` (ห้อง ${data.roomNumber})` : '';
            foundAlerts.push({
              id: doc.id,
              propertyName: `${data.propertyName || 'ที่พัก'}${roomSuffix}`,
              roomNumber: data.roomNumber,
              endDate,
              daysLeft,
              tenantName: data.tenantName,
              ownerId: data.ownerId,
              tenantId: data.tenantId,
              monthlyRent: data.monthlyRent,
            });
          }
        });
      } catch { /* ignore permission errors */ }
    }

    // localStorage fallback (mock mode)
    try {
      const stored = localStorage.getItem('contracts');
      if (stored) {
        const list = JSON.parse(stored) as any[];
        list.forEach(c => {
          if (c.status !== 'active') return;
          const endDate = c.endDate ? new Date(c.endDate) : null;
          if (!endDate) return;
          const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= ALERT_THRESHOLD_DAYS && daysLeft > 0 && !foundAlerts.find(a => a.id === c.id)) {
            const roomSuffix = c.roomNumber ? ` (ห้อง ${c.roomNumber})` : '';
            foundAlerts.push({
              id: c.id,
              propertyName: `${c.propertyName || 'ที่พัก'}${roomSuffix}`,
              roomNumber: c.roomNumber,
              endDate,
              daysLeft,
              tenantName: c.tenantName,
              monthlyRent: c.monthlyRent,
            });
          }
        });
      }

      // ⚠️ [TEST MODE] Always inject a demo alert if no real contracts found
      // This ensures the LeaseRenewalAlert card always appears for testing.
      // On every page refresh it resets to this demo data.
      if (foundAlerts.length === 0) {
        const demoEnd = new Date();
        demoEnd.setDate(demoEnd.getDate() + 18);
        foundAlerts.push({
          id: 'demo_alert_1',
          propertyName: 'Sukhumvit Condo 2BR (ห้อง A-1204)',
          roomNumber: 'A-1204',
          endDate: demoEnd,
          daysLeft: 18,
          tenantName: 'คุณสมชาย ใจดี',
          monthlyRent: 28000,
        });
      }
    } catch { /* ignore */ }

    setAlerts(foundAlerts);
  };

  const dismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  const activeAlerts = alerts.filter(a => !dismissed.has(a.id));

  return { alerts: activeAlerts, allAlerts: alerts, dismiss, refresh: loadContracts };
}
