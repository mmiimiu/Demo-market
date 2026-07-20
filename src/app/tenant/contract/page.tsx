'use client';

import React, { Suspense } from 'react';
import { ContractManager } from '@/components/shared/ContractManager';
import { useSearchParams } from 'next/navigation';

function ContractContent() {
  const searchParams = useSearchParams();
  const contractId = searchParams.get('contractId') || 'demo-001';

  return (
    <ContractManager 
      contractId={contractId} 
      lang="th" 
      forceRole="tenant"
    />
  );
}

export default function ContractPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-gray-500">กำลังโหลดสัญญา...</div>}>
          <ContractContent />
        </Suspense>
      </div>
    </div>
  );
}
