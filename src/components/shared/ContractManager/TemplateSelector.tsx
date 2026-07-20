import React from 'react';
import { cn } from '@/lib/utils';
import { ContractTemplate } from './types';
import { TEMPLATES } from './constants';

interface TemplateSelectorProps {
  value: ContractTemplate;
  onChange: (t: ContractTemplate) => void;
  lang: 'th' | 'en' | 'cn';
}

export function TemplateSelector({ value, onChange, lang }: TemplateSelectorProps) {
  const isTh = lang === 'th';
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(TEMPLATES) as ContractTemplate[]).map((key) => {
        const t = TEMPLATES[key];
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "px-3 py-1.5 text-xs font-bold border transition-all rounded-none",
              value === key ? t.color : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
            )}
          >
            {isTh ? t.labelTh : t.label}
          </button>
        );
      })}
    </div>
  );
}
