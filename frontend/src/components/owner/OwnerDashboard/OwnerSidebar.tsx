'use client';

import React from 'react';
import { Home, Users, Search, Receipt, FileSignature, BarChart, ShieldCheck, Bell, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';
export type ActiveTab = 'properties' | 'ownership' | 'matching' | 'tenants' | 'billing' | 'contracts' | 'analytics' | 'screening' | 'notifications';

interface OwnerSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isThai: boolean;
  isChinese: boolean;
}

export const OwnerSidebar: React.FC<OwnerSidebarProps> = ({ activeTab, setActiveTab, isThai, isChinese }) => {
  const { unreadCount } = useNotifications();
  const navItems: { id: ActiveTab; labelEn: string; labelTh: string; labelCn: string; icon: React.ElementType }[] = [
    { id: 'properties', labelEn: 'Properties & Listings', labelTh: 'อสังหาริมทรัพย์และประกาศ', labelCn: '房产与房源', icon: Home },
    { id: 'ownership', labelEn: 'Manage Ownership', labelTh: 'จัดการกรรมสิทธิ์', labelCn: '所有权管理', icon: FileSignature },
    { id: 'matching', labelEn: 'Find Agent', labelTh: 'หาเอเจนต์', labelCn: '寻找中介', icon: Search },
    { id: 'tenants', labelEn: 'Tenants', labelTh: 'ข้อมูลผู้เช่า', labelCn: '租客信息', icon: Users },
    { id: 'billing', labelEn: 'Billing & Invoices', labelTh: 'บิลและใบแจ้งหนี้', labelCn: '账单与发票', icon: Receipt },
    { id: 'contracts', labelEn: 'Contracts', labelTh: 'สัญญาเช่าดิจิทัล', labelCn: '电子合同', icon: FileSignature },
    { id: 'analytics', labelEn: 'Reports & Analytics', labelTh: 'รายงาน & Analytics', labelCn: '报告与分析', icon: BarChart },
    { id: 'screening', labelEn: 'Tenant Screening', labelTh: 'ตรวจสอบผู้เช่า', labelCn: '审查租客', icon: ShieldCheck },
    { id: 'notifications', labelEn: 'Notifications', labelTh: 'การแจ้งเตือน', labelCn: '通知', icon: Bell },
  ];

  const getLabel = (item: typeof navItems[0]) => {
    if (isThai) return item.labelTh;
    if (isChinese) return item.labelCn;
    return item.labelEn;
  };

  return (
    <div className="w-64 bg-white border border-gray-200 text-gray-700 flex flex-col h-full rounded-none overflow-hidden shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-gray-900 font-semibold tracking-tight text-base">Owner Portal</h2>
        <p className="text-xs text-gray-500 mt-1 font-medium">Manage your properties</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Owner dashboard navigation">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all",
                isActive 
                  ? "bg-[#E51D53] text-white" 
                  : "hover:bg-gray-100"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-500")} />
                <span>{getLabel(item)}</span>
              </div>
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-none text-xs font-medium transition-colors">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-gray-600" />
            <span>Owner Support</span>
          </div>
        </button>
      </div>
    </div>
  );
};
