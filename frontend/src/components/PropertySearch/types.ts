/**
 * PropertySearch component types
 */

import type { PropertySearchParams, PropertyType, Amenity } from '@/lib/types/property';

export interface PropertySearchProps {
  onSearch: (params: PropertySearchParams) => void;
  initialParams?: Partial<PropertySearchParams>;
}
