import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function FormActionBar({
  children,
  className,
  contentClassName,
  label = 'Form actions',
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  label?: string;
}) {
  return (
    <div className={cn('sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white px-4 py-3 sm:-mx-6 sm:px-6', className)} aria-label={label}>
      <div className={cn('mx-auto flex max-w-3xl flex-col-reverse gap-2 sm:flex-row sm:justify-end', contentClassName)}>{children}</div>
    </div>
  );
}
