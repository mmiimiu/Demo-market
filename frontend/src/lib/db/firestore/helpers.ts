import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  Timestamp,
  type DocumentData,
  type QueryConstraint
} from 'firebase/firestore';
import { db } from '@/firebase/config';

// Helper functions
export const firestoreHelpers = {
  // Convert Firestore Timestamp to Date
  timestampToDate: (timestamp: any): Date | undefined => {
    if (!timestamp) return undefined;
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp.toDate) {
      return timestamp.toDate();
    }
    return undefined;
  },

  // Convert Date to Firestore Timestamp
  dateToTimestamp: (date: Date | undefined): Timestamp | undefined => {
    if (!date) return undefined;
    return Timestamp.fromDate(date);
  },

  // Get document by ID
  getDocById: async <T>(collectionName: string, docId: string): Promise<T | null> => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  },

  // Get documents with query
  getDocsWithQuery: async <T>(
    collectionName: string,
    constraints: QueryConstraint[]
  ): Promise<T[]> => {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw error;
    }
  },

  // Add document
  addDocument: async <T extends DocumentData>(
    collectionName: string,
    data: T
  ): Promise<string> => {
    try {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  },

  // Update document
  updateDocument: async <T extends Partial<DocumentData>>(
    collectionName: string,
    docId: string,
    data: T
  ): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (collectionName: string, docId: string): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  },
};
