import { db } from '@/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { NotificationService } from './NotificationService';

export class NotificationScheduler {
  /**
   * Check for contracts expiring within 30 days and create notifications
   */
  static async checkContractExpiry() {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const contractsRef = collection(db, 'contracts');
      const q = query(
        contractsRef,
        where('endDate', '<=', thirtyDaysFromNow.toISOString()),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(q);

      for (const contractDoc of querySnapshot.docs) {
        const contract = contractDoc.data();
        const endDate = new Date(contract.endDate);
        const daysUntilExpiry = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        // Only notify if within 30 days and not already notified
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0 && !contract.expiryNotified) {
          await NotificationService.createNotification({
            userId: contract.ownerId,
            type: 'contract_expiry',
            title: 'Contract Expiring Soon',
            message: `Contract for ${contract.propertyName} expires in ${daysUntilExpiry} days`,
            propertyId: contract.propertyId,
            tenantId: contract.tenantId,
          });

          // Mark as notified
          await updateDoc(doc(db, 'contracts', contractDoc.id), {
            expiryNotified: true,
          });
        }
      }
    } catch (error) {
      console.error('Error checking contract expiry:', error);
    }
  }

  /**
   * Check for rent due dates and create notifications
   */
  static async checkRentDue() {
    try {
      const today = new Date();
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

      const contractsRef = collection(db, 'contracts');
      const q = query(
        contractsRef,
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(q);

      for (const contractDoc of querySnapshot.docs) {
        const contract = contractDoc.data();
        const rentDueDate = new Date(contract.rentDueDate);
        
        // Check if rent is due in 2 days or today
        const daysUntilDue = Math.ceil((rentDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue <= 2 && daysUntilDue >= 0) {
          const lastNotified = contract.lastRentNotified ? new Date(contract.lastRentNotified) : null;
          const daysSinceLastNotification = lastNotified 
            ? Math.ceil((Date.now() - lastNotified.getTime()) / (1000 * 60 * 60 * 24))
            : 30;

          // Only notify if not notified in the last 7 days
          if (daysSinceLastNotification >= 7) {
            await NotificationService.createNotification({
              userId: contract.ownerId,
              type: 'rent_due',
              title: 'Rent Payment Due',
              message: `Rent payment of ฿${Number(contract.monthlyRent).toLocaleString()} is due in ${daysUntilDue} days`,
              propertyId: contract.propertyId,
              tenantId: contract.tenantId,
            });

            await updateDoc(doc(db, 'contracts', contractDoc.id), {
              lastRentNotified: new Date().toISOString(),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking rent due:', error);
    }
  }

  /**
   * Check for overdue payments and create notifications
   */
  static async checkOverduePayments() {
    try {
      const today = new Date();

      const contractsRef = collection(db, 'contracts');
      const q = query(
        contractsRef,
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(q);

      for (const contractDoc of querySnapshot.docs) {
        const contract = contractDoc.data();
        const rentDueDate = new Date(contract.rentDueDate);
        
        // Check if rent is overdue by more than 2 days
        const daysOverdue = Math.ceil((Date.now() - rentDueDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysOverdue > 2) {
          const lastNotified = contract.lastOverdueNotified ? new Date(contract.lastOverdueNotified) : null;
          const daysSinceLastNotification = lastNotified 
            ? Math.ceil((Date.now() - lastNotified.getTime()) / (1000 * 60 * 60 * 24))
            : 30;

          // Only notify if not notified in the last 7 days
          if (daysSinceLastNotification >= 7) {
            await NotificationService.createNotification({
              userId: contract.ownerId,
              type: 'overdue_payment',
              title: 'Rent Payment Overdue',
              message: `Rent payment is ${daysOverdue} days overdue. Amount: ฿${Number(contract.monthlyRent).toLocaleString()}`,
              propertyId: contract.propertyId,
              tenantId: contract.tenantId,
            });

            await updateDoc(doc(db, 'contracts', contractDoc.id), {
              lastOverdueNotified: new Date().toISOString(),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking overdue payments:', error);
    }
  }

  /**
   * Run all notification checks
   */
  static async runAllChecks() {
    await this.checkContractExpiry();
    await this.checkRentDue();
    await this.checkOverduePayments();
  }
}
