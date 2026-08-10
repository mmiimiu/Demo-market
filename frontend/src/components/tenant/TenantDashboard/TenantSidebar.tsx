'use client';

import React from 'react';
import { Home, Heart, Calendar, FileText, Receipt, CheckSquare, Wrench, Settings, MessageCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
export type ActiveTab = 'overview' | 'favorites' | 'appointments' | 'applications' | 'contracts' | 'billing' | 'maintenance' | 'notifications' | 'settings';

interface TenantSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: 'th' | 'en' | 'cn';
}

export const TenantSidebar: React.FC<TenantSidebarProps> = ({ activeTab, setActiveTab, lang }) => {
  const isThai = lang === 'th';
  const isChinese = lang === 'cn';

  const navItems: { id: ActiveTab; labelEn: string; labelTh: string; labelCn: string; icon: React.ElementType }[] = [
    { id: 'overview', labelEn: 'Overview', labelTh: 'ภาพรวม', labelCn: '概览', icon: Home },
    { id: 'favorites', labelEn: 'Saved Properties', labelTh: 'ที่พักที่บันทึกไว้', labelCn: '收藏房源', icon: Heart },
    { id: 'appointments', labelEn: 'Viewings', labelTh: 'นัดหมายดูห้อง', labelCn: '看房预约', icon: Calendar },
    { id: 'applications', labelEn: 'Applications', labelTh: 'การสมัครเช่า', labelCn: '租赁申请', icon: FileText },
    { id: 'contracts', labelEn: 'My Contracts', labelTh: 'สัญญาของฉัน', labelCn: '我的合同', icon: CheckSquare },
    { id: 'billing', labelEn: 'Invoices & Payments', labelTh: 'บิลและชำระเงิน', labelCn: '账单与支付', icon: Receipt },
    { id: 'maintenance', labelEn: 'Maintenance', labelTh: 'แจ้งซ่อม', labelCn: '报修', icon: Wrench },
    { id: 'notifications', labelEn: 'Notifications', labelTh: 'การแจ้งเตือน', labelCn: '通知', icon: Bell },
    { id: 'settings', labelEn: 'Preferences', labelTh: 'การตั้งค่า', labelCn: '设置', icon: Settings },
  ];

  const getLabel = (item: typeof navItems[0]) => {
    if (isThai) return item.labelTh;
    if (isChinese) return item.labelCn;
    return item.labelEn;
  };

  return (
    <div className="w-64 bg-white border border-gray-200 text-gray-700 flex flex-col h-full rounded-none overflow-hidden shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-gray-900 font-semibold tracking-tight text-base">Tenant Portal</h2>
        <p className="text-xs text-gray-500 mt-1 font-medium">Manage your rental journey</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Tenant dashboard navigation">
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
            <span>Tenant Support</span>
          </div>
        </button>
      </div>
    </div>
  );
};
