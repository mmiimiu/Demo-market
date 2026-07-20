import { UserRole, KYCStatus, PropertyType, Amenity } from '../types';

export interface MockRenter {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  role: UserRole;
  kycStatus: KYCStatus;
  location: string;
  bio: string;
  urgency: 'high' | 'medium' | 'low';
  moveInDate: string;
  preferences: {
    budgetMin: number;
    budgetMax: number;
    locations: string[];
    propertyTypes: PropertyType[];
    amenities: Amenity[];
  };
}
