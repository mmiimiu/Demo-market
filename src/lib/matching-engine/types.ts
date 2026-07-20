export type AgentTier = 'platinum' | 'gold' | 'silver' | 'bronze';

export interface AgentProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  lineId?: string;
  tier: AgentTier;
  rating: number;           // 0–5
  responseRate: number;     // 0–1 (e.g. 0.92 = 92%)
  avgResponseMinutes: number;
  serviceAreas: string[];   // e.g. ['สุขุมวิท', 'อโศก', 'ทองหล่อ']
  specialties: string[];    // e.g. ['condo', 'house']
  activeJobs: number;       // current assigned jobs
  maxJobs: number;          // capacity
  isAvailable: boolean;
  experienceYears: number;
  totalDeals: number;
}

export interface MatchRequest {
  propertyLocation: string;
  propertyType: string;
  priceRange: { min: number; max: number };
  urgency: 'high' | 'medium' | 'low';
  requesterId: string;
}

export interface MatchResult {
  agent: AgentProfile;
  score: number;            // 0–100
  matchReasons: string[];
  isRadiusExpanded: boolean;
  estimatedResponseMinutes: number;
  slaDeadline: Date;        // 30 minutes from match time
}

export interface HandoffResult {
  originalAgentId: string;
  newAgent: AgentProfile;
  handoffReason: string;
  handoffAt: Date;
}

export interface CommissionSplit {
  agentAmount: number;
  platformAmount: number;
  referralAmount: number;
  total: number;
  breakdown: string[];
}
