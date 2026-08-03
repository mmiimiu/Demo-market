'use client';

import React from 'react';
import { Search, ChevronRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Language, UserRole } from '@/lib/types';

interface MobileDrawerProps {
  lang: Language;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  navbarSearchQuery: string;
  setNavbarSearchQuery: (query: string) => void;
  t: any;
  user: any;
  userRole: UserRole | null;
  handleNavbarSearch: (e: React.FormEvent) => void;
  handleLogoOrHomeClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  handlePostListingClick: () => void;
  onOpenOwnerDashboard?: () => void;
  onOpenAgentDashboard?: () => void;
  onOpenOwnerFinder?: () => void;
  onOpenSupport?: () => void;
  onOpenRentalJourney?: () => void;
  handleSignOut: () => void;
  setAuthTab: (tab: 'login' | 'register') => void;
  setAuthOpen: (open: boolean) => void;
  router: any;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  lang,
  setMobileMenuOpen,
  navbarSearchQuery,
  setNavbarSearchQuery,
  t,
  user,
  userRole,
  handleNavbarSearch,
  handleLogoOrHomeClick,
  handlePostListingClick,
  onOpenOwnerDashboard,
  onOpenAgentDashboard,
  onOpenOwnerFinder,
  onOpenSupport,
  onOpenRentalJourney,
  handleSignOut,
  setAuthTab,
  setAuthOpen,
  router,
}) => {
  return (
    <SheetContent side="right" className={cn(
      "w-full sm:max-w-sm p-0 border-none shadow-2xl flex flex-col",
      lang === 'th' ? "font-thai" : lang === 'cn' ? "font-chinese" : "font-english"
    )}>
      <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
      {/* Drawer Header */}
      <div className="p-6 bg-gradient-to-br from-[#1A56DB] to-[#0EA5E9] text-white text-left relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 blur-[60px] -mr-16 -mt-16" />
        <h3 className="text-lg font-black tracking-tight relative z-10">PrimeRent</h3>
        <p className="text-[10px] font-medium text-white/70 mt-1 relative z-10">
          {lang === 'en' ? 'Premium Rental Service' : lang === 'cn' ? '高端租房服务平台' : 'แพลตฟอร์มเช่าพักระดับพรีเมียม'}
        </p>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Dynamic search bar inside mobile side drawer */}
        <form onSubmit={(e) => { handleNavbarSearch(e); setMobileMenuOpen(false); }} className="flex gap-2 bg-gray-50 border border-gray-100 rounded-2xl p-1.5">
          <input
            type="text"
            value={navbarSearchQuery}
            onChange={(e) => setNavbarSearchQuery(e.target.value)}
            placeholder={t.search_placeholder || "📍 ค้นหาทำเล/ย่าน/ถนน..."}
            className="flex-1 bg-transparent outline-none border-none text-xs font-semibold text-gray-700 placeholder-gray-400 pl-3.5"
          />
          <button type="submit" className="p-2 rounded-xl bg-primary text-white"><Search className="w-3.5 h-3.5" /></button>
        </form>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.quick_links || "ลิงก์ด่วน"}</h4>
          <div className="grid grid-cols-1 gap-2">
            <Link 
              href="/"
              onClick={(e) => { handleLogoOrHomeClick(e); setMobileMenuOpen(false); }}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary/5 group transition-all"
            >
              <span className="font-bold text-xs text-gray-700 group-hover:text-primary">{t.home || "หน้าแรก"}</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all" />
            </Link>

            <Link 
              href="/listings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary/5 group transition-all"
            >
              <span className="font-bold text-xs text-gray-700 group-hover:text-primary">{t.nav_rent_stay || "ค้นหาที่พัก"}</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all" />
            </Link>

            <button 
              onClick={() => { handlePostListingClick(); setMobileMenuOpen(false); }} 
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary/5 group transition-all text-left"
            >
              <span className="font-bold text-xs text-gray-700 group-hover:text-primary">{t.post || "ลงประกาศที่พัก"}</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all" />
            </button>

            {userRole === 'renter' && (
              <>
                <button 
                  onClick={() => { router.push("/tenant/dashboard"); setMobileMenuOpen(false); }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary/5 group transition-all text-left"
                >
                  <span className="font-bold text-xs text-gray-700 group-hover:text-primary">{lang === 'en' ? 'My Space' : lang === 'cn' ? '租客中心' : 'แดชบอร์ด'}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all" />
                </button>
              </>
            )}

            {userRole === 'landlord' && (
              <button 
                onClick={() => { onOpenOwnerDashboard ? onOpenOwnerDashboard() : router.push("/owner/dashboard"); setMobileMenuOpen(false); }}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary/5 group transition-all text-left"
              >
                <span className="font-bold text-xs text-gray-700 group-hover:text-primary">{t.nav_owner_dashboard || "จัดการที่พัก"}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all" />
              </button>
            )}

            {userRole === 'agent' && (
              <>
                <button 
                  onClick={() => { onOpenAgentDashboard ? onOpenAgentDashboard() : router.push("/agent/dashboard"); setMobileMenuOpen(false); }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary/5 group transition-all text-left"
                >
                  <span className="font-bold text-xs text-gray-700 group-hover:text-primary">{t.nav_agent_dashboard || "สถิติ Agent"}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all" />
                </button>
                <button 
                  onClick={() => { onOpenOwnerFinder ? onOpenOwnerFinder() : router.push("/renter-matching"); setMobileMenuOpen(false); }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary/5 group transition-all text-left"
                >
                  <span className="font-bold text-xs text-gray-700 group-hover:text-primary">{t.nav_find_owner || "หาห้องจากเจ้าของ"}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all" />
                </button>
              </>
            )}

            {(userRole === 'renter' || !userRole) && user && (
              <>
                <button 
                  onClick={() => { router.push("/tenant/dashboard"); setMobileMenuOpen(false); }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary/5 group transition-all text-left"
                >
                  <span className="font-bold text-xs text-gray-700 group-hover:text-primary">{lang === 'en' ? 'My Space' : lang === 'cn' ? '租客中心' : 'แดชบอร์ด'}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all" />
                </button>
              </>
            )}

            {user && (
              <>
                <button 
                  onClick={() => { router.push("/profile"); setMobileMenuOpen(false); }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary/5 group transition-all text-left"
                >
                  <span className="font-bold text-xs text-gray-700 group-hover:text-primary">{t.profile || "โปรไฟล์ของฉัน"}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all" />
                </button>
                <Link 
                  href="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary/5 group transition-all"
                >
                  <span className="font-bold text-xs text-gray-700 group-hover:text-primary">{t.chat || "ข้อความแชท"}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all" />
                </Link>
                <button 
                  onClick={() => { onOpenSupport ? onOpenSupport() : router.push("/support"); setMobileMenuOpen(false); }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-primary/5 group transition-all text-left"
                >
                  <span className="font-bold text-xs text-gray-700 group-hover:text-primary">{t.support || "ช่วยเหลือ/แจ้งปัญหา"}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-6 border-t border-gray-100 shrink-0 bg-gray-50/50">
        {!user ? (
          <Button 
            onClick={() => { setAuthTab('login'); setAuthOpen(true); setMobileMenuOpen(false); }} 
            className="w-full h-11 rounded-xl bg-primary hover:bg-blue-700 font-bold text-sm shadow-md"
          >
            {t.login || "เข้าสู่ระบบ / สมัครสมาชิก"}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} 
            className="w-full h-11 rounded-xl border-gray-200 text-destructive hover:bg-destructive/5 font-bold text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" /> {t.logout || "ออกจากระบบ"}
          </Button>
        )}
      </div>
    </SheetContent>
  );
};
