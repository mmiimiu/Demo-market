import { Property, Language } from '@/lib/types';

export interface PropertyCardProps {
  property: Property;
  lang: Language;
  currency: 'THB' | 'USD' | 'CNY';
  onViewDetails: (p: Property) => void;
  isSaved: boolean;
  onToggleSave: (id: number) => void;
  onQuickChat?: (property: Property) => void;
  workLocation?: string;
  /** Property comparison */
  onCompare?: (property: Property) => void;
  isInCompare?: boolean;
  canCompare?: boolean;
}
