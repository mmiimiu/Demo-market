'use client';
import { useState, useEffect, useMemo } from 'react';
import { mockProperties } from '@/lib/properties';
import { useApp } from '@/contexts/AppContext';
import { useNotification } from '@/hooks/use-notification';
import { usePropertyComparison } from '@/hooks/usePropertyComparison';
import { calcCommuteTime } from '@/lib/utils/commute';
import { FilterState, DEFAULT_FILTER_STATE, AppModals, DEFAULT_MODALS, MobileTab } from './types';

export function usePrimeRentState(categories: any[]) {
  const { lang, currency, workLocation, setWorkLocation, commuteMode, setCommuteMode, savedIds, toggleSave } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>(['all']);
  const [heroIndex, setHeroIndex] = useState(0);
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [modals, setModals] = useState<AppModals>(DEFAULT_MODALS);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const notification = useNotification();
  const comparison = usePropertyComparison();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    const history = localStorage.getItem('primerent_search_history');
    if (history) setSearchHistory(JSON.parse(history));
    const timer = setInterval(() => setHeroIndex(p => (p + 1) % 3), 8000);
    return () => { window.removeEventListener('scroll', onScroll); clearInterval(timer); };
  }, []);

  const addToSearchHistory = (q: string) => {
    if (!q.trim()) return;
    const next = [q, ...searchHistory.filter(h => h !== q)].slice(0, 5);
    setSearchHistory(next);
    localStorage.setItem('primerent_search_history', JSON.stringify(next));
  };

  const scrollToListings = () => {
    const el = document.getElementById('listings');
    if (el) window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' });
  };

  const handleCategoryClick = (catId: string) => {
    setActiveCategoryIds(prev => {
      if (catId === 'all') return ['all'];
      const next = prev.includes(catId) ? prev.filter(i => i !== catId) : [...prev.filter(i => i !== 'all'), catId];
      return next.length === 0 ? ['all'] : next;
    });
    scrollToListings();
  };

  const resetFilters = () => {
    setFilterState(DEFAULT_FILTER_STATE);
    setSearchQuery('');
    setWorkLocation('');
    setActiveCategoryIds(['all']);
  };

  const filteredProperties = useMemo(() => {
    let result = [...mockProperties];
    if (!activeCategoryIds.includes('all')) {
      result = result.filter(p => activeCategoryIds.some(id => {
        const cat = categories.find(c => c.id === id);
        return cat && (id === 'studio' ? p.bed === 0 : id === 'villa' ? (p.amenities.includes('pool') && p.bed >= 3) : id === 'dorm' ? (p.price <= 10000 && p.type === 'apartment') : p.type === cat.type);
      }));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => [p.name, p.nameEn, p.location].some(x => x.toLowerCase().includes(q)));
    }
    result = result.filter(p => p.price >= filterState.priceMin && p.price <= filterState.priceMax && p.bed >= filterState.minBedrooms && p.sqm >= filterState.minSqm && filterState.amenities.every(a => p.amenities.includes(a)));
    if (filterState.maxCommute > 0 && workLocation) {
      result = result.filter(p => {
        const idNum = typeof p.id === 'string' ? parseInt(p.id.replace(/\D/g, '')) || 0 : p.id;
        const t = calcCommuteTime(idNum, workLocation, commuteMode);
        return t !== null && t <= filterState.maxCommute;
      });
    }
    if (filterState.sort === 'low-high') result.sort((a, b) => a.price - b.price);
    else if (filterState.sort === 'high-low') result.sort((a, b) => b.price - a.price);
    return result;
  }, [activeCategoryIds, searchQuery, filterState, categories, workLocation, commuteMode]);

  const handleSmartSearch = async (customQuery?: string) => {
    setIsSearching(true);
    const queryToSearch = customQuery || searchQuery;
    if (!queryToSearch) { setIsSearching(false); return; }
    addToSearchHistory(queryToSearch);
    try {
      const { performAISmartSearch } = await import('@/app/actions/ai-search');
      const structured = await performAISmartSearch({ query: queryToSearch });
      if (structured) {
        if (structured.type && structured.type.length > 0) {
          const matchedIds = structured.type.map((t: string) => categories.find(c => (c as any).type === t)?.id).filter(Boolean) as string[];
          setActiveCategoryIds(matchedIds.length > 0 ? matchedIds : ['all']);
        }
        setFilterState(prev => ({
          ...prev,
          priceMin: structured.priceMin ?? prev.priceMin,
          priceMax: structured.priceMax ?? prev.priceMax,
          minBedrooms: structured.minBedrooms ?? prev.minBedrooms,
          minSqm: structured.minSqm ?? prev.minSqm,
          amenities: structured.amenities ?? prev.amenities,
        }));
      }
      scrollToListings();
    } catch (error: any) {
      console.error('Smart search failed:', error);
      const isKeyErr = error.message?.includes('API key');
      notification.error(lang === 'th' ? 'การค้นหาล้มเหลว' : 'Search Failed', isKeyErr ? (lang === 'th' ? 'กรุณาตั้งค่า API Key' : 'Please set API Key') : (lang === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อ AI' : 'AI connection error'));
    } finally {
      setIsSearching(false);
    }
  };

  return {
    scrolled, searchQuery, setSearchQuery, activeCategoryIds, setActiveCategoryIds,
    heroIndex, mobileTab, setMobileTab, filterState, setFilterState, modals,
    selectedProperty, setSelectedProperty, savedIds, isSearching, searchHistory,
    showSearchHistory, setShowSearchHistory, toggleSave, handleCategoryClick,
    resetFilters, filteredProperties, handleSmartSearch, scrollToListings,
    openModal: (key: keyof AppModals) => setModals(p => ({ ...p, [key]: true })),
    closeModal: (key: keyof AppModals) => setModals(p => ({ ...p, [key]: false })),
    comparison
  };
}
