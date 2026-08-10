'use client';

/**
 * UserProfile — shared types, theme map, form state type
 */

import type { UserRole, Language, PropertyType, Amenity } from '@/lib/types';

export type ProfileTab =
  | 'info'
  | 'security'
  | 'preferences'
  | 'agent_dashboard'
  | 'owner_properties'
  | 'public_profile'
  | 'upgrade'
  | 'delegations'
  | 'credits'
  | 'saved_searches'
  | 'search_reports'
  | 'saved_properties'
  | 'tenant_screening'
  | 'my_listings'
  | 'payment'
  | 'contracts';


export interface ProfileFormData {
  displayName: string;
  phoneNumber: string;
  location: string;
  bio: string;
  // Renter
  urgency: 'high' | 'medium' | 'low';
  moveInDate: string;
  budgetMin: number;
  budgetMax: number;
  locations: string[];
  propertyTypes: PropertyType[];
  amenities: Amenity[];
  // Landlord
  portfolioSize: number;
  responseTime: string;
  responseRate: number;
  // Agent
  licenseId: string;
  brokerName: string;
  experienceYears: number;
  specialties: string[];
  lineId: string;
  facebookPage: string;
  website: string;
  email: string;
}

export const DEFAULT_FORM_DATA: ProfileFormData = {
  displayName: '',
  phoneNumber: '',
  location: '',
  bio: '',
  urgency: 'medium',
  moveInDate: '',
  budgetMin: 10000,
  budgetMax: 30000,
  locations: [],
  propertyTypes: [],
  amenities: [],
  portfolioSize: 1,
  responseTime: 'ภายใน 1 ชั่วโมง',
  responseRate: 98,
  licenseId: '',
  brokerName: '',
  experienceYears: 1,
  specialties: [],
  lineId: '',
  facebookPage: '',
  website: '',
  email: '',
};

export interface RoleTheme {
  primary: string;
  text: string;
  textDark: string;
  bgLight: string;
  border: string;
  accent: string;
  badgeClass: string;
  label: string;
}

export function getRoleTheme(role: UserRole, lang: Language): RoleTheme {
  const themes: Record<UserRole, RoleTheme> = {
    renter: { primary: 'bg-emerald-500', text: 'text-emerald-500', textDark: 'text-emerald-900', bgLight: 'bg-emerald-50/70', border: 'border-emerald-100', accent: 'emerald', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: lang === 'th' ? 'ผู้เช่า (Renter)' : 'Renter' },
    user: { primary: 'bg-emerald-500', text: 'text-emerald-500', textDark: 'text-emerald-900', bgLight: 'bg-emerald-50/70', border: 'border-emerald-100', accent: 'emerald', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: lang === 'th' ? 'ผู้ใช้งานใหม่' : 'New User' },
    landlord: { primary: 'bg-indigo-600', text: 'text-indigo-600', textDark: 'text-indigo-900', bgLight: 'bg-indigo-50/70', border: 'border-indigo-100', accent: 'indigo', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: lang === 'th' ? 'เจ้าของที่พัก (Landlord)' : 'Landlord' },
    owner: { primary: 'bg-indigo-600', text: 'text-indigo-600', textDark: 'text-indigo-900', bgLight: 'bg-indigo-50/70', border: 'border-indigo-100', accent: 'indigo', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: lang === 'th' ? 'เจ้าของที่พัก (Owner)' : 'Owner' },
    agent: { primary: 'bg-teal-500', text: 'text-teal-500', textDark: 'text-teal-900', bgLight: 'bg-teal-50/70', border: 'border-teal-100', accent: 'teal', badgeClass: 'bg-teal-50 text-teal-700 border-teal-200', label: lang === 'th' ? 'ตัวแทน (Agent)' : 'Agent' },
    admin: { primary: 'bg-violet-600', text: 'text-violet-600', textDark: 'text-violet-900', bgLight: 'bg-violet-50/70', border: 'border-violet-100', accent: 'violet', badgeClass: 'bg-violet-50 text-violet-700 border-violet-200', label: lang === 'th' ? 'ผู้ดูแลระบบ (Admin)' : 'Admin' },
    superadmin: { primary: 'bg-rose-600', text: 'text-rose-600', textDark: 'text-rose-900', bgLight: 'bg-rose-50/70', border: 'border-rose-100', accent: 'rose', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Super Admin' },
    sa: { primary: 'bg-rose-600', text: 'text-rose-600', textDark: 'text-rose-900', bgLight: 'bg-rose-50/70', border: 'border-rose-100', accent: 'rose', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Super Admin' },
  };
  return themes[role] || themes.renter;
}
