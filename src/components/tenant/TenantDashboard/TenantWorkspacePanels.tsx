'use client';

import { FileText, HeartOff, ReceiptText, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge, TaskState } from '@/components/shared';
import ShowingScheduler from '@/components/agent/ShowingScheduler';
import { useApp } from '@/contexts/AppContext';
import { mockProperties } from '@/lib/properties';
import { t } from '@/lib/translations';
import type { ActiveTab } from './TenantSidebar';
import { TenantPreferences } from './TenantPreferences';

export function TenantWorkspacePanel({ tab, lang }: { tab: ActiveTab; lang: 'th' | 'en' | 'cn' }) {
  const router = useRouter();
  const { savedIds, toggleSave } = useApp();

  if (tab === 'appointments') return <ShowingScheduler mode="tenant" />;

  if (tab === 'billing') return <section className="product-panel mx-auto max-w-3xl p-5 sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><ReceiptText className="size-5 text-primary" aria-hidden="true" /><h2 className="text-lg font-bold text-slate-900">{t(lang, 'payment_title')}</h2></div><p className="mt-2 text-sm leading-6 text-slate-600">{t(lang, 'payment_invoice')} INV-2026-06 · {t(lang, 'payment_amount')} ฿8,300</p></div><StatusBadge tone="warning">{t(lang, 'payment_time_remaining')}</StatusBadge></div><Button className="mt-6 w-full sm:w-auto" onClick={() => router.push('/tenant/billing')}>{t(lang, 'payment_confirm')}</Button></section>;

  if (tab === 'favorites') {
    const properties = mockProperties.filter((property) => savedIds.includes(property.id as number));
    if (!properties.length) return <TaskState title={t(lang, 'tenant_saved_empty')} description={t(lang, 'tenant_saved_empty_desc')} action={<Button onClick={() => router.push('/listings')}>{t(lang, 'search')}</Button>} />;
    return <section aria-label={t(lang, 'tenant_saved_properties')} className="grid gap-4 md:grid-cols-2">{properties.map((property) => <article key={property.id} className="product-panel p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-slate-900">{lang === 'th' ? property.name : lang === 'cn' ? property.nameCn : property.nameEn}</h2><p className="mt-1 text-sm text-slate-600">{lang === 'th' ? property.location : lang === 'cn' ? property.locationCn : property.locationEn}</p><p className="mt-3 font-semibold tabular-nums text-slate-900">฿{property.price.toLocaleString()}</p></div><Button variant="outline" size="icon" aria-label={t(lang, 'tenant_remove_saved')} title={t(lang, 'tenant_remove_saved')} onClick={() => toggleSave(property.id as number)}><HeartOff className="size-5" aria-hidden="true" /></Button></div></article>)}</section>;
  }

  if (tab === 'applications') return <section className="product-panel mx-auto max-w-3xl p-5 sm:p-6"><div className="flex items-center gap-2"><FileText className="size-5 text-primary" aria-hidden="true" /><h2 className="text-lg font-bold text-slate-900">{t(lang, 'tenant_applications')}</h2></div><article className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold text-slate-900">Ideo Mix Sukhumvit 102</h3><p className="mt-1 text-sm text-slate-600">{t(lang, 'tenant_application_review')}</p></div><Button variant="outline" onClick={() => router.push('/listings')}>{t(lang, 'view_details')}</Button></article></section>;

  if (tab === 'contracts') return <section className="product-panel mx-auto max-w-3xl p-5 sm:p-6"><div className="flex items-center gap-2"><FileText className="size-5 text-primary" aria-hidden="true" /><h2 className="text-lg font-bold text-slate-900">{t(lang, 'tenant_contracts')}</h2></div><div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">Ideo Mix Sukhumvit 102</p><p className="mt-1 text-sm text-slate-600">{t(lang, 'tenant_contract_ready')}</p></div><Button onClick={() => router.push('/tenant/contract?contractId=demo-001')}>{t(lang, 'tenant_open_contract')}</Button></div></section>;

  if (tab === 'settings') return <section className="space-y-4"><TenantPreferences label={(th, en, cn) => lang === 'th' ? th : lang === 'cn' ? cn : en} /><Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/profile?tab=preferences')}><Settings2 className="size-5" aria-hidden="true" />{t(lang, 'tenant_edit_preferences')}</Button></section>;

  return <TaskState title={t(lang, 'tenant_preferences')} />;
}
