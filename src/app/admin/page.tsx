'use client';

import React from 'react';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useApp } from '@/contexts/AppContext';

export default function AdminPage() {
  const { lang } = useApp();
  return <AdminPanel lang={lang as any} />;
}
