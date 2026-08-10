/**
 * use2FAPrompt
 * Tracks transaction count and shows a 2FA suggestion banner
 * after the user's first transaction if 2FA is not yet enabled.
 *
 * localStorage keys:
 *   - primerent_tx_count       : number of completed transactions
 *   - primerent_2fa_active     : boolean string — 2FA enabled
 *   - primerent_2fa_prompted   : boolean string — banner shown once
 *
 * Usage:
 *   const { shouldShow2FAPrompt, recordTransaction, dismiss2FAPrompt } = use2FAPrompt();
 *   // After payment / delete action:
 *   recordTransaction();
 */

'use client';

import { useState, useCallback } from 'react';

const TX_COUNT_KEY      = 'primerent_tx_count';
const TWO_FA_ACTIVE_KEY = 'primerent_2fa_active';
const PROMPTED_KEY      = 'primerent_2fa_prompted';

export function use2FAPrompt() {
  const [shouldShow2FAPrompt, setShouldShow2FAPrompt] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const is2FAOn    = localStorage.getItem(TWO_FA_ACTIVE_KEY) === 'true';
    const isPrompted = localStorage.getItem(PROMPTED_KEY) === 'true';
    const txCount    = parseInt(localStorage.getItem(TX_COUNT_KEY) ?? '0', 10);
    // Show if: 2FA off AND not yet prompted AND at least 1 transaction done
    return !is2FAOn && !isPrompted && txCount >= 1;
  });

  /** Call after every sensitive action (payment, revoke, delete) */
  const recordTransaction = useCallback(() => {
    const current = parseInt(localStorage.getItem(TX_COUNT_KEY) ?? '0', 10);
    const next    = current + 1;
    localStorage.setItem(TX_COUNT_KEY, String(next));

    const is2FAOn    = localStorage.getItem(TWO_FA_ACTIVE_KEY) === 'true';
    const isPrompted = localStorage.getItem(PROMPTED_KEY) === 'true';

    if (!is2FAOn && !isPrompted && next >= 1) {
      setShouldShow2FAPrompt(true);
    }
  }, []);

  /** User dismissed the banner — don't show again */
  const dismiss2FAPrompt = useCallback(() => {
    localStorage.setItem(PROMPTED_KEY, 'true');
    setShouldShow2FAPrompt(false);
  }, []);

  /** Re-check when 2FA status changes externally */
  const recheckPrompt = useCallback(() => {
    const is2FAOn    = localStorage.getItem(TWO_FA_ACTIVE_KEY) === 'true';
    const isPrompted = localStorage.getItem(PROMPTED_KEY) === 'true';
    const txCount    = parseInt(localStorage.getItem(TX_COUNT_KEY) ?? '0', 10);
    setShouldShow2FAPrompt(!is2FAOn && !isPrompted && txCount >= 1);
  }, []);

  return {
    shouldShow2FAPrompt,
    recordTransaction,
    dismiss2FAPrompt,
    recheckPrompt,
  };
}
