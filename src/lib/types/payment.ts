// Payment Gateway — Type Definitions
// PrimeRent Platform

export type PaymentType = "deposit" | "advance_rent" | "monthly_rent";
export type PaymentStatus = "pending_slip" | "slip_uploaded" | "confirmed" | "rejected" | "cancelled";
export type BillStatus = "draft" | "sent" | "paid" | "overdue";
export type PayoutStatus = "pending_payout" | "paid";

export interface PaymentRecord {
  id: string;
  contractId: string;
  propertyId: string;
  type: PaymentType;
  amount: number;
  currency: "THB";
  payerId: string;
  payeeId: string;
  slipUrl?: string;
  slipUploadedAt?: string;
  note?: string;
  status: PaymentStatus;
  confirmedAt?: string;
  confirmedBy?: string;
  rejectedReason?: string;
  month?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionRecord {
  id: string;
  contractId: string;
  propertyId: string;
  advanceRentAmount: number;
  agentId: string;
  agentPercent: number;
  agentAmount: number;
  coAgentId?: string;
  coAgentPercent?: number;
  coAgentAmount?: number;
  websitePercent: number;
  websiteAmount: number;
  status: PayoutStatus;
  payoutAt?: string;
  createdAt: string;
}

export interface MonthlyBillItem {
  type: "rent" | "water" | "electric" | "common_fee" | "other";
  label: string;
  amount: number;
  unit?: number;
  ratePerUnit?: number;
}

export interface MonthlyBill {
  id: string;
  contractId: string;
  propertyId: string;
  ownerId: string;
  tenantId: string;
  month: string;
  dueDate: string;
  items: MonthlyBillItem[];
  totalAmount: number;
  hasUtilities: boolean;
  status: BillStatus;
  paymentId?: string;
  sentAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function calcCommission(
  advanceRentAmount: number,
  agentId: string,
  coAgentId?: string
) {
  const hasCoAgent = !!coAgentId;
  const agentPercent = hasCoAgent ? 60 : 70;
  const coAgentPercent = hasCoAgent ? 10 : 0;
  const websitePercent = 30;
  return {
    advanceRentAmount,
    agentId,
    agentPercent,
    agentAmount: Math.round(advanceRentAmount * agentPercent / 100),
    coAgentId,
    coAgentPercent: hasCoAgent ? coAgentPercent : undefined,
    coAgentAmount: hasCoAgent ? Math.round(advanceRentAmount * coAgentPercent / 100) : undefined,
    websitePercent,
    websiteAmount: Math.round(advanceRentAmount * websitePercent / 100),
  };
}

export function calcBillTotal(items: MonthlyBillItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}
