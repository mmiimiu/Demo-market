'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { useAuthStore } from '../store/auth.store';
import type { ExtendedUser } from '@/firebase/auth/use-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    // 1. Check for Mock User in LocalStorage first (for demo/mockup mode)
    const isDevelopment = process.env.NODE_ENV === 'development';
    const mockUserStr = typeof window !== 'undefined' ? localStorage.getItem('prime_mock_user') : null;

    if (mockUserStr) {
      try {
        const mockUser = JSON.parse(mockUserStr);
        if (mockUser && typeof mockUser === 'object' && mockUser.uid && mockUser.email) {
          setUser({ ...mockUser, isMock: true } as ExtendedUser);
          return () => {}; // return empty cleanup
        }
      } catch (e) {
        console.error('Failed to parse mock user:', e);
      }
    }

    if (!auth) {
      setInitialized(true);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u ? ({ ...u, isMock: false } as ExtendedUser) : null);
    });

    return unsubscribe;
  }, [auth, setUser, setInitialized]);

  return <>{children}</>;
}
