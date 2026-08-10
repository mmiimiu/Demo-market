import { Language, Property, PropertyType, Amenity } from '@/lib/types';

export interface ListingFormProps {
  lang: Language;
  initialData?: Partial<Property>;
  propertyId?: string;
}

export interface ListingFormData {
  title: string;
  description: string;
  price: string;
  type: PropertyType;
  location: string;
  floor: string;
  bed: string;
  bath: string;
  sqm: string;
  deposit: string;
  contractTerm: string;
  commonFee: string;
  tour360Url: string;
  amenities: Amenity[];
  commissionOffer: string;
  agentBrokerage: string;
  deedNumber: string;
  roomNumber: string;
  waterRate: string;
  electricityRate: string;
  internetIncluded: boolean;
  verifiedPropertyId?: string;
}
