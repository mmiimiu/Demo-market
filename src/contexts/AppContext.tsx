"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, CommuteMode } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { mockProperties } from '@/lib/properties';
import { useNotification } from '@/hooks/use-notification';

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  currency: 'THB' | 'USD' | 'CNY';
  setCurrency: (currency: 'THB' | 'USD' | 'CNY') => void;
  savedIds: number[];
  toggleSave: (id: number) => void;
  chatState: {
    isOpen: boolean;
    property?: { id: number; name: string };
    role: 'renter' | 'agent' | 'owner';
    partnerName?: string;
  };
  openChat: (property?: { id: number; name: string }, role?: 'renter' | 'agent' | 'owner', partnerName?: string) => void;
  closeChat: () => void;
  workLocation: string;
  setWorkLocation: (loc: string) => void;
  commuteMode: CommuteMode;
  setCommuteMode: (mode: CommuteMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const notification = useNotification();
  const [lang, setLangState] = useState<Language>('th');
  const [currency, setCurrencyState] = useState<'THB' | 'USD' | 'CNY'>('THB');
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [workLocation, setWorkLocationState] = useState<string>('');
  const [commuteMode, setCommuteModeState] = useState<CommuteMode>('bts');
  const [chatState, setChatState] = useState<{
    isOpen: boolean;
    property?: { id: number; name: string };
    role: 'renter' | 'agent' | 'owner';
    partnerName?: string;
  }>({
    isOpen: false,
    role: 'renter'
  });

  useEffect(() => {
    const savedLang = localStorage.getItem('primerent_lang') as Language;
    const savedCurrency = localStorage.getItem('primerent_currency') as 'THB' | 'USD' | 'CNY';
    const savedIdsRaw = localStorage.getItem('primerent_saved_ids');
    const savedWorkLocation = localStorage.getItem('primerent_work_location');
    const savedCommuteMode = localStorage.getItem('primerent_commute_mode') as CommuteMode;

    if (savedLang) setLangState(savedLang);
    if (savedCurrency) setCurrencyState(savedCurrency);
    if (savedIdsRaw) {
      try { setSavedIds(JSON.parse(savedIdsRaw)); } catch { setSavedIds([]); }
    }
    if (savedWorkLocation !== null && savedWorkLocation !== undefined) {
      setWorkLocationState(savedWorkLocation);
    }
    if (savedCommuteMode) {
      setCommuteModeState(savedCommuteMode);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('primerent_lang', newLang);
  };

  const setCurrency = (newCurrency: 'THB' | 'USD' | 'CNY') => {
    setCurrencyState(newCurrency);
    localStorage.setItem('primerent_currency', newCurrency);
  };

  const setWorkLocation = (newLoc: string) => {
    setWorkLocationState(newLoc);
    localStorage.setItem('primerent_work_location', newLoc);
  };

  const setCommuteMode = (newMode: CommuteMode) => {
    setCommuteModeState(newMode);
    localStorage.setItem('primerent_commute_mode', newMode);
  };

  const toggleSave = (id: number) => {
    setSavedIds(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('primerent_saved_ids', JSON.stringify(next));
      return next;
    });
  };

  const openChat = (property?: { id: number; name: string }, role: 'renter' | 'agent' | 'owner' = 'renter', partnerName?: string) => {
    setChatState({
      isOpen: true,
      property,
      role,
      partnerName
    });
  };

  const closeChat = () => {
    setChatState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AppContext.Provider value={{ 
      lang, setLang, currency, setCurrency, savedIds, toggleSave,
      chatState, openChat, closeChat,
      workLocation, setWorkLocation, commuteMode, setCommuteMode
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

