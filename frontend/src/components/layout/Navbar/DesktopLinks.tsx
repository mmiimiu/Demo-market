import React from 'react';
import Link from 'next/link';
import { PlusCircle, LayoutGrid, Building2, Warehouse, MessageCircle, ChevronDown, Home, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MegaMenu } from './MegaMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DesktopLinksProps {
  isSolid: boolean;
  user: any;
  userRole: string | null;
  lang: 'th' | 'en' | 'cn';
  t: any;
  megaMenuOpen: boolean;
  openMegaMenu: () => void;
  closeMegaMenu: () => void;
  setMegaMenuOpen: (open: boolean) => void;
  onOpenOwnerDashboard?: () => void;
  onOpenAgentDashboard?: () => void;
  onOpenRentalJourney?: () => void;
  handleLogoOrHomeClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  handlePostListingClick: () => void;
  formatPrice: (price: number) => string;
  router: any;
}

const navLink = (isSolid: boolean, extra = '') =>
  cn(
    "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 group",
    isSolid
      ? "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
      : "text-white/80 hover:text-white hover:bg-white/10",
    extra
  );

const navIcon = "w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200";

export const DesktopLinks: React.FC<DesktopLinksProps> = ({
  isSolid, user, userRole, lang, t, megaMenuOpen,
  openMegaMenu, closeMegaMenu, setMegaMenuOpen,
  onOpenOwnerDashboard, onOpenAgentDashboard, onOpenRentalJourney,
  handleLogoOrHomeClick, handlePostListingClick, formatPrice, router,
}) => {
  return (
    <div className="hidden lg:flex items-center justify-center flex-1 px-6">
      <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300">

        <Link
          href="/"
          onClick={handleLogoOrHomeClick}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
            isSolid ? "text-gray-600 hover:bg-blue-50 hover:text-blue-700" : "text-white/80 hover:text-white hover:bg-white/10"
          )}
        >
          {t.home || "หน้าแรก"}
        </Link>

        <MegaMenu
          isSolid={isSolid}
          megaMenuOpen={megaMenuOpen}
          openMegaMenu={openMegaMenu}
          closeMegaMenu={closeMegaMenu}
          setMegaMenuOpen={setMegaMenuOpen}
          t={t}
          formatPrice={formatPrice}
        />

        {userRole === "landlord" && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={navLink(isSolid, "outline-none")}>
                  <Warehouse className={navIcon} />
                  {t.nav_owner_dashboard || "จัดการที่พัก"}
                  <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-all duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 bg-white rounded-2xl p-2 border border-gray-100 shadow-xl shadow-blue-100/20 mt-2 animate-in slide-in-from-top-2 duration-200">
                <DropdownMenuItem
                  onClick={() => onOpenOwnerDashboard ? onOpenOwnerDashboard() : router.push("/owner/dashboard")}
                  className="rounded-xl cursor-pointer p-3 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  {t.nav_owner_dashboard || "จัดการที่พัก"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/liff/sign")}
                  className="rounded-xl cursor-pointer p-3 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  {t.sign_contract_nav || "เซ็นสัญญา (LINE LIFF)"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button onClick={handlePostListingClick} className={navLink(isSolid)}>
              <PlusCircle className={navIcon} />{t.post || "ลงประกาศ"}
            </button>
          </>
        )}

        {userRole === "agent" && (
          <>
            <button
              onClick={() => onOpenAgentDashboard ? onOpenAgentDashboard() : router.push("/agent/dashboard")}
              className={navLink(isSolid)}
            >
              <LayoutGrid className={navIcon} />{t.nav_agent_dashboard || "สถิติ Agent"}
            </button>
            <button onClick={handlePostListingClick} className={navLink(isSolid)}>
              <PlusCircle className={navIcon} />{t.post || "ลงประกาศ"}
            </button>
          </>
        )}

        {userRole === "renter" && (
          <>
            <button onClick={() => router.push('/tenant/dashboard')} className={navLink(isSolid)}>
              <Home className={navIcon} />{lang === 'en' ? 'My Space' : lang === 'cn' ? '租客中心' : 'แดชบอร์ด'}
            </button>
            <Link href="/chat" className={navLink(isSolid)}>
              <MessageCircle className={navIcon} />{t.chat || 'แชท'}
            </Link>
            <button onClick={handlePostListingClick} className={navLink(isSolid)}>
              <PlusCircle className={navIcon} />{t.post || "ลงประกาศ"}
            </button>
          </>
        )}

        {!user && (
          <>
            <a
              href="#how-it-works"
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
                isSolid ? "text-gray-600 hover:bg-blue-50 hover:text-blue-700" : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              {t.how_it_works || "3 ขั้นตอนง่ายๆ"}
            </a>
            <button onClick={handlePostListingClick} className={navLink(isSolid)}>
              <PlusCircle className={navIcon} />{t.post || "ลงประกาศฟรี"}
            </button>
          </>
        )}

        {/* Admin Link — show ONLY for admin userRole */}
        {user && userRole === 'admin' && (
          <>
            <span className={cn("w-px h-5 mx-1 shrink-0", isSolid ? "bg-gray-200" : "bg-white/20")} aria-hidden />
            <Link
              href="/admin"
              className={cn(
                "px-3 py-1.5 text-[10px] font-black rounded-lg transition-all duration-200 flex items-center gap-1.5 border",
                isSolid
                  ? "text-red-600 bg-red-50 border-red-100 hover:bg-red-100"
                  : "text-red-300 bg-red-500/10 border-red-400/20 hover:bg-red-500/20"
              )}
            >
              <Shield className="w-3 h-3" />
              ADMIN
            </Link>
          </>
        )}

        {/* LINE OA Shortcut — show for all logged-in roles EXCEPT admin */}
        {user && userRole !== 'admin' && (
          <>
            <span className={cn("w-px h-5 mx-1 shrink-0", isSolid ? "bg-gray-200" : "bg-white/20")} aria-hidden />
            <Link
              href="/chat/line-oa"
              className="px-3 py-1.5 text-[10px] font-black rounded-lg text-white bg-[#06C755] hover:bg-[#05b34c] shadow-md shadow-green-200/50 transition-all duration-200 flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3 text-white fill-current" />
              LINE OA
            </Link>
          </>
        )}

      </div>
    </div>
  );
};
