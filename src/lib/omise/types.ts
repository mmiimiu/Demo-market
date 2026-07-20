export type ChargeStatus = 'pending' | 'successful' | 'failed' | 'expired' | 'reversed';

export interface PromptPayQRResult {
  chargeId: string;
  qrCodeBase64: string;   // Base64 PNG of QR code
  amount: number;         // In satang (THB × 100)
  amountTHB: number;
  expiresAt: Date;
  status: ChargeStatus;
}

export interface PayoutResult {
  transferId: string;
  amount: number;
  recipientName: string;
  status: 'pending' | 'sent' | 'paid' | 'failed';
  fee: number;            // Always ฿30
}

export interface EscrowRecord {
  chargeId: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  agentId?: string;
  totalAmount: number;
  depositAmount: number;
  firstMonthRent: number;
  agentCommission: number;
  platformFee: number;
  status: 'held' | 'released' | 'refunded' | 'disputed';
  heldAt: Date;
  releasedAt?: Date;
}
