'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, BellRing, CheckCircle2, FileText, MessageSquare, ReceiptText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { StatusBadge, TaskState } from '@/components/shared';
import { useApp } from '@/contexts/AppContext';
import { browserStorage } from '@/lib/browser-storage';
import { t } from '@/lib/translations';

type TenantLanguage = 'th' | 'en' | 'cn';

type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  createdAt: string;
};

type TransactionDisplay = {
  id: string;
  invoice: string;
  amount: number;
  date: string;
  receipt: boolean;
};

const TRANSACTIONS: TransactionDisplay[] = [
  { id: 'txn-2026-05', invoice: 'INV-2026-05', amount: 8300, date: '2026-05-25', receipt: true },
  { id: 'txn-2026-04', invoice: 'INV-2026-04', amount: 8300, date: '2026-04-25', receipt: true },
];

const NEWS = [
  { id: 'rent-reminder', titleKey: 'tenant_news_rent_title' as const, bodyKey: 'tenant_news_rent_body' as const, date: '2026-06-20' },
  { id: 'water-service', titleKey: 'tenant_news_service_title' as const, bodyKey: 'tenant_news_service_body' as const, date: '2026-06-18' },
];

function formatDate(date: string, lang: TenantLanguage) {
  return new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : lang === 'cn' ? 'zh-CN' : 'en-GB', { dateStyle: 'medium' }).format(new Date(date));
}

function TenantPageFrame({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  const router = useRouter();
  const { lang } = useApp();
  const languageClass = lang === 'th' ? 'font-thai' : lang === 'cn' ? 'font-chinese' : 'font-english';

  return (
    <main className={`min-h-screen bg-slate-50 ${languageClass}`}>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <IconButton label={t(lang, 'tenant_back_dashboard')} onClick={() => router.push('/tenant/dashboard')}><ArrowLeft className="size-5" aria-hidden="true" /></IconButton>
          <h1 className="flex-1 text-center text-base font-semibold text-slate-900">{title}</h1>
          <span className="size-11" aria-hidden="true" />
        </div>
      </header>
      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="mb-5 flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">{icon}</div><h2 className="text-xl font-bold text-slate-900">{title}</h2></div>
        {children}
      </div>
    </main>
  );
}

export function TenantHistoryPage() {
  const { lang } = useApp();

  return (
    <TenantPageFrame title={t(lang, 'tenant_history_title')} icon={<ReceiptText className="size-5" aria-hidden="true" />}>
      {TRANSACTIONS.length === 0 ? <TaskState title={t(lang, 'tenant_history_empty')} /> : <ol className="space-y-3" aria-label={t(lang, 'tenant_history_title')}>
        {TRANSACTIONS.map((transaction) => <li key={transaction.id} className="product-panel flex items-start gap-3 p-5"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><CheckCircle2 className="size-5" aria-hidden="true" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{transaction.invoice}</p><p className="mt-1 text-sm text-slate-600">{formatDate(transaction.date, lang)}</p></div><p className="font-semibold tabular-nums text-slate-900">฿{transaction.amount.toLocaleString()}</p></div>{transaction.receipt && <StatusBadge tone="success" className="mt-3">{t(lang, 'tenant_receipt_ready')}</StatusBadge>}</div></li>)}
      </ol>}
    </TenantPageFrame>
  );
}

export function TenantContactPage() {
  const { lang } = useApp();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => setTickets(browserStorage.getJSON<SupportTicket[]>('primerent_tenant_support_tickets', [])), []);

  const submitTicket = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    const nextTicket = { id: `support-${Date.now()}`, subject: subject.trim(), description: description.trim(), createdAt: new Date().toISOString() };
    const nextTickets = [nextTicket, ...tickets];
    setTickets(nextTickets);
    browserStorage.setJSON('primerent_tenant_support_tickets', nextTickets);
    setSubject('');
    setDescription('');
    setSubmitted(true);
  };

  return (
    <TenantPageFrame title={t(lang, 'tenant_contact_title')} icon={<MessageSquare className="size-5" aria-hidden="true" />}>
      <div className="space-y-5">
        <section className="product-panel p-5 sm:p-6"><p className="text-sm leading-6 text-slate-600">{t(lang, 'tenant_contact_intro')}</p><form className="mt-5 space-y-4" onSubmit={submitTicket}>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">{t(lang, 'support_subject')}<input value={subject} onChange={(event) => setSubject(event.target.value)} required className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring" /></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-800">{t(lang, 'support_desc')}<textarea value={description} onChange={(event) => setDescription(event.target.value)} required rows={5} className="min-h-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring" /></label>
          <Button type="submit" className="w-full sm:w-auto">{t(lang, 'tenant_contact_submit')}</Button>
        </form>{submitted && <p role="status" className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-800"><CheckCircle2 className="size-4" aria-hidden="true" />{t(lang, 'tenant_ticket_sent')}</p>}</section>
        <section aria-labelledby="open-tickets-title"><h2 id="open-tickets-title" className="mb-3 text-base font-semibold text-slate-900">{t(lang, 'open_tickets')}</h2>{tickets.length === 0 ? <TaskState title={t(lang, 'tenant_contact_empty')} /> : <ol className="space-y-3">{tickets.map((ticket) => <li key={ticket.id} className="product-panel p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{ticket.subject}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{ticket.description}</p></div><StatusBadge tone="info">{t(lang, 'ticket_status')}</StatusBadge></div><p className="mt-3 text-xs text-slate-500">{formatDate(ticket.createdAt, lang)}</p></li>)}</ol>}</section>
      </div>
    </TenantPageFrame>
  );
}

export function TenantNewsPage() {
  const { lang } = useApp();
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => setReadIds(browserStorage.getJSON<string[]>('primerent_tenant_news_read', [])), []);
  const markRead = (id: string) => setReadIds((current) => {
    const next = current.includes(id) ? current : [...current, id];
    browserStorage.setJSON('primerent_tenant_news_read', next);
    return next;
  });

  return (
    <TenantPageFrame title={t(lang, 'tenant_news_title')} icon={<BellRing className="size-5" aria-hidden="true" />}>
      {NEWS.length === 0 ? <TaskState title={t(lang, 'tenant_news_empty')} /> : <ol className="space-y-3" aria-label={t(lang, 'tenant_news_title')}>
        {NEWS.map((news) => { const isRead = readIds.includes(news.id); return <li key={news.id} className="product-panel p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{t(lang, news.titleKey)}</h2>{!isRead && <StatusBadge tone="info">{t(lang, 'tenant_news_unread')}</StatusBadge>}</div><p className="mt-2 text-sm leading-6 text-slate-600">{t(lang, news.bodyKey)}</p><p className="mt-3 text-xs text-slate-500">{formatDate(news.date, lang)}</p></div>{!isRead && <Button type="button" variant="outline" onClick={() => markRead(news.id)}>{t(lang, 'tenant_mark_read')}</Button>}</div></li>; })}
      </ol>}
    </TenantPageFrame>
  );
}
