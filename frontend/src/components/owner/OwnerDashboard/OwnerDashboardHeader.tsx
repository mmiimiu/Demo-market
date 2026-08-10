import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { translations } from '@/lib/translations';

interface OwnerDashboardHeaderProps {
  lang: 'th' | 'en' | 'cn';
  onCreateClick: () => void;
}

export function OwnerDashboardHeader({ lang, onCreateClick }: OwnerDashboardHeaderProps) {
  const t = translations[lang] || translations.th;
  const isThai = lang === 'th';
  const isChinese = lang === 'cn';

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {t.nav_owner_dashboard}
        </h1>
        <p className="text-sm text-gray-600 font-medium">
          {isThai ? 'จัดการทรัพย์สิน ผู้เช่า และรายรับของคุณ' : isChinese ? '管理您的房产、租客และ收入' : 'Manage your properties, tenants, and income.'}
        </p>
      </div>
      <Button onClick={onCreateClick} className="h-12 px-6 rounded-none bg-gray-900 hover:bg-gray-800 text-white font-medium text-base gap-2" aria-label={isThai ? 'สร้างประกาศใหม่' : 'Create new listing'}>
        <Plus className="w-5 h-5" /> {t.create_listing}
      </Button>
    </header>
  );
}
