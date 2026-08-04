"use client";

import React, { useState, useEffect } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { Navbar } from "@/components/layout";
import { useApp } from "@/contexts/AppContext";
import { Lang } from "./types";
import { Sparkles, Search, BrainCircuit, Wand2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { runFallbackSearch } from "@/ai/flows/ai-smart-search/fallback";
import { mockProperties } from "@/lib/properties";
import type { Property } from "@/lib/types";
import { cn } from "@/lib/utils";

import StatsSection from "./StatsSection";
import FeaturedListings from "./FeaturedListings";
import HowItWorksSection from "./HowItWorksSection";
import RoleCardsSection from "./RoleCardsSection";
import WhySection from "./WhySection";
import TestimonialsSection from "./TestimonialsSection";
import LineBannerSection from "./LineBannerSection";
import FAQSection from "./FAQSection";
import FooterSection from "./FooterSection";
import RecentSearchesSection from "./RecentSearchesSection";

export default function LandingPage() {
  const { lang, savedIds, toggleSave } = useApp();
  const [activeTab, setActiveTab] = useState<"renter" | "owner" | "agent">("renter");
  const [howItWorksTab, setHowItWorksTab] = useState<"renter" | "owner" | "agent">("renter");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(150000);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  // Search mode
  const [searchMode, setSearchMode] = useState<'normal' | 'ai'>('normal');
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProgressText, setAiProgressText] = useState('');
  const [extractedFilters, setExtractedFilters] = useState<any>(null);
  const [matchedProperties, setMatchedProperties] = useState<Property[]>([]);

  useEffect(() => {
    // If logged in as admin, redirect directly to admin dashboard
    const currentRole = localStorage.getItem('primerent_user_role');
    if (currentRole === 'admin') {
      window.location.href = '/admin';
      return;
    }

    // Check if redirecting from admin logout requesting a login popup
    const params = new URLSearchParams(window.location.search);
    if (params.get('openLogin') === 'true') {
      setAuthTab('login');
      setAuthOpen(true);
      // Clean up URL query parameters silently
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openLogin = () => { setAuthTab("login"); setAuthOpen(true); };
  const openSignup = () => { setAuthTab("register"); setAuthOpen(true); };

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [dropdownHistory, setDropdownHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('primerent_saved_searches');
      if (raw) setDropdownHistory(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [isSearchFocused]);

  const handleDeleteHistoryItem = (id: string) => {
    try {
      const updated = dropdownHistory.filter(x => x.id !== id);
      setDropdownHistory(updated);
      localStorage.setItem('primerent_saved_searches', JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  const filterPropertiesWithAI = (parsed: any) => {
    return mockProperties.filter((p: any) => {
      if (parsed.type?.length > 0 && !parsed.type.includes(p.type)) return false;
      if (parsed.location?.length > 0) {
        const hit = parsed.location.some((loc: string) => {
          const l = loc.toLowerCase();
          return p.location.toLowerCase().includes(l) || p.name.toLowerCase().includes(l);
        });
        if (!hit) return false;
      }
      if (parsed.priceMin !== undefined && p.price < parsed.priceMin) return false;
      if (parsed.priceMax !== undefined && p.price > parsed.priceMax) return false;
      if (parsed.minBedrooms !== undefined && p.bed < parsed.minBedrooms) return false;
      if (parsed.amenities?.length > 0) {
        if (!parsed.amenities.every((a: string) => p.amenities?.includes(a))) return false;
      }
      return true;
    });
  };

  const handleSearch = () => {
    if (searchMode === 'ai') {
      const q = searchQuery.trim();
      if (!q) return;
      setIsAiDialogOpen(true);
      setIsAiProcessing(true);
      setExtractedFilters(null);
      setMatchedProperties([]);
      setAiProgressText(lang === 'th' ? '🔮 กำลังวิเคราะห์ความต้องการของคุณ...' : '🔮 Analyzing your intent...');
      setTimeout(() => {
        setAiProgressText(lang === 'th' ? '🧠 กำลังสกัดคำสำคัญและตัวกรอง...' : '🧠 Extracting filters...');
        setTimeout(() => {
          setAiProgressText(lang === 'th' ? '⚡️ กำลังจับคู่ห้องที่ตรงกับความต้องการ...' : '⚡️ Matching best properties...');
          setTimeout(() => {
            const parsed = runFallbackSearch(q);
            setExtractedFilters(parsed);
            setMatchedProperties(filterPropertiesWithAI(parsed));
            setIsAiProcessing(false);
          }, 600);
        }, 600);
      }, 600);
      return;
    }
    // Normal search
    const q = searchQuery.trim();
    if (q) {
      try {
        const raw = localStorage.getItem('primerent_saved_searches');
        const existing = raw ? JSON.parse(raw) : [];
        const filtered = existing.filter((a: { query: string }) => a.query !== q);
        const entry = {
          id: `search_${Date.now()}`,
          query: q,
          categories: [],
          priceMin,
          priceMax,
          minBedrooms: 0,
          minSqm: 0,
          amenities: [],
          savedAt: new Date().toISOString(),
          active: true,
        };
        // Always keep only the 4 most recent — newest prepended, oldest dropped
        localStorage.setItem('primerent_saved_searches', JSON.stringify([entry, ...filtered].slice(0, 4)));
      } catch { /* ignore storage errors */ }
    }
    window.location.href = `/listings?q=${searchQuery}&priceMin=${priceMin}&priceMax=${priceMax}`;
  };


  return (
    <div className="min-h-screen bg-gray-50/30">
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
      <Navbar scrolled={scrolled} transparent={false} showMiniSearch={scrolled} />
      
      <div className="pt-[80px] lg:pt-[90px] bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 py-8 lg:py-12">
          <h1 className="text-lg sm:text-4xl lg:text-5xl font-black text-gray-900 text-center mb-2 sm:mb-4 tracking-tight">
            {lang === 'th' ? 'ค้นหาบ้านที่ใช่ สำหรับคุณ' : lang === 'cn' ? '寻找您的完美居所' : 'Find your perfect home'}
          </h1>
          <p className="text-[9px] sm:text-base text-gray-500 text-center font-medium mb-4 sm:mb-8">
            {lang === 'th' ? 'เช่าที่พักที่ใช่ ด้วยแพลตฟอร์มที่ครอบคลุมที่สุด' : lang === 'cn' ? '租赁您的理想居所，尽在我们的综合平台' : 'Rent your perfect property with our comprehensive platform'}
          </p>
          
          {/* Mode Switcher Toggle */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-slate-100/80 backdrop-blur-xs p-1 rounded-full border border-slate-200/50 shadow-sm">
              <button
                type="button"
                onClick={() => setSearchMode('normal')}
                className={cn(
                  "px-3 py-1.5 sm:px-5 sm:py-2 text-[9px] sm:text-sm font-black rounded-full transition-all duration-300 flex items-center gap-1 sm:gap-2",
                  searchMode === 'normal' 
                    ? "bg-white text-gray-800 shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                🔍 {lang === 'th' ? 'ค้นหาปกติ' : 'Normal Search'}
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('ai')}
                className={cn(
                  "px-3 py-1.5 sm:px-5 sm:py-2 text-[9px] sm:text-sm font-black rounded-full transition-all duration-300 flex items-center gap-1 sm:gap-2",
                  searchMode === 'ai' 
                    ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md scale-105" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300 animate-pulse" />
                <span>{lang === 'th' ? 'ค้นหาด้วย AI' : 'AI Search'}</span>
              </button>
            </div>
          </div>

          {/* Big Search Bar for Landing Page */}
          <div className={cn(
            "w-full max-w-4xl mx-auto shadow-xl shadow-gray-200/50 rounded-lg sm:rounded-2xl p-1 sm:p-2 bg-white border border-gray-100 transition-all",
            searchMode === 'ai' && "ring-2 sm:ring-4 ring-teal-500/20 border-teal-500/50 scale-[1.01]"
          )}>
            <div className="flex flex-row items-center gap-1 sm:gap-2 relative">
              <div className="flex-1 flex flex-col justify-center px-2 py-0.5 sm:px-4 sm:py-1 hover:bg-gray-50 rounded-md sm:rounded-xl transition-colors cursor-text border border-transparent hover:border-gray-100 group/input overflow-hidden">
                <label className={cn(
                  "text-[7px] sm:text-[9px] font-extrabold tracking-wider flex items-center gap-1 whitespace-nowrap",
                  searchMode === 'ai' ? "text-teal-600" : "text-gray-800"
                )}>
                  {searchMode === 'ai' ? (
                    <>
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-teal-500 animate-spin" />
                      {lang === 'th' ? 'พิมพ์ความต้องการที่อยากได้ (ภาษาธรรมชาติ)' : 'Describe What You Want (Natural Language)'}
                    </>
                  ) : (
                    lang === 'th' ? 'ทำเลที่ตั้ง' : 'Location'
                  )}
                </label>
                <input
                  type="text"
                  placeholder={
                    searchMode === 'ai'
                      ? (lang === 'th' ? 'เช่น: อยากได้คอนโดเลี้ยงสัตว์ได้ใกล้ BTS อ่อนนุช งบไม่เกิน 20,000...' : 'e.g. condo near BTS Onnut, pet friendly, budget <= 20,000...')
                      : (lang === 'th' ? 'กรอกทำเลที่ตั้ง...' : 'Enter location...')
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="w-full bg-transparent outline-none border-none text-[8px] sm:text-sm font-bold text-gray-900 placeholder-gray-400 focus:ring-0 px-0 h-4 sm:h-auto truncate"
                />

                {/* Dropdown for search history on input focus */}
                {isSearchFocused && dropdownHistory.length > 0 && searchMode !== 'ai' && (
                  <div className="absolute top-[105%] left-0 w-full bg-white border border-gray-100 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 py-1 mb-1">
                      {lang === 'th' ? 'ค้นหาล่าสุด' : 'Recent Searches'}
                    </p>
                    <div className="space-y-0.5">
                      {dropdownHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group/item"
                          onClick={() => {
                            setSearchQuery(item.query);
                            if (item.priceMin > 0) setPriceMin(item.priceMin);
                            if (item.priceMax < 150000) setPriceMax(item.priceMax);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-700">{item.query}</span>
                            {item.priceMax < 150000 && (
                              <span className="text-[10px] text-gray-400 font-semibold">
                                (฿{item.priceMin.toLocaleString()} - ฿{item.priceMax.toLocaleString()})
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHistoryItem(item.id);
                            }}
                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {searchMode !== 'ai' && (
                <>
                  <div className="block w-px h-6 sm:h-8 bg-gray-200 self-center shrink-0" />
                  <div className="flex-[0.7] flex flex-col justify-center px-2 py-0.5 sm:px-4 sm:py-1 hover:bg-gray-50 rounded-md sm:rounded-xl transition-colors cursor-text border border-transparent hover:border-gray-100 min-w-0">
                    <label className="text-[7px] sm:text-[9px] font-extrabold text-gray-800 tracking-wider whitespace-nowrap">
                      {lang === 'th' ? 'ช่วงราคา' : 'Price Range'}
                    </label>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full bg-transparent outline-none border-none text-[8px] sm:text-sm font-bold text-gray-900 placeholder-gray-400 focus:ring-0 px-0 h-4 sm:h-auto"
                        onChange={(e) => setPriceMin(Number(e.target.value))}
                      />
                      <span className="text-gray-300 text-[8px] sm:text-sm">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full bg-transparent outline-none border-none text-[8px] sm:text-sm font-bold text-gray-900 placeholder-gray-400 focus:ring-0 px-0 text-right h-4 sm:h-auto"
                        onChange={(e) => setPriceMax(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </>
              )}

              <button 
                onClick={handleSearch}
                className={cn(
                  "shrink-0 w-auto px-2 py-1 sm:px-6 sm:py-2.5 text-[8px] sm:text-sm text-white rounded-md sm:rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1 sm:gap-2 h-full min-h-[24px] sm:min-h-[36px] whitespace-nowrap",
                  searchMode === 'ai' 
                    ? "bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700" 
                    : "bg-[#E51D53] hover:bg-[#D41B4D]"
                )}
              >
                {searchMode === 'ai' ? (
                  <>
                    <Sparkles className="w-2.5 h-2.5 sm:w-5 sm:h-5 text-white" />
                    <span>{lang === 'th' ? 'วิเคราะห์ด้วย AI' : 'Analyze with AI'}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-2.5 h-2.5 sm:w-5 sm:h-5 text-white" strokeWidth={3} />
                    <span>{lang === 'th' ? 'ค้นหาเลย' : 'Search'}</span>
                  </>
                )}
              </button>

            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-3 mt-4 sm:mt-6">
            {['ใกล้ BTS', 'เลี้ยงสัตว์ได้', 'วิวแม่น้ำ', 'ราคาไม่เกิน 15,000'].map(tag => (
              <span key={tag} className="px-2 py-1 sm:px-4 sm:py-1.5 rounded-full bg-gray-50 text-gray-600 text-[8px] sm:text-xs font-bold border border-gray-200 cursor-pointer hover:border-[#E51D53] hover:text-[#E51D53] transition-colors">
                {tag}
              </span>
            ))}
          </div>

          {/* Recent search history — shown only when localStorage has saved searches */}
          <RecentSearchesSection lang={lang} />
        </div>
      </div>

      <div className="bg-white">
        <StatsSection lang={lang} />
        <FeaturedListings lang={lang} savedIds={savedIds} toggleSave={toggleSave} />
      </div>
      <HowItWorksSection lang={lang} howItWorksTab={howItWorksTab} setHowItWorksTab={setHowItWorksTab} />
      <RoleCardsSection lang={lang} />
      <WhySection lang={lang} />
      <TestimonialsSection lang={lang} />
      <LineBannerSection lang={lang} />
      <FAQSection lang={lang} />
      <FooterSection lang={lang} />

      {/* AI Assistant dialog processing & matching recommended list */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-6 shadow-2xl border-none font-sans overflow-hidden bg-white">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-base font-black text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-teal-500/10 text-teal-600 rounded-xl">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
              </div>
              <span>{lang === 'th' ? 'AI Search Assistant' : 'AI Search Assistant'}</span>
            </DialogTitle>
          </DialogHeader>

          {isAiProcessing ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-600 absolute top-5 left-5 animate-bounce" />
              </div>
              <p className="text-xs font-bold text-slate-500 tracking-wide text-center animate-pulse px-4">
                {aiProgressText}
              </p>
            </div>
          ) : (
            <div className="space-y-5 pt-2">
              {/* Extracted Filter Badges */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-teal-600" />
                  {lang === 'th' ? 'ตัวกรองที่ AI วิเคราะห์และสกัดข้อมูลสำเร็จ' : 'AI EXTRACTED FILTERS'}
                </h5>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {extractedFilters?.location?.map((loc: string) => (
                    <Badge key={loc} className="bg-teal-50 text-teal-700 font-bold border border-teal-100 px-2 py-0.5 rounded-lg text-[9px]">
                      📍 ทำเล: {loc}
                    </Badge>
                  ))}
                  {extractedFilters?.type?.map((t: string) => (
                    <Badge key={t} className="bg-blue-50 text-blue-700 font-bold border border-blue-100 px-2 py-0.5 rounded-lg text-[9px]">
                      🏠 ประเภท: {t === 'condo' ? 'คอนโด' : t === 'house' ? 'บ้าน' : t === 'townhouse' ? 'ทาวน์โฮม' : 'อพาร์ตเมนต์'}
                    </Badge>
                  ))}
                  {(extractedFilters?.priceMin || extractedFilters?.priceMax) && (
                    <Badge className="bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 px-2 py-0.5 rounded-lg text-[9px]">
                      💰 งบประมาณ: {extractedFilters.priceMin ? `฿${extractedFilters.priceMin.toLocaleString()}` : '0'} - {extractedFilters.priceMax ? `฿${extractedFilters.priceMax.toLocaleString()}` : 'ไม่จำกัด'}
                    </Badge>
                  )}
                  {extractedFilters?.minBedrooms !== undefined && (
                    <Badge className="bg-amber-50 text-amber-700 font-bold border border-amber-100 px-2 py-0.5 rounded-lg text-[9px]">
                      🛏️ {extractedFilters.minBedrooms} ห้องนอนขึ้นไป
                    </Badge>
                  )}
                  {extractedFilters?.amenities?.map((am: string) => (
                    <Badge key={am} className="bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-2 py-0.5 rounded-lg text-[9px]">
                      ✓ {am === 'pet' ? 'เลี้ยงสัตว์ได้' : am === 'pool' ? 'สระว่ายน้ำ' : am === 'gym' ? 'ฟิตเนส' : am === 'parking' ? 'ที่จอดรถ' : am === 'bts_mrt' ? 'ใกล้ BTS/MRT' : am}
                    </Badge>
                  ))}
                  {!extractedFilters?.location?.length && !extractedFilters?.type?.length && !extractedFilters?.priceMax && !extractedFilters?.amenities?.length && (
                    <span className="text-[10px] text-gray-400 font-bold italic">{lang === 'th' ? 'สแกนตามคีย์เวิร์ดทั่วไป' : 'Generic search'}</span>
                  )}
                </div>
              </div>

              {/* Recommended Matches */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {lang === 'th' ? 'ผลการค้นหาแนะนำที่ตรงใจคุณมากที่สุด' : 'BEST MATCHING RECOMMENDATIONS'}
                </h5>

                {matchedProperties.length > 0 ? (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {matchedProperties.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setIsAiDialogOpen(false);
                          window.location.href = `/listings?q=${encodeURIComponent(p.name)}`;
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-2xl border border-gray-100 hover:border-teal-500/50 hover:bg-teal-500/5 transition-all cursor-pointer group"
                      >
                        <img 
                          src={p.img} 
                          alt={p.name} 
                          className="w-14 h-14 object-cover rounded-xl shrink-0 border border-gray-100 group-hover:scale-[1.02] transition-transform duration-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-xs text-gray-800 truncate">{lang === 'th' ? p.name : p.nameEn || p.name}</p>
                          <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">📍 {lang === 'th' ? p.location : p.locationEn || p.location}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400 font-semibold">{p.sqm} ตร.ม. • {p.bed} ห้องนอน</span>
                            {p.amenities?.includes('pet' as any) && (
                              <Badge className="bg-pink-50 text-pink-600 text-[8px] border-none font-bold py-0 h-4 rounded">Pet Friendly</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-[#E51D53]">฿{p.price.toLocaleString()}</p>
                          <p className="text-[8px] text-gray-400 font-bold">{lang === 'th' ? '/เดือน' : '/month'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                    <p className="text-xs font-bold text-slate-500 text-center">
                      {lang === 'th' ? 'ไม่พบห้องพักตรงตามเงื่อนไขเป๊ะ ๆ ในระบบ' : 'No exact listings match these criteria.'}
                    </p>
                    <p className="text-[10px] text-slate-400 text-center">
                      {lang === 'th' ? 'แต่คุณยังสามารถกดเปิดดูรายการทั้งหมดเพื่อดูห้องทำเลใกล้เคียงได้ครับ' : 'However, you can still view all properties to explore nearby choices.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <DialogClose asChild>
                  <Button variant="ghost" className="rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 h-10 px-4">
                    {lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
                  </Button>
                </DialogClose>

                <Button
                  onClick={() => {
                    setIsAiDialogOpen(false);
                    const params = new URLSearchParams();
                    if (extractedFilters?.type?.length) params.set('type', extractedFilters.type[0]);
                    if (extractedFilters?.location?.length) params.set('q', extractedFilters.location[0]);
                    if (extractedFilters?.priceMin) params.set('priceMin', extractedFilters.priceMin.toString());
                    if (extractedFilters?.priceMax) params.set('priceMax', extractedFilters.priceMax.toString());
                    window.location.href = params.toString() ? `/listings?${params.toString()}` : '/listings';
                  }}
                  className="rounded-xl text-xs font-black bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white flex items-center gap-1.5 h-10 px-5 shadow-md shadow-indigo-500/10"
                >
                  <span>{lang === 'th' ? 'ดูผลลัพธ์ทั้งหมด' : 'Show All Results'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
