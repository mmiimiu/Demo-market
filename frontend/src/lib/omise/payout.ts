import { type PayoutResult } from './types';
import { omiseFetch } from './config';

/**
 * โอนเงินไปยังบัญชีธนาคาร (สำหรับ Escrow release → landlord/agent)
 *
 * @param recipientId   - Omise Recipient ID (สร้างไว้ล่วงหน้าใน Omise Dashboard)
 * @param amountTHB     - จำนวนเงินที่จะโอน (บาท)
 */
export async function createBankPayout(
  recipientId: string,
  amountTHB: number
): Promise<PayoutResult> {
  const amountSatang = Math.round(amountTHB * 100);
  const FEE_SATANG = 3000; // ฿30 fixed fee

  const transfer = await omiseFetch('/transfers', 'POST', {
    amount: amountSatang,
    recipient: recipientId,
  });

  return {
    transferId: transfer.id,
    amount: amountTHB,
    recipientName: transfer.recipient?.name || 'Unknown',
    status: transfer.sent ? 'sent' : 'pending',
    fee: FEE_SATANG / 100,
  };
}
