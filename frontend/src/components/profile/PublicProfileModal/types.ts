import { Language, UserRole, PropertyType, Amenity } from '@/lib/types';

export interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  lang: Language;
}

export interface ProfileData {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  role: UserRole;
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  location: string;
  bio: string;
  phoneNumber?: string;
  isAgentVerified?: boolean;
  experienceYears?: number;
  licenseId?: string;
  brokerName?: string;
  responseRate?: number;
  responseTime?: string;
  lineId?: string;
  specialties?: string[];
  portfolioSize?: number;
  urgency?: 'high' | 'medium' | 'low';
  moveInDate?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferences?: {
    budgetMin: number;
    budgetMax: number;
    locations: string[];
    propertyTypes: PropertyType[];
    amenities: Amenity[];
  };
}
