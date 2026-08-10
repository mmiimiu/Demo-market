/**
 * @fileOverview Credit Balance API Endpoint
 * Route: GET /api/credit/balance
 * Query Params: ?userId=...
 *
 * returns user's current credit balance from Firestore, or mock indicator if Firestore is unavailable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { getOptionalAuth } from '@/lib/api/auth';

export async function GET(req: NextRequest) {
  try {
    // Resolve user from authorization header
    const authContext = await getOptionalAuth(req);
    let userId = authContext?.uid;

    // Fallback to query parameter if not authenticated
    if (!userId) {
      const { searchParams } = new URL(req.url);
      userId = searchParams.get('userId') || undefined;
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (adminDb) {
      const userRef = adminDb.collection('users').doc(userId);
      const userDoc = await userRef.get();
      const balance = userDoc.exists ? (userDoc.data()?.creditBalance || 0) : 0;
      return NextResponse.json({ success: true, balance });
    } else {
      // Fallback for local development
      return NextResponse.json({ success: true, balance: 0, mock: true });
    }
  } catch (error: any) {
    console.error('[credit-balance] GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
