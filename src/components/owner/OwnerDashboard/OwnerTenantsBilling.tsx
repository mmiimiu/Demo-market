'use client';

import React from 'react';
import { OwnerTenantsTab } from './OwnerTenantsTab';
import { OwnerBillingTab } from './OwnerBillingTab';

interface OwnerTenantsBillingProps {
  lang: 'th' | 'en' | 'cn';
  tab: 'tenants' | 'billing';
}

export function OwnerTenantsBilling({ lang, tab }: OwnerTenantsBillingProps) {
  if (tab === 'tenants') {
    return <OwnerTenantsTab lang={lang} />;
  }
  
  return <OwnerBillingTab lang={lang} />;
}
