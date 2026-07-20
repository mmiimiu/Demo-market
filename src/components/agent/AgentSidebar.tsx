'use client';

import React from 'react';
import { LayoutDashboard, Users, UserPlus, Handshake, MapPin, Settings, DollarSign, MessageCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AgentTab = 'overview' | 'tenant-requests' | 'co-broker' | 'showings' | 'commission' | 'notifications' | 'settings';

interface AgentSidebarProps {
  activeTab: AgentTab;
  setActiveTab: (tab: AgentTab) => void;
  isThai: boolean;
  isChinese: boolean;
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({ activeTab, setActiveTab, isThai, isChinese }) => {
  const navItems: { id: AgentTab; labelEn: string; labelTh: string; labelCn: string; icon: React.ElementType }[] = [
    { id: 'overview', labelEn: 'Overview', labelTh: 'ภาพรวม', labelCn: '概览', icon: LayoutDashboard },
    { id: 'tenant-requests', labelEn: 'Find Tenants', labelTh: 'หาผู้เช่า', labelCn: '寻找租客', icon: Users },
    { id: 'co-broker', labelEn: 'Co-Broker', labelTh: 'Co-Broker', labelCn: '合作经纪人', icon: Handshake },
    { id: 'showings', labelEn: 'Showings', labelTh: 'พาลูกค้าดูห้อง', labelCn: '带看记录', icon: MapPin },
    { id: 'commission', labelEn: 'Commission', labelTh: 'ค่าคอมมิชชั่น', labelCn: '佣金', icon: DollarSign },
    { id: 'notifications', labelEn: 'Notifications', labelTh: 'การแจ้งเตือน', labelCn: '通知', icon: Bell },
    { id: 'settings', labelEn: 'Settings & Zones', labelTh: 'ตั้งค่า & โซนทำงาน', labelCn: '设置', icon: Settings },
  ];

  const getLabel = (item: typeof navItems[0]) => {
    if (isThai) return item.labelTh;
    if (isChinese) return item.labelCn;
    return item.labelEn;
  };

  return (
    <div className="w-64 bg-white border border-gray-200 text-gray-700 flex flex-col h-full rounded-none overflow-hidden shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-gray-900 font-semibold tracking-tight text-base">Agent Portal</h2>
        <p className="text-xs text-gray-500 mt-1 font-medium">Manage your business</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Agent dashboard navigation">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                isActive 
                  ? "bg-[#E51D53] text-white" 
                  : "hover:bg-gray-100"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-500")} />
              {getLabel(item)}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-none text-xs font-medium transition-colors">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-gray-600" />
            <span>Agent Support</span>
          </div>
        </button>
      </div>
    </div>
  );
};
