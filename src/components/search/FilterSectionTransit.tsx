import React from 'react';
import { Train } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/types';
import type { FilterState } from '../PrimeRentApp/types';

interface FilterSectionTransitProps {
  lang: Language;
  localState: FilterState;
  setLocalState: React.Dispatch<React.SetStateAction<FilterState>>;
}

export function FilterSectionTransit({ lang, localState, setLocalState }: FilterSectionTransitProps) {
  const options = ['< 300m', '< 500m', '< 1km', 'Any'];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
        <Train className="w-4 h-4 text-blue-500" /> 
        {lang === 'th' ? 'ห่างจากรถไฟฟ้า (BTS/MRT)' : 'Distance to Transit'}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map((dist) => (
          <button 
            key={dist}
            onClick={() => setLocalState(prev => ({ ...prev, transitDist: dist }))}
            className={cn(
              "px-4 py-3 rounded-xl border text-sm font-bold transition-all",
              localState.transitDist === dist 
                ? "bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-500/20 scale-105" 
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            {dist}
          </button>
        ))}
      </div>
    </div>
  );
}
