"use client";

import React from 'react';
import { Language, Amenity } from '@/lib/types';
import { translations } from '@/lib/translations';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AmenitiesGrid } from './AmenitiesGrid';

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
  const t = translations[lang];

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
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <div className="flex flex-col gap-2 mb-4">
          <Label className="text-sm font-black">{t.price}</Label>
          <span className="text-primary font-black bg-primary/5 px-4 py-2 rounded-none text-sm w-fit shadow-sm border border-primary/10">
            {symbol}{convert(filterState.priceMin).toLocaleString()} - {filterState.priceMax >= 150000 ? '∞' : `${symbol}${convert(filterState.priceMax).toLocaleString()}`}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
           <div className="space-y-2">
             <Label className="text-[10px] font-black text-gray-400 uppercase px-1">{t.min}</Label>
             <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">{symbol}</span>
               <Input 
                type="number"
                value={filterState.priceMin === 0 ? '' : filterState.priceMin}
                onChange={(e) => setFilterState((prev: any) => ({ ...prev, priceMin: Number(e.target.value) || 0 }))}
                className="h-10 pl-8 rounded-none bg-gray-50 border-none font-bold text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                placeholder="0"
               />
             </div>
           </div>
           <div className="space-y-2">
             <Label className="text-[10px] font-black text-gray-400 uppercase px-1">{t.max}</Label>
             <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">{symbol}</span>
               <Input 
                type="number"
                value={filterState.priceMax >= 150000 ? '' : filterState.priceMax}
                onChange={(e) => setFilterState((prev: any) => ({ ...prev, priceMax: Number(e.target.value) || 150000 }))}
                className="h-10 pl-8 rounded-none bg-gray-50 border-none font-bold text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                placeholder={lang === 'th' ? "ไม่จำกัด" : "Any"}
               />
             </div>
           </div>
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <Label className="text-sm font-bold mb-3 block">{t.bedrooms}</Label>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setFilterState((prev: any) => ({ ...prev, minBedrooms: num }))}
              className={cn(
                "py-2 rounded-none font-bold transition-all border-2 text-xs",
                filterState.minBedrooms === num 
                  ? "bg-primary text-white border-primary shadow-lg" 
                  : "bg-white border-gray-100 text-gray-500 hover:border-primary/30"
              )}
            >
              {num === 0 ? 'Studio' : `${num} ${lang === 'th' ? 'ห้อง' : 'Room'}`}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <Label className="text-sm font-bold mb-3 block">{lang === 'th' ? 'ห้องน้ำ' : 'Bathrooms'}</Label>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setFilterState((prev: any) => ({ ...prev, minBathrooms: num }))}
              className={cn(
                "py-2 rounded-none font-bold transition-all border-2 text-xs",
                (filterState.minBathrooms || 0) === num 
                  ? "bg-primary text-white border-primary shadow-lg" 
                  : "bg-white border-gray-100 text-gray-500 hover:border-primary/30"
              )}
            >
              {num === 0 ? (lang === 'th' ? 'ทั้งหมด' : 'Any') : `${num} ${lang === 'th' ? 'ห้อง' : 'Room'}`}
            </button>
          ))}
        </div>
      </div>

      {/* Area */}
      <div>
        <Label className="text-sm font-bold mb-3 block">{t.area} ({t.sqm})</Label>
        <div className="grid grid-cols-2 gap-2">
          {[0, 25, 50, 80].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setFilterState((prev: any) => ({ ...prev, minSqm: num }))}
              className={cn(
                "py-2 rounded-none font-bold transition-all border-2 text-xs",
                filterState.minSqm === num 
                  ? "bg-primary text-white border-primary shadow-lg" 
                  : "bg-white border-gray-100 text-gray-500 hover:border-primary/30"
              )}
            >
               {num === 0 ? t.all : `${num}+ ${t.sqm}`}
            </button>
          ))}
        </div>
      </div>

       {/* Pet Friendly */}
       <div className="flex items-center justify-between p-3 bg-gray-50 border border-slate-100 rounded-none">
         <div className="space-y-0.5">
           <Label className="text-sm font-bold block">{lang === 'th' ? '🐾 อนุญาตให้เลี้ยงสัตว์' : '🐾 Pet-Friendly'}</Label>
           <span className="text-[10px] font-bold text-gray-400">{lang === 'th' ? 'แสดงเฉพาะห้องที่ต้อนรับสัตว์เลี้ยง' : 'Only show listings welcoming pets'}</span>
         </div>
         <input
           type="checkbox"
           checked={filterState.petFriendly || false}
           onChange={(e) => setFilterState((prev: any) => ({ ...prev, petFriendly: e.target.checked }))}
           className="w-5 h-5 accent-primary cursor-pointer"
         />
       </div>

       {/* Furnished */}
       <div>
         <Label className="text-sm font-bold mb-3 block">{lang === 'th' ? '🛋️ การตกแต่งเฟอร์นิเจอร์' : '🛋️ Furnishing'}</Label>
         <div className="grid grid-cols-3 gap-2">
           {([['any', lang === 'th' ? 'ทั้งหมด' : 'Any'], ['yes', lang === 'th' ? 'แต่งครบ' : 'Furnished'], ['no', lang === 'th' ? 'ห้องเปล่า' : 'Unfurnished']] as const).map(([val, label]) => (
             <button
               key={val}
               type="button"
               onClick={() => setFilterState((prev: any) => ({ ...prev, furnished: val }))}
               className={cn(
                 "py-2 rounded-none font-bold transition-all border-2 text-xs",
                 (filterState.furnished || 'any') === val 
                   ? "bg-primary text-white border-primary shadow-lg" 
                   : "bg-white border-gray-100 text-gray-500 hover:border-primary/30"
               )}
             >
               {label}
             </button>
           ))}
         </div>
       </div>

       {/* Floor Level */}
       <div>
         <Label className="text-sm font-bold mb-3 block">{lang === 'th' ? '🏢 ชั้นที่ต้องการ' : '🏢 Floor Range'}</Label>
         <div className="grid grid-cols-2 gap-3">
           <div className="space-y-1">
             <Label className="text-[9px] font-black text-gray-400 uppercase">{lang === 'th' ? 'ชั้นต่ำสุด' : 'Min Floor'}</Label>
             <Input 
               type="number"
               value={filterState.minFloor === 0 ? '' : filterState.minFloor}
               onChange={(e) => setFilterState((prev: any) => ({ ...prev, minFloor: Number(e.target.value) || 0 }))}
               className="h-10 rounded-none bg-gray-50 border-none font-bold text-xs"
               placeholder="0"
             />
           </div>
           <div className="space-y-1">
             <Label className="text-[9px] font-black text-gray-400 uppercase">{lang === 'th' ? 'ชั้นสูงสุด' : 'Max Floor'}</Label>
             <Input 
               type="number"
               value={filterState.maxFloor >= 50 ? '' : filterState.maxFloor}
               onChange={(e) => setFilterState((prev: any) => ({ ...prev, maxFloor: Number(e.target.value) || 50 }))}
               className="h-10 rounded-none bg-gray-50 border-none font-bold text-xs"
               placeholder="50"
             />
           </div>
         </div>
       </div>

       {/* BTS Radius */}
       <div>
         <Label className="text-sm font-bold mb-3 block">{lang === 'th' ? '🚇 ระยะห่างรถไฟฟ้า (BTS/MRT)' : '🚇 Distance to Station'}</Label>
         <div className="grid grid-cols-4 gap-1.5">
           {([['any', lang === 'th' ? 'ไม่จำกัด' : 'Any'], ['300', '300m'], ['500', '500m'], ['1000', '1km']] as const).map(([val, label]) => (
             <button
               key={val}
               type="button"
               onClick={() => setFilterState((prev: any) => ({ ...prev, btsRadius: val }))}
               className={cn(
                 "py-2 rounded-none font-bold transition-all border-2 text-[10px]",
                 (filterState.btsRadius || 'any') === val 
                   ? "bg-primary text-white border-primary shadow-lg" 
                   : "bg-white border-gray-100 text-gray-500 hover:border-primary/30"
               )}
             >
               {label}
             </button>
           ))}
         </div>
       </div>

      {/* Amenities Grid */}
      <AmenitiesGrid
        t={t}
        amenities={filterState.amenities}
        toggleAmenity={toggleAmenity}
      />
    </div>
  );
};
