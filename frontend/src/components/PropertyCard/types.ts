/**
 * PropertyCard component types
 */

import type { Property } from '@/lib/types/property';

export interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  showAgentInfo?: boolean;
}
