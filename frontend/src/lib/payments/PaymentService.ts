import { db } from '@/firebase/config';
import { collection, addDoc, doc, updateDoc, getDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { LineService } from '../line/LineService';
import type { PaymentRecord } from '../line/LineService';

export class PaymentService {
  /**
   * Create a new payment record
   */
  static async createPaymentRecord(payment: Omit<PaymentRecord, 'id' | 'createdAt' | 'status'>) {
    try {
      const docRef = await addDoc(collection(db, 'payments'), {
        ...payment,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Send LINE notification to request slip upload
      const contractRef = doc(db, 'contracts', payment.contractId);
      const contractDoc = await getDoc(contractRef);
      if (contractDoc.exists()) {
        const contract = contractDoc.data();
        const propertyRef = doc(db, 'properties', payment.propertyId);
        const propertyDoc = await getDoc(propertyRef);
        
        if (propertyDoc.exists()) {
          const property = propertyDoc.data();
          // Get tenant's LINE ID from user profile
          const userRef = doc(db, 'users', payment.tenantId);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const user = userDoc.data();
            if (user.lineUserId) {
              await LineService.requestSlipUpload(user.lineUserId, {
                propertyName: property.title || property.name,
                amount: payment.amount,
              });
            }
          }
        }
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating payment record:', error);
      throw error;
    }
  }

  /**
   * Upload payment slip image
   */
  static async uploadPaymentSlip(paymentId: string, slipImageUrl: string) {
    try {
      const docRef = doc(db, 'payments', paymentId);
      await updateDoc(docRef, {
        slipImageUrl,
        slipVerified: false,
        status: 'pending',
      });
      return true;
    } catch (error) {
      console.error('Error uploading payment slip:', error);
      throw error;
    }
  }

  /**
   * Get payment record by ID
   */
  static async getPaymentRecord(paymentId: string): Promise<PaymentRecord | null> {
    try {
      const docRef = doc(db, 'payments', paymentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as PaymentRecord;
      }
      return null;
    } catch (error) {
      console.error('Error fetching payment record:', error);
      return null;
    }
  }

  /**
   * Get payment records for a contract
   */
  static async getContractPayments(contractId: string): Promise<PaymentRecord[]> {
    try {
      const q = query(
        collection(db, 'payments'),
        where('contractId', '==', contractId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRecord));
    } catch (error) {
      console.error('Error fetching contract payments:', error);
      return [];
    }
  }

  /**
   * Get payment records for a property (owner view)
   */
  static async getPropertyPayments(propertyId: string): Promise<PaymentRecord[]> {
    try {
      const q = query(
        collection(db, 'payments'),
        where('propertyId', '==', propertyId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRecord));
    } catch (error) {
      console.error('Error fetching property payments:', error);
      return [];
    }
  }

  /**
   * Verify payment slip
   */
  static async verifyPaymentSlip(
    paymentId: string,
    verified: boolean,
    verifiedBy: string,
    notes?: string
  ) {
    try {
      const docRef = doc(db, 'payments', paymentId);
      await updateDoc(docRef, {
        slipVerified: verified,
        status: verified ? 'verified' : 'rejected',
        verifiedBy,
        verifiedAt: new Date().toISOString(),
        notes,
      });

      // Send LINE notification if verified
      if (verified) {
        const payment = await this.getPaymentRecord(paymentId);
        if (payment) {
          const userRef = doc(db, 'users', payment.tenantId);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const user = userDoc.data();
            const propertyRef = doc(db, 'properties', payment.propertyId);
            const propertyDoc = await getDoc(propertyRef);
            
            if (propertyDoc.exists() && user.lineUserId) {
              const property = propertyDoc.data();
              await LineService.sendPaymentConfirmation(user.lineUserId, {
                propertyName: property.title || property.name,
                amount: payment.amount,
                paymentDate: payment.paymentDate,
              });
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error verifying payment slip:', error);
      throw error;
    }
  }

  /**
   * Get pending payments for verification (owner view)
   */
  static async getPendingPayments(ownerId: string): Promise<PaymentRecord[]> {
    try {
      const q = query(
        collection(db, 'payments'),
        where('ownerId', '==', ownerId),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRecord));
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      return [];
    }
  }
}
