import { type AgentTier, type CommissionSplit } from './types';

/**
 * คำนวณการแบ่งค่าคอมมิชชั่นอัตโนมัติ
 *
 * Standard split:
 *   Agent          70% (ปรับตาม tier)
 *   Platform       20%
 *   Referral       10% (ถ้ามี referrer, ไม่งั้นไปที่ platform)
 */
export function calculateCommissionSplit(
  commissionTotal: number,
  agentTier: AgentTier,
  hasReferral: boolean = false
): CommissionSplit {
  const tierBonuses: Record<AgentTier, number> = {
    platinum: 0.05,  // +5% bonus
    gold: 0.02,      // +2% bonus
    silver: 0,
    bronze: -0.05,   // -5% (encourage improvement)
  };

  const baseAgentRate = 0.70 + tierBonuses[agentTier];
  const referralRate = hasReferral ? 0.10 : 0;
  const platformRate = 1 - baseAgentRate - referralRate;

  const agentAmount = Math.round(commissionTotal * baseAgentRate);
  const referralAmount = Math.round(commissionTotal * referralRate);
  const platformAmount = commissionTotal - agentAmount - referralAmount;

  return {
    agentAmount,
    platformAmount,
    referralAmount,
    total: commissionTotal,
    breakdown: [
      `เอเจนต์ (${Math.round(baseAgentRate * 100)}%): ฿${agentAmount.toLocaleString()}`,
      `Platform (${Math.round(platformRate * 100)}%): ฿${platformAmount.toLocaleString()}`,
      ...(hasReferral ? [`Referral (10%): ฿${referralAmount.toLocaleString()}`] : []),
    ],
  };
}
