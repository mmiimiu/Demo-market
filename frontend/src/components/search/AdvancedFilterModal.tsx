import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/types';
import type { FilterState } from '../PrimeRentApp/types';
import { FilterSectionPrice } from './FilterSectionPrice';
import { FilterSectionTransit } from './FilterSectionTransit';
import { FilterSectionDetails } from './FilterSectionDetails';
import { DEFAULT_FILTER_STATE } from '../PrimeRentApp/types';

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  filterState: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
}

export function AdvancedFilterModal({
  isOpen, onClose, lang, filterState, onFilterChange
}: AdvancedFilterModalProps) {
  
  const [localState, setLocalState] = React.useState<FilterState>(filterState);

  React.useEffect(() => {
    if (isOpen) setLocalState(filterState);
  }, [isOpen, filterState]);

  const handleApply = () => {
    onFilterChange(localState);
    onClose();
  };

  const handleClear = () => {
    setLocalState({ ...DEFAULT_FILTER_STATE });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className={cn(
        "sm:max-w-xl p-0 overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-xl",
        lang === 'th' ? "font-thai" : lang === 'cn' ? "font-chinese" : "font-english"
      )}>
        <DialogHeader className="p-6 border-b border-gray-200/50 dark:border-slate-800/50 flex flex-row items-center justify-between sticky top-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md z-10 shadow-sm">
          <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">
            {lang === 'th' ? 'ตัวกรองแบบละเอียด' : lang === 'cn' ? '高级筛选' : 'Advanced Filters'}
          </DialogTitle>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </DialogHeader>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-10 custom-scrollbar">
          
          <FilterSectionPrice 
            lang={lang} 
            localState={localState} 
            setLocalState={setLocalState} 
          />

          <div className="w-full h-px bg-gray-100" />

          <FilterSectionTransit 
            lang={lang} 
            localState={localState} 
            setLocalState={setLocalState} 
          />

          <div className="w-full h-px bg-gray-100" />

          <FilterSectionDetails 
            lang={lang} 
            localState={localState} 
            setLocalState={setLocalState} 
          />
          
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <button onClick={handleClear} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
            {lang === 'th' ? 'ล้างทั้งหมด' : 'Clear All'}
          </button>
          <Button onClick={handleApply} className="bg-[#E51D53] hover:bg-[#D41B4D] text-white px-8 h-12 rounded-xl font-black shadow-lg shadow-[#E51D53]/20 hover:scale-[1.02] transition-transform">
            {lang === 'th' ? 'แสดงผลลัพธ์' : 'Show Results'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
