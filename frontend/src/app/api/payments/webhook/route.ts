/**
 * Payment Webhook Handler
 * POST /api/payments/webhook - Handle Omise webhook events
 */

import { NextRequest } from 'next/server';
import { 
  apiHandler, 
  ApiResponseBuilder,
  ApiError 
} from '@/lib/api/response';
import { PaymentService } from '@/lib/services/payment';

/**
 * POST /api/payments/webhook
 * Handle Omise webhook events
 */
export const POST = apiHandler(async (req: NextRequest) => {
  // Get raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get('omise-signature') || '';

  // Verify webhook signature
  if (!PaymentService.verifyWebhookSignature(rawBody, signature)) {
    console.error('Invalid webhook signature');
    throw new ApiError(401, 'INVALID_SIGNATURE', 'Invalid webhook signature');
  }

  try {
    const event = JSON.parse(rawBody);

    console.log('Received webhook event:', event.key);

    // Process the webhook event
    await PaymentService.processWebhook(event);

    // Update payment record in Firestore
    if (event.data && event.data.id) {
      await PaymentService.updatePaymentFromWebhook(event);
    }

    return ApiResponseBuilder.success({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    throw new ApiError(500, 'WEBHOOK_ERROR', 'Failed to process webhook', error.message);
  }
});
