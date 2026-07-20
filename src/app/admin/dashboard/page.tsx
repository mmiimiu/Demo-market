'use client';

import React, { Suspense } from 'react';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useApp } from '@/contexts/AppContext';

function AdminDashboardContent() {
  const { lang } = useApp();
  return <AdminPanel lang={lang as any} />;
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
