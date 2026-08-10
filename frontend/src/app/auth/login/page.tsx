"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/?auth=login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">กำลังนำคุณไปที่หน้าเข้าสู่ระบบ...</p>
      </div>
    </div>
  );
}
