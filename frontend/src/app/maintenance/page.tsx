'use client';

import React, { useEffect } from 'react';
import { MaintenanceSystem } from '@/components/shared/MaintenanceSystem';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { SubPageHeader } from '@/components/layout';

export default function MaintenancePage() {
  const { lang } = useApp();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A56DB]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" style={{ fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
      <SubPageHeader
        backHref="/tenant/dashboard"
        title={lang === 'th' ? 'แจ้งซ่อมบำรุง' : lang === 'cn' ? '报修申请' : 'Maintenance Requests'}
        maxWidthClass="max-w-4xl"
      />
      <MaintenanceSystem lang={lang} />
    </div>
  );
}
