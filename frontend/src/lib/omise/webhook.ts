import crypto from 'crypto';

/**
 * ตรวจสอบ Omise webhook signature
 * ใช้ HMAC-SHA256 กับ OMISE_WEBHOOK_SECRET
 */
export function verifyOmiseWebhook(payload: string, signature: string): boolean {
  const secret = process.env.OMISE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[omise] OMISE_WEBHOOK_SECRET not set — skipping verification.');
    return true;
  }

  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return expected === signature;
}
