import type { CreditTransaction } from '@/lib/credit';

export const STORAGE_KEY_BALANCE = 'primerent_credit_balance';
export const STORAGE_KEY_TXS = 'primerent_credit_txs';
export const DEFAULT_BALANCE = 0;

export function loadBalance(): number {
  if (typeof window === 'undefined') return DEFAULT_BALANCE;
  const stored = localStorage.getItem(STORAGE_KEY_BALANCE);
  return stored ? parseInt(stored, 10) : DEFAULT_BALANCE;
}

export function loadTransactions(): CreditTransaction[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY_TXS);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as any[];
    return parsed.map((tx) => ({
      ...tx,
      createdAt: new Date(tx.createdAt),
    }));
  } catch {
    return [];
  }
}

export function saveBalance(balance: number): void {
  localStorage.setItem(STORAGE_KEY_BALANCE, String(balance));
}

export function saveTransactions(txs: CreditTransaction[]): void {
  localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(txs));
}

export function generateTxId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
