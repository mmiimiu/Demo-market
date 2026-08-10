import { where, limit } from 'firebase/firestore';
import { type User } from './types';
import { Collections } from './collections';
import { firestoreHelpers } from './helpers';

export const userHelpers = {
  getUserById: async (userId: string): Promise<User | null> => {
    return firestoreHelpers.getDocById<User>(Collections.USERS, userId);
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    const users = await firestoreHelpers.getDocsWithQuery<User>(
      Collections.USERS,
      [where('email', '==', email), limit(1)]
    );
    return users.length > 0 ? users[0] : null;
  },

  updateUserProfile: async (userId: string, data: Partial<User>): Promise<void> => {
    return firestoreHelpers.updateDocument(Collections.USERS, userId, data);
  },
};
