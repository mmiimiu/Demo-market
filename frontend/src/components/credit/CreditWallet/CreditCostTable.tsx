'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CREDIT_COSTS, CREDIT_USAGE_LABELS } from '@/lib/credit';
import type { Language } from '@/lib/types';

interface CreditCostTableProps {
  lang: Language;
}

export function CreditCostTable({ lang }: CreditCostTableProps) {
  const isTh = lang === 'th';
  const costEntries = Object.entries(CREDIT_COSTS) as [keyof typeof CREDIT_COSTS, number][];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
          <Info className="w-5 h-5 text-blue-500" />
        </div>
        <h3 className="font-black text-gray-900 text-lg">
          {isTh ? 'ราคาการใช้เครดิต' : 'Credit Pricing'}
        </h3>
      </div>
      <div className="space-y-2">
        {costEntries.map(([key, cost]) => {
          const label = CREDIT_USAGE_LABELS[key];
          return (
            <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-xl">{label.icon}</span>
                <span className="font-semibold text-gray-700 text-sm">
                  {isTh ? label.th : label.en}
                </span>
              </div>
              <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-black text-sm px-3 py-1">
                {cost.toLocaleString()} ₡
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
