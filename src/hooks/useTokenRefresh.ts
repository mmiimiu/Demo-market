/**
 * useTokenRefresh
 * Auto-refresh access token every 12 minutes (before 15-min expiry).
 * Reads/writes tokens from localStorage:
 *   - primerent_access_token
 *   - primerent_refresh_token
 * On failure → clears session and redirects to login.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ACCESS_TOKEN_KEY  = 'primerent_access_token';
const REFRESH_TOKEN_KEY = 'primerent_refresh_token';
const REFRESH_INTERVAL  = 12 * 60 * 1000; // 12 minutes in ms

export function useTokenRefresh() {
  const router   = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doRefresh = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return; // not logged in — nothing to do

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        // Persist new tokens
        if (data.access_token)  localStorage.setItem(ACCESS_TOKEN_KEY,  data.access_token);
        if (data.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        console.info('[TokenRefresh] Tokens refreshed successfully.');
      } else {
        // Refresh token expired / invalid → force logout
        console.warn('[TokenRefresh] Refresh failed — logging out.');
        clearTokens();
        router.push('/?auth=login&reason=session_expired');
      }
    } catch (err) {
      console.error('[TokenRefresh] Network error during refresh:', err);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('prime_mock_user');
    localStorage.removeItem('primerent_user_role');
  };

  useEffect(() => {
    // Run once immediately on mount (re-hydrate session)
    doRefresh();

    // Then schedule every REFRESH_INTERVAL
    timerRef.current = setInterval(doRefresh, REFRESH_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
