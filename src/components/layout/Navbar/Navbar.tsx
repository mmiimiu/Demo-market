'use client';

import React from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { NavbarProps } from './types';
import { formatPrice } from './utils';
import { MiniSearch } from './MiniSearch';
import { UserMenu } from './UserMenu';
import { NavbarFindAgentButton } from './NavbarFindAgentButton';
import { NavbarNotifications } from './NavbarNotifications';
import { MobileDrawer } from './MobileDrawer';
import { Logo } from './Logo';
import { useNavbar } from './useNavbar';
import { DesktopLinks } from './DesktopLinks';

export const Navbar: React.FC<NavbarProps> = ({
  lang: propLang,
  setLang: propSetLang,
  scrolled,
  currency: propCurrency,
  setCurrency: propSetCurrency,
  onOpenPostListing,
  onOpenAgentDashboard,
  onOpenOwnerDashboard,
  onOpenOwnerFinder,
  onOpenProfile,
  onOpenSupport,
  onOpenRentalJourney,
  transparent = false,
  showMiniSearch = true,
  portal
}) => {
  const {
    router, authOpen, setAuthOpen, authTab, setAuthTab,
    navbarSearchQuery, setNavbarSearchQuery, mobileMenuOpen, setMobileMenuOpen,
    megaMenuOpen, setMegaMenuOpen, navbarPriceMin, setNavbarPriceMin,
    navbarPriceMax, setNavbarPriceMax, openMegaMenu, closeMegaMenu,
    lang, setLang, currency, setCurrency, t, user, userRole,
    toggleLang, handleSignOut, handlePostListingClick, handleNavbarSearch, handleLogoOrHomeClick,
    navbarPropertyType, setNavbarPropertyType,
    upgradeAlertOpen, setUpgradeAlertOpen,
  } = useNavbar(propLang, propSetLang, propCurrency, propSetCurrency, onOpenPostListing);

  const isSolid = !transparent || scrolled;

  return (
    <>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
      
      <AlertDialog open={upgradeAlertOpen} onOpenChange={setUpgradeAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{lang === 'en' ? 'Account Upgrade Required' : lang === 'cn' ? '需要升级账户' : 'ต้องอัปเกรดบัญชีก่อน'}</AlertDialogTitle>
            <AlertDialogDescription>
              {lang === 'en' 
                ? 'To post a property listing, you need to upgrade your account to an Owner or Agent.' 
                : lang === 'cn'
                ? '要发布房源，您需要将帐户升级为业主或中介。'
                : 'ในการลงประกาศที่พัก คุณจำเป็นต้องอัปเกรดบัญชีเป็นเจ้าของหรือนายหน้าก่อน'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{lang === 'en' ? 'Cancel' : lang === 'cn' ? '取消' : 'ยกเลิก'}</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/profile?tab=upgrade')}>
              {lang === 'en' ? 'Upgrade Account' : lang === 'cn' ? '升级账户' : 'อัปเกรดบัญชีเลย'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <nav className={cn(
        "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300",
        isSolid 
          ? "bg-white border-b border-gray-200 py-2 sm:py-3.5 px-2 sm:px-8 text-gray-800" 
          : "bg-transparent py-3 sm:py-6 px-2 sm:px-8 text-white"
      )}>
        <div className="flex items-center justify-between w-full max-w-[1600px] mx-auto">
          {/* Left: Logo */}
          <div className="flex-1 flex items-center justify-start shrink-0 pl-5 sm:pl-0">
            <Logo isSolid={isSolid} handleLogoOrHomeClick={handleLogoOrHomeClick} />
          </div>

          {/* Center: Full Search Bar or Desktop Links or Portal Badge */}
          <div className="flex-auto flex justify-center">
            {portal ? (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className={cn(
                  "px-5 py-2 rounded-2xl border font-black text-xs tracking-wide shadow-sm flex items-center gap-2",
                  portal === 'owner' && "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 text-blue-700 shadow-blue-500/5",
                  portal === 'tenant' && "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100 text-emerald-700 shadow-emerald-500/5",
                  portal === 'agent' && "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100 text-amber-700 shadow-amber-500/5",
                  portal === 'admin' && "bg-gradient-to-r from-red-50 to-rose-50 border-red-100 text-red-700 shadow-red-500/5"
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    portal === 'owner' && "bg-blue-600 animate-pulse",
                    portal === 'tenant' && "bg-emerald-600 animate-pulse",
                    portal === 'agent' && "bg-amber-600 animate-pulse",
                    portal === 'admin' && "bg-red-600 animate-pulse"
                  )} />
                  <span>
                    {portal === 'owner' && (lang === 'en' ? 'Owner Portal' : lang === 'cn' ? '业主中心' : 'แดชบอร์ดเจ้าของที่พัก')}
                    {portal === 'tenant' && (lang === 'en' ? 'Tenant Portal' : lang === 'cn' ? '租客中心' : 'แดชบอร์ดผู้เช่า')}
                    {portal === 'agent' && (lang === 'en' ? 'Agent Portal' : lang === 'cn' ? '經紀人中心' : 'แดชบอร์ดเอเจนต์')}
                    {portal === 'admin' && (lang === 'en' ? 'Admin Portal' : lang === 'cn' ? '管理员中心' : 'แดชบอร์ดผู้ดูแลระบบ')}
                  </span>
                </div>
              </div>
            ) : showMiniSearch ? (
              <div className="hidden lg:flex w-full justify-center">
                <MiniSearch
                  navbarSearchQuery={navbarSearchQuery} setNavbarSearchQuery={setNavbarSearchQuery}
                  navbarPriceMin={navbarPriceMin} setNavbarPriceMin={setNavbarPriceMin}
                  navbarPriceMax={navbarPriceMax} setNavbarPriceMax={setNavbarPriceMax}
                  propertyType={navbarPropertyType} setPropertyType={setNavbarPropertyType}
                  t={t} lang={lang} formatPrice={(price) => formatPrice(price, currency)}
                  onSubmit={handleNavbarSearch}
                  isSolid={isSolid}
                />
              </div>
            ) : (
              <DesktopLinks
                isSolid={isSolid}
                user={user}
                userRole={userRole}
                lang={lang}
                t={t}
                megaMenuOpen={megaMenuOpen}
                openMegaMenu={openMegaMenu}
                closeMegaMenu={closeMegaMenu}
                setMegaMenuOpen={setMegaMenuOpen}
                onOpenOwnerDashboard={onOpenOwnerDashboard}
                onOpenAgentDashboard={onOpenAgentDashboard}
                onOpenRentalJourney={onOpenRentalJourney}
                handleLogoOrHomeClick={handleLogoOrHomeClick}
                handlePostListingClick={handlePostListingClick}
                formatPrice={(price) => formatPrice(price, currency)}
                router={router}
              />
            )}
          </div>

          {/* Right: User Menu & Mobile Drawer */}
          <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2 shrink-0">
            {(userRole === 'agent' || userRole === 'owner' || userRole === 'landlord' || portal === 'agent' || portal === 'owner') && (
              <NavbarFindAgentButton isSolid={isSolid} userRole={userRole} portal={portal} lang={lang} />
            )}
            {user && <NavbarNotifications lang={lang} />}
            <UserMenu
              user={user} userRole={userRole} currency={currency} setCurrency={setCurrency}
              lang={lang} toggleLang={toggleLang} t={t} handleSignOut={handleSignOut}
              onOpenProfile={onOpenProfile}
              onOpenSupport={onOpenSupport}
              onOpenRentalJourney={onOpenRentalJourney} isSolid={isSolid}
              setAuthTab={setAuthTab} setAuthOpen={setAuthOpen} router={router}
              handlePostListingClick={handlePostListingClick}
            />

            <div className="flex items-center lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className={cn(
                    "p-1 sm:p-2 rounded-xl transition-all border border-transparent lg:hidden",
                    isSolid ? "text-gray-700 hover:bg-gray-100/80" : "text-white hover:bg-white/10"
                  )}>
                    <Menu className="w-5 h-5 sm:w-5 sm:h-5" />
                  </button>
                </SheetTrigger>
                <MobileDrawer
                  lang={lang} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
                  navbarSearchQuery={navbarSearchQuery} setNavbarSearchQuery={setNavbarSearchQuery}
                  t={t} user={user} userRole={userRole} handleNavbarSearch={handleNavbarSearch}
                  handleLogoOrHomeClick={handleLogoOrHomeClick} handlePostListingClick={handlePostListingClick}
                  onOpenOwnerDashboard={onOpenOwnerDashboard} onOpenAgentDashboard={onOpenAgentDashboard}
                  onOpenOwnerFinder={onOpenOwnerFinder} onOpenProfile={onOpenProfile} onOpenSupport={onOpenSupport}
                  onOpenRentalJourney={onOpenRentalJourney}
                  handleSignOut={handleSignOut} setAuthTab={setAuthTab} setAuthOpen={setAuthOpen} router={router}
                />
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
