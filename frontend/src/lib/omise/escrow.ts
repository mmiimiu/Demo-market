/**
 * คำนวณการแบ่งเงิน Escrow
 *
 * Standard Escrow Split:
 *   Deposit (2 months)  → ถือไว้ใน escrow จนหมดสัญญา
 *   First month rent    → โอนให้ landlord หลัง 7 วัน (cooling period)
 *   Commission          → โอนให้ agent ทันที
 *   Platform fee        → 1.5% (Omise fee) + service fee
 */
export function calculateEscrowSplit(opts: {
  monthlyRent: number;
  depositMonths?: number;
  agentCommissionRate?: number;    // e.g. 0.05 = 5%
  platformFeeRate?: number;        // e.g. 0.015 = 1.5%
}): {
  depositAmount: number;
  firstMonthRent: number;
  agentCommission: number;
  platformFee: number;
  totalCharge: number;
  breakdown: string[];
} {
  const {
    monthlyRent,
    depositMonths = 2,
    agentCommissionRate = 0.05,
    platformFeeRate = 0.015,
  } = opts;

  const depositAmount = monthlyRent * depositMonths;
  const firstMonthRent = monthlyRent;
  const agentCommission = Math.round(monthlyRent * agentCommissionRate);
  const platformFee = Math.round((depositAmount + firstMonthRent) * platformFeeRate);
  const totalCharge = depositAmount + firstMonthRent + agentCommission + platformFee;

  return {
    depositAmount,
    firstMonthRent,
    agentCommission,
    platformFee,
    totalCharge,
    breakdown: [
      `มัดจำ ${depositMonths} เดือน: ฿${depositAmount.toLocaleString()}`,
      `ค่าเช่าเดือนแรก: ฿${firstMonthRent.toLocaleString()}`,
      `ค่าคอมมิชชั่นตัวแทน (${Math.round(agentCommissionRate * 100)}%): ฿${agentCommission.toLocaleString()}`,
      `ค่าธรรมเนียม Platform (${Math.round(platformFeeRate * 100)}%): ฿${platformFee.toLocaleString()}`,
      `รวมทั้งหมด: ฿${totalCharge.toLocaleString()}`,
    ],
  };
}
