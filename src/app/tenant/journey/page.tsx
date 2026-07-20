'use client';

import React, { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { SubPageHeader } from '@/components/layout';
import { RentalJourneyTracker } from '@/components/tenant/RentalJourneyTracker';

export default function TenantJourneyPage() {
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
        title={lang === 'th' ? 'ติดตามการเช่า (Rental Journey)' : lang === 'cn' ? '租房进程' : 'Rental Journey'}
        maxWidthClass="max-w-4xl"
      />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <RentalJourneyTracker lang={lang} onClose={() => router.push('/tenant/dashboard')} />
      </div>
    </div>
  );
}
