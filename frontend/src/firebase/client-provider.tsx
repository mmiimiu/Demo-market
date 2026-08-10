'use client';

import React, { useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

/**
 * Initializes Firebase services on the client.
 */
import { getFirestore } from 'firebase/firestore';

export function initializeFirebase() {
  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use useMemo to ensure Firebase is initialized only once on the client.
  const { firebaseApp, firestore, auth } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
