import React from 'react';
import { Property, Language } from '@/lib/types';

export interface CompareDrawerProps {
  properties: Property[];
  onRemove: (id: string | number) => void;
  onClear: () => void;
  onClose: () => void;
  isOpen: boolean;
  lang: Language;
  currency: 'THB' | 'USD' | 'CNY';
  workLocation?: string;
  onViewDetails: (p: Property) => void;
}

export interface CompareRowProps {
  label: string;
  values: React.ReactNode[];
  totalSlots: number;
}
