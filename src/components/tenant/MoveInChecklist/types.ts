import type { Language } from '@/lib/types';

export interface ChecklistItem {
  id: string;
  category: string;
  name: string;
  status: 'good' | 'damaged' | 'untested' | null;
  remark: string;
  photos: string[];
}

export interface MoveInChecklistProps {
  lang: Language;
  propertyId: string;
  contractId: string;
  onComplete?: () => void;
}

export interface CategoryGroupProps {
  lang: Language;
  category: string;
  catItems: ChecklistItem[];
  updateItemStatus: (id: string, status: 'good' | 'damaged' | 'untested') => void;
  updateRemark: (id: string, remark: string) => void;
  handleMockUploadPhoto: (id: string) => void;
  removePhoto: (id: string, photoIndex: number) => void;
}
