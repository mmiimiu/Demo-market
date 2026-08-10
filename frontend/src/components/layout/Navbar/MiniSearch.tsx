'use client';

import React, { useState } from 'react';
import { Search, MapPin, Home, DollarSign, Sparkles, BrainCircuit, CheckCircle2, AlertCircle, Wand2, ArrowRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { runFallbackSearch } from '@/ai/flows/ai-smart-search/fallback';
import { mockProperties } from '@/lib/properties';
import type { Property } from '@/lib/types';

interface MiniSearchProps {
  navbarSearchQuery: string;
  setNavbarSearchQuery: (val: string) => void;
  navbarPriceMin: number;
  setNavbarPriceMin: (val: number) => void;
  navbarPriceMax: number;
  setNavbarPriceMax: (val: number) => void;
  propertyType: string;
  setPropertyType: (val: string) => void;
  t: any;
  lang: 'th' | 'en' | 'cn';
  formatPrice: (priceThb: number) => string;
  onSubmit: (e: React.FormEvent) => void;
  isSolid?: boolean;
}

export const MiniSearch: React.FC<MiniSearchProps> = ({
  navbarSearchQuery,
  setNavbarSearchQuery,
  navbarPriceMin,
  setNavbarPriceMin,
  navbarPriceMax,
  setNavbarPriceMax,
  propertyType,
  setPropertyType,
  t,
  lang,
  formatPrice,
  onSubmit,
  isSolid = true,
}) => {
  const router = useRouter();
  const isTh = lang === 'th';

  const [searchMode, setSearchMode] = useState<'normal' | 'ai'>('normal');
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProgressText, setAiProgressText] = useState('');
  const [extractedFilters, setExtractedFilters] = useState<any>(null);
  const [matchedProperties, setMatchedProperties] = useState<Property[]>([]);

  const filterPropertiesWithAI = (parsed: any) => {
    return mockProperties.filter((p: any) => {
      if (parsed.type && parsed.type.length > 0) {
        if (!parsed.type.includes(p.type)) return false;
      }
      if (parsed.location && parsed.location.length > 0) {
        const locMatch = parsed.location.some((loc: string) => {
          const l = loc.toLowerCase();
          return (
            p.location.toLowerCase().includes(l) ||
            p.locationEn?.toLowerCase().includes(l) ||
            p.locationCn?.toLowerCase().includes(l) ||
            p.name.toLowerCase().includes(l) ||
            p.nameEn?.toLowerCase().includes(l) ||
            p.nameCn?.toLowerCase().includes(l)
          );
        });
        if (!locMatch) return false;
      }
      if (parsed.priceMin !== undefined && p.price < parsed.priceMin) return false;
      if (parsed.priceMax !== undefined && p.price > parsed.priceMax) return false;
      if (parsed.minBedrooms !== undefined && p.bed < parsed.minBedrooms) return false;
      if (parsed.minSqm !== undefined && p.sqm < parsed.minSqm) return false;
      if (parsed.maxSqm !== undefined && p.sqm > parsed.maxSqm) return false;

      if (parsed.amenities && parsed.amenities.length > 0) {
        const hasAll = parsed.amenities.every((a: string) => p.amenities?.includes(a));
        if (!hasAll) return false;
      }
      return true;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === 'ai') {
      if (!navbarSearchQuery.trim()) return;
      setIsAiDialogOpen(true);
      setIsAiProcessing(true);
      setExtractedFilters(null);
      setMatchedProperties([]);
      
      setAiProgressText(isTh ? '🔮 กำลังวิเคราะห์เจตนาและความต้องการของคุณ...' : '🔮 Analyzing your search intent...');
      
      setTimeout(() => {
        setAiProgressText(isTh ? '🧠 กำลังแยกคำสำคัญและคำนวณตัวกรองอสังหาฯ...' : '🧠 Extracting keywords and parameters...');
        
        setTimeout(() => {
          setAiProgressText(isTh ? '⚡️ กำลังจับคู่กับห้องพักที่ตอบโจทย์ดีที่สุด...' : '⚡️ Matching with best property matches...');
          
          setTimeout(() => {
            const parsed = runFallbackSearch(navbarSearchQuery);
            const matches = filterPropertiesWithAI(parsed);
            setExtractedFilters(parsed);
            setMatchedProperties(matches);
            setIsAiProcessing(false);
          }, 600);
        }, 600);
      }, 600);
      return;
    }

    const params = new URLSearchParams();
    if (navbarSearchQuery.trim()) params.set('q', navbarSearchQuery.trim());
    if (navbarPriceMin > 0) params.set('priceMin', navbarPriceMin.toString());
    if (navbarPriceMax < 150000) params.set('priceMax', navbarPriceMax.toString());
    if (propertyType) params.set('type', propertyType);

    router.push(params.toString() ? `/listings?${params.toString()}` : '/listings');
  };

  const propertyTypes = [
    { id: '', label: lang === 'th' ? 'ทุกประเภท' : 'Any Type' },
    { id: 'condo', label: lang === 'th' ? 'คอนโด' : 'Condo' },
    { id: 'house', label: lang === 'th' ? 'บ้าน' : 'House' },
    { id: 'townhouse', label: lang === 'th' ? 'ทาวน์โฮม' : 'Townhouse' },
  ];

  const currentTypeLabel = propertyTypes.find(pt => pt.id === propertyType)?.label;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Mode Switcher Toggle */}
      <div className="flex bg-slate-100/80 backdrop-blur-xs p-1 rounded-full mb-3 shrink-0 gap-1 border border-slate-200/50 shadow-xs">
        <button
          type="button"
          onClick={() => setSearchMode('normal')}
          className={cn(
            "px-4 py-1.5 text-[10px] font-black rounded-full transition-all duration-300 flex items-center gap-1",
            searchMode === 'normal' 
              ? "bg-white text-gray-800 shadow-xs" 
              : "text-gray-400 hover:text-gray-600"
          )}
        >
          🔍 {isTh ? 'ค้นหาปกติ' : 'Normal Search'}
        </button>
        <button
          type="button"
          onClick={() => setSearchMode('ai')}
          className={cn(
            "px-4 py-1.5 text-[10px] font-black rounded-full transition-all duration-300 flex items-center gap-1.5",
            searchMode === 'ai' 
              ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md scale-105" 
              : "text-gray-400 hover:text-gray-600"
          )}
        >
          <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
          <span>{isTh ? 'ค้นหาด้วย AI' : 'AI Search'}</span>
        </button>
      </div>

      <form
        onSubmit={handleSearch}
        className={cn(
          "flex items-center rounded-2xl pl-4 md:pl-6 pr-2 py-1.5 md:py-2.5 w-full max-w-[800px] transition-all duration-300 shrink-0 mx-auto border",
          isSolid 
            ? "bg-gray-50 border-gray-200 hover:bg-gray-100" 
            : "bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-md",
          searchMode === 'ai' && "ring-2 ring-teal-500/20 border-teal-500/50"
        )}
      >
        {/* Segment 1: Input */}
        <div 
          className={cn(
            "flex-1 flex flex-col justify-center px-4 rounded-xl h-10 md:h-12 transition-all duration-300 cursor-text group",
            isSolid ? 'hover:bg-white' : 'hover:bg-white/15'
          )}
          onClick={(e) => {
            const input = e.currentTarget.querySelector('input');
            if (input) input.focus();
          }}
        >
          <label className={cn(
            "text-[10px] font-extrabold tracking-wider flex items-center gap-1",
            searchMode === 'ai' ? "text-teal-600" : (isSolid ? "text-gray-800" : "text-white/90")
          )}>
            {searchMode === 'ai' ? (
              <>
                <Sparkles className="w-2.5 h-2.5 text-teal-500 animate-spin" />
                {isTh ? 'พิมพ์ความต้องการที่อยากได้ (ภาษาธรรมชาติ)' : 'Describe What You Want (Natural Language)'}
              </>
            ) : (
              lang === 'th' ? 'ทำเลที่ตั้ง' : 'Location'
            )}
          </label>
          <input
            type="text"
            value={navbarSearchQuery}
            onChange={(e) => setNavbarSearchQuery(e.target.value)}
            placeholder={
              searchMode === 'ai' 
                ? (isTh ? 'พิมพ์ถามเช่น: อยากได้คอนโดเลี้ยงสัตว์ได้ใกล้ BTS อ่อนนุช งบไม่เกิน 20,000...' : 'e.g. condo near BTS Onnut, pet friendly, budget <= 20,000...')
                : (t.search_placeholder ? t.search_placeholder.replace("📍 ", "") : "ค้นหาทำเล...")
            }
            className={cn(
              "w-full bg-transparent outline-none border-none text-sm font-bold focus:ring-0 px-0 truncate transition-all duration-300",
              isSolid ? 'text-gray-700 placeholder-gray-400' : 'text-white placeholder-white/60'
            )}
          />
        </div>

        {searchMode !== 'ai' && (
          <>
            <div className="hidden md:block w-[1px] h-8 bg-gray-200 mx-1" />

            {/* Segment 2: Property Type */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "hidden md:flex flex-1 flex-col justify-center px-4 rounded-xl h-10 md:h-12 transition-all duration-300 text-left outline-none",
                    isSolid ? 'hover:bg-white' : 'hover:bg-white/15'
                  )}
                >
                  <label className={`text-[10px] font-extrabold tracking-wider cursor-pointer ${isSolid ? 'text-gray-800' : 'text-white/90'}`}>
                    {lang === 'th' ? 'ประเภท' : 'Property Type'}
                  </label>
                  <span className={`text-sm font-bold truncate ${isSolid ? 'text-gray-600' : 'text-white/80'}`}>
                    {currentTypeLabel}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-2 rounded-2xl border border-gray-100 shadow-2xl mt-4">
                <div className="flex flex-col gap-1">
                  {propertyTypes.map((pt) => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setPropertyType(pt.id)}
                      className={cn(
                        "px-4 py-2 text-sm text-left rounded-xl transition-colors",
                        propertyType === pt.id ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-100 text-gray-700'
                      )}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="hidden lg:block w-[1px] h-8 bg-gray-200 mx-1" />

            {/* Segment 3: Price Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "hidden lg:flex flex-1 flex-col justify-center px-4 rounded-xl h-10 md:h-12 transition-all duration-300 text-left outline-none",
                    isSolid ? 'hover:bg-white' : 'hover:bg-white/15'
                  )}
                >
                  <label className={`text-[10px] font-extrabold tracking-wider cursor-pointer ${isSolid ? 'text-gray-800' : 'text-white/90'}`}>
                    {t.price || "ราคา"}
                  </label>
                  <span className={`text-sm font-bold truncate ${isSolid ? 'text-gray-600' : 'text-white/80'}`}>
                    {navbarPriceMin === 0 && navbarPriceMax >= 150000
                      ? (lang === 'th' ? 'ทุกช่วงราคา' : 'Any price')
                      : `${formatPrice(navbarPriceMin)}-${formatPrice(navbarPriceMax)}`}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-6 rounded-3xl border border-gray-100 shadow-2xl mt-4">
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-gray-900">{t.price_range || "ช่วงราคา"}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-500">{t.min || "ต่ำสุด"}</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={navbarPriceMin === 0 ? '' : navbarPriceMin}
                        onChange={(e) => setNavbarPriceMin(Number(e.target.value) || 0)}
                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-500">{t.max || "สูงสุด"}</span>
                      <input
                        type="number"
                        placeholder={lang === 'th' ? "ไม่จำกัด" : "Any"}
                        value={navbarPriceMax >= 150000 ? '' : navbarPriceMax}
                        onChange={(e) => setNavbarPriceMax(Number(e.target.value) || 150000)}
                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}

        {/* Segment 4: Search Button */}
        <button
          type="submit"
          className={cn(
            "ml-1 md:ml-2 px-3 md:px-6 h-8 md:h-10 rounded-lg text-white flex items-center gap-2 font-bold transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]",
            searchMode === 'ai' 
              ? "bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 shadow-md" 
              : "bg-[#E51D53] hover:bg-[#D41B4D]"
          )}
        >
          {searchMode === 'ai' ? (
            <Sparkles className="w-4 h-4 text-white" />
          ) : (
            <Search className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={3} />
          )}
          <span className="hidden md:inline">{searchMode === 'ai' ? (isTh ? 'วิเคราะห์ด้วย AI' : 'Analyze with AI') : (lang === 'th' ? 'ค้นหา' : 'Search')}</span>
        </button>
      </form>

      {/* AI Assistant dialog processing & matching recommended list */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-6 shadow-2xl border-none font-sans overflow-hidden bg-white">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="text-base font-black text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-teal-500/10 text-teal-600 rounded-xl">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
              </div>
              <span>{isTh ? 'AI Search Assistant' : 'AI Search Assistant'}</span>
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
                  {isTh ? 'ตัวกรองที่ AI วิเคราะห์และสกัดข้อมูลสำเร็จ' : 'AI EXTRACTED FILTERS'}
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
                    <span className="text-[10px] text-gray-400 font-bold italic">{isTh ? 'สแกนตามคีย์เวิร์ดทั่วไป' : 'Generic search'}</span>
                  )}
                </div>
              </div>

              {/* Recommended Matches */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {isTh ? 'ผลการค้นหาแนะนำที่ตรงใจคุณมากที่สุด' : 'BEST MATCHING RECOMMENDATIONS'}
                </h5>

                {matchedProperties.length > 0 ? (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {matchedProperties.map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setIsAiDialogOpen(false);
                          router.push(`/listings?q=${encodeURIComponent(p.name)}`);
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
                          <p className="text-[8px] text-gray-400 font-bold">{isTh ? '/เดือน' : '/month'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                    <p className="text-xs font-bold text-slate-500 text-center">
                      {isTh ? 'ไม่พบห้องพักตรงตามเงื่อนไขเป๊ะ ๆ ในระบบ' : 'No exact listings match these criteria.'}
                    </p>
                    <p className="text-[10px] text-slate-400 text-center">
                      {isTh ? 'แต่คุณยังสามารถกดเปิดดูรายการทั้งหมดเพื่อดูห้องทำเลใกล้เคียงได้ครับ' : 'However, you can still view all properties to explore nearby choices.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <DialogClose asChild>
                  <Button variant="ghost" className="rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 h-10 px-4">
                    {isTh ? 'ปิดหน้าต่าง' : 'Close'}
                  </Button>
                </DialogClose>

                <Button
                  onClick={() => {
                    setIsAiDialogOpen(false);
                    // Build search query params
                    const params = new URLSearchParams();
                    if (extractedFilters?.type?.length) params.set('type', extractedFilters.type[0]);
                    if (extractedFilters?.location?.length) params.set('q', extractedFilters.location[0]);
                    if (extractedFilters?.priceMin) params.set('priceMin', extractedFilters.priceMin.toString());
                    if (extractedFilters?.priceMax) params.set('priceMax', extractedFilters.priceMax.toString());
                    router.push(params.toString() ? `/listings?${params.toString()}` : '/listings');
                  }}
                  className="rounded-xl text-xs font-black bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white flex items-center gap-1.5 h-10 px-5 shadow-md shadow-indigo-500/10"
                >
                  <span>{isTh ? 'ดูผลลัพธ์ทั้งหมด' : 'Show All Results'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
