/**
 * @fileOverview Credit History API Endpoint
 * Route: GET /api/credit/history
 * Query Params: ?userId=...
 *
 * returns user's transaction history from Firestore, or mock indicator if Firestore is unavailable.
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
      const txsRef = adminDb.collection('credit_transactions');
      const snapshot = await txsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const transactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
        };
      });

      return NextResponse.json({ success: true, transactions });
    } else {
      // Fallback for local development
      return NextResponse.json({ success: true, transactions: [], mock: true });
    }
  } catch (error: any) {
    console.error('[credit-history] GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
