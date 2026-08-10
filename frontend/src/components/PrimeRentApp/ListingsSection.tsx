'use client';

import React, { useState } from 'react';
import { X, FilterX, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PropertyCard } from '../PropertyCard';
import { cn } from '@/lib/utils';
import type { Language, Property, Amenity } from '@/lib/types';
import type { FilterState } from './types';
import { AdvancedFilterModal } from '../search/AdvancedFilterModal';
import { Container } from '@/components/ui/container';
import { PropertyDetail } from '../PropertyDetail';

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
  type: string;
  extra?: string;
}

interface ListingsSectionProps {
  lang: Language;
  currency: 'THB' | 'USD' | 'CNY';
  t: any;
  filteredProperties: Property[];
  filterState: FilterState;
  activeCategoryIds: string[];
  savedIds: number[];
  CATEGORIES: Category[];
  workLocation: string;
  onResetFilters: () => void;
  onCategoryClick: (id: string) => void;
  onRemoveAmenity: (a: Amenity) => void;
  onSortChange: (sort: FilterState['sort']) => void;
  onViewDetails: (p: Property) => void;
  onToggleSave: (id: number) => void;
  onQuickChat: (p: Property) => void;
  onCompare?: (p: Property) => void;
  isInCompare?: (id: string | number) => boolean;
  canCompare?: boolean;
  onFilterChange: (updates: Partial<FilterState>) => void;
}

export function ListingsSection({
  lang, currency, t, filteredProperties, filterState, activeCategoryIds, savedIds,
  CATEGORIES, workLocation, onResetFilters, onCategoryClick, onRemoveAmenity,
  onSortChange, onViewDetails, onToggleSave, onQuickChat,
  onCompare, isInCompare, canCompare, onFilterChange
}: ListingsSectionProps) {
  const hasActiveFilters = filterState.amenities.length > 0 || filterState.minBedrooms > 0 ||
    filterState.minSqm > 0 || filterState.priceMax < 150000 || !activeCategoryIds.includes('all');

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleViewDetails = (p: Property) => {
    setSelectedProperty(p);
  };

  const closeSidePanel = () => {
    setSelectedProperty(null);
  };

  return (
    <section id="listings" className="py-16 sm:py-20 md:py-24 pb-24 lg:pb-24 relative overflow-hidden bg-[#FAF9F5]/40">
      <Container>
        <div className="flex flex-col gap-12">
          <div className="flex-1 space-y-8">
            {/* Active Filter Chips */}
            <div className="flex flex-wrap items-center gap-2.5">
              {hasActiveFilters && (
                <Button variant="ghost" onClick={onResetFilters}
                  className="text-[10px] font-black text-[#E55B3C] gap-2 rounded-xl bg-[#FFF5F2] hover:bg-[#FFF5F2]/80 px-4 h-9 border border-[#FFE2DA] uppercase tracking-widest transition-all">
                  <FilterX className="w-3.5 h-3.5" /> {t.reset_filters}
                </Button>
              )}
              {activeCategoryIds.filter(id => id !== 'all').map(id => (
                <Badge key={id} className="px-4 py-2 rounded-xl font-black bg-[#1C2030] text-white border-none gap-2 text-[10px] uppercase tracking-widest shadow-lg shadow-black/5 animate-in zoom-in-95">
                  {CATEGORIES.find(c => c.id === id)?.label}
                  <button onClick={() => onCategoryClick(id)} className="p-0.5 rounded-full hover:bg-white/20 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filterState.amenities.map(a => (
                <Badge key={a} variant="outline" className="px-4 py-2 rounded-xl bg-white text-[#1C2030] border border-[#E8E5DD] shadow-sm gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-[#FAF9F5] transition-all">
                  {t.amenities[a]}
                  <button onClick={() => onRemoveAmenity(a)} className="p-0.5 rounded-full hover:bg-slate-100 text-gray-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Header + Sort */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-black text-[#1C2030] tracking-tight">
                {t.recommended_listings.replace('{count}', filteredProperties.length.toString())}
              </h2>
              <div className="flex items-center gap-3">
                <select
                  className="bg-white border border-[#E8E5DD] rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-[#1C2030]/10 transition-all appearance-none cursor-pointer pr-10"
                  value={filterState.sort}
                  onChange={(e) => onSortChange(e.target.value as FilterState['sort'])}
                >
                  <option value="latest">{t.sort_latest}</option>
                  <option value="low-high">{t.sort_price_low}</option>
                  <option value="high-low">{t.sort_price_high}</option>
                </select>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAdvancedFiltersOpen(true)}
                  className="bg-white border-[#E8E5DD] rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 gap-2 h-auto"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {lang === 'th' ? 'กรองแบบละเอียด' : lang === 'cn' ? '高级筛选' : 'Advanced Filters'}
                </Button>
              </div>
            </div>

            {/* Property Grid */}
            {filteredProperties.length === 0 ? (
              <div className="py-32 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <h3 className="text-2xl font-black text-gray-900 mb-3">{t.no_results}</h3>
                <Button onClick={onResetFilters} className="rounded-xl px-12 h-14 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm shadow-sm">{t.reset_filters}</Button>
              </div>
            ) : (
              <div className="flex gap-8 relative">
                {/* Grid Area - shrinks if side panel is open */}
                <div className={cn(
                  "grid gap-8 transition-all duration-500 w-full",
                  selectedProperty ? "hidden lg:grid lg:grid-cols-2 lg:w-1/2 xl:w-7/12" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                )}>
                  {filteredProperties.map((property, idx) => (
                    <div key={property.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
                      <PropertyCard
                        property={property} lang={lang} currency={currency}
                        onViewDetails={() => handleViewDetails(property)}
                        isSaved={savedIds.includes(property.id as number)}
                        onToggleSave={onToggleSave}
                        onQuickChat={onQuickChat}
                        workLocation={workLocation}
                        onCompare={onCompare}
                        isInCompare={isInCompare ? isInCompare(property.id) : false}
                        canCompare={canCompare}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Side Panel Area */}
                {selectedProperty && (
                  <div className="w-full lg:w-1/2 xl:w-5/12 animate-in slide-in-from-right-16 fade-in duration-500 fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto bg-gray-50 lg:bg-transparent overflow-y-auto h-screen lg:h-auto pb-24 lg:pb-0">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24 min-h-[80vh]">
                      <div className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur-md rounded-full shadow-sm">
                        <Button variant="ghost" size="icon" onClick={closeSidePanel} className="hover:bg-gray-100 rounded-full">
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                      <PropertyDetail 
                        property={selectedProperty} 
                        lang={lang} 
                        onClose={closeSidePanel}
                        isSaved={savedIds.includes(selectedProperty.id as number)}
                        onToggleSave={onToggleSave}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Modals & Popups */}
        <AdvancedFilterModal 
          isOpen={isAdvancedFiltersOpen}
          onClose={() => setIsAdvancedFiltersOpen(false)}
          lang={lang}
          filterState={filterState}
          onFilterChange={onFilterChange}
        />
      </Container>
    </section>
  );
}
