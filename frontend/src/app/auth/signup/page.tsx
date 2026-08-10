"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/?auth=signup');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">กำลังนำคุณไปที่หน้าสมัครสมาชิก...</p>
      </div>
    </div>
  );
}
