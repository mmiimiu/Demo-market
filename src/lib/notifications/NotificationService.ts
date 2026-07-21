import { db } from '@/firebase/config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export interface Notification {
  id?: string;
  userId: string;
  targetRole?: 'tenant' | 'owner' | 'agent' | 'admin';
  type: 'contract_expiry' | 'rent_due' | 'commission_report' | 'overdue_payment' | 'broadcast' | 'lead_dispatch' | 'showing_appointment' | 'maintenance_update' | 'system_alert';
  title: string;
  message: string;
  propertyId?: string;
  tenantId?: string;
  isRead: boolean;
  createdAt: any;
  scheduledDate?: any;
}

export class NotificationService {
  /** Filter notification types according to user role */
  static isTypeAllowedForRole(type: string, role: string): boolean {
    const roleAllowedTypes: Record<string, string[]> = {
      tenant: ['saved_search', 'showing_appointment', 'contract_expiry', 'rent_due', 'maintenance_update', 'broadcast'],
      owner: ['showing_appointment', 'rental_payout', 'contract_expiry', 'tenant_maintenance_request', 'rent_due'],
      agent: ['lead_dispatch', 'showing_batch', 'commission_split', 'commission_report', 'qr_payment_success', 'sla_warning', 'showing_appointment'],
      admin: ['system_alert', 'dispute_ticket', 'sla_breached', 'fraud_alert', 'broadcast'],
      superadmin: ['system_alert', 'dispute_ticket', 'sla_breached', 'fraud_alert', 'broadcast'],
    };
    const allowed = roleAllowedTypes[role.toLowerCase()] || roleAllowedTypes['tenant'];
    return allowed.includes(type);
  }

  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId: string, role: string = 'tenant') {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      const querySnapshot = await getDocs(q);
      const allNotifs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      // Apply Role-Based Notification Filter
      return allNotifs.filter(n => !n.targetRole || n.targetRole === role || this.isTypeAllowedForRole(n.type, role));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  static async markAsRead(notificationId: string) {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      const querySnapshot = await getDocs(q);
      const batch = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isRead: true })
      );
      await Promise.all(batch);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}
