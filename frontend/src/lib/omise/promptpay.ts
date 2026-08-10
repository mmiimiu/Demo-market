import { type ChargeStatus, type PromptPayQRResult } from './types';
import { omiseFetch } from './config';

/**
 * สร้าง PromptPay QR Code สำหรับรับชำระค่าเช่าหรือมัดจำ
 * QR หมดอายุอัตโนมัติใน 15 นาที
 *
 * @param amountTHB     - จำนวนเงิน (บาท)
 * @param description   - คำอธิบายการชำระ (แสดงใน Omise dashboard)
 * @param metadata      - ข้อมูลเพิ่มเติม (propertyId, tenantId, etc.)
 */
export async function createPromptPayQR(
  amountTHB: number,
  description: string,
  metadata: Record<string, string> = {}
): Promise<PromptPayQRResult> {
  const amountSatang = Math.round(amountTHB * 100);
  const EXPIRY_MINUTES = 15;

  // Create a PromptPay source
  const source = await omiseFetch('/sources', 'POST', {
    type: 'promptpay',
    amount: amountSatang,
    currency: 'THB',
  });

  // Create charge with the source
  const charge = await omiseFetch('/charges', 'POST', {
    amount: amountSatang,
    currency: 'THB',
    source: source.id,
    description,
    metadata,
    expires_at: new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000).toISOString(),
  });

  const qrCodeBase64 = charge.source?.scannable_code?.image?.download_uri || '';

  return {
    chargeId: charge.id,
    qrCodeBase64,
    amount: amountSatang,
    amountTHB,
    expiresAt: new Date(charge.expires_at || Date.now() + EXPIRY_MINUTES * 60 * 1000),
    status: charge.status as ChargeStatus,
  };
}

/**
 * ตรวจสอบสถานะ charge (polling สำหรับ client)
 */
export async function getChargeStatus(chargeId: string): Promise<{
  status: ChargeStatus;
  paidAt?: Date;
  amount: number;
}> {
  const charge = await omiseFetch(`/charges/${chargeId}`);
  return {
    status: charge.status as ChargeStatus,
    paidAt: charge.paid_at ? new Date(charge.paid_at) : undefined,
    amount: charge.amount / 100,
  };
}
