/**
 * TwoFactorPromptBanner
 * A dismissible banner shown after the user's first transaction when 2FA is off.
 * Links directly to Profile > Security tab.
 */

'use client';

import React from 'react';
import { ShieldCheck, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TwoFactorPromptBannerProps {
  onDismiss: () => void;
}

export function TwoFactorPromptBanner({ onDismiss }: TwoFactorPromptBannerProps) {
  const router = useRouter();

  const goToSecurity = () => {
    onDismiss();
    router.push('/profile?tab=security');
  };

  return (
    <div
      id="2fa-prompt-banner"
      role="alert"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100vw-2rem)] max-w-lg
                 bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                 rounded-2xl shadow-2xl shadow-blue-900/30
                 px-5 py-4 flex items-center gap-4
                 animate-in slide-in-from-bottom-4 fade-in duration-400"
    >
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
        <ShieldCheck className="w-5 h-5 text-white" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black leading-tight">
          🔐 เพิ่มความปลอดภัย — เปิดใช้ 2FA ได้แล้ว!
        </p>
        <p className="text-[11px] text-blue-100 font-medium mt-0.5 leading-relaxed">
          คุณเพิ่งทำธุรกรรมเรียบร้อย เปิด 2FA (Google Authenticator หรือ Email OTP) เพื่อป้องกันบัญชีของคุณฟรี
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={goToSecurity}
        className="shrink-0 flex items-center gap-1 bg-white text-blue-600 text-xs font-black
                   px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap"
      >
        ตั้งค่าเลย
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        aria-label="ปิดแจ้งเตือน"
        className="shrink-0 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}
