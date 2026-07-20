import { create } from 'zustand';
import type { ExtendedUser } from '@/firebase/auth/use-user';

interface AuthState {
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setUser: (user: ExtendedUser | null) => void;
  setInitialized: (isInitialized: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isInitialized: true 
  }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
