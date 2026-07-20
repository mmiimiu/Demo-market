/**
 * Types for OwnerDashboard handlers
 */

import type { Property } from '@/lib/types';

export interface OwnerDashboardHandlersProps {
  user: any;
  db: any;
  creditBalance: number;
  spend: (amount: number, description: string) => void;
  localProperties: Property[];
  setLocalProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  setIsPostListingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingProperty: React.Dispatch<React.SetStateAction<Property | null>>;
  isThai: boolean;
}
