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
    ...((currentRole === 'user' || currentRole === 'renter') ? [
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
    <div className="w-full lg:w-80 space-y-4 shrink-0">
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
              'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors border-l-2',
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-600 border-l-blue-600'
                : 'bg-transparent text-gray-500 hover:bg-gray-50 border-l-transparent'
            )}
          >
            <div className="flex items-center gap-3">
              <tab.icon className={cn('w-4 h-4', activeTab === tab.id ? 'text-gray-900' : 'text-gray-400')} />
              <span className="font-medium text-sm">{tab.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
