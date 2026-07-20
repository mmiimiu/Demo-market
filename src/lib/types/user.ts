/**
 * User-related types — roles, profiles, KYC, preferences
 */

// ─── User Roles ────────────────────────────────────────────────────────────────

/**
 * Platform user roles (from lowest to highest privilege)
 * - user      : สมัครใหม่ ยังไม่เลือก role (default หลัง signup)
 * - renter    : ผู้เช่า — ค้นหาและติดต่อขอเช่าห้อง
 * - landlord  : เจ้าของห้อง — ลงประกาศและจัดการผู้เช่า
 * - agent     : นายหน้า — จัดการหลาย listing ให้ owner
 * - admin     : ผู้ดูแลระบบ
 * - superadmin: ผู้ดูแลระดับ infrastructure
 */
export type UserRole = 'user' | 'renter' | 'landlord' | 'owner' | 'agent' | 'admin' | 'superadmin' | 'sa';

/** Legacy alias สำหรับ backward compat (owner = landlord) */
export type LegacyUserRole = UserRole | 'owner' | 'sa';

// ─── KYC ──────────────────────────────────────────────────────────────────────

export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

// ─── Language ─────────────────────────────────────────────────────────────────

export type Language = 'th' | 'en' | 'cn';

// ─── Commute Mode ─────────────────────────────────────────────────────────────

export type CommuteMode = 'bts' | 'car' | 'moto';

// ─── User Profile ──────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email?: string;
  phone?: string;
  phoneNumber?: string; // Backward compatibility
  displayName?: string;
  photoURL?: string;

  role: UserRole;
  language: 'th' | 'en' | 'cn';

  /** Array of auth providers user signed up with (e.g. 'google', 'line', 'password', 'phone') */
  authProviders?: string[];

  /** true เมื่อผ่าน onboarding screen แล้ว */
  onboardingCompleted: boolean;

  kycStatus: KYCStatus;
  creditBalance: number;

  // LINE integration
  lineUserId?: string;
  isLineLinked?: boolean;
  lineLinkedAt?: Date | any;

  // Legacy or Flat Profile fields
  bio?: string;
  location?: string;
  urgency?: 'high' | 'medium' | 'low';
  moveInDate?: string;
  portfolioSize?: number;
  responseTime?: string;
  responseRate?: number;
  licenseId?: string;
  brokerName?: string;
  experienceYears?: number;
  specialties?: string[];
  lineId?: string;
  facebookPage?: string;
  website?: string;

  // Verified fields
  verified: {
    email: boolean;
    phone: boolean;
    ndid: boolean;
    agent: boolean;
  };

  // Role-specific profiles (optional — set เมื่อ upgrade role)
  agentProfile?: {
    companyName?: string;
    licenseNumber?: string;
    specialties: import('./property').PropertyType[];
    serviceAreas: string[];
    rating: number;
    totalDeals: number;
    responseTimeAvg: number;
    approvalStatus: 'pending' | 'approved' | 'rejected';
  };

  landlordProfile?: {
    properties: string[];
    rating: number;
    totalProperties: number;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    documents?: {
      idCardUrl?: string;
      titleDeedUrl?: string;
      bankAccountUrl?: string;
    };
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

  preferences?: {
    budgetMin: number;
    budgetMax: number;
    locations: string[];
    propertyTypes: import('./property').PropertyType[];
    amenities: import('./property').Amenity[];
  };

  createdAt: Date | any;
  updatedAt: Date | any;
  lastLogin?: Date | any;
}

// ─── Role Helpers ──────────────────────────────────────────────────────────────

/** Helper: check if role has admin privileges */
export function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'superadmin';
}

/** Helper: normalize legacy role names */
export function normalizeRole(role: string): UserRole {
  if (role === 'owner') return 'landlord';
  if (role === 'sa') return 'superadmin';
  if (role === 'renter') return 'renter';
  const valid: UserRole[] = ['user', 'renter', 'landlord', 'agent', 'admin', 'superadmin'];
  return valid.includes(role as UserRole) ? (role as UserRole) : 'user';
}
