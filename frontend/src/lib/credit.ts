/**
 * @fileOverview Credit System Module
 * กำหนดแพ็กเกจเครดิต และประเภทของธุรกรรมการใช้เครดิต (Credit Usage / Top-up)
 */

export interface CreditPackage {
  id: string;
  name: string;
  priceTHB: number;
  credits: number;
  bonus: number;
  popular?: boolean;
}

export type TransactionType = 'topup' | 'usage' | 'refund' | 'bonus';

export interface CreditTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;         // จำนวนเครดิต (+ หรือ -)
  balanceAfter: number;   // ยอดเครดิตคงเหลือหลังทำธุรกรรม
  description: string;
  referenceId?: string;   // เช่น chargeId จาก Omise, หรือ listingId ที่โปรโมท
  createdAt: Date;
  channel?: string;       // ช่องทางชำระ (e.g., 'QR PromptPay')
  status?: 'success' | 'failed' | 'expired'; // สถานะ
  packageName?: string;   // Package name
  paymentAmount?: number; // จำนวนเงินที่ชำระ
}

// ─── Preset Packages ──────────────────────────────────────────────────────────

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pkg_basic',
    name: 'Basic',
    priceTHB: 500,
    credits: 500,
    bonus: 0,
  },
  {
    id: 'pkg_pro',
    name: 'Pro',
    priceTHB: 1000,
    credits: 1000,
    bonus: 100, // 10% bonus
    popular: true,
  },
  {
    id: 'pkg_premium',
    name: 'Premium',
    priceTHB: 3000,
    credits: 3000,
    bonus: 450, // 15% bonus
  },
  {
    id: 'pkg_elite',
    name: 'Elite',
    priceTHB: 5000,
    credits: 5000,
    bonus: 1000, // 20% bonus
  }
];

// ─── Credit Pricing (Cost of Actions) ─────────────────────────────────────────

export const CREDIT_COSTS = {
  POST_LISTING: 50,       // ลงประกาศธรรมดา
  BOOST_LISTING: 150,     // ดันประกาศ (1 วัน)
  PIN_LISTING: 300,       // ปักหมุดบนสุด (1 วัน)
  RENEW_LISTING: 30,      // ต่ออายุประกาศ
};

/**
 * คำนวณจำนวนเครดิตทั้งหมดที่ได้รับจากแพ็กเกจ
 */
export function calculateTotalCredits(pkgId: string): number {
  const pkg = CREDIT_PACKAGES.find(p => p.id === pkgId);
  if (!pkg) return 0;
  return pkg.credits + pkg.bonus;
}

/**
 * Format credit number with ₡ symbol
 */
export function formatCredit(amount: number): string {
  return `${Math.abs(amount).toLocaleString()} ₡`;
}

// ─── Credit Usage Labels (TH / EN) ────────────────────────────────────────────

export const CREDIT_USAGE_LABELS: Record<keyof typeof CREDIT_COSTS, { th: string; en: string; icon: string }> = {
  POST_LISTING:  { th: 'ลงประกาศ',          en: 'Post Listing',    icon: '📋' },
  BOOST_LISTING: { th: 'ดันประกาศ (1 วัน)', en: 'Boost (1 Day)',   icon: '🚀' },
  PIN_LISTING:   { th: 'ปักหมุดบนสุด (1 วัน)', en: 'Pin Top (1 Day)', icon: '📌' },
  RENEW_LISTING: { th: 'ต่ออายุประกาศ',     en: 'Renew Listing',  icon: '🔄' },
};
