'use client';

import React from 'react';
import { Search, DollarSign, PlusCircle, MapPin, ChevronDown, Bed, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Language, Amenity } from '@/lib/types';
import type { FilterState, CommuteMode } from './types';

interface HeroSectionProps {
  lang: Language;
  t: any;
  heroIndex: number;
  searchQuery: string;
  searchHistory: string[];
  showSearchHistory: boolean;
  isSearching: boolean;
  filterState: FilterState;
  workLocation: string;
  commuteMode: CommuteMode;
  symbol: string;
  convert: (v: number) => number;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  onHistoryClick: (q: string) => void;
  onShowHistoryChange: (show: boolean) => void;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onWorkLocationChange: (loc: string) => void;
  onCommuteModeChange: (mode: CommuteMode) => void;
}

const HERO_IMAGES = [
  PlaceHolderImages.find(i => i.id === 'hero-1')?.imageUrl || '',
  PlaceHolderImages.find(i => i.id === 'hero-2')?.imageUrl || '',
  PlaceHolderImages.find(i => i.id === 'hero-3')?.imageUrl || '',
].filter(Boolean);

export function HeroSection({
  lang, t, heroIndex, searchQuery, searchHistory, showSearchHistory, isSearching,
  filterState, workLocation, commuteMode, symbol, convert,
  onSearchChange, onSearchSubmit, onHistoryClick, onShowHistoryChange,
  onFilterChange, onWorkLocationChange, onCommuteModeChange,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[400px] sm:min-h-[480px] md:h-[550px] flex items-center justify-center pt-20 px-4 bg-gray-50 border-b border-gray-100">
      <div className="container mx-auto relative z-10 text-center max-w-6xl">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
            {t.hero_h1} <em className="text-primary not-italic font-black">{t.hero_h1_em}</em>
          </h1>
          <p className="text-gray-500 font-medium text-lg md:text-xl max-w-2xl mx-auto mb-10">
            {t.hero_sub}
          </p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm w-full max-w-5xl mx-auto text-left">
            <div className="flex flex-col md:flex-row items-center gap-2">
              {/* Search Input */}
              <div className="flex-1 relative group w-full">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  className="w-full h-14 pl-14 pr-6 rounded-xl border-none bg-transparent text-gray-900 font-bold text-base outline-none focus:ring-0 transition-all placeholder:text-gray-400"
                  placeholder={t.search_placeholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
                  onFocus={() => onShowHistoryChange(true)}
                  onBlur={() => setTimeout(() => onShowHistoryChange(false), 200)}
                />
                {showSearchHistory && searchHistory.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      <div className="text-xs font-bold text-gray-400 px-3 py-2 mb-1">
                        {lang === 'th' ? 'ประวัติการค้นหาล่าสุด' : 'Recent Searches'}
                      </div>
                      {searchHistory.map((query, index) => (
                        <button
                          key={index}
                          onClick={() => onHistoryClick(query)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3 group/item"
                        >
                          <Clock className="w-4 h-4 text-gray-400 group-hover/item:text-primary transition-colors" />
                          <span className="text-gray-700 font-medium group-hover/item:text-primary transition-colors">{query}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Inline Quick Filters */}
              <div className="hidden lg:flex items-center gap-1.5 px-4 border-l border-gray-100 h-10 shrink-0">
                {/* Work Location Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn('rounded-xl h-10 px-4 font-bold text-gray-600 flex items-center gap-2 transition-all hover:bg-gray-50 outline-none', workLocation && 'text-primary bg-primary/5')}>
                      <MapPin className="w-4 h-4 opacity-60" />
                      {workLocation || (lang === 'th' ? 'ระบุที่ทำงาน' : 'Work Location')}
                      {filterState.maxCommute > 0 && <span className="text-[9px] bg-primary text-white rounded-full px-1.5 py-0.5 font-black">≤{filterState.maxCommute}m</span>}
                      <ChevronDown className="w-3 h-3 opacity-30" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[340px] p-6 rounded-2xl border border-gray-100 shadow-xl animate-in zoom-in-95 duration-200">
                    <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                      {lang === 'th' ? '🗺️ คำนวณเวลาเดินทางจากที่ทำงาน' : '🗺️ Commute Calculator'}
                    </Label>
                    <div className="space-y-4">
                      <Input
                        placeholder={lang === 'th' ? 'เช่น สยาม, อโศก, พระราม 9...' : 'e.g. Asok, Siam, Rama 9...'}
                        className="h-12 rounded-xl bg-gray-50 border-none font-bold"
                        value={workLocation}
                        onChange={(e) => onWorkLocationChange(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-2">
                        {(lang === 'th' ? ['สยาม', 'อโศก', 'พระราม 9', 'อารีย์', 'สีลม'] : ['Siam', 'Asoke', 'Rama 9', 'Ari', 'Silom']).map(loc => (
                          <button key={loc} type="button" onClick={() => onWorkLocationChange(loc)}
                            className={cn('px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all', workLocation === loc ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-primary/20')}>
                            {loc}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{lang === 'th' ? 'ประเภทการเดินทาง' : 'Transport Mode'}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {([['bts', '🚇', 'BTS/MRT'], ['car', '🚗', lang === 'th' ? 'รถยนต์' : 'Car'], ['moto', '🏍️', lang === 'th' ? 'มอเตอร์ไซค์' : 'Moto']] as const).map(([mode, icon, label]) => (
                            <button key={mode} type="button" onClick={() => onCommuteModeChange(mode as CommuteMode)}
                              className={cn('flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-black border-2 transition-all', commuteMode === mode ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-500 border-gray-100')}>
                              <span className="text-base">{icon}</span><span>{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      {workLocation && (
                        <>
                          <div className="space-y-2">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{lang === 'th' ? 'ระยะเวลาเดินทางสูงสุด' : 'Max Commute Time'}</p>
                            <div className="grid grid-cols-4 gap-1.5">
                              {[0, 15, 30, 45].map(min => (
                                <button key={min} type="button" onClick={() => onFilterChange({ maxCommute: min })}
                                  className={cn('py-2 rounded-xl text-[10px] font-black border-2 transition-all', filterState.maxCommute === min ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-100')}>
                                  {min === 0 ? (lang === 'th' ? 'ทั้งหมด' : 'Any') : `≤${min}m`}
                                </button>
                              ))}
                            </div>
                          </div>
                          <Button variant="ghost" onClick={() => { onWorkLocationChange(''); onFilterChange({ maxCommute: 0 }); }}
                            className="text-xs text-destructive hover:bg-destructive/5 w-full h-10 rounded-xl font-bold">
                            {lang === 'th' ? 'ล้างที่ตั้งที่ทำงาน' : 'Clear Work Location'}
                          </Button>
                        </>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Price Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn('rounded-xl h-10 px-4 font-bold text-gray-600 flex items-center gap-2 transition-all hover:bg-gray-50 outline-none', (filterState.priceMin > 0 || filterState.priceMax < 150000) && 'text-primary bg-primary/5')}>
                      <DollarSign className="w-4 h-4 opacity-60" /> {t.price} <ChevronDown className="w-3 h-3 opacity-30" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[340px] p-6 rounded-2xl border border-gray-100 shadow-xl animate-in zoom-in-95 duration-200">
                    <div className="space-y-6">
                      <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{t.price_range}</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold text-gray-400 px-1 uppercase">{t.min}</Label>
                          <Input type="number" placeholder="0" value={filterState.priceMin === 0 ? '' : filterState.priceMin} onChange={(e) => onFilterChange({ priceMin: Number(e.target.value) || 0 })} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-bold text-gray-400 px-1 uppercase">{t.max}</Label>
                          <Input type="number" placeholder={lang === 'th' ? 'ไม่จำกัด' : 'Any'} value={filterState.priceMax >= 150000 ? '' : filterState.priceMax} onChange={(e) => onFilterChange({ priceMax: Number(e.target.value) || 150000 })} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">{lang === 'th' ? 'ราคาแนะนำ' : 'Recommended'}</p>
                        <div className="flex flex-wrap gap-2">
                          {[10000, 20000, 30000, 50000].map(p => (
                            <button key={p} onClick={() => onFilterChange({ priceMax: p })}
                              className={cn('px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all', filterState.priceMax === p ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-primary/20')}>
                              {symbol}{convert(p).toLocaleString()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Bedrooms Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn('rounded-xl h-10 px-4 font-bold text-gray-600 flex items-center gap-2 transition-all hover:bg-gray-50 outline-none', filterState.minBedrooms > 0 && 'text-primary bg-primary/5')}>
                      <Bed className="w-4 h-4 opacity-60" /> {filterState.minBedrooms === 0 ? t.bedrooms : `${filterState.minBedrooms}+`} <ChevronDown className="w-3 h-3 opacity-30" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-6 rounded-2xl border border-gray-100 shadow-xl">
                    <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 block">{t.bedrooms}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map((num) => (
                        <button key={num} onClick={() => onFilterChange({ minBedrooms: num })}
                          className={cn('py-3 rounded-xl font-bold transition-all border-2', filterState.minBedrooms === num ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-primary/20')}>
                          {num === 0 ? 'Studio' : `${num}+`}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Amenities Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn('rounded-xl h-10 px-4 font-bold text-gray-600 flex items-center gap-2 transition-all hover:bg-gray-50 outline-none', filterState.amenities.length > 0 && 'text-primary bg-primary/5')}>
                      <PlusCircle className="w-4 h-4 opacity-60" /> {t.lifestyle_shortcuts} <ChevronDown className="w-3 h-3 opacity-30" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-6 rounded-2xl border border-gray-100 shadow-xl">
                    <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 block">{t.lifestyle_shortcuts}</Label>
                    <ScrollArea className="h-[300px] pr-2">
                      <div className="space-y-2">
                        {(Object.keys(t.amenities) as Amenity[]).map((key) => (
                          <div key={key} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => {
                              const amenities = filterState.amenities.includes(key)
                                ? filterState.amenities.filter(a => a !== key)
                                : [...filterState.amenities, key];
                              onFilterChange({ amenities });
                            }}>
                            <Checkbox checked={filterState.amenities.includes(key)} onCheckedChange={() => {}} />
                            <Label className="flex-1 font-bold text-gray-700 text-xs cursor-pointer">{t.amenities[key]}</Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Button */}
              <Button
                onClick={onSearchSubmit}
                disabled={isSearching}
                className="w-full md:w-auto h-14 px-8 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-base transition-all disabled:opacity-50 flex-shrink-0"
              >
                {isSearching ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Search className="w-6 h-6 mr-2" /> {t.search}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
