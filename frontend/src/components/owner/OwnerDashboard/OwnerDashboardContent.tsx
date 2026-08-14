import React from 'react';
import { OwnerListings } from './OwnerListings';
import { OwnerMaintenance } from './OwnerMaintenance';
import { RevenueInsights } from './RevenueInsights';
import { OwnerTenantsBilling } from './OwnerTenantsBilling';
import { OwnerReports } from './OwnerReports';
import { TenantScreening } from '@/components/shared/TenantScreening';
import { PropertyValuationTool } from '@/components/shared/PropertyValuationTool';
import { OwnerNotificationsTab } from './OwnerNotificationsTab';
import { OwnerPropertiesTab } from './OwnerPropertiesTab';
import { TabContracts } from '@/components/contract/ContractSystem/TabContracts';
import { OwnerAgentMatchingSystem } from '@/components/agent/OwnerAgentMatchingSystem';

interface OwnerDashboardContentProps {
  activeTab: string;
  lang: 'th' | 'en' | 'cn';
  properties: any[];
  loading: boolean;
  onRenew: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (prop: any) => void;
  onCreateClick: () => void;
  onBoost: (id: string) => void;
  onPin: (id: string) => void;
}

export function OwnerDashboardContent({
  activeTab,
  lang,
  properties,
  loading,
  onRenew,
  onDelete,
  onEdit,
  onCreateClick,
  onBoost,
  onPin,
}: OwnerDashboardContentProps) {
  if (activeTab === 'properties') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <OwnerListings
          lang={lang}
          properties={properties}
          loading={loading}
          onRenew={onRenew}
          onDelete={onDelete}
          onEdit={onEdit}
          onCreateClick={onCreateClick}
          onBoost={onBoost}
          onPin={onPin}
        />
        <div className="space-y-10">
          <OwnerMaintenance lang={lang} />
          <RevenueInsights lang={lang} />
        </div>
      </div>
    );
  }

  if (activeTab === 'contracts') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <TabContracts userRole="owner" />
      </div>
    );
  }

  if (activeTab === 'analytics') {
    return (
      <div className="space-y-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <OwnerReports lang={lang} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-3xl mx-auto">
          <PropertyValuationTool lang={lang} />
        </div>
      </div>
    );
  }

  if (activeTab === 'screening') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-3xl mx-auto">
        <TenantScreening lang={lang} />
      </div>
    );
  }

  if (activeTab === 'ownership') {
    return <OwnerPropertiesTab lang={lang} />;
  }

  if (activeTab === 'matching') {
    return <OwnerAgentMatchingSystem lang={lang} />;
  }

  if (activeTab === 'notifications') {
    const isThai = lang === 'th';
    const isChinese = lang === 'cn';
    return <OwnerNotificationsTab isThai={isThai} isChinese={isChinese} />;
  }

  return <OwnerTenantsBilling lang={lang} tab={activeTab as any} />;
}
