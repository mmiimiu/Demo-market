import { Language } from '@/lib/types';

export interface NavbarProps {
  lang?: Language;
  setLang?: (lang: Language) => void;
  scrolled: boolean;
  currency?: 'THB' | 'USD' | 'CNY';
  setCurrency?: (curr: 'THB' | 'USD' | 'CNY') => void;
  onOpenPostListing?: () => void;
  onOpenAgentDashboard?: () => void;
  onOpenOwnerFinder?: () => void;
  onOpenOwnerDashboard?: () => void;
  onOpenProfile?: () => void;
  onOpenSupport?: () => void;
  onOpenRentalJourney?: () => void;
  transparent?: boolean;
  showMiniSearch?: boolean;
  portal?: 'owner' | 'tenant' | 'agent' | 'admin';
}
