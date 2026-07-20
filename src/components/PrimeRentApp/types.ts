// PrimeRentApp — shared types & filter state

import type { Amenity } from '@/lib/types';

export interface FilterState {
  priceMin: number;
  priceMax: number;
  minBedrooms: number;
  minSqm: number;
  amenities: Amenity[];
  sort: 'latest' | 'low-high' | 'high-low';
  maxCommute: number;
  transitDist?: string;
  floorLevel?: string;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  priceMin: 0,
  priceMax: 150000,
  minBedrooms: 0,
  minSqm: 0,
  amenities: [],
  sort: 'latest',
  maxCommute: 0,
  transitDist: 'Any',
  floorLevel: 'Any',
};

export type MobileTab = 'home' | 'search' | 'post' | 'chat' | 'profile';

export type CommuteMode = 'bts' | 'car' | 'moto';

export interface AppModals {
  postListing: boolean;
  agentDashboard: boolean;
  ownerFinder: boolean;
  ownerDashboard: boolean;
  profile: boolean;
  support: boolean;
  rentalJourney: boolean;
}

export const DEFAULT_MODALS: AppModals = {
  postListing: false,
  agentDashboard: false,
  ownerFinder: false,
  ownerDashboard: false,
  profile: false,
  support: false,
  rentalJourney: false,
};
