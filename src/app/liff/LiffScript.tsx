'use client';

import Script from 'next/script';

/**
 * LiffScript - Injects LIFF SDK and viewport settings for LIFF pages
 */
export function LiffScript() {
  return (
    <>
      <Script
        src="https://static.line-scdn.net/liff/edge/2/sdk.js"
        strategy="afterInteractive"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    </>
  );
}
