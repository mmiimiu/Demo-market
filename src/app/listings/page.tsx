"use client";

import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Language, Property, Amenity } from '@/lib/types';
import { translations } from '@/lib/translations';
import { mockProperties } from '@/lib/properties';
import { 
  Search, 
  SlidersHorizontal, 
  FilterX, 
  X,
  BellRing,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyModal } from '@/components/PropertyModal';
import { FilterDrawer } from '@/components/FilterDrawer';
import { SidebarFilters } from '@/components/SidebarFilters';
import { Navbar } from '@/components/layout';
import { smartSearchAction } from '@/app/actions/search';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePropertyComparison } from '@/hooks/usePropertyComparison';
import { CompareDrawer } from '@/components/shared/CompareDrawer';
import { MapView } from '@/components/listings/MapView';
import { Map, List } from 'lucide-react';

interface FilterState {
  priceMin: number;
  priceMax: number;
  minBedrooms: number;
  minSqm: number;
  amenities: Amenity[];
  sort: 'latest' | 'low-high' | 'high-low';
  petFriendly?: boolean;
  furnished?: 'any' | 'yes' | 'no';
  minFloor?: number;
  maxFloor?: number;
  btsRadius?: 'any' | '300' | '500' | '1000';
}

interface Category {
  id: string;
  label: string;
  type: 'all' | 'condo' | 'house' | 'apartment';
  extra?: 'dorm' | 'villa' | 'studio';
}

