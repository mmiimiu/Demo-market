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
    <div className="flex h-[calc(100vh-80px)] lg:h-[calc(100vh-100px)] bg-gray-50 overflow-hidden pt-4 lg:pt-0">
      <OwnerSidebar activeTab={activeTab as any} setActiveTab={setActiveTab as any} isThai={isThai} isChinese={isChinese} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-[1600px] mx-auto">
          {/* Top Alert Banner */}
          <div className="mb-6 bg-white border border-gray-100 border-l-4 border-l-[#E51D53] rounded-2xl p-4 flex items-start gap-3 shadow-sm shadow-gray-200/50">
            <span className="text-xl">👋</span>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{isThai ? 'ยินดีต้อนรับกลับมาครับ Owner!' : 'Welcome back, Owner!'}</h3>
              <p className="text-xs text-gray-600 mt-1">{isThai ? 'พรุ่งนี้มีนัดหมายผู้เช่าเข้ามาดูห้องเวลา 10:00 น.' : 'You have a tenant viewing appointment tomorrow at 10:00 AM.'}</p>
            </div>
          </div>

          <OwnerDashboardHeader lang={lang} onCreateClick={() => handleCreateListingClick()} />
 
        <LeaseRenewalAlert lang={lang} />
        <ArrearsWarningAlert lang={lang} />

        {/* Dashboard Widgets specific to 'properties' tab or general view */}
        {activeTab === 'properties' && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <OwnerKpis lang={lang} propertiesCount={displayProperties.length} />
                <OwnerRevenueChart lang={lang} />
              </div>
              <div className="xl:col-span-1 space-y-6">
                <RecentInquiries lang={lang} />
                <OwnerNotificationCards 
                  expiringCount={2} 
                  overdueCount={0} 
                  totalUnits={displayProperties.length} 
                  isThai={isThai} 
                  isChinese={isChinese} 
                />
              </div>
            </div>
          </>
        )}

        {/* Render Agent Matching */}
        {activeTab === 'matching' && (
          <AgentMatching lang={lang} />
        )}

        {/* Render Tab Content based on selection */}
        <div className={activeTab === 'properties' ? 'mt-8' : ''}>
          <OwnerDashboardContent
            activeTab={activeTab}
            lang={lang}
            properties={displayProperties}
            loading={displayLoading}
            onRenew={handleRenewListing}
            onDelete={handleDeleteListing}
            onEdit={handleEditListing}
            onCreateClick={() => handleCreateListingClick()}
            onBoost={handleBoostListing}
            onPin={handlePinListing}
          />
        </div>

        <OwnerDashboardModals
          lang={lang}
          isPostListingOpen={isPostListingOpen}
          editingProperty={editingProperty}
          onClose={() => { setIsPostListingOpen(false); setEditingProperty(null); }}
        />
        </div>
      </div>
    </div>
  );
}
