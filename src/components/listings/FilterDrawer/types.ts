import React from 'react';
import { Language } from '@/lib/types';

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: 'THB' | 'USD' | 'CNY';
  filterState: any;
  setFilterState: React.Dispatch<React.SetStateAction<any>>;
  onReset: () => void;
  children: React.ReactNode;
}
