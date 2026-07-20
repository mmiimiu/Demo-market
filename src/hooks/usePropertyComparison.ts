'use client';

import { useState, useCallback } from 'react';
import { Property } from '@/lib/types';

const MAX_COMPARE = 3;

export interface UsePropertyComparisonReturn {
  compareList: Property[];
  addToCompare: (property: Property) => void;
  removeFromCompare: (id: string | number) => void;
  isInCompare: (id: string | number) => boolean;
  clearCompare: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  canAdd: boolean;
}

export function usePropertyComparison(): UsePropertyComparisonReturn {
  const [compareList, setCompareList] = useState<Property[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const addToCompare = useCallback((property: Property) => {
    setCompareList(prev => {
      if (prev.some(p => p.id === property.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      const next = [...prev, property];
      if (next.length >= 2) setIsDrawerOpen(true);
      return next;
    });
  }, []);

  const removeFromCompare = useCallback((id: string | number) => {
    setCompareList(prev => {
      const next = prev.filter(p => p.id !== id);
      if (next.length === 0) setIsDrawerOpen(false);
      return next;
    });
  }, []);

  const isInCompare = useCallback(
    (id: string | number) => compareList.some(p => p.id === id),
    [compareList]
  );

  const clearCompare = useCallback(() => {
    setCompareList([]);
    setIsDrawerOpen(false);
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen(prev => !prev), []);

  return {
    compareList,
    addToCompare,
    removeFromCompare,
    isInCompare,
    clearCompare,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    canAdd: compareList.length < MAX_COMPARE,
  };
}
