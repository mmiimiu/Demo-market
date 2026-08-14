import React from 'react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';

interface OwnerDashboardTabsProps {
  activeTab: 'properties' | 'ownership' | 'matching' | 'tenants' | 'billing' | 'contracts' | 'analytics' | 'screening' | 'notifications';
  setActiveTab: React.Dispatch<React.SetStateAction<'properties' | 'ownership' | 'matching' | 'tenants' | 'billing' | 'contracts' | 'analytics' | 'screening' | 'notifications'>>;
  isThai: boolean;
  isChinese: boolean;
}

export function OwnerDashboardTabs({ activeTab, setActiveTab, isThai, isChinese }: OwnerDashboardTabsProps) {
  const { unreadCount } = useNotifications();
  const tabs = [
    { key: 'properties' as const, label: isThai ? 'อสังหาริมทรัพย์และประกาศ' : isChinese ? '房产与房源' : 'Properties & Listings' },
    { key: 'ownership' as const, label: isThai ? 'จัดการกรรมสิทธิ์' : isChinese ? '所有权管理' : 'Manage Ownership' },
    { key: 'matching' as const, label: isThai ? '🤝 หาเอเจนต์ (Agent Match)' : isChinese ? '寻找中介' : '🤝 Find Agent' },
    { key: 'tenants' as const, label: isThai ? 'ข้อมูลผู้เช่า' : isChinese ? '租客信息' : 'Tenants' },
    { key: 'billing' as const, label: isThai ? 'บิลและใบแจ้งหนี้' : isChinese ? '账单与发票' : 'Billing & Invoices' },
    { key: 'contracts' as const, label: isThai ? 'สัญญาเช่าดิจิทัล' : isChinese ? '电子合同' : 'Contracts' },
    { key: 'analytics' as const, label: isThai ? '📊 รายงาน & Analytics' : isChinese ? '报告与分析' : '📊 Reports & Analytics' },
    { key: 'screening' as const, label: isThai ? '🔍 ตรวจสอบผู้เช่า' : isChinese ? '审查租客' : '🔍 Tenant Screening' },
    { key: 'notifications' as const, label: isThai ? '🔔 การแจ้งเตือน' : isChinese ? '通知' : '🔔 Notifications' },
  ];

  return (
    <div className="flex flex-col gap-1 w-full mt-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition-all rounded-xl",
            activeTab === tab.key ? "bg-[#EEF2FF] text-[#4F46E5]" : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          )}
        >
          <span>{tab.label}</span>
          {tab.key === 'notifications' && unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
