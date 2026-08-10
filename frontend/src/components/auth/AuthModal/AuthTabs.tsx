import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { Language } from '@/lib/types';
import { AuthTab } from './types';

interface AuthTabsProps {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  lang: Language;
}

export default function AuthTabs({ activeTab, onTabChange, lang }: AuthTabsProps) {
  const isTh = lang === 'th';

  const tabs: { id: AuthTab; labelTh: string; labelEn: string; icon: React.ElementType }[] = [
    { id: 'login', labelTh: 'เข้าสู่ระบบ', labelEn: 'Sign In', icon: LogIn },
    { id: 'register', labelTh: 'สมัครสมาชิก', labelEn: 'Sign Up', icon: UserPlus },
  ];

  return (
    <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6">
      {tabs.map(({ id, labelTh, labelEn, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl font-black text-sm transition-all duration-200 ${
            activeTab === id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Icon className="w-4 h-4" />
          {isTh ? labelTh : labelEn}
        </button>
      ))}
    </div>
  );
}
