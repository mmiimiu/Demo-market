import { getAdminFirestore, getAdminAuth } from './config';

/**
 * Admin Firestore Helpers
 */
export const adminFirestoreHelpers = {
  /**
   * Create or update user document
   */
  async setUser(uid: string, data: any) {
    const db = getAdminFirestore();
    await db.collection('users').doc(uid).set(data, { merge: true });
  },

  /**
   * Get user document
   */
  async getUser(uid: string) {
    const db = getAdminFirestore();
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  /**
   * Delete user and all related data
   */
  async deleteUser(uid: string) {
    const db = getAdminFirestore();
    const auth = getAdminAuth();

    // Delete user document
    await db.collection('users').doc(uid).delete();

    // Delete user properties
    const properties = await db.collection('properties').where('ownerId', '==', uid).get();
    const propertyDeletes = properties.docs.map(doc => doc.ref.delete());
    await Promise.all(propertyDeletes);

    // Delete Firebase Auth user
    await auth.deleteUser(uid);
  },

  /**
   * Batch write operations
   */
  async batchWrite(operations: Array<{
    type: 'set' | 'update' | 'delete';
    collection: string;
    doc: string;
    data?: any;
  }>) {
    const db = getAdminFirestore();
    const batch = db.batch();

    for (const op of operations) {
      const ref = db.collection(op.collection).doc(op.doc);

      switch (op.type) {
        case 'set':
          batch.set(ref, op.data);
          break;
        case 'update':
          batch.update(ref, op.data);
          break;
        case 'delete':
          batch.delete(ref);
          break;
      }
    }

    await batch.commit();
  },

  /**
   * Run transaction
   */
  async runTransaction<T>(
    updateFunction: (transaction: FirebaseFirestore.Transaction) => Promise<T>
  ): Promise<T> {
    const db = getAdminFirestore();
    return db.runTransaction(updateFunction);
  },
};
