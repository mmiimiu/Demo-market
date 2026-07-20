/**
 * PropertyDetail component types
 */

import type { Property, Language } from '@/lib/types';

export interface PropertyDetailProps {
  property: Property;
  lang?: Language;
  onContactAgent?: () => void;
  onBookViewing?: () => void;
  onSave?: () => void;
  onClose?: () => void;
  isSaved?: boolean;
  onToggleSave?: (id: number) => void;
}
