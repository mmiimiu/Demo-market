'use client';

import React, { useEffect } from 'react';
import { TenantDashboard } from '@/components/tenant';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { SubPageHeader, Navbar } from '@/components/layout';

export default function TenantDashboardPage() {
  const { lang } = useApp();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A56DB]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      <Navbar scrolled={true} portal="tenant" />
      <div className="pt-[80px] lg:pt-[100px]">
        <TenantDashboard lang={lang} />
      </div>
    </div>
  );
}
