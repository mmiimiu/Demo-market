'use client';

import React from 'react';
import {
  User, Building2, ShieldCheck, Bell, BarChart2, Star, ChevronRight,
  Camera, Clock, ShieldAlert, Sparkles, Landmark, Coins, Heart, BadgeCheck, Search, FileText
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Language, UserRole, KYCStatus } from '@/lib/types';
import type { ProfileTab, RoleTheme } from './types';
import { ProfileProgress } from './ProfileProgress';

interface ProfileSidebarProps {
  lang: Language;
  t: any;
  user: any;
  theme: RoleTheme;
  currentRole: UserRole;
  currentKyc: KYCStatus;
  isAgentVerified?: boolean;
  completionScore: number;
  completionTips: string[];
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export function ProfileSidebar({
  lang, t, user, theme, currentRole, currentKyc, isAgentVerified,
  completionScore, completionTips, activeTab, onTabChange
}: ProfileSidebarProps) {
  const tabs = [
    { id: 'info', label: t.personal_info, icon: User },
    { id: 'security', label: t.security, icon: ShieldCheck },
    { id: 'preferences', label: t.preferences, icon: Bell },
    { id: 'saved_properties', label: lang === 'th' ? 'ที่พักที่บันทึกไว้' : 'Saved Properties', icon: Heart },
    { id: 'search_reports', label: lang === 'th' ? 'ประวัติการค้นหา' : 'Search History', icon: Search },
    { id: 'payment', label: lang === 'th' ? 'ธุรกรรมการเงิน (Payments)' : 'Financial Portal', icon: Landmark },
    ...(currentRole !== 'admin' ? [
      { id: 'upgrade', label: lang === 'th' ? 'อัปเกรดบัญชี (KYC)' : 'Upgrade Partner', icon: Sparkles },
    ] : []),
    ...(currentRole === 'renter' ? [
      { id: 'contracts', label: lang === 'th' ? 'สัญญาของฉัน' : 'My Contracts', icon: FileText },
      { id: 'tenant_screening', label: lang === 'th' ? 'สมัครการตรวจสอบผู้เช่า' : 'Tenant Screening', icon: Star }
    ] : []),
    ...((currentRole === 'landlord' || currentRole === 'owner' || currentRole === 'agent') ? [
      { id: 'my_listings', label: lang === 'th' ? 'ประวัติการลงประกาศ' : 'My Listings', icon: Building2 },
      { id: 'delegations', label: lang === 'th' ? 'สัญญาแต่งตั้งดูแลห้อง' : 'Delegations', icon: Landmark },
      { id: 'credits', label: lang === 'th' ? 'กระเป๋าเงินเครดิต' : 'Credit Wallet', icon: Coins }
    ] : []),
    ...(currentRole === 'agent' ? [
      { id: 'agent_dashboard', label: lang === 'th' ? 'สถิติผลงาน' : 'Performance', icon: BarChart2 },
      { id: 'public_profile', label: lang === 'th' ? 'โปรไฟล์สาธารณะ' : 'Public Profile', icon: Star },
    ] : []),
    ...(currentRole === 'landlord' || currentRole === 'owner' ? [
      { id: 'owner_properties', label: lang === 'th' ? 'สรุปทรัพย์สิน' : 'Properties', icon: Building2 },
      { id: 'public_profile', label: lang === 'th' ? 'โปรไฟล์สาธารณะ' : 'Public Profile', icon: Star },
    ] : []),
  ];

  return (
    <>
      {/* Desktop Sidebar (lg:flex hidden) */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 space-y-4 shrink-0">
        <ProfileProgress lang={lang} theme={theme} completionScore={completionScore} completionTips={completionTips} isAgentVerified={isAgentVerified} currentRole={currentRole} />

        <Card className="border border-gray-100 shadow-sm shadow-gray-200/50 rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="w-20 h-20 border-2 border-gray-100">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="bg-gray-100 text-gray-600 font-medium text-2xl">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button 
                aria-label={lang === 'th' ? 'เปลี่ยนรูปโปรไฟล์' : 'Change profile picture'}
                className="absolute bottom-0 right-0 p-2 bg-white border border-gray-100 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Camera className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{user?.displayName || 'User'}</h3>
            <p className="text-xs text-gray-500 mb-4 truncate max-w-full">{user?.email}</p>
            <div className="flex flex-col gap-2 items-center">
              <Badge className="border border-gray-100 bg-gray-50 text-gray-700 rounded-xl font-medium px-3 py-1 text-[10px] w-fit">
                {theme.label}
              </Badge>
              <div>
                {currentKyc === 'verified' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-xl">
                    <ShieldCheck className="w-3 h-3" /> KYC VERIFIED
                  </span>
                ) : currentKyc === 'pending' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-xl">
                    <Clock className="w-3 h-3" /> PENDING
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-xl">
                    <ShieldAlert className="w-3 h-3" /> UNVERIFIED
                  </span>
                )}
              </div>
              {currentRole === 'agent' && isAgentVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded-xl">
                  <BadgeCheck className="w-3 h-3 text-teal-600" />
                  {lang === 'th' ? 'Verified Agent' : 'Verified Agent'}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as ProfileTab)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors border-l-2 text-left',
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-l-blue-600 font-bold'
                  : 'bg-transparent text-gray-500 hover:bg-gray-50 border-l-transparent'
              )}
            >
              <div className="flex items-center gap-3">
                <tab.icon className={cn('w-4 h-4', activeTab === tab.id ? 'text-blue-600' : 'text-gray-400')} />
                <span className="font-medium text-sm">{tab.label}</span>
              </div>
              <ChevronRight className={cn('w-4.5 h-4.5 transition-transform text-gray-300', activeTab === tab.id && 'text-blue-500 translate-x-0.5')} />
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar (lg:hidden block) */}
      <div className="flex lg:hidden flex-col w-full space-y-4 shrink-0 pb-4 border-b border-gray-150">
        {/* Compact User Info Row */}
        <div className="flex items-center gap-4 bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
          <Avatar className="w-14 h-14 border border-gray-200">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className="bg-gray-250 text-gray-700 font-bold text-lg">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 truncate text-base">{user?.displayName || 'User'}</h3>
              <Badge className="border border-gray-200 bg-white text-gray-700 rounded-lg font-semibold px-2 py-0.5 text-[9px] w-fit shrink-0">
                {theme.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
            <div className="flex gap-2 items-center mt-1.5">
              {currentKyc === 'verified' ? (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-lg">
                  <ShieldCheck className="w-2.5 h-2.5 text-green-600" /> Verified
                </span>
              ) : currentKyc === 'pending' ? (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                  <Clock className="w-2.5 h-2.5 text-amber-600" /> Pending
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
                  <ShieldAlert className="w-2.5 h-2.5 text-red-600" /> Unverified
                </span>
              )}
              {currentRole === 'agent' && isAgentVerified && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                  <BadgeCheck className="w-2.5 h-2.5 text-teal-600" /> Agent✓
                </span>
              )}
              <span className="text-[9px] text-gray-400 font-bold ml-auto">
                {lang === 'th' ? `โปรไฟล์ ${completionScore}%` : `Profile ${completionScore}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className={cn('h-full transition-all duration-700 ease-out rounded-full',
            completionScore >= 80 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
            completionScore >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-rose-400 to-red-500'
          )} style={{ width: `${completionScore}%` }} />
        </div>

        {/* Horizontal Swipeable Tab Menu */}
        <div className="flex flex-row overflow-x-auto gap-1.5 py-1 scrollbar-none -mx-4 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as ProfileTab)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all shrink-0 text-xs font-black border border-gray-100 shadow-sm active:scale-95 touch-manipulation',
                activeTab === tab.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <tab.icon className={cn('w-3.5 h-3.5 shrink-0', activeTab === tab.id ? 'text-white' : 'text-gray-400')} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
