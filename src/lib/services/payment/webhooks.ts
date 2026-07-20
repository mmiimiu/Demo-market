import crypto from 'crypto';
import { where } from 'firebase/firestore';
import { firestoreHelpers, Collections } from '@/lib/db/firestore';
import { OMISE_SECRET_KEY } from './config';
import { mapWebhookEventToUpdates } from './update-mapper';
import { sendPaymentSuccessNotification, sendPaymentFailureNotification } from './notifications';

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha256', OMISE_SECRET_KEY);
    hmac.update(payload);
    const computedSignature = hmac.digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Handle successful charge
 */
async function handleChargeComplete(charge: any): Promise<void> {
  console.log('Charge completed:', charge.id);
}

/**
 * Handle failed charge
 */
async function handleChargeFailed(charge: any): Promise<void> {
  console.log('Charge failed:', charge.id, charge.failure_message);
}

/**
 * Handle transfer creation
 */
async function handleTransferCreate(transfer: any): Promise<void> {
  console.log('Transfer created:', transfer.id);
}

/**
 * Handle failed transfer
 */
async function handleTransferFailed(transfer: any): Promise<void> {
  console.log('Transfer failed:', transfer.id, transfer.failure_message);
}

/**
 * Process webhook event
 */
export async function processWebhook(event: any): Promise<void> {
  const { key, data } = event;

  console.log(`Processing webhook event: ${key}`);

  switch (key) {
    case 'charge.complete':
      await handleChargeComplete(data);
      break;
    
    case 'charge.failed':
      await handleChargeFailed(data);
      break;
    
    case 'transfer.create':
      await handleTransferCreate(data);
      break;
    
    case 'transfer.failed':
      await handleTransferFailed(data);
      break;
    
    default:
      console.log(`Unhandled webhook event: ${key}`);
  }
}

/**
 * Update payment record based on webhook event
 */
export async function updatePaymentFromWebhook(event: any): Promise<void> {
  const { key, data } = event;

  try {
    const payments = await firestoreHelpers.getDocsWithQuery<any>(
      Collections.PAYMENTS,
      [
        where('gatewayTransactionId', '==', data.id)
      ]
    );

    if (payments.length === 0) {
      console.log('Payment not found for transaction:', data.id);
      return;
    }

    const payment = payments[0];
    const updates = mapWebhookEventToUpdates(key, data, payment.type);
    
    updates.webhookEvents = [
      ...(payment.webhookEvents || []),
      {
        event: key,
        timestamp: new Date(),
        data,
      },
    ];

    await firestoreHelpers.updateDocument(Collections.PAYMENTS, payment.id, updates);
    console.log(`Payment ${payment.id} updated with status: ${updates.status}`);

    if (updates.status === 'completed') {
      await sendPaymentSuccessNotification(payment);
    } else if (updates.status === 'failed') {
      await sendPaymentFailureNotification(payment);
    }
  } catch (error) {
    console.error('Error updating payment from webhook:', error);
    throw error;
  }
}
