'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ContractManager } from '@/components/shared/ContractManager';
import { useApp } from '@/contexts/AppContext';
import { SubPageHeader } from '@/components/layout';

export default function ContractPage() {
  const params = useParams();
  const { lang } = useApp();
  const contractId = typeof params?.id === 'string' ? params.id : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <SubPageHeader 
        backHref="/owner/dashboard" 
        title={lang === 'th' ? 'จัดการสัญญาเช่า' : 'Manage Contract'} 
        maxWidthClass="max-w-6xl"
      />
      <div className="max-w-6xl mx-auto">
        {contractId ? (
          <ContractManager contractId={contractId} lang={lang} />
        ) : (
          <div className="text-center py-20 font-bold text-gray-400">
            {lang === 'th' ? 'ไม่พบรหัสสัญญาเช่า' : 'Contract ID not found'}
          </div>
        )}
      </div>
    </div>
  );
}
