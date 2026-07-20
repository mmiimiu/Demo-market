import { 
  type PropertyType, 
  type Amenity, 
  type UserRole, 
  type PropertyStatus 
} from '@/lib/types';

export type { PropertyType, Amenity, UserRole, PropertyStatus };
export type InquiryStatus = 'new' | 'contacted' | 'showing_scheduled' | 'showing_completed' | 'negotiating' | 'contract_pending' | 'closed_won' | 'closed_lost';

// User interface
export interface User {
  id: string;
  email?: string;
  phone?: string;
  lineUserId?: string;
  googleId?: string;
  
  profile: {
    firstName: string;
    lastName: string;
    displayName: string;
    avatar?: string;
    dateOfBirth?: Date;
    nationality?: string;
  };
  
  role: UserRole;
  language: 'th' | 'en' | 'cn';
  currency: 'THB' | 'USD' | 'CNY';
  onboardingCompleted?: boolean;
  
  verified: {
    email: boolean;
    phone: boolean;
    ndid: boolean;
    agent: boolean;
  };
  
  agentProfile?: {
    companyName?: string;
    licenseNumber?: string;
    zones: any[]; // GeoJSON
    specialties: PropertyType[];
    rating: number;
    totalDeals: number;
    responseTimeAvg: number;
    approvalStatus: 'pending' | 'approved' | 'rejected';
  };
  
  ownerProfile?: {
    properties: string[];
    rating: number;
    totalProperties: number;
  };
  
  twoFactorEnabled: boolean;
  
  notifications: {
    email: boolean;
    sms: boolean;
    line: boolean;
    push: boolean;
    savedSearch: boolean;
    priceChange: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

// Property interface
export interface Property {
  id: string;
  
  name: {
    th: string;
    en: string;
    cn: string;
  };
  
  type: PropertyType;
  
  price: number;
  deposit: number;
  commonFee?: number;
  
  location: {
    address: {
      th: string;
      en: string;
      cn: string;
    };
    province: string;
    district: string;
    subdistrict: string;
    postalCode: string;
    coordinates: { latitude: number; longitude: number };
    nearestBTS?: string;
    nearestMRT?: string;
    distanceToBTS?: number;
  };
  
  details: {
    bedrooms: number;
    bathrooms: number;
    sqm: number;
    floor?: number;
    totalFloors?: number;
    furnished: boolean;
    petFriendly: boolean;
    smokingAllowed: boolean;
  };
  
  amenities: Amenity[];
  
  media: {
    photos: string[];
    videos?: string[];
    virtualTour360?: string;
    thumbnailUrl: string;
  };
  
  ownerId: string;
  agentId?: string;
  
  status: PropertyStatus;
  availableFrom?: Date;
  
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  
  views: number;
  saves: number;
  inquiries: number;
  
  boosted: boolean;
  boostedUntil?: Date;
  featuredUntil?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  expiresAt?: Date;
  lastRenewed?: Date;
}

// Inquiry interface
export interface Inquiry {
  id: string;
  userId: string;
  propertyId: string;
  ownerId: string;
  agentId?: string;
  
  message: string;
  preferredMoveInDate?: Date;
  leaseDuration?: number;
  budget?: {
    min: number;
    max: number;
  };
  
  status: InquiryStatus;
  
  dispatchedAt?: Date;
  acceptedAt?: Date;
  agentAcceptDeadline?: Date;
  
  showing?: {
    scheduledAt: Date;
    confirmedAt?: Date;
    completedAt?: Date;
    notes?: string;
  };
  
  lastContactAt?: Date;
  followUpAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}
