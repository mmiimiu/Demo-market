import { Language } from '@/lib/types';

export interface SidebarFiltersProps {
  lang: Language;
  currency: 'THB' | 'USD' | 'CNY';
  currentCity: string;
  filterState: any;
  setFilterState: React.Dispatch<React.SetStateAction<any>>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
