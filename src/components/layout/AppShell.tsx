/**
 * AppShell
 * Client-side wrapper that mounts global hooks:
 *   - useTokenRefresh: auto-refresh JWT access token
 *   - use2FAPrompt:    show 2FA banner after first transaction
 *
 * Added inside layout.tsx without touching the Server Component export.
 */

'use client';

import React from 'react';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { use2FAPrompt } from '@/hooks/use2FAPrompt';
import { TwoFactorPromptBanner } from '@/components/auth/TwoFactorPromptBanner';

export function AppShell({ children }: { children: React.ReactNode }) {
  // Auto token refresh loop
  useTokenRefresh();

  // 2FA post-transaction prompt
  const { shouldShow2FAPrompt, dismiss2FAPrompt } = use2FAPrompt();

  return (
    <>
      {children}
      {shouldShow2FAPrompt && (
        <TwoFactorPromptBanner onDismiss={dismiss2FAPrompt} />
      )}
    </>
  );
}
