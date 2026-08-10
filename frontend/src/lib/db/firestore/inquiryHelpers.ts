import { where, orderBy } from 'firebase/firestore';
import { type Inquiry, type InquiryStatus } from './types';
import { Collections } from './collections';
import { firestoreHelpers } from './helpers';

export const inquiryHelpers = {
  createInquiry: async (data: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    return firestoreHelpers.addDocument(Collections.INQUIRIES, data);
  },

  getInquiriesByUser: async (userId: string): Promise<Inquiry[]> => {
    return firestoreHelpers.getDocsWithQuery<Inquiry>(
      Collections.INQUIRIES,
      [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      ]
    );
  },

  getInquiriesByAgent: async (agentId: string): Promise<Inquiry[]> => {
    return firestoreHelpers.getDocsWithQuery<Inquiry>(
      Collections.INQUIRIES,
      [
        where('agentId', '==', agentId),
        orderBy('createdAt', 'desc')
      ]
    );
  },

  updateInquiryStatus: async (inquiryId: string, status: InquiryStatus): Promise<void> => {
    return firestoreHelpers.updateDocument(Collections.INQUIRIES, inquiryId, { status });
  },
};
