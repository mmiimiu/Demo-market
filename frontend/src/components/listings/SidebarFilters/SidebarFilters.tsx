"use client";

import React, { useState } from 'react';
import { SidebarFiltersProps } from './types';
import { translations } from '@/lib/translations';
import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterContent } from './FilterContent';

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  lang,
  currency,
  filterState,
  setFilterState,
}) => {
  const t = translations[lang] || translations.th;
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Drawer is removed because FilterDrawer is used in page.tsx */}

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:block w-[320px] shrink-0 space-y-12",
        lang === 'th' ? "font-thai" : "font-english"
      )}>
        <FilterContent
          lang={lang}
          currency={currency}
          filterState={filterState}
          setFilterState={setFilterState}
        />
      </div>
    </>
  );
};
