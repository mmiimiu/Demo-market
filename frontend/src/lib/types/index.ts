/**
 * @fileOverview Central Type Definitions — Barrel Re-export
 * Import all shared types from here. Do NOT define UserRole/UserProfile elsewhere.
 * 
 * Types are split by domain:
 * - user.ts        → UserRole, UserProfile, KYCStatus, Language
 * - property.ts    → Property, PropertyType, Amenity, PropertyStatus
 * - communication.ts → ChatRoom, Message, Ticket
 * - auth.ts        → Auth providers, sessions, tokens, 2FA
 */

// ─── User ─────────────────────────────────────────────────────────────────────
export type {
  UserRole,
  LegacyUserRole,
  KYCStatus,
  Language,
  UserProfile,
  CommuteMode,
} from './user';

export {
  isAdminRole,
  normalizeRole,
} from './user';

// ─── Property ─────────────────────────────────────────────────────────────────
export type {
  PropertyType,
  PropertyStatus,
  AgentAccess,
  AssignmentType,
  CommissionType,
  Amenity,
  Property,
  PropertyImage,
  PropertySearchParams,
} from './property';

export { canPostListing } from './property';

// ─── Communication ─────────────────────────────────────────────────────────────
export type {
  ChatRoom,
  Message,
  Ticket,
} from './communication';

// ─── Auth ───────────────────────────────────────────────────────────────────────
export type {
  AuthProvider,
  Session,
  RefreshToken,
  TwoFactorMethod,
  TwoFactorSetup,
  TwoFactorVerification,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthErrorType,
  AuthError,
} from './auth';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export type {
  DashboardTab,
  DashboardStat,
  DashboardActivity,
  DashboardConfig,
} from './dashboard';

// ─── Collaboration ─────────────────────────────────────────────────────────────
export type {
  AssignmentStatus,
  AgentAssignment,
  CommissionStatus,
  Commission,
  ReferralStatus,
  AgentReferral,
  AgentSpecialty,
  AgentProfile,
  AgentMarketplaceFilter,
} from './collaboration';

// ─── Payment ──────────────────────────────────────────────────────────────────
export type {
  PaymentType,
  PaymentStatus,
  BillStatus,
  PayoutStatus,
  PaymentRecord,
  CommissionRecord,
  MonthlyBillItem,
  MonthlyBill,
} from './payment';
export { calcCommission, calcBillTotal } from './payment';
