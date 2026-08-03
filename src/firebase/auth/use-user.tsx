
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
    let mockUserStr = typeof window !== 'undefined' ? localStorage.getItem('prime_mock_user') : null;

    if (!mockUserStr && typeof window !== 'undefined') {
      const defaultRole = localStorage.getItem('primerent_user_role') || 'agent';
      const defaultMock = {
        uid: 'mock_user_1',
        displayName: 'คุณสมชาย ใจดี',
        email: 'demo@primerent.com',
        phoneNumber: '0812345678',
        role: defaultRole,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
      };
      localStorage.setItem('prime_mock_user', JSON.stringify(defaultMock));
      mockUserStr = JSON.stringify(defaultMock);
    }

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