function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    lang, setLang, currency, setCurrency, savedIds, toggleSave,
    workLocation, setWorkLocation, commuteMode, setCommuteMode 
  } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>(['all']);
  const [filterState, setFilterState] = useState<FilterState>({
    priceMin: 0,
    priceMax: 150000,
    minBedrooms: 0,
    minSqm: 0,
    amenities: [],
    sort: 'latest',
    petFriendly: false,
    furnished: 'any',
    minFloor: 0,
    maxFloor: 50,
    btsRadius: 'any',
  });
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeAISearchQuery, setActiveAISearchQuery] = useState<string | null>(null);
  const lastProcessedQueryRef = useRef<string | null>(null);
  
  // Smart Search Preferences from Onboarding
  const [searchPreferences, setSearchPreferences] = useState<{location?: string; maxBudget?: number; minBudget?: number} | null>(null);

  // ── Property Comparison (Feature 6.6) ───────────────────────────────────────
  const {
    compareList,
    addToCompare,
    removeFromCompare,
    isInCompare,
    clearCompare,
    isDrawerOpen: isCompareOpen,
    closeDrawer: closeCompare,
    canAdd: canCompare,
  } = usePropertyComparison();

  const handleCompare = (property: Property) => {
    if (isInCompare(property.id)) {
      removeFromCompare(property.id);
    } else {
      addToCompare(property);
    }
  };

  const t = translations[lang] || translations.th;
  const isThai = lang === 'th';

  const CATEGORIES: Category[] = [
    { id: 'all', label: t.all, type: 'all' },
    { id: 'condo', label: t.cat_condo, type: 'condo' },
    { id: 'house', label: t.cat_house, type: 'house' },
    { id: 'apartment', label: t.cat_apartment, type: 'apartment' },
    { id: 'dorm', label: t.cat_dorm, type: 'apartment', extra: 'dorm' },
    { id: 'villa', label: t.cat_villa, type: 'house', extra: 'villa' },
    { id: 'studio', label: t.cat_studio, type: 'all', extra: 'studio' },
  ];

  const symbols = { THB: '฿', USD: '$', CNY: '¥' };

  const rates = { THB: 1, USD: 0.028, CNY: 0.20 };
  const convertedMaxPrice = Math.round(filterState.priceMax * rates[currency]);

  const filteredProperties = useMemo(() => {
    let filtered = mockProperties;

    // Filter by category
    if (!activeCategoryIds.includes('all')) {
      filtered = filtered.filter(p => {
        if (activeCategoryIds.includes('studio')) {
          return p.bed === 0;
        }
        return activeCategoryIds.some(catId => {
          const cat = CATEGORIES.find(c => c.id === catId);
          if (!cat) return false;
          if (cat.extra === 'dorm') return p.type === 'apartment' && p.name.toLowerCase().includes('dorm');
          if (cat.extra === 'villa') return p.type === 'house' && p.name.toLowerCase().includes('villa');
          return p.type === cat.type;
        });
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.nameEn.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.locationEn.toLowerCase().includes(query)
      );
    }

    // Filter by price
    filtered = filtered.filter(p => p.price >= filterState.priceMin && p.price <= filterState.priceMax);

    // Filter by bedrooms
    if (filterState.minBedrooms > 0) {
      filtered = filtered.filter(p => p.bed >= filterState.minBedrooms);
    }

    // Filter by sqm
    if (filterState.minSqm > 0) {
      filtered = filtered.filter(p => p.sqm >= filterState.minSqm);
    }

    // Filter by amenities
    if (filterState.amenities.length > 0) {
      filtered = filtered.filter(p => 
        filterState.amenities.every(amenity => p.amenities.includes(amenity))
      );
    }

    // Filter by Pet-Friendly
    if (filterState.petFriendly) {
      filtered = filtered.filter(p => p.amenities.includes('pet') || p.name.toLowerCase().includes('pet') || p.name.toLowerCase().includes('สัตว์เลี้ยง'));
    }

    // Filter by Furnished
    if (filterState.furnished && filterState.furnished !== 'any') {
      if (filterState.furnished === 'yes') {
        filtered = filtered.filter(p => p.amenities.includes('furnished'));
      } else {
        filtered = filtered.filter(p => !p.amenities.includes('furnished'));
      }
    }

    // Filter by Floor
    if (filterState.minFloor !== undefined || filterState.maxFloor !== undefined) {
      filtered = filtered.filter(p => {
        // mock floor resolving or fallback
        const floor = (p as any).floor ?? 5;
        return floor >= (filterState.minFloor ?? 0) && floor <= (filterState.maxFloor ?? 50);
      });
    }

    // Filter by BTS Radius
    if (filterState.btsRadius && filterState.btsRadius !== 'any') {
      const radiusLimit = parseInt(filterState.btsRadius, 10);
      filtered = filtered.filter(p => {
        // Mock distance check
        const dist = (p as any).btsDistance ?? 400;
        return dist <= radiusLimit;
      });
    }

    // Sort
    if (filterState.sort === 'low-high') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (filterState.sort === 'high-low') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered = filtered.sort((a, b) => {
        const idA = typeof a.id === 'string' ? parseInt(a.id) : a.id;
        const idB = typeof b.id === 'string' ? parseInt(b.id) : b.id;
        return idB - idA;
      });
    }

    return filtered;
  }, [filterState, searchQuery, activeCategoryIds, CATEGORIES]);

  const handleSmartSearch = async (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const query = customQuery || searchQuery;
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const results = await smartSearchAction({ query });
      setActiveAISearchQuery(query);
      
      // Apply parsed filters to state
      setFilterState((prev: FilterState) => ({
        ...prev,
        priceMin: results.priceMin !== undefined ? results.priceMin : 0,
        priceMax: results.priceMax !== undefined ? results.priceMax : 150000,
        minBedrooms: results.minBedrooms !== undefined ? results.minBedrooms : 0,
        minSqm: results.minSqm !== undefined ? results.minSqm : 0,
        amenities: results.amenities !== undefined ? results.amenities : [],
      }));

      if (results.type && results.type.length > 0) {
        setActiveCategoryIds(results.type);
      } else {
        setActiveCategoryIds(['all']);
      }

      if (results.location && results.location.length > 0) {
        setSearchQuery(results.location[0]);
      } else {
        const isLongSentence = query.length > 25 || query.split(/\s+/).length > 3;
        if (isLongSentence) {
          setSearchQuery("");
        } else {
          setSearchQuery(query);
        }
      }
      
      if (query) {
        try {
          const raw = localStorage.getItem('primerent_saved_searches');
          const existing = raw ? JSON.parse(raw) : [];
          const filtered = existing.filter((a: any) => a.query !== query);
          const entry = {
            id: `search_${Date.now()}`,
            query,
            categories: activeCategoryIds,
            priceMin: filterState.priceMin,
            priceMax: filterState.priceMax,
            minBedrooms: filterState.minBedrooms,
            minSqm: filterState.minSqm,
            amenities: filterState.amenities,
            savedAt: new Date().toISOString(),
            active: true
          };
          localStorage.setItem('primerent_saved_searches', JSON.stringify([entry, ...filtered].slice(0, 5)));
        } catch { /* ignore */ }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveSearchAlert = () => {
    const searchAlert = {
      id: `alert_${Date.now()}`,
      query: searchQuery,
      categories: activeCategoryIds,
      priceMin: filterState.priceMin,
      priceMax: filterState.priceMax,
      minBedrooms: filterState.minBedrooms,
      minSqm: filterState.minSqm,
      amenities: filterState.amenities,
      savedAt: new Date().toISOString(),
      active: true
    };

    const existingAlerts = JSON.parse(localStorage.getItem('primerent_saved_searches') || '[]');
    existingAlerts.push(searchAlert);
    localStorage.setItem('primerent_saved_searches', JSON.stringify(existingAlerts));

    toast({
      title: isThai ? 'บันทึกแจ้งเตือนการค้นหาสำเร็จ' : 'Search Alert Saved',
      description: isThai 
        ? `ระบบจะแจ้งเตือนเมื่อมีอสังหาริมทรัพย์ใหม่ที่ตรงกับการค้นหานี้` 
        : `You will be alerted when new properties match these filters.`
    });
  };

  const handleCategoryClick = (catId: string) => {
    setActiveCategoryIds(prev => {
      if (catId === 'all') return ['all'];
      if (prev.includes(catId)) {
        const newIds = prev.filter(id => id !== catId);
        return newIds.length === 0 ? ['all'] : newIds;
      }
      return prev.filter(id => id !== 'all').concat(catId);
    });
  };

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (!activeCategoryIds.includes('all') && activeCategoryIds.length > 0) {
      params.set('type', activeCategoryIds[0]);
    }
    if (filterState.priceMin > 0) params.set('priceMin', filterState.priceMin.toString());
    if (filterState.priceMax < 150000) params.set('priceMax', filterState.priceMax.toString());
    
    const queryString = params.toString();
    lastProcessedQueryRef.current = searchQuery;
    router.push(queryString ? `/listings?${queryString}` : '/listings', { scroll: false });
  }, [searchQuery, activeCategoryIds, filterState.priceMin, filterState.priceMax, router]);

  const removeAmenity = (amenity: Amenity) => {
    setFilterState(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const resetFilters = () => {
    setFilterState({
      priceMin: 0,
      priceMax: 150000,
      minBedrooms: 0,
      minSqm: 0,
      amenities: [],
      sort: 'latest',
      petFriendly: false,
      furnished: 'any',
      minFloor: 0,
      maxFloor: 50,
      btsRadius: 'any',
    });
    setActiveCategoryIds(['all']);
    setSearchQuery('');
    setActiveAISearchQuery(null);
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('primerent_recent_searches');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  useEffect(() => {
    const savedSearches = localStorage.getItem('primerent_recent_searches');
    if (savedSearches) setRecentSearches(JSON.parse(savedSearches));

    // Initialize state from URL params
    const queryParam = searchParams.get('q');
    const typeParam = searchParams.get('type');
    const priceMinParam = searchParams.get('priceMin');
    const priceMaxParam = searchParams.get('priceMax');
    const locationParam = searchParams.get('location');
    const openIdParam = searchParams.get('open'); // ⭐ Auto-open property modal from notification

    if (typeParam && typeParam !== 'all') setActiveCategoryIds([typeParam]);
    if (priceMinParam) setFilterState(prev => ({ ...prev, priceMin: parseInt(priceMinParam) || 0 }));
    if (priceMaxParam) setFilterState(prev => ({ ...prev, priceMax: parseInt(priceMaxParam) || 150000 }));
    if (locationParam) setSearchQuery(locationParam);

    // ⭐ Auto-open property modal when ?open=<id> is in URL (e.g. from Wishlist notification)
    if (openIdParam) {
      const targetId = parseInt(openIdParam, 10);
      import('@/lib/properties').then(({ mockProperties }) => {
        const found = mockProperties.find((p: any) => p.id === targetId || p.id === openIdParam);
        if (found) setSelectedProperty(found);
      });
    }

    if (queryParam) {
      setSearchQuery(queryParam);
      if (queryParam !== lastProcessedQueryRef.current) {
        lastProcessedQueryRef.current = queryParam;
        handleSmartSearch(undefined, queryParam);
      }
    }

    // Load search preferences from Onboarding
    const prefs = localStorage.getItem('primerent_search_preferences');
    if (prefs) {
      setSearchPreferences(JSON.parse(prefs));
    }
  }, [searchParams]);

  return (
    <main>
      <Navbar 
        scrolled={scrolled}
        showMiniSearch={false}
      />

      {/* ─── Smart Search Recommendations ───────────────────────────── */}
      {searchPreferences && !searchQuery && (
        <section className="pt-[80px] bg-indigo-50/50 border-b border-indigo-100">
          <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-6 py-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">✨</span>
              <h2 className="text-lg font-black text-indigo-900">
                {isThai ? 'แนะนำสำหรับคุณ (จากข้อมูลที่คุณให้ไว้)' : 'Recommended for You (Based on your preferences)'}
              </h2>
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar">
              {mockProperties
                .filter(p => 
                  (!searchPreferences.maxBudget || p.price <= searchPreferences.maxBudget) &&
                  (!searchPreferences.location || p.location.includes(searchPreferences.location) || p.locationEn.toLowerCase().includes(searchPreferences.location.toLowerCase()))
                )
                .slice(0, 4)
                .map(p => (
                  <div key={p.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] snap-start shrink-0">
                    <PropertyCard 
                      property={p}
                      lang={lang}
                      currency={currency}
                      onViewDetails={setSelectedProperty}
                      isSaved={savedIds.includes(p.id as number)}
                      onToggleSave={toggleSave}
                      onCompare={handleCompare}
                      isInCompare={isInCompare(p.id)}
                      canCompare={canCompare}
                    />
                  </div>
              ))}
            </div>
          </div>
        </section>
      )}      {/* ─── Hero Search Section ─────────────────────────────────────── */}
      <section className="pt-[64px] sm:pt-[68px] pb-6 bg-white border-b border-gray-100">
        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="pt-6 pb-2 flex flex-col items-center gap-4">
            {/* Result count row */}
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-gray-200" />
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                {isThai
                  ? `ประกาศทั้งหมด · ${filteredProperties.length.toLocaleString()} รายการ`
                  : `All Listings · ${filteredProperties.length.toLocaleString()} results`}
              </p>
              <div className="h-px w-8 bg-gray-200" />
            </div>

            {/* Hero Search Bar + Filter Button */}
            <div className="w-full max-w-3xl flex gap-1.5 sm:gap-2">
              {/* Search Form */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSmartSearch(e); }}
                className="flex-1 relative"
              >
                <div className={cn(
                  "flex items-center bg-white border rounded-xl sm:rounded-2xl transition-all duration-300 shadow-sm",
                  "border-[#E2E8F0] hover:border-[#2563EB] focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-[#2563EB]/5"
                )}>
                  <div className="flex-1 flex items-center px-3 sm:px-5 gap-2 sm:gap-3">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-gray-400" />
                    <input
                      type="text"
                      autoComplete="off"
                      className="flex-1 bg-transparent outline-none border-none text-[11px] sm:text-sm h-10 sm:h-14 font-medium placeholder:text-gray-400 text-gray-800 w-full min-w-0"
                      placeholder={isThai ? 'ค้นหาพื้นที่ หรือสถานที่...' : 'Search area or location...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                      </button>
                    )}
                  </div>

                  {/* Inline Work Location Filter */}
                  <div className="hidden lg:flex items-center gap-1.5 px-4 border-l border-[#E2E8F0] h-10 shrink-0">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className={cn('rounded-full h-10 px-4 font-bold text-gray-600 flex items-center gap-2 transition-all hover:bg-gray-50 outline-none', workLocation && 'text-[#2563EB] bg-[#2563EB]/5')}>
                          <MapPin className="w-4 h-4 opacity-60" />
                          <span className="text-xs truncate max-w-[120px] font-bold text-gray-600">
                            {workLocation || (isThai ? 'ระบุที่ทำงาน' : 'Work Location')}
                          </span>
                          <ChevronDown className="w-3 h-3 opacity-30 shrink-0" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[340px] p-6 rounded-xl border border-[#E2E8F0] bg-white shadow-2xl z-50">
                        <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                          {isThai ? '🗺️ คำนวณเวลาเดินทางจากที่ทำงาน' : '🗺️ Commute Calculator'}
                        </Label>
                        <div className="space-y-4">
                          <Input
                            placeholder={isThai ? 'เช่น สยาม, อโศก, พระราม 9...' : 'e.g. Asok, Siam, Rama 9...'}
                            className="h-12 rounded-xl bg-gray-50 border border-gray-200 font-bold"
                            value={workLocation}
                            onChange={(e) => setWorkLocation(e.target.value)}
                          />
                          <div className="flex flex-wrap gap-2">
                            {(isThai ? ['สยาม', 'อโศก', 'พระราม 9', 'อารีย์', 'สีลม'] : ['Siam', 'Asoke', 'Rama 9', 'Ari', 'Silom']).map(loc => (
                              <button key={loc} type="button" onClick={() => setWorkLocation(loc)}
                                className={cn('px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all', workLocation === loc ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm' : 'bg-white text-gray-500 border-[#E2E8F0] hover:border-[#2563EB]/50')}>
                                {loc}
                              </button>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{isThai ? 'ประเภทการเดินทาง' : 'Transport Mode'}</p>
                            <div className="grid grid-cols-3 gap-2">
                              {([['bts', '🚇', 'BTS/MRT'], ['car', '🚗', isThai ? 'รถยนต์' : 'Car'], ['moto', '🏍️', isThai ? 'มอเตอร์ไซค์' : 'Moto']] as const).map(([mode, icon, label]) => (
                                <button key={mode} type="button" onClick={() => setCommuteMode(mode)}
                                  className={cn('flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all', commuteMode === mode ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm' : 'bg-white text-gray-500 border-[#E2E8F0]')}>
                                  <span className="text-base">{icon}</span><span>{label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          {workLocation && (
                            <Button variant="ghost" onClick={() => setWorkLocation('')}
                              className="text-xs text-destructive hover:bg-destructive/5 w-full h-10 rounded-xl font-bold">
                              {isThai ? 'ล้างที่ตั้งที่ทำงาน' : 'Clear Work Location'}
                            </Button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSearching}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg sm:rounded-xl h-8 sm:h-10 my-1 sm:my-2 mr-1 sm:mr-2 px-3 sm:px-6 font-black text-[10px] sm:text-xs gap-1 sm:gap-2 shrink-0 transition-all shadow-sm"
                  >
                    {isSearching ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline sm:inline">{isThai ? 'ค้นหา' : 'Search'}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Filter Button */}
              <FilterDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                lang={lang}
                currency={currency}
                filterState={filterState}
                setFilterState={setFilterState}
                onReset={resetFilters}
              >
                <Button
                  type="button"
                  onClick={() => setIsFilterOpen(true)}
                  aria-label={isThai ? 'เปิดตัวกรอง' : 'Open filters'}
                  className="bg-white hover:bg-[#F8FAFC] text-gray-800 rounded-xl sm:rounded-2xl h-10 sm:h-14 px-3 sm:px-5 font-black text-xs border border-[#E2E8F0] hover:border-[#2563EB] transition-all gap-1 sm:gap-2 shadow-sm"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#2563EB]" />
                  <span className="hidden sm:inline">{isThai ? 'ตัวกรอง' : 'Filter'}</span>
                </Button>
              </FilterDrawer>

              {/* Save Alert Button */}
              <Button
                type="button"
                onClick={handleSaveSearchAlert}
                aria-label={isThai ? 'บันทึกแจ้งเตือนการค้นหา' : 'Save search alert'}
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl sm:rounded-2xl h-10 sm:h-14 px-3 sm:px-5 font-black text-[10px] sm:text-xs transition-all gap-1 sm:gap-2 shadow-sm shrink-0"
              >
                <BellRing className="w-4 h-4" />
                <span className="hidden sm:inline">{isThai ? 'แจ้งเตือน' : 'Alert'}</span>
              </Button>
            </div>

            {/* Quick Filter Shortcuts Row */}
            <div className="w-full max-w-3xl flex flex-wrap gap-2 pt-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterState(prev => ({ ...prev, btsRadius: prev.btsRadius === '500' ? 'any' : '500' }))}
                className={cn('rounded-full h-8 text-[10px] font-black tracking-wider transition-all border border-[#E2E8F0] shadow-sm', filterState.btsRadius === '500' ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-gray-500 hover:bg-slate-50')}
              >
                🚇 {isThai ? 'ใกล้ BTS ≤ 500m' : 'Near BTS ≤ 500m'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterState(prev => ({ ...prev, petFriendly: !prev.petFriendly }))}
                className={cn('rounded-full h-8 text-[10px] font-black tracking-wider transition-all border border-[#E2E8F0] shadow-sm', filterState.petFriendly ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-gray-500 hover:bg-slate-50')}
              >
                🐾 {isThai ? 'เลี้ยงสัตว์ได้' : 'Pet OK'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterState(prev => ({ ...prev, furnished: prev.furnished === 'yes' ? 'any' : 'yes' }))}
                className={cn('rounded-full h-8 text-[10px] font-black tracking-wider transition-all border border-[#E2E8F0] shadow-sm', filterState.furnished === 'yes' ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-gray-500 hover:bg-slate-50')}
              >
                🛋️ {isThai ? 'แต่งครบพร้อมอยู่' : 'Fully Furnished'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterState(prev => ({ ...prev, priceMax: prev.priceMax === 15000 ? 150000 : 15000 }))}
                className={cn('rounded-full h-8 text-[10px] font-black tracking-wider transition-all border border-[#E2E8F0] shadow-sm', filterState.priceMax === 15000 ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-gray-500 hover:bg-slate-50')}
              >
                💰 {isThai ? 'งบประหยัด ≤ 15,000' : 'Budget ≤ 15k'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterState(prev => ({ ...prev, minBedrooms: prev.minBedrooms === 2 ? 0 : 2 }))}
                className={cn('rounded-full h-8 text-[10px] font-black tracking-wider transition-all border border-[#E2E8F0] shadow-sm', filterState.minBedrooms === 2 ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-gray-500 hover:bg-slate-50')}
              >
                🛏️ {isThai ? '2 ห้องนอนขึ้นไป' : '2+ Bedrooms'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 relative overflow-hidden scroll-reveal">

        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="lg:w-80 flex-shrink-0">
              <SidebarFilters lang={lang} currency={currency} currentCity={searchQuery} filterState={filterState} setFilterState={setFilterState} />
            </div>

            <div className="flex-1 space-y-8 md:space-y-10">
              {/* Active Filter Chips */}
              <div className="flex flex-wrap items-center gap-3 pb-2">
                {(filterState.amenities.length > 0 || filterState.minBedrooms > 0 || filterState.minSqm > 0 || filterState.priceMax < 150000 || !activeCategoryIds.includes('all')) && (
                   <Button variant="ghost" onClick={resetFilters} className="text-[10px] font-black text-red-600 gap-2 rounded-xl bg-red-50 hover:bg-red-100/80 px-5 h-10 border border-red-100 uppercase tracking-widest">
                     <FilterX className="w-3.5 h-3.5" /> {t.reset_filters}
                   </Button>
                )}

                {activeCategoryIds.filter(id => id !== 'all').map(id => (
                  <Badge key={id} variant="secondary" className="px-5 py-2.5 rounded-xl font-black bg-[#2563EB] text-white border-none gap-3 text-[10px] uppercase tracking-widest shadow-md shadow-blue-500/5">
                    {CATEGORIES.find(c => c.id === id)?.label}
                    <button onClick={() => handleCategoryClick(id)} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                ))}
                
                {filterState.amenities.map(a => (
                  <Badge key={a} variant="secondary" className="pl-5 pr-2 py-2.5 rounded-xl bg-white text-[#1E293B] border border-[#E2E8F0] shadow-sm gap-3 font-black text-[10px] uppercase tracking-widest group">
                    {t.amenities[a]}
                    <button onClick={() => removeAmenity(a)} className="p-1 rounded-full hover:bg-slate-100 text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                ))}
                
                {filterState.minBedrooms > 0 && (
                  <Badge variant="secondary" className="px-5 py-2.5 rounded-xl font-black bg-white text-orange-600 border border-[#E2E8F0] shadow-sm text-[10px] uppercase tracking-widest">
                    {filterState.minBedrooms}+ {t.bedrooms}
                  </Badge>
                )}

                {filterState.priceMax < 150000 && (
                  <Badge variant="secondary" className="px-5 py-2.5 rounded-xl font-black bg-white text-[#1E854A] border border-[#D1F7E2] bg-[#EAFDF3] shadow-sm text-[10px] uppercase tracking-widest">
                    {"<"} {symbols[currency]}{convertedMaxPrice.toLocaleString()}
                  </Badge>
                )}
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-black text-[#1E293B] tracking-tight">
                    {t.booking_count.replace('{count}', filteredProperties.length.toString())}
                  </h3>
                  {activeAISearchQuery && (
                    <p className="text-xs font-bold text-[#1E293B] mt-2 flex items-center gap-1.5 bg-white border border-[#E2E8F0] rounded-xl px-4 py-2 w-fit">
                      <span className="w-2 h-2 rounded-full bg-[#1E854A] animate-pulse" />
                      {lang === 'th' 
                        ? `ผลการค้นหาอัจฉริยะสำหรับ: "${activeAISearchQuery}"` 
                        : `AI Search Results for: "${activeAISearchQuery}"`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <select 
                    aria-label={isThai ? 'เรียงลำดับรายการ' : 'Sort listings'}
                    className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-2 sm:px-6 sm:py-3.5 text-[10px] sm:text-xs font-black text-gray-700 outline-none shadow-sm focus:ring-2 focus:ring-[#2563EB]/10 transition-all appearance-none cursor-pointer pr-8 sm:pr-12 relative h-10 sm:h-auto" 
                    value={filterState.sort} 
                    onChange={(e) => setFilterState(prev => ({ ...prev, sort: e.target.value as any }))} 
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                  >
                    <option value="latest">{lang === 'th' ? 'เรียงตาม: ล่าสุด' : lang === 'cn' ? '排序：最新发布' : 'Sort: Latest'}</option>
                    <option value="low-high">{t.sort_price_low}</option>
                    <option value="high-low">{t.sort_price_high}</option>
                  </select>

                  {/* List / Map View Toggle Buttons */}
                  <div className="flex bg-[#F1F5F9] p-1.5 rounded-xl gap-1">
                    <Button
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={cn('rounded-lg px-3.5 h-8 font-black text-[10px] uppercase gap-1 shadow-none transition-all', viewMode === 'list' ? 'bg-white text-slate-800' : 'bg-transparent text-slate-500 hover:text-slate-800')}
                    >
                      <List className="w-3.5 h-3.5" />
                      {isThai ? 'รายการ' : 'List'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setViewMode('map')}
                      className={cn('rounded-lg px-3.5 h-8 font-black text-[10px] uppercase gap-1 shadow-none transition-all', viewMode === 'map' ? 'bg-white text-slate-800' : 'bg-transparent text-slate-500 hover:text-slate-800')}
                    >
                      <Map className="w-3.5 h-3.5" />
                      {isThai ? 'แผนที่' : 'Map'}
                    </Button>
                  </div>

                  <FilterDrawer 
                    isOpen={isFilterOpen} 
                    onClose={() => setIsFilterOpen(false)} 
                    lang={lang} 
                    currency={currency} 
                    filterState={filterState} 
                    setFilterState={setFilterState} 
                    onReset={resetFilters}
                  >
                    <Button variant="default" className="lg:hidden rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-10 px-4 shadow-sm font-black text-[10px] sm:text-xs">
                      <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" /> {t.filters}
                    </Button>
                  </FilterDrawer>
                </div>
              </div>

              {viewMode === 'map' ? (
                <MapView
                  properties={filteredProperties}
                  lang={lang}
                  currency={currency}
                  onViewDetails={setSelectedProperty}
                />
              ) : filteredProperties.length === 0 ? (
                <div className="py-20 md:py-32 text-center bg-white rounded-2xl border border-dashed border-[#E2E8F0] shadow-inner group transition-all duration-700 hover:border-[#2563EB]/25">
                  <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 group-hover:scale-110 transition-transform">
                    <Search className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-[#E2E8F0]" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-[#1E293B] mb-3">{t.no_results}</h3>
                  <p className="text-muted-foreground font-medium mb-8 md:mb-10 max-w-xs mx-auto leading-relaxed text-sm md:text-base">{lang === 'th' ? 'ลองปรับตัวกรองหรือล้างการค้นหาเพื่อดูผลลัพธ์อื่น' : 'Try adjusting your filters or clearing search to see other results'}</p>
                  <Button onClick={resetFilters} className="rounded-xl px-8 md:px-12 h-14 md:h-16 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-base md:text-lg shadow-xl shadow-blue-500/10 hover:scale-105 active:scale-95 transition-all">
                    {t.reset_filters}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredProperties.map((property, idx) => (
                    <div key={property.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
                       <PropertyCard
                         property={property}
                         lang={lang}
                         currency={currency}
                         onViewDetails={setSelectedProperty}
                         isSaved={savedIds.includes(property.id as number)}
                         onToggleSave={toggleSave}
                         workLocation={workLocation}
                         onCompare={handleCompare}
                         isInCompare={isInCompare(property.id)}
                         canCompare={canCompare}
                       />
                    </div>
                  ))}
                </div>
              )}
              
              {filteredProperties.length > 0 && (
                <div className="pt-10 text-center">
                   <Button variant="outline" className="h-14 px-16 rounded-xl border border-[#E2E8F0] text-gray-700 hover:text-[#2563EB] font-black text-xs uppercase tracking-[0.15em] hover:bg-[#F8FAFC] hover:border-[#2563EB] transition-all shadow-sm">
                      {t.load_more}
                   </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {selectedProperty && (
        <PropertyModal 
          property={selectedProperty} 
          onClose={() => setSelectedProperty(null)}
          lang={lang}
          currency={currency}
          isSaved={savedIds.includes(selectedProperty.id as number)}
          onToggleSave={toggleSave}
          workLocation={workLocation}
        />
      )}

      {/* Property Comparison Drawer (Feature 6.6) */}
      <CompareDrawer
        properties={compareList}
        onRemove={removeFromCompare}
        onClear={clearCompare}
        onClose={closeCompare}
        isOpen={isCompareOpen}
        lang={lang}
        currency={currency}
        workLocation={workLocation}
        onViewDetails={setSelectedProperty}
      />
    </main>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </main>
    }>
      <ListingsContent />
    </Suspense>
  );
}

