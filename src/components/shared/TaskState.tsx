/**
 * TaskState Component
 * Standard mock empty state block representation used across pages.
 */

'use client';

import React from 'react';

interface TaskStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function TaskState({ title, description, action }: TaskStateProps) {
  return (
    <div className="py-12 px-6 text-center max-w-md mx-auto space-y-4 border border-dashed border-slate-200 rounded-2xl bg-white/50 shadow-inner">
      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-sm">
        📋
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-black text-slate-800">{title}</h4>
        {description && (
          <p className="text-xs font-bold text-slate-400 leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
