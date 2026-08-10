import { CheckCircle2, CircleAlert, Clock3, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const toneClasses: Record<StatusTone, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-rose-200 bg-rose-50 text-rose-800',
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
};

const toneIcon = {
  info: Info,
  success: CheckCircle2,
  warning: Clock3,
  danger: CircleAlert,
  neutral: Info,
} as const;

export function StatusBadge({ tone = 'neutral', children, className }: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = toneIcon[tone];

  return (
    <span className={cn('inline-flex min-h-7 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold', toneClasses[tone], className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}
