'use client';

import React, { useMemo } from 'react';
import { LayoutGrid, Building2, Home, Building, Bed, Palmtree, Box } from 'lucide-react';
import { translations } from '@/lib/translations';
import { useApp } from '@/contexts/AppContext';
import { Navbar } from './layout';
import { PropertyModal } from './PropertyModal';
import { ModuleModal } from './ModuleModal';
import { ListingForm } from './ListingForm';
import { AgentDashboard } from './agent';
import { AgentOwnerFinder } from './AgentOwnerFinder';
import { OwnerDashboard } from './owner';
import { UserProfile } from './profile';
import { SupportSystem } from './SupportSystem';
import { RentalJourneyTracker } from './tenant/RentalJourneyTracker';
import { WebChat } from './WebChat';
import { MobileBottomNav } from './MobileBottomNav';
import { CompareDrawer } from './shared/CompareDrawer';

import { ListingsSection } from './PrimeRentApp/ListingsSection';
import { usePrimeRentState } from './PrimeRentApp/usePrimeRentState';

export default function PrimeRentApp() {
  const { lang, setLang, currency, setCurrency, chatState, closeChat, openChat, workLocation, setWorkLocation, commuteMode, setCommuteMode } = useApp();
  const t = translations[lang] || translations.th;

  const [isMaintenance, setIsMaintenance] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mode = localStorage.getItem('primerent_maintenance_mode') === 'true';
      const currentRole = localStorage.getItem('primerent_user_role') || 'renter';
      const isAdmin = currentRole === 'admin' || currentRole === 'superadmin' || currentRole === 'sa';
      setIsMaintenance(mode && !isAdmin);
    }
  }, []);

  const CATEGORIES = useMemo(() => [
    { id: 'all', label: t.all, icon: LayoutGrid, type: 'all' },
    { id: 'condo', label: t.cat_condo, icon: Building2, type: 'condo' },
    { id: 'house', label: t.cat_house, icon: Home, type: 'house' },
    { id: 'apartment', label: t.cat_apartment, icon: Building, type: 'apartment' },
    { id: 'dorm', label: t.cat_dorm, icon: Bed, type: 'apartment', extra: 'dorm' },
    { id: 'villa', label: t.cat_villa, icon: Palmtree, type: 'house', extra: 'villa' },
    { id: 'studio', label: t.cat_studio, icon: Box, type: 'all', extra: 'studio' },
  ], [t]);

  const state = usePrimeRentState(CATEGORIES);
  const symbol = { THB: '฿', USD: '$', CNY: '¥' }[currency] || '฿';
  const rates = { THB: 1, USD: 0.028, CNY: 0.20 };
  const convert = (val: number) => Math.round(val * rates[currency]);

  if (isMaintenance) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center flex-col p-6 font-thai">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight">{lang === 'th' ? '🔧 ขออภัยด้วยครับ ปิดปรับปรุงระบบชั่วคราว' : '🔧 Under Scheduled Maintenance'}</h1>
            <p className="text-sm text-slate-400 font-bold leading-relaxed">
              {lang === 'th'
                ? 'PrimeRent กำลังรัน Script อัปเดตและสำรองฐานข้อมูลส่วนกลางเพื่อความเสถียรสูงสุด คาดว่าจะเปิดให้บริการอีกครั้งในเร็วๆ นี้'
                : 'PrimeRent is currently updating servers and backing up transaction pools. We will be back online shortly.'}
            </p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-500 text-left space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live status:</p>
            <p>• HTTP: 503 Service Unavailable</p>
            <p>• DB status: MIGRATE_PENDING</p>
          </div>
          <p className="text-[10px] text-slate-500 font-bold">© 2026 PrimeRent Platform Co., Ltd.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen antialiased bg-[#F8FAFC] w-full max-w-full ${lang === 'th' ? 'font-thai' : lang === 'cn' ? 'font-chinese' : 'font-english'}`}>
      <Navbar
        scrolled={state.scrolled}
        onOpenPostListing={() => state.openModal('postListing')}
        onOpenAgentDashboard={() => state.openModal('agentDashboard')}
        onOpenOwnerFinder={() => state.openModal('ownerFinder')}
        onOpenOwnerDashboard={() => state.openModal('ownerDashboard')}
        onOpenProfile={() => state.openModal('profile')}
        onOpenSupport={() => state.openModal('support')}
        onOpenRentalJourney={() => state.openModal('rentalJourney')}
      />

      <div className="pt-24 lg:pt-28">
        <ListingsSection
          lang={lang} currency={currency} t={t}
          filteredProperties={state.filteredProperties}
          filterState={state.filterState} activeCategoryIds={state.activeCategoryIds}
        savedIds={state.savedIds} CATEGORIES={CATEGORIES} workLocation={workLocation}
        onResetFilters={state.resetFilters}
        onCategoryClick={state.handleCategoryClick}
        onRemoveAmenity={(a) => state.setFilterState(prev => ({ ...prev, amenities: prev.amenities.filter(x => x !== a) }))}
        onSortChange={(sort) => state.setFilterState(prev => ({ ...prev, sort }))}
        onViewDetails={state.setSelectedProperty}
        onToggleSave={state.toggleSave}
        onQuickChat={(prop) => openChat({ id: prop.id as number, name: lang === 'en' ? prop.nameEn : lang === 'cn' ? prop.nameCn : prop.name }, 'renter')}
        onCompare={(prop) => state.comparison.isInCompare(prop.id) ? state.comparison.removeFromCompare(prop.id) : state.comparison.addToCompare(prop)}
        isInCompare={(id) => state.comparison.isInCompare(id)}
        canCompare={state.comparison.canAdd}
        onFilterChange={(updates) => state.setFilterState(prev => ({ ...prev, ...updates }))}
        />
      </div>

      {/* Modals */}
      <ModuleModal isOpen={state.modals.postListing} onClose={() => state.closeModal('postListing')} lang={lang} title={t.post}><ListingForm lang={lang} /></ModuleModal>
      <ModuleModal isOpen={state.modals.agentDashboard} onClose={() => state.closeModal('agentDashboard')} lang={lang} title={t.nav_agent_dashboard}><AgentDashboard lang={lang} /></ModuleModal>
      <ModuleModal isOpen={state.modals.ownerFinder} onClose={() => state.closeModal('ownerFinder')} lang={lang} title={t.nav_find_owner}><AgentOwnerFinder lang={lang} /></ModuleModal>
      <ModuleModal isOpen={state.modals.ownerDashboard} onClose={() => state.closeModal('ownerDashboard')} lang={lang} title={t.nav_owner_dashboard}><OwnerDashboard lang={lang} /></ModuleModal>
      <ModuleModal isOpen={state.modals.profile} onClose={() => state.closeModal('profile')} lang={lang} title={t.profile || 'โปรไฟล์ของฉัน'} maxWidth="max-w-6xl"><UserProfile lang={lang} /></ModuleModal>
      <ModuleModal isOpen={state.modals.support} onClose={() => state.closeModal('support')} lang={lang} title={t.support} maxWidth="max-w-4xl"><SupportSystem lang={lang} /></ModuleModal>
      <ModuleModal isOpen={state.modals.rentalJourney} onClose={() => state.closeModal('rentalJourney')} lang={lang} title={lang === 'en' ? 'Rental Journey' : lang === 'cn' ? '租房进程' : 'ติดตามการเช่า'} maxWidth="max-w-4xl">
        <RentalJourneyTracker lang={lang} onClose={() => state.closeModal('rentalJourney')} />
      </ModuleModal>
      <PropertyModal property={state.selectedProperty} onClose={() => state.setSelectedProperty(null)} lang={lang} currency={currency} isSaved={state.selectedProperty ? state.savedIds.includes(state.selectedProperty.id as number) : false} onToggleSave={state.toggleSave} workLocation={workLocation} />

      {chatState.isOpen && (
        <WebChat
          property={chatState.property}
          agent={{ id: 'agent-1', name: 'PrimeRent Agent' }}
          isOpen={chatState.isOpen}
          onClose={closeChat}
          lang={lang}
          currentUserRole={chatState.role}
          chatPartnerName={chatState.partnerName}
        />
      )}

      <CompareDrawer
        properties={state.comparison.compareList}
        onRemove={state.comparison.removeFromCompare}
        onClear={state.comparison.clearCompare}
        onClose={state.comparison.closeDrawer}
        isOpen={state.comparison.isDrawerOpen}
        lang={lang}
        currency={currency}
        workLocation={workLocation}
        onViewDetails={state.setSelectedProperty}
      />

      <MobileBottomNav activeTab={state.mobileTab} onTabChange={state.setMobileTab} onOpenPostListing={() => state.openModal('postListing')} onOpenProfile={() => state.openModal('profile')} scrollToListings={state.scrollToListings} />
    </div>
  );
}
