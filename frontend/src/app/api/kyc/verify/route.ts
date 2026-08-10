/**
 * @fileOverview e-KYC Verification API Endpoint
 * 
 * Route: POST /api/kyc/verify
 * Request: { userId: string, method: 'ndid' | 'liveness_check', returnUrl: string }
 * Response: { sessionId, redirectUrl }
 * 
 * Route: PUT /api/kyc/verify
 * รับ Webhook/Callback จาก KYC Provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { startKYCSession, checkKYCStatus, verifyKYCWebhook, type KYCMethod } from '@/lib/ekyc';
import { adminDb } from '@/firebase/admin';
import { 
  apiHandler, 
  ApiResponseBuilder, 
  getRequestBody,
  ApiError 
} from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth';

export const POST = apiHandler(async (req: NextRequest) => {
  const authContext = await requireAuth(req);
  const body = await getRequestBody<{
    method?: KYCMethod;
    returnUrl: string;
  }>(req);

  const userId = authContext.uid; // Secure: Use authenticated user's UID
  const { method = 'liveness_check', returnUrl } = body;

  if (!returnUrl) {
    throw new ApiError(400, 'MISSING_RETURN_URL', 'returnUrl is required');
  }

  try {
    const session = await startKYCSession(userId, method, returnUrl);

    if (adminDb) {
      // Store session in Firestore
      await adminDb.collection('kyc_sessions').doc(session.sessionId).set({
        ...session,
        userId,
      });
    }

    return ApiResponseBuilder.success(session);

  } catch (error: any) {
    console.error('[kyc-verify] POST Error:', error);
    throw new ApiError(500, 'KYC_SESSION_FAILED', 'Failed to start KYC session', error.message);
  }
});

export async function PUT(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-kyc-signature') || '';

    if (!verifyKYCWebhook(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { sessionId, status } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const result = await checkKYCStatus(sessionId);

    if (adminDb) {
      const sessionRef = adminDb.collection('kyc_sessions').doc(sessionId);
      const sessionDoc = await sessionRef.get();
      
      if (sessionDoc.exists) {
        const userId = sessionDoc.data()?.userId;
        
        await sessionRef.update({
          status: result.status,
          updatedAt: new Date(),
          verificationData: result.verificationData || null
        });

        if (userId && result.status === 'verified') {
          await adminDb.collection('users').doc(userId).update({
            kycStatus: 'verified',
            kycVerifiedAt: new Date()
          });
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[kyc-verify] PUT Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
