/**
 * Property-related types — property, amenity, status
 */

// ─── Property Enums ────────────────────────────────────────────────────────────

export type PropertyType = 'condo' | 'house' | 'apartment' | 'townhouse' | 'villa' | 'all';

export type PropertyStatus = 'available' | 'rented' | 'reserved' | 'hidden' | 'pending' | 'draft' | 'maintenance';

export type AgentAccess = 'public' | 'agent_only' | 'private';

export type AssignmentType = 'exclusive' | 'shared' | 'referral';

export type CommissionType = 'one_time' | 'recurring';

export type Amenity =
  | 'air' | 'parking' | 'furnished' | 'pool' | 'gym'
  | 'pet' | 'bts_mrt' | 'seaview' | 'garden' | 'nice_view'
  | 'playground' | 'bar' | 'wifi' | 'security' | 'aircon'
  | 'kitchen' | 'washing' | 'balcony' | 'elevator';

// ─── Property Interface ────────────────────────────────────────────────────────

export interface Property {
  id: string | number;
  type: PropertyType;
  status?: PropertyStatus;

  name: string;
  nameEn: string;
  nameCn: string;
  title?: string;
  description?: string;

  price: number;
  originalPrice?: number; // ⭐ Original price before discount (for Wishlist price-drop alert)
  deposit?: number;
  commonFee?: number;
  waterRate?: number;
  electricityRate?: number;
  internetIncluded?: boolean;

  location: string;
  locationEn: string;
  locationCn: string;
  coordinates?: { latitude: number; longitude: number };
  nearestBTS?: string;
  nearestMRT?: string;
  distanceToBTS?: number;
  nearbyPlaces?: string[];

  floor?: number;
  bed: number;
  bath: number;
  sqm: number;
  contractTerm?: number;

  photos?: string[];
  img: string;
  imageHint: string;
  thumbnailUrl?: string;
  tour360Url?: string;

  amenities: Amenity[];
  stars: number;
  badge: 'featured' | 'hot' | 'recommended' | '';

  isVerified?: boolean;
  verified?: boolean;
  contractStatus?: 'pending_signature' | 'signed' | 'unsigned';
  verifiedBy?: string;

  ownerId?: string;
  agentId?: string;
  assignedAgentId?: string; // ⭐ Agent assigned by owner
  agentAccess?: AgentAccess; // ⭐ Agent access level
  agentCommissionRate?: number; // ⭐ Commission rate for agents
  commissionType?: CommissionType; // ⭐ Commission type
  isAgentRepost?: boolean; // ⭐ True if reposted by agent (hides owner info)
  originalPropertyId?: string | number; // ⭐ Original property ID for reposts

  // ⭐ Drafts & Templates
  isTemplate?: boolean;
  isPublicTemplate?: boolean;
  templateName?: string;

  views?: number;
  saves?: number;
  inquiries?: number;

  boosted?: boolean;
  boostedUntil?: Date;

  mapPin?: { x: number; y: number };

  createdAt?: Date | any;
  updatedAt?: Date | any;
  publishedAt?: Date | any;
  expiresAt?: Date | any;
}

// ─── Property Image ───────────────────────────────────────────────────────────────

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  order: number;
  uploaded_at: Date;
}

// ─── Property Search Params ───────────────────────────────────────────────────────

export interface PropertySearchParams {
  query?: string;
  location?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  min_price?: number;
  max_price?: number;
  property_type?: PropertyType[];
  bedrooms?: number;
  bathrooms?: number;
  min_sqm?: number;
  max_sqm?: number;
  nearby_bts?: string[];
  nearby_mrt?: string[];
  amenities?: Amenity[];
  agent_access?: AgentAccess;
  page: number;
  limit: number;
  sort: 'price_asc' | 'price_desc' | 'newest' | 'nearest';
}

// ─── Property Helpers ─────────────────────────────────────────────────────────

/** Helper: check if role can post listings */
export function canPostListing(role: import('./user').UserRole): boolean {
  return role === 'landlord' || role === 'agent' || role === 'admin' || role === 'superadmin';
}

// ─── Ownership Verification ───────────────────────────────────────────────────

export interface PropertyOwnershipVerification {
  id?: string;
  uid: string;
  landOffice: string;
  deedNumber: string;
  deedFileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any; // Firestore Timestamp
  approvedAt?: any; // Firestore Timestamp
  rejectionReason?: string;
}
