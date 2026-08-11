import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore, getFirestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "placeholder-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "placeholder-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "placeholder-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "placeholder-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "placeholder-messaging-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "placeholder-app-id",
};

// ℹ️ Demo Mode: Skip Firebase validation in production
// This demo uses mock data and does not require a live Firebase connection.
// To enable real Firebase, set all NEXT_PUBLIC_FIREBASE_* environment variables.


// Initialize Firebase app
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services with offline cache configured at startup
export const auth: Auth = getAuth(app);
export const db: Firestore = typeof window !== 'undefined'
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  : getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export { firebaseConfig };
