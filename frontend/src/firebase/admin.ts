/**
 * @fileOverview Firebase Admin SDK initialization for server-side operations.
 * Used in API routes that need privileged access to Firestore (e.g. LINE sync).
 *
 * Environment Variables Required (set in .env.local):
 *   FIREBASE_ADMIN_PROJECT_ID
 *   FIREBASE_ADMIN_CLIENT_EMAIL
 *   FIREBASE_ADMIN_PRIVATE_KEY   (the full private key, with \n escaped)
 *
 * If these are not set, adminDb and adminAuth will be null and
 * API routes should gracefully degrade.
 */

import type { Firestore } from 'firebase-admin/firestore';
import type { Auth } from 'firebase-admin/auth';

let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

// Only initialize on server side and when credentials are present
if (typeof window === 'undefined') {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    try {
      // Lazy import to avoid bundling in client
      const admin = require('firebase-admin');

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }

      adminDb = admin.firestore();
      adminAuth = admin.auth();
      console.log('[firebase-admin] Initialized successfully.');
    } catch (e) {
      console.error('[firebase-admin] Initialization failed:', e);
    }
  } else {
    console.warn(
      '[firebase-admin] Missing credentials — adminDb and adminAuth will be null. ' +
      'Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in .env.local'
    );
  }
}

export { adminDb, adminAuth };
