'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MaintenanceSystem } from '@/components/shared/MaintenanceSystem';

function LiffMaintenanceContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'tenant';

  return (
    <div className="min-h-screen bg-slate-50">
      <MaintenanceSystem lang="th" role={role} />
    </div>
  );
}

export default function LiffMaintenancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">กำลังโหลด...</div>}>
      <LiffMaintenanceContent />
    </Suspense>
  );
}
