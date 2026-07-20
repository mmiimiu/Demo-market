import { db } from '@/firebase/config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export interface Notification {
  id?: string;
  userId: string;
  type: 'contract_expiry' | 'rent_due' | 'commission_report' | 'overdue_payment' | 'broadcast';
  title: string;
  message: string;
  propertyId?: string;
  tenantId?: string;
  isRead: boolean;
  createdAt: any;
  scheduledDate?: any;
}

export class NotificationService {
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

  static async getUserNotifications(userId: string) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
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
