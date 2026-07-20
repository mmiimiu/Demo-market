'use client';

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getCategories, getPopularLocations } from './constants';

interface MegaMenuProps {
  isSolid: boolean;
  megaMenuOpen: boolean;
  openMegaMenu: () => void;
  closeMegaMenu: () => void;
  setMegaMenuOpen: (val: boolean) => void;
  t: any;
  formatPrice: (priceThb: number) => string;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  isSolid,
  megaMenuOpen,
  openMegaMenu,
  closeMegaMenu,
  setMegaMenuOpen,
  t,
  formatPrice,
}) => {
  const categories = getCategories(t);
  const popularLocations = getPopularLocations(t);

  return (
    <div className="relative" onMouseEnter={openMegaMenu} onMouseLeave={closeMegaMenu}>
      <button className={cn(
        "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-1",
        isSolid ? "text-gray-600 hover:bg-blue-50 hover:text-blue-700" : "text-white/80 hover:text-white hover:bg-white/10",
        megaMenuOpen && (isSolid ? "text-blue-700 bg-blue-50" : "text-white bg-white/10")
      )}>
        {t.nav_rent_stay || "เช่าที่พัก"}
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", megaMenuOpen && "rotate-180")} />
      </button>

      {megaMenuOpen && (
        <div
          onMouseEnter={openMegaMenu}
          onMouseLeave={closeMegaMenu}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[680px] bg-white rounded-2xl shadow-2xl shadow-blue-100/20 border border-gray-100 overflow-hidden"
          style={{
            transformOrigin: 'top center',
            animation: 'megaMenuIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <style>{`
            @keyframes megaMenuIn {
              from { opacity: 0; transform: translateX(-50%) scale(0.95); }
              to   { opacity: 1; transform: translateX(-50%) scale(1); }
            }
          `}</style>
          <div className="grid grid-cols-3 gap-0">
            {/* Col 1: หมวดหมู่ */}
            <div className="p-5 border-r border-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t.mega_categories || "หมวดหมู่"}</p>
              <div className="space-y-0.5">
                {categories.map(item => (
                  <Link
                    key={item.q}
                    href={`/listings?type=${item.q}`}
                    onClick={() => setMegaMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors duration-200">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 2: ทำเลยอดนิยม */}
            <div className="p-5 border-r border-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t.mega_popular_locations || "ทำเลยอดนิยม"}</p>
              <div className="space-y-0.5">
                {popularLocations.map(area => (
                  <Link
                    key={area.query}
                    href={`/listings?location=${encodeURIComponent(area.query)}`}
                    onClick={() => setMegaMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-blue-50 group transition-all duration-200"
                  >
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors duration-200 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {area.label}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">{area.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Col 3: ประกาศแนะนำ */}
            <div className="p-5 bg-gray-50/50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t.mega_featured || "ประกาศแนะนำ"}</p>
              <Link
                href="/listings?badge=featured"
                onClick={() => setMegaMenuOpen(false)}
                className="block rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="h-28 overflow-hidden">
                  <img src="/listing_condo_sukhumvit.png" alt="Featured" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3 bg-white">
                  <p className="text-[10px] font-black text-blue-600 mb-0.5">{t.featured_condo_tag || "แนะนำ · ใกล้ BTS"}</p>
                  <p className="text-xs font-bold text-gray-900 mb-1">{t.featured_condo_name || "คอนโด The Line สุขุมวิท"}</p>
                  <p className="text-sm font-black text-blue-700">{formatPrice(18000)}<span className="text-[10px] text-gray-400 font-normal">{t.per_month}</span></p>
                </div>
              </Link>
              <Link
                href="/listings"
                onClick={() => setMegaMenuOpen(false)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-bold text-primary hover:text-blue-700 transition-colors py-2"
              >
                {t.mega_view_all_listings || "ดูประกาศทั้งหมด"}
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
