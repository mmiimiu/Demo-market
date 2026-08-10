/**
 * Authentication Hook
 */

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/firebase/config';
import { api } from '@/lib/api-client';
import type { User } from '@/lib/db/firestore';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user data from API
        try {
          const data = await api.auth.getMe();
          setUserData(data);
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (displayName && result.user) {
        await updateFirebaseProfile(result.user, { displayName });
      }
      
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });
      
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const signOut = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<User>) => {
    setError(null);
    try {
      const updated = await api.auth.updateMe(data);
      setUserData(updated);
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    userData,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
}
