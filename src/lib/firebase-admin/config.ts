import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
let adminApp: ReturnType<typeof initializeApp> | undefined;

export function getAdminApp() {
  if (adminApp) {
    return adminApp;
  }

  // Check if already initialized
  const apps = getApps();
  if (apps.length > 0) {
    adminApp = apps[0];
    return adminApp;
  }

  // Initialize with service account
  try {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin credentials');
    }

    const serviceAccount: ServiceAccount = {
      projectId,
      clientEmail,
      privateKey,
    };

    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: `${projectId}.appspot.com`,
    });

    console.log('Firebase Admin SDK initialized');
    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

// Firestore Admin
export function getAdminFirestore() {
  const app = getAdminApp();
  return getFirestore(app);
}

// Auth Admin
export function getAdminAuth() {
  const app = getAdminApp();
  return getAuth(app);
}

// Storage Admin
export function getAdminStorage() {
  const app = getAdminApp();
  return getStorage(app);
}
