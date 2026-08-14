"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { translations } from '@/lib/translations';
import { useUser } from '@/firebase';
import type { Property } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ModuleModal } from '../../shared/ModuleModal';
import { ListingForm } from '../../listings/ListingForm';
import { useCredit } from '@/hooks/useCredit';
import { CREDIT_COSTS } from '@/lib/credit';
import { Badge } from '@/components/ui/badge';

import { OwnerKpis } from './OwnerKpis';
import { OwnerListings } from './OwnerListings';
import { AgentMatching } from './AgentMatching';
import { OwnerMaintenance } from './OwnerMaintenance';
import { RevenueInsights } from './RevenueInsights';
import { OwnerTenantsBilling } from './OwnerTenantsBilling';
import { OwnerReports } from './OwnerReports';
import { OwnerRevenueChart } from './OwnerRevenueChart';
import { RecentInquiries } from './RecentInquiries';
import { LeaseRenewalAlert } from '@/components/shared/LeaseRenewalAlert';
import { ArrearsWarningAlert } from '@/components/shared/ArrearsWarningAlert';
import { TenantScreening } from '@/components/shared/TenantScreening';
import { OwnerNotificationCards } from './OwnerNotificationCards';
import { OwnerNotificationsTab } from './OwnerNotificationsTab';
import { PropertyValuationTool } from '@/components/shared/PropertyValuationTool';
import { useOwnerDashboardHandlers } from './handlers';
import { OwnerSidebar } from './OwnerSidebar';
import { OwnerDashboardHeader } from './OwnerDashboardHeader';
import { OwnerDashboardContent } from './OwnerDashboardContent';
import { OwnerDashboardModals } from './OwnerDashboardModals';
import { useOwnerDashboard } from './hooks/useOwnerDashboard';
import { TabContracts } from '@/components/contract/ContractSystem/TabContracts';
import { OwnerAgentMatchingSystem } from '@/components/agent/OwnerAgentMatchingSystem';

export function OwnerDashboard({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const t = translations[lang] || translations.th;
  const isThai = lang === 'th';
  const isChinese = lang === 'cn';
  const { user } = useUser();
  const { creditBalance, spend } = useCredit();

  const {
    activeTab, setActiveTab,
    editingProperty, setEditingProperty,
    isPostListingOpen, setIsPostListingOpen,
    contracts, setContracts,
    localProperties, setLocalProperties,
    displayProperties, displayLoading,
    db
  } = useOwnerDashboard();

  const {
    handleCreateListingClick,
    handleRenewListing,
    handleBoostListing,
    handlePinListing,
    handleDeleteListing,
    handleEditListing,
  } = useOwnerDashboardHandlers({
    user,
    db,
    creditBalance,
    spend,
    localProperties,
    setLocalProperties,
    setIsPostListingOpen,
    setEditingProperty,
    isThai,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Top Alert Banner */}
        <div className="bg-white border border-gray-100 border-l-4 border-l-[#E51D53] rounded-2xl p-4 flex items-start gap-3 shadow-sm shadow-gray-200/50">
          <span className="text-xl">👋</span>
          <div>
            <h3 className="text-sm font-bold text-gray-900">{isThai ? 'ยินดีต้อนรับกลับมาครับ Owner!' : 'Welcome back, Owner!'}</h3>
            <p className="text-xs text-gray-600 mt-1">{isThai ? 'พรุ่งนี้มีนัดหมายผู้เช่าเข้ามาดูห้องเวลา 10:00 น.' : 'You have a tenant viewing appointment tomorrow at 10:00 AM.'}</p>
          </div>
        </div>

        <OwnerDashboardHeader lang={lang} onCreateClick={() => handleCreateListingClick()} />

        <LeaseRenewalAlert lang={lang} />
        <ArrearsWarningAlert lang={lang} />

        {/* Full-width Owner Overview Widgets */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <OwnerKpis lang={lang} propertiesCount={displayProperties.length} />
            <OwnerRevenueChart lang={lang} />
          </div>
          <div className="xl:col-span-1 space-y-6">
            <RecentInquiries lang={lang} />
            <AgentMatching lang={lang} />
          </div>
        </div>

        {/* Owner Agent Matching System */}
        <div id="matching" className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            🤝 {isThai ? 'เปิดรับนายหน้า & ตัวแทน (Owner Agent Matching)' : 'Agent Matching (Open Listings)'}
          </h3>
          <OwnerAgentMatchingSystem lang={lang} />
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            📜 {isThai ? 'สัญญาเช่าดิจิทัล & แบบร่างสัญญา Manual' : 'Digital Lease Contracts & Draft Templates'}
          </h3>
          <TabContracts userRole="owner" />
        </div>
      </div>

      <OwnerDashboardModals
        lang={lang}
        isPostListingOpen={isPostListingOpen}
        editingProperty={editingProperty}
        onClose={() => {
          setIsPostListingOpen(false);
          setEditingProperty(null);
        }}
      />
    </div>
  );
}
