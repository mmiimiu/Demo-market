'use client';

import React from 'react';
import { UserProfile } from '@/components/profile';
import { SubPageHeader } from '@/components/layout';
import { useApp } from '@/contexts/AppContext';

export default function ProfilePage() {
  const { lang } = useApp();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <SubPageHeader showSignOut />
      <div className="max-w-7xl mx-auto py-6">
        <UserProfile lang={lang as any} />
      </div>
    </div>
  );
}
