import { Property, Language } from '@/lib/types';

export interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
  lang: Language;
  currency: 'THB' | 'USD' | 'CNY';
  isSaved: boolean;
  onToggleSave: (id: number) => void;
  workLocation?: string;
}
