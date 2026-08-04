"use client";

import React, { useState } from 'react';
import { Language, Amenity } from '@/lib/types';
import { translations } from '@/lib/translations';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { AmenitiesList } from './AmenitiesList';

interface FilterContentProps {
  lang: Language;
  currency: 'THB' | 'USD' | 'CNY';
  filterState: any;
  setFilterState: React.Dispatch<React.SetStateAction<any>>;
}

export const FilterContent: React.FC<FilterContentProps> = ({
  lang,
  currency,
  filterState,
  setFilterState,
}) => {
  const t = translations[lang] || translations.th;
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const toggleAmenity = (amenity: Amenity) => {
    setFilterState((prev: any) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a: any) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const symbols = { THB: '฿', USD: '$', CNY: '¥' };
  const rates = { THB: 1, USD: 0.028, CNY: 0.20 };
  const symbol = symbols[currency];
  
  const convert = (val: number) => Math.round(val * rates[currency]);

  return (
    <div className="space-y-8 lg:space-y-12">
      {/* Price Filter */}
      <div className="space-y-6 lg:space-y-8">
        <div className="flex flex-col gap-3">
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">{t.price}</h4>
          <div className="bg-primary/5 text-primary px-6 py-3 rounded-none text-base font-black w-fit border border-primary/10 shadow-sm">
            {symbol}{convert(filterState.priceMin).toLocaleString()} - {filterState.priceMax >= 150000 ? '∞' : `${symbol}${convert(filterState.priceMax).toLocaleString()}`}
          </div>
        </div>

        {/* Inputs for manual entry */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.min}</Label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 group-focus-within:text-primary transition-colors">{symbol}</span>
              <Input 
                type="number"
                value={filterState.priceMin === 0 ? '' : filterState.priceMin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterState((prev: any) => ({ ...prev, priceMin: Number(e.target.value) || 0 }))}
                className="h-14 pl-10 pr-2 rounded-none border-none bg-gray-100/50 text-base font-black focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-inner"
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t.max}</Label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 group-focus-within:text-primary transition-colors">{symbol}</span>
              <Input 
                type="number"
                value={filterState.priceMax >= 150000 ? '' : filterState.priceMax}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterState((prev: any) => ({ ...prev, priceMax: Number(e.target.value) || 150000 }))}
                className="h-14 pl-10 pr-2 rounded-none border-none bg-gray-100/50 text-base font-black focus-visible:ring-4 focus-visible:ring-primary/10 transition-all shadow-inner"
                placeholder={lang === 'th' ? "ไม่จำกัด" : "Any"}
              />
            </div>
          </div>
        </div>

        {/* Price Chips */}
        <div className="flex flex-wrap gap-2.5 pt-2">
          {[10000, 20000, 35000, 50000].map(p => (
            <button 
              key={p}
              type="button"
              onClick={() => setFilterState((prev: any) => ({ ...prev, priceMax: p }))}
              className={cn(
                "px-5 py-3.5 rounded-none text-xs font-black transition-all border-2 shadow-sm",
                filterState.priceMax === p 
                  ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105" 
                  : "bg-white text-gray-600 border-gray-50 hover:border-primary/20 hover:bg-primary/5"
              )}
            >
              {symbol}{convert(p).toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">{t.bedrooms}</h4>
        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => setFilterState((prev: any) => ({ ...prev, minBedrooms: num }))}
              className={cn(
                "py-3 rounded-none font-black text-xs border-2 transition-all shadow-sm text-center",
                (num === 4 ? filterState.minBedrooms >= 4 : filterState.minBedrooms === num)
                  ? "bg-primary text-white border-primary shadow-xl shadow-primary/10" 
                  : "bg-white text-gray-500 border-gray-50 hover:border-primary/20 hover:bg-primary/5"
              )}
            >
              {num === 0 ? 'Studio' : num === 4 ? (lang === 'th' ? '4+ ห้อง' : '4+ Rooms') : `${num} ${lang === 'th' ? 'ห้อง' : 'Room'}`}
            </button>
          ))}
        </div>
        {/* Custom Bedrooms Input */}
        <div className="flex items-center gap-3 pt-1">
          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 shrink-0">
            {lang === 'th' ? 'ระบุจำนวนห้อง:' : 'Custom Bed:'}
          </Label>
          <Input
            type="number"
            min="0"
            max="20"
            value={filterState.minBedrooms || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = Math.max(0, parseInt(e.target.value) || 0);
              setFilterState((prev: any) => ({ ...prev, minBedrooms: val }));
            }}
            className="h-10 text-xs font-black rounded-none border-gray-200 bg-gray-50 focus-visible:ring-primary/20"
            placeholder={lang === 'th' ? 'เช่น 4, 5, 6 ห้อง' : 'e.g. 4, 5, 6'}
          />
        </div>
      </div>

      {/* Bathrooms */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] px-1">{lang === 'th' ? 'ห้องน้ำ' : 'Bathrooms'}</h4>
        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => setFilterState((prev: any) => ({ ...prev, minBathrooms: num }))}
              className={cn(
                "py-3 rounded-none font-black text-xs border-2 transition-all shadow-sm text-center",
                (num === 4 ? (filterState.minBathrooms || 0) >= 4 : (filterState.minBathrooms || 0) === num)
                  ? "bg-primary text-white border-primary shadow-xl shadow-primary/10" 
                  : "bg-white text-gray-500 border-gray-50 hover:border-primary/20 hover:bg-primary/5"
              )}
            >
              {num === 0 ? (lang === 'th' ? 'ทั้งหมด' : 'Any') : num === 4 ? (lang === 'th' ? '4+ ห้อง' : '4+ Rooms') : `${num} ${lang === 'th' ? 'ห้อง' : 'Room'}`}
            </button>
          ))}
        </div>
        {/* Custom Bathrooms Input */}
        <div className="flex items-center gap-3 pt-1">
          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 shrink-0">
            {lang === 'th' ? 'ระบุจำนวน:' : 'Custom Bath:'}
          </Label>
          <Input
            type="number"
            min="0"
            max="10"
            value={filterState.minBathrooms || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = Math.max(0, parseInt(e.target.value) || 0);
              setFilterState((prev: any) => ({ ...prev, minBathrooms: val }));
            }}
            className="h-10 text-xs font-black rounded-none border-gray-200 bg-gray-50 focus-visible:ring-primary/20"
            placeholder={lang === 'th' ? 'เช่น 4, 5 ห้องน้ำ' : 'e.g. 4, 5'}
          />
        </div>
      </div>

      {/* Amenities List */}
      <AmenitiesList
        t={t}
        amenities={filterState.amenities}
        toggleAmenity={toggleAmenity}
        showAllAmenities={showAllAmenities}
        setShowAllAmenities={setShowAllAmenities}
      />
    </div>
  );
};
