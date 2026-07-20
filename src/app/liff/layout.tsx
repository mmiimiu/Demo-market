"use client";

import React from 'react';
import { LiffScript } from './LiffScript';

// This layout enforces a simple, mobile-first constraint for all LIFF views.
// It removes any desktop navigation headers since LIFF runs inside a mobile frame.
export default function LiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LiffScript />
      <div className="min-h-screen bg-slate-50 font-sans max-w-md mx-auto relative shadow-xl overflow-hidden">
        {children}
      </div>
    </>
  );
}
