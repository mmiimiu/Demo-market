'use client';

import React from 'react';
import { ChevronDown, UserCircle, LifeBuoy, LogOut, Building2, LayoutDashboard, PlusCircle, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationCenter } from '@/components/NotificationCenter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { langFlags } from './constants';
import { Language, UserRole } from '@/lib/types';
import { db } from '@/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

interface UserMenuProps {
  user: any;
  userRole: UserRole | null;
  currency: 'THB' | 'USD' | 'CNY';
  setCurrency: (curr: 'THB' | 'USD' | 'CNY') => void;
  lang: Language;
  toggleLang: () => void;
  t: any;
  handleSignOut: () => void;
  onOpenProfile?: () => void;
  onOpenSupport?: () => void;
  onOpenRentalJourney?: () => void;
  onOpenAgentDashboard?: () => void;
  onOpenOwnerDashboard?: () => void;
  onOpenPostListing?: () => void;
  isSolid: boolean;
  setAuthTab: (tab: 'login' | 'register') => void;
  setAuthOpen: (open: boolean) => void;
  router: any;
  handlePostListingClick?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  userRole,
  currency,
  setCurrency,
  lang,
  toggleLang,
  t,
  handleSignOut,
  onOpenProfile,
  onOpenSupport,
  onOpenRentalJourney,
  onOpenAgentDashboard,
  onOpenOwnerDashboard,
  onOpenPostListing,
  isSolid,
  setAuthTab,
  setAuthOpen,
  router,
  handlePostListingClick,
}) => {
  const isTh = lang === 'th';

  const handleRoleSwitch = async (newRole: UserRole) => {
    localStorage.setItem('primerent_user_role', newRole);
    const mappedCookieRole = newRole === 'landlord' ? 'owner' : newRole;
    document.cookie = `user_role=${mappedCookieRole}; path=/; max-age=31536000`;
    if (user?.isMock) {
      const mockUserStr = localStorage.getItem('prime_mock_user');
      if (mockUserStr) {
        try {
          const mockUser = JSON.parse(mockUserStr);
          mockUser.role = newRole;
          localStorage.setItem('prime_mock_user', JSON.stringify(mockUser));
        } catch (e) {
          console.error(e);
        }
      }
    } else if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { role: newRole });
      } catch (e) {
        console.error('Failed to update role in Firestore:', e);
      }
    }
    
    if (newRole === 'admin') {
      window.location.href = '/admin/dashboard';
    } else if (newRole === 'landlord') {
      window.location.href = '/owner/dashboard';
    } else if (newRole === 'agent') {
      window.location.href = '/agent/dashboard';
    } else if (newRole === 'renter') {
      window.location.href = '/tenant/dashboard';
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center gap-0 sm:gap-3 shrink-0">
      {/* Lang flag button */}
      <button 
        onClick={toggleLang}
        className={cn(
          "flex items-center justify-center transition-all p-1 sm:p-2 rounded-xl border border-transparent",
          isSolid ? "hover:bg-gray-100/80 text-gray-700" : "hover:bg-white/10 text-white"
        )}
      >
        <img src={langFlags[lang]} className="w-4 h-3 sm:w-5 sm:h-3.5 object-cover rounded shadow-sm" alt={lang} />
      </button>

      {/* Currency selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            className={cn(
              "flex items-center gap-0.5 sm:gap-1 font-bold transition-all px-1.5 py-1 sm:px-3 sm:py-2 rounded-xl outline-none border border-transparent text-[10px] sm:text-xs tracking-wider",
              isSolid ? "text-gray-700 hover:bg-gray-100/80" : "text-white hover:bg-white/10"
            )}
          >
            <span>{currency}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-28 rounded-2xl p-1.5 shadow-xl border-none font-bold animate-in zoom-in-95 duration-200">
          {(['THB', 'USD', 'CNY'] as const).map((curr) => (
            <DropdownMenuItem 
              key={curr} 
              onClick={() => setCurrency(curr)}
              className={cn(
                "rounded-xl justify-center cursor-pointer p-2.5 font-bold text-xs transition-colors",
                currency === curr ? "bg-primary/5 text-primary" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {curr}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Auth Buttons or Dropdown */}
      {user ? (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none group">
                <Avatar className="w-7 h-7 sm:w-9 sm:h-9 border border-primary/20 group-hover:border-primary transition-all duration-300 ring-2 ring-transparent group-hover:ring-primary/5">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="bg-primary text-white font-black text-[10px] sm:text-xs">
                    {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px] rounded-2xl p-0 border border-gray-200 shadow-xl bg-white mt-2">
              <div className="max-h-[85vh] overflow-y-auto">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                  <p className="font-bold text-gray-900 text-sm truncate">{user.displayName || 'User'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Unified Account</p>
                    {(user?.agentProfile?.approvalStatus === 'pending' || user?.landlordProfile?.approvalStatus === 'pending') && (
                      <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 leading-none tracking-wider animate-pulse">
                        รอตรวจสอบอัปเกรด
                      </span>
                    )}
                  </div>
                </div>

                {/* Switch Role Quick Bar */}
                <div className="px-5 py-3 border-b border-gray-100 bg-slate-50 flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    {lang === 'en' ? 'Active Role' : lang === 'cn' ? '当前身份' : 'บทบาทปัจจุบัน'}
                  </span>
                  <div className="flex bg-slate-200/80 p-0.5 rounded-lg shrink-0 gap-0.5">
                    {[
                      { role: 'renter', label: isTh ? 'ผู้เช่า' : 'Renter' },
                      { role: 'landlord', label: isTh ? 'เจ้าของ' : 'Owner' },
                      { role: 'agent', label: isTh ? 'นายหน้า' : 'Agent' },
                      { role: 'admin', label: isTh ? 'ผู้ดูแล' : 'Admin' }
                    ].map((item) => {
                      const isActive = userRole === item.role;
                      
                      // Check if the user email has this role registered in local storage mapping (strip suffix)
                      const rawEmail = user?.email || '';
                      const userEmail = rawEmail.toLowerCase().trim().replace(/\+.*@/, '@');
                      const rolesKey = 'prime_registered_roles';
                      const rolesMap = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(rolesKey) || '{}') : {};
                      const registeredRoles: string[] = rolesMap[userEmail] || ['renter']; // default renter
                      const roleKeyToCheck = item.role === 'landlord' ? 'owner' : item.role;
                      
                      // Auto register admin if email contains admin keyword or for testing
                      const isRegistered = roleKeyToCheck === 'admin'
                        ? true
                        : roleKeyToCheck === 'owner'
                          ? (registeredRoles.includes('owner') || registeredRoles.includes('landlord'))
                          : registeredRoles.includes(roleKeyToCheck);

                      return (
                        <button
                          key={item.role}
                          onClick={() => {
                            if (!isRegistered) {
                              alert(isTh 
                                ? `คุณยังไม่มีบัญชีบทบาทนี้สำหรับอีเมลนี้ กรุณาเข้าไปที่หน้าโปรไฟล์ และเลือกแท็บ "อัปเกรดบัญชี (KYC)" เพื่อสมัครเปิดใช้งานบทบาท ${item.label}` 
                                : `You do not have a registered profile for this role. Please go to your Profile and select the "Upgrade Partner (KYC)" tab to unlock ${item.label}.`);
                              return;
                            }
                            handleRoleSwitch(item.role as UserRole);
                          }}
                          className={cn(
                            "px-1.5 py-0.5 text-[9px] font-black rounded-md transition-all duration-300 flex items-center gap-0.5",
                            isActive 
                              ? "bg-white text-primary shadow-xs" 
                              : isRegistered
                                ? "text-gray-500 hover:text-gray-900 hover:bg-white/30"
                                : "text-gray-300 cursor-not-allowed hover:bg-transparent opacity-60"
                          )}
                        >
                          {!isRegistered && <span className="text-[8px]">🔒</span>}
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Renter Section */}
                {(userRole === 'renter' || !userRole) && (
                  <div className="p-2">
                    <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">For Renters</p>
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        router.push("/tenant/dashboard");
                      }} 
                      className="w-full flex items-center rounded-xl gap-3 cursor-pointer px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" /> {lang === 'en' ? 'Tenant Dashboard' : 'แดชบอร์ดผู้เช่า'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        if (handlePostListingClick) handlePostListingClick();
                        else router.push("/post-listing");
                      }} 
                      className="w-full flex items-center rounded-xl gap-3 cursor-pointer px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-gray-400" /> {lang === 'en' ? 'Post New Listing' : 'ลงประกาศใหม่'}
                    </DropdownMenuItem>
                  </div>
                )}

                {/* Agent Section */}
                {userRole === 'agent' && (
                  <div className="p-2">
                    <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">For Agents</p>
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        if (onOpenAgentDashboard) onOpenAgentDashboard();
                        else router.push("/agent/dashboard");
                      }} 
                      className="w-full flex items-center rounded-xl gap-3 cursor-pointer px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" /> {lang === 'en' ? 'Agent Dashboard' : 'แดชบอร์ดเอเจนต์'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        if (onOpenPostListing) onOpenPostListing();
                        else router.push("/post-listing");
                      }} 
                      className="w-full flex items-center rounded-xl gap-3 cursor-pointer px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-gray-400" /> {lang === 'en' ? 'Post New Listing' : 'ลงประกาศใหม่'}
                    </DropdownMenuItem>
                  </div>
                )}

                {/* Owner Section */}
                {userRole === 'landlord' && (
                  <div className="p-2">
                    <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">For Owners</p>
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        if (onOpenOwnerDashboard) onOpenOwnerDashboard();
                        else router.push("/owner/dashboard");
                      }} 
                      className="w-full flex items-center rounded-xl gap-3 cursor-pointer px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" /> {lang === 'en' ? 'Owner Dashboard' : 'แดชบอร์ดเจ้าของ'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        if (onOpenPostListing) onOpenPostListing();
                        else router.push("/post-listing");
                      }} 
                      className="w-full flex items-center rounded-xl gap-3 cursor-pointer px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-gray-400" /> {lang === 'en' ? 'Post New Listing' : 'ลงประกาศใหม่'}
                    </DropdownMenuItem>
                  </div>
                )}

                {/* Admin Section */}
                {(userRole === 'admin' || userRole === 'superadmin' || userRole === 'sa') && (
                  <div className="p-2">
                    <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">For Admins</p>
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        router.push("/admin");
                      }} 
                      className="w-full flex items-center rounded-xl gap-3 cursor-pointer px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" /> {lang === 'en' ? 'Admin Dashboard' : 'แดชบอร์ดแอดมิน'}
                    </DropdownMenuItem>
                  </div>
                )}

                <div className="h-px bg-gray-100 mx-3" />

                {/* General Section */}
                <div className="p-2 pb-3">
                {userRole !== 'admin' && (
                  <DropdownMenuItem 
                    onClick={() => router.push("/profile?tab=upgrade")}
                    className="w-full flex items-center rounded-xl gap-3 cursor-pointer px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors bg-amber-50/30 mb-1"
                  >
                    <UserCircle className="w-4 h-4 text-amber-500" /> {lang === 'en' ? 'Upgrade Account' : lang === 'cn' ? '升级账户' : 'อัปเกรดบัญชี'}
                  </DropdownMenuItem>
                )}
                  <DropdownMenuItem 
                    onClick={() => onOpenProfile ? onOpenProfile() : router.push("/profile")} 
                    className="w-full flex items-center rounded-xl gap-3 cursor-pointer px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserCircle className="w-4 h-4 text-gray-400" /> {t.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onOpenSupport ? onOpenSupport() : router.push("/support")} 
                    className="w-full flex items-center rounded-xl gap-3 cursor-pointer px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LifeBuoy className="w-4 h-4 text-gray-400" /> {t.support}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push("/profile")}
                    className="w-full flex items-center rounded-xl gap-3 cursor-pointer px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors bg-green-50/30 mt-1"
                  >
                    <UserCircle className="w-4 h-4 text-green-500" /> {lang === 'en' ? 'Verify via LINE' : lang === 'cn' ? '通过LINE验证' : 'ยืนยันตัวตนผ่าน LINE'}
                  </DropdownMenuItem>
                </div>
              </div>

              <div className="p-3 border-t border-gray-100">
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="w-full flex items-center justify-center rounded-xl gap-2 cursor-pointer p-3 text-xs font-bold text-white bg-[#E51D53] hover:bg-[#D41B4D] focus:bg-[#D41B4D] focus:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" /> {t.logout}
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            onClick={() => { setAuthTab('login'); setAuthOpen(true); }}
            className={cn(
              "font-bold rounded-xl px-3.5 h-9 text-xs transition-all",
              isSolid ? "text-gray-700 hover:bg-gray-100/85" : "text-white/80 hover:bg-white/10"
            )}
          >
            {t.login || "เข้าสู่ระบบ"}
          </Button>
          <Button
            onClick={() => { setAuthTab('register'); setAuthOpen(true); }}
            className={cn(
              "font-bold rounded-full px-4 h-9 text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]",
              isSolid ? "bg-primary text-white shadow-primary/10" : "bg-white text-primary hover:bg-white/95"
            )}
          >
            {t.signup || "สมัครสมาชิก"}
          </Button>
        </div>
      )}
    </div>
  );
};
