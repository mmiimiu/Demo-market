"use client";

import React from 'react';
import { FilterDrawerProps } from './types';
import { translations } from '@/lib/translations';
import { X, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { FilterContent } from './FilterContent';

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ 
  isOpen, 
  onClose, 
  lang, 
  currency,
  filterState,
  setFilterState,
  onReset,
  children
}) => {
  const t = translations[lang];

  return (
    <Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] max-h-[600px] overflow-y-auto p-6 shadow-2xl border-2 border-primary/10"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary" /> {t.filters}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-none transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <FilterContent
          lang={lang}
          currency={currency}
          filterState={filterState}
          setFilterState={setFilterState}
        />

        <div className="mt-6 pt-4 border-t border-border flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 rounded-none h-10 font-bold border-2 gap-2 text-xs"
            onClick={onReset}
          >
            <Trash2 className="w-4 h-4" /> {lang === 'th' ? 'รีเซ็ต' : 'Reset'}
          </Button>
          <Button 
            className="flex-[2] rounded-none h-10 font-black text-sm shadow-xl"
            onClick={onClose}
          >
            {lang === 'th' ? 'แสดงผลลัพธ์' : 'Show Results'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
