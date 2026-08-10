/**
 * Payment QR Code API
 * POST /api/payments/qr - Generate PromptPay QR code
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { 
  apiHandler, 
  ApiResponseBuilder, 
  getRequestBody,
  ApiError 
} from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth';
import { PaymentService } from '@/lib/services/payment';
import { firestoreHelpers, Collections } from '@/lib/db/firestore';

interface QRCodeRequest {
  amount: number;
  description: string;
  type: 'deposit' | 'rent' | 'commission' | 'credit_purchase' | 'boost_listing';
  propertyId?: string;
  contractId?: string;
  recipientId?: string;
}

/**
 * POST /api/payments/qr
 * Generate PromptPay QR code for payment
 */
export const POST = apiHandler(async (req: NextRequest) => {
  const authContext = await requireAuth(req);
  const body = await getRequestBody<QRCodeRequest>(req);

  // Validate required fields
  if (!body.amount || body.amount <= 0) {
    throw new ApiError(400, 'INVALID_AMOUNT', 'Amount must be greater than 0');
  }

  if (!body.description || body.description.trim().length === 0) {
    throw new ApiError(400, 'MISSING_DESCRIPTION', 'Description is required');
  }

  if (!body.type) {
    throw new ApiError(400, 'MISSING_TYPE', 'Payment type is required');
  }

  try {
    // Generate a deterministic idempotency key by hashing the request details
    const payloadStr = JSON.stringify({
      uid: authContext.uid,
      type: body.type,
      amount: body.amount,
      propertyId: body.propertyId,
      contractId: body.contractId,
      recipientId: body.recipientId,
    });
    const idempotencyKey = crypto.createHash('sha256').update(payloadStr).digest('hex');

    // Create QR code via Omise
    const qrResult = await PaymentService.createPromptPayQR(
      body.amount,
      body.description,
      {
        userId: authContext.uid,
        type: body.type,
        propertyId: body.propertyId,
        contractId: body.contractId,
        recipientId: body.recipientId,
        idempotencyKey,
      }
    );

    // Store payment record in Firestore
    const paymentData = {
      type: body.type,
      amount: body.amount,
      currency: 'THB',
      payerId: authContext.uid,
      recipientId: body.recipientId,
      propertyId: body.propertyId,
      contractId: body.contractId,
      gateway: 'omise',
      gatewayTransactionId: qrResult.id,
      status: 'pending' as const,
      qrCode: {
        url: qrResult.scannable_code.image.download_uri,
        expiresAt: new Date(qrResult.expires_at),
      },
      idempotencyKey,
      webhookEvents: [],
    };

    const paymentId = await firestoreHelpers.addDocument(Collections.PAYMENTS, paymentData);

    // Return QR code data
    return ApiResponseBuilder.success({
      paymentId,
      qrCodeUrl: qrResult.scannable_code.image.download_uri,
      amount: qrResult.amount,
      currency: qrResult.currency,
      expiresAt: qrResult.expires_at,
      chargeId: qrResult.id,
    });
  } catch (error: any) {
    console.error('Error generating QR code:', error);
    throw new ApiError(500, 'QR_GENERATION_FAILED', 'Failed to generate QR code', error.message);
  }
});
