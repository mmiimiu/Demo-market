import React from 'react';
import { Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import type { Language } from '@/lib/types';
import type { FilterState } from '../PrimeRentApp/types';

interface FilterSectionPriceProps {
  lang: Language;
  localState: FilterState;
  setLocalState: React.Dispatch<React.SetStateAction<FilterState>>;
}

export function FilterSectionPrice({ lang, localState, setLocalState }: FilterSectionPriceProps) {
  const quickPrices = [
    { label: '< 10k', min: 0, max: 10000 },
    { label: '10k - 20k', min: 10000, max: 20000 },
    { label: '20k - 50k', min: 20000, max: 50000 },
    { label: '> 50k', min: 50000, max: 150000 },
  ];

  const handleQuickPrice = (min: number, max: number) => {
    setLocalState(prev => ({ ...prev, priceMin: min, priceMax: max }));
  };

  const isQuickSelected = (min: number, max: number) => {
    return localState.priceMin === min && localState.priceMax === max;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
        <Banknote className="w-4 h-4 text-green-500" /> 
        {lang === 'th' ? 'ช่วงราคาเช่า (Price Range)' : 'Price Range'}
      </h3>
      
      {/* Quick Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {quickPrices.map((p, i) => (
          <button 
            key={i}
            onClick={() => handleQuickPrice(p.min, p.max)}
            className={cn(
              "px-4 py-3 rounded-xl border text-sm font-bold transition-all",
              isQuickSelected(p.min, p.max)
                ? "bg-green-50 border-green-200 text-green-700 ring-2 ring-green-500/20 scale-105" 
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Manual Input */}
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-bold text-gray-500">{lang === 'th' ? 'ต่ำสุด (Min)' : 'Min Price'}</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400 font-bold">฿</span>
            <Input 
              type="number" 
              value={localState.priceMin} 
              onChange={(e) => setLocalState(prev => ({ ...prev, priceMin: Number(e.target.value) }))}
              className="pl-8 font-bold border-gray-200 focus:border-green-500 rounded-xl"
            />
          </div>
        </div>
        <div className="pt-6 font-black text-gray-300">-</div>
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-bold text-gray-500">{lang === 'th' ? 'สูงสุด (Max)' : 'Max Price'}</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400 font-bold">฿</span>
            <Input 
              type="number" 
              value={localState.priceMax} 
              onChange={(e) => setLocalState(prev => ({ ...prev, priceMax: Number(e.target.value) }))}
              className="pl-8 font-bold border-gray-200 focus:border-green-500 rounded-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
