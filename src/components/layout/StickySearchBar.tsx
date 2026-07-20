"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Language } from '@/lib/types';
import { translations } from '@/lib/translations';
import { 
  Search, 
  X, 
  Clock, 
  MapPin,
  Building2,
  Home,
  Bed,
  Palmtree,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterDrawer } from '@/components/FilterDrawer';
import { cn } from '@/lib/utils';

interface StickySearchBarProps {
  lang: Language;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e?: React.FormEvent, customQuery?: string) => void;
  isSearching: boolean;
  recentSearches: string[];
  onClearRecent: () => void;
  isFilterOpen: boolean;
  onOpenFilter: () => void;
  onCloseFilter: () => void;
  filterState: any;
  setFilterState: React.Dispatch<React.SetStateAction<any>>;
  onResetFilters: () => void;
  scrolled: boolean;
  currency: 'THB' | 'USD' | 'CNY';
  onCurrencyChange: (curr: 'THB' | 'USD' | 'CNY') => void;
  /** When true, renders as a static (non-fixed) search bar for hero sections */
  heroMode?: boolean;
}

export const StickySearchBar: React.FC<StickySearchBarProps> = ({
  lang,
  searchQuery,
  setSearchQuery,
  onSearch,
  isSearching,
  recentSearches,
  onClearRecent,
  isFilterOpen,
  onOpenFilter,
  onCloseFilter,
  filterState,
  setFilterState,
  onResetFilters,
  scrolled,
  currency,
  onCurrencyChange,
  heroMode = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang] || translations.th;
  const isThai = lang === 'th';

  const CATEGORIES = [
    { id: 'condo', label: t.cat_condo, icon: Building2 },
    { id: 'house', label: t.cat_house, icon: Home },
    { id: 'apartment', label: t.cat_apartment, icon: Building2 },
    { id: 'dorm', label: t.cat_dorm, icon: Bed },
    { id: 'villa', label: t.cat_villa, icon: Palmtree },
  ];

  const POPULAR_SUGGESTIONS = [
    { id: 'bts', label: isThai ? 'ใกล้ BTS' : 'Near BTS', icon: MapPin },
    { id: 'mrt', label: isThai ? 'ใกล้ MRT' : 'Near MRT', icon: MapPin },
    { id: 'pet', label: isThai ? 'เลี้ยงสัตว์ได้' : 'Pet Friendly', icon: Home },
    { id: 'furnished', label: isThai ? 'เฟอร์นิเจอร์ครบ' : 'Furnished', icon: Home },
    { id: 'pool', label: isThai ? 'มีสระว่ายน้ำ' : 'With Pool', icon: Palmtree },
  ];

  const SHORTCUT_CATEGORIES = [
    {
      id: 'location',
      label: isThai ? 'ทำเลที่ตั้ง' : 'Location',
      icon: MapPin,
      items: [
        { id: 'bkk', label: isThai ? 'กรุงเทพฯ' : 'Bangkok' },
        { id: 'cm', label: isThai ? 'เชียงใหม่' : 'Chiang Mai' },
        { id: 'phuket', label: isThai ? 'ภูเก็ต' : 'Phuket' },
        { id: 'pattaya', label: isThai ? 'พัทยา' : 'Pattaya' },
        { id: 'huahin', label: isThai ? 'หัวหิน' : 'Hua Hin' },
      ]
    },
    {
      id: 'property',
      label: isThai ? 'ประเภทที่พัก' : 'Property Type',
      icon: Building2,
      items: [
        { id: 'condo', label: t.cat_condo },
        { id: 'house', label: t.cat_house },
        { id: 'apartment', label: t.cat_apartment },
        { id: 'dorm', label: t.cat_dorm },
        { id: 'villa', label: t.cat_villa },
      ]
    },
    {
      id: 'amenities',
      label: isThai ? 'สิ่งอำนวยความสะดวก' : 'Amenities',
      icon: Home,
      items: [
        { id: 'bts', label: isThai ? 'ใกล้ BTS' : 'Near BTS' },
        { id: 'mrt', label: isThai ? 'ใกล้ MRT' : 'Near MRT' },
        { id: 'pet', label: isThai ? 'เลี้ยงสัตว์ได้' : 'Pet Friendly' },
        { id: 'furnished', label: isThai ? 'เฟอร์นิเจอร์ครบ' : 'Furnished' },
        { id: 'pool', label: isThai ? 'มีสระว่ายน้ำ' : 'With Pool' },
      ]
    }
  ];

  const LOCATION_SUGGESTIONS = [
    { id: 'bkk', label: isThai ? 'กรุงเทพฯ' : 'Bangkok', icon: MapPin },
    { id: 'cm', label: isThai ? 'เชียงใหม่' : 'Chiang Mai', icon: MapPin },
    { id: 'phuket', label: isThai ? 'ภูเก็ต' : 'Phuket', icon: MapPin },
    { id: 'pattaya', label: isThai ? 'พัทยา' : 'Pattaya', icon: MapPin },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    if (!isSearching) {
      setIsFocused(true);
      setShowRecent(true);
    }
  };

  const handleRecentClick = (query: string) => {
    setSearchQuery(query);
    onSearch(undefined, query);
    setShowRecent(false);
    setIsFocused(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(e);
    setShowRecent(false);
    setIsFocused(false);
  };

  const currencySymbols = { THB: '฿', USD: '$', CNY: '¥' };

  // ─── Shared Dropdown ──────────────────────────────────────────────────────────
  const [savedHistory, setSavedHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('primerent_saved_searches');
      if (raw) setSavedHistory(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [showRecent]);

  const handleClearHistory = () => {
    try {
      localStorage.setItem('primerent_saved_searches', JSON.stringify([]));
      setSavedHistory([]);
      onClearRecent();
    } catch { /* ignore */ }
  };

  const recentDropdown = showRecent && !isSearching && (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-none shadow-2xl border border-gray-100 p-4 z-[200] animate-in fade-in slide-in-from-top-2 duration-200 max-h-[500px] overflow-y-auto">
      {/* Recent Searches */}
      {savedHistory.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              {t.recent_searches}
            </h4>
            <button 
              onClick={handleClearHistory}
              className="text-xs font-bold text-primary hover:text-primary/80"
            >
              {t.clear_history}
            </button>
          </div>
          {savedHistory.slice(0, 5).map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleRecentClick(item.query)}
              className="w-full flex items-center gap-3 p-3 rounded-none hover:bg-gray-50 transition-colors text-left"
            >
              <Clock className="w-4 h-4 text-gray-400" />
              <div className="flex flex-col">
                <span className="font-medium text-gray-700 text-xs">{item.query || (isThai ? 'ค้นหาทั้งหมด' : 'All')}</span>
                {item.priceMax < 150000 && (
                  <span className="text-[10px] text-gray-400 font-semibold">
                    (฿{item.priceMin.toLocaleString()} - ฿{item.priceMax.toLocaleString()})
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Popular Suggestions */}
      <div className="space-y-3 mb-6">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
          {isThai ? 'คำแนะนำยอดนิยม' : 'Popular Suggestions'}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {POPULAR_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleRecentClick(suggestion.label)}
              className="flex items-center gap-2 p-3 rounded-none bg-gray-50 hover:bg-primary/5 border border-gray-100 hover:border-primary/20 transition-all text-left"
            >
              <suggestion.icon className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-700">{suggestion.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location Suggestions */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
          {isThai ? 'จุดหมายยอดนิยม' : 'Popular Destinations'}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {LOCATION_SUGGESTIONS.map((location) => (
            <button
              key={location.id}
              onClick={() => handleRecentClick(location.label)}
              className="flex items-center gap-2 p-3 rounded-none bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/20 transition-all text-left"
            >
              <location.icon className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">{location.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {savedHistory.length === 0 && (
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 font-medium">
            {isThai ? 'ยังไม่มีการค้นหาล่าสุด' : 'No recent searches'}
          </p>
        </div>
      )}
    </div>
  );

  // ─── Hero Mode: Static search bar inside a hero section ───────────────────────
  if (heroMode) {
    return (
      <div className="w-full max-w-3xl mx-auto" ref={searchRef}>
        <form onSubmit={handleSubmit} className={cn("relative transition-all duration-300", isFocused ? "z-[200]" : "z-10")}>
          <div className={cn(
            "flex items-center bg-white border-2 transition-all duration-300 shadow-lg",
            isFocused ? "border-primary ring-4 ring-primary/10" : "border-gray-200 hover:border-primary/30"
          )}>
            <div className="flex-1 flex items-center px-5 gap-3">
              <Search className={cn("w-5 h-5 shrink-0 transition-colors", isFocused ? "text-primary" : "text-gray-400")} />
              <Input
                ref={inputRef}
                autoComplete="off"
                className="border-none shadow-none focus-visible:ring-0 text-base h-14 w-full bg-transparent font-medium placeholder:text-gray-400"
                placeholder={isThai ? 'ค้นหาพื้นที่ ชื่ออาคาร หรือสถานที่...' : 'Search area, building name, or location...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleFocus}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 hover:bg-gray-100 rounded-none transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSearching}
              className="bg-[#1A56DB] hover:bg-[#0f4db8] text-white rounded-none h-14 px-8 font-black text-sm transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#1A56DB]/20 gap-2 shrink-0"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-none animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  {isThai ? 'ค้นหา' : 'Search'}
                </>
              )}
            </Button>
          </div>
          {recentDropdown}
        </form>
      </div>
    );
  }

  // ─── Sticky Mode: Fixed bar that slides in when scrolled ─────────────────────
  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
        scrolled ? "translate-y-[64px] sm:translate-y-[68px] opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div className={cn(
        "bg-white shadow-[0_8px_32px_-8px_rgba(26,86,219,0.15)] border-b border-primary/10 transition-all duration-500",
        scrolled ? "scale-100" : "scale-95"
      )}>
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-4">

            {/* Search Bar */}
            <div className="flex-1 relative" ref={searchRef}>
              <form onSubmit={handleSubmit} className={cn(
                "relative transition-all duration-300",
                isFocused ? "z-[200]" : "z-10"
              )}>
                <div className={cn(
                  "flex items-center gap-2 bg-[#F8FAFF] rounded-none border-2 transition-all duration-300",
                  isFocused ? "border-primary ring-4 ring-primary/10" : "border-gray-200 hover:border-primary/30"
                )}>
                  <div className="flex-1 flex items-center px-3 gap-2">
                    <Search className={cn("w-4 h-4 transition-colors", isFocused ? "text-primary" : "text-gray-400")} />
                    <Input 
                      ref={inputRef}
                      autoComplete="off"
                      className="border-none shadow-none focus-visible:ring-0 text-sm h-9 w-full bg-transparent font-medium placeholder:text-gray-400" 
                      placeholder={isThai ? 'ค้นหาพื้นที่ ชื่ออาคาร หรือสถานที่...' : 'Search area, building name, or location...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={handleFocus}
                    />
                    {searchQuery && (
                      <button 
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="p-1.5 hover:bg-gray-200 rounded-none transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSearching} 
                    className="bg-[#1A56DB] hover:bg-[#0f4db8] text-white rounded-none h-9 px-4 font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#1A56DB]/20 mr-1"
                  >
                    {isSearching ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-none animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                  </Button>
                  <FilterDrawer 
                    isOpen={isFilterOpen}
                    onClose={onCloseFilter}
                    lang={lang}
                    currency={currency}
                    filterState={filterState}
                    setFilterState={setFilterState}
                    onReset={onResetFilters}
                  >
                    <Button 
                      type="button"
                      className="bg-[#F8FAFF] hover:bg-[#1A56DB]/5 text-gray-700 rounded-none h-9 px-3 font-black text-xs transition-all border border-gray-200 hover:border-[#1A56DB]/20"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </FilterDrawer>
                </div>

                {/* Recent Searches Dropdown */}
                {recentDropdown}
              </form>
            </div>

            {/* Currency Selector */}
            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
              {(['THB', 'USD', 'CNY'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => onCurrencyChange(curr)}
                  className={cn(
                    "px-2 py-1.5 rounded-none font-black text-[10px] transition-all",
                    currency === curr 
                      ? "bg-[#1A56DB] text-white shadow-lg shadow-[#1A56DB]/20" 
                      : "bg-[#F8FAFF] text-gray-600 hover:bg-[#1A56DB]/5 border border-gray-200 hover:border-[#1A56DB]/20"
                  )}
                >
                  {currencySymbols[curr]} {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible Shortcut Categories */}
          {isFocused && (
            <div className="mt-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              {SHORTCUT_CATEGORIES.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-none overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                    className="w-full flex items-center justify-between p-2 bg-[#F8FAFF] hover:bg-[#1A56DB]/5 transition-all"
                  >
                    <div className="flex items-center gap-1.5">
                      <category.icon className="w-3.5 h-3.5 text-[#1A56DB]" />
                      <span className="text-[10px] font-black text-gray-700">{category.label}</span>
                    </div>
                    <ChevronRight 
                      className={cn(
                        "w-3.5 h-3.5 text-gray-400 transition-transform duration-300",
                        expandedCategory === category.id && "rotate-90"
                      )} 
                    />
                  </button>
                  {expandedCategory === category.id && (
                    <div className="p-1.5 bg-white grid grid-cols-2 sm:grid-cols-3 gap-1 animate-in slide-in-from-top-2 duration-200">
                      {category.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSearchQuery(item.label);
                            onSearch(undefined, item.label);
                            setExpandedCategory(null);
                          }}
                          className="p-1.5 text-center rounded-none hover:bg-[#1A56DB]/5 transition-all text-[10px] font-medium text-gray-600 hover:text-[#1A56DB]"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
