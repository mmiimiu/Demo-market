
'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

export interface ExtendedUser extends User {
  isMock?: boolean;
  role?: string;
  name?: string;
}

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for Mock User in LocalStorage first (for demo/mockup mode)
    const mockUserStr = typeof window !== 'undefined' ? localStorage.getItem('prime_mock_user') : null;

    if (mockUserStr) {
      try {
        const mockUser = JSON.parse(mockUserStr);
        // Validate mock user structure
        if (mockUser && typeof mockUser === 'object' && mockUser.uid && mockUser.email) {
          setUser({ ...mockUser, isMock: true } as ExtendedUser);
          setLoading(false);
          return () => {}; // Return empty cleanup function for mock user
        } else {
          console.warn('Invalid mock user structure, clearing localStorage');
          localStorage.removeItem('prime_mock_user');
        }
      } catch (e) {
        console.error('Failed to parse mock user:', e);
        localStorage.removeItem('prime_mock_user');
      }
    }

    // 2. Fallback to real Firebase Auth
    if (!auth) {
      setLoading(false);
      return () => {}; // Return empty cleanup function if no auth
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u ? { ...u, isMock: false } as ExtendedUser : null);
      setLoading(false);
    });
    return unsubscribe; // Return cleanup function to prevent memory leak
  }, [auth]);

  return { user, loading };
}
