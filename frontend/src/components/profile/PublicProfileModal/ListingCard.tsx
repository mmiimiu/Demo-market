import React from 'react';
import { cn } from '@/lib/utils';
import { Property } from '@/lib/types';
import { Language } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface ListingCardProps {
  item: Property;
  lang: Language;
  isMatch?: boolean;
}

export function ListingCard({ item, lang, isMatch = false }: ListingCardProps) {
  return (
    <div className={cn(
      "flex gap-3 border transition-all hover:shadow-md group",
      isMatch ? "border-green-100 bg-green-50/30" : "border-gray-100 bg-white"
    )}>
      <div className="w-20 h-20 overflow-hidden shrink-0">
        <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
      </div>
      <div className="flex-1 min-w-0 py-2.5 pr-2.5">
        {isMatch && <Badge className="bg-green-500 text-white text-[8px] px-1.5 py-0 border-none font-bold mb-1 rounded-none">MATCH</Badge>}
        <h4 className="font-bold text-gray-900 text-xs truncate">{lang === 'th' ? item.name : item.nameEn}</h4>
        <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{lang === 'th' ? item.location : item.locationEn}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-sm font-bold text-primary">฿{item.price.toLocaleString()}</span>
          <span className="text-[9px] font-bold text-gray-400">{item.sqm} sqm</span>
        </div>
      </div>
    </div>
  );
}
