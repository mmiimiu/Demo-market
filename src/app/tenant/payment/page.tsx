import React, { Suspense } from 'react';
import { TenantPayment } from '@/components/tenant';

export default function TenantPaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading payment...</div>}>
      <TenantPayment />
    </Suspense>
  );
}
