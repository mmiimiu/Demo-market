/**
 * Agent-Owner Collaboration types
 * Agent assignments, commissions, referrals, marketplace
 */

import type { AssignmentType, CommissionType } from './property';

// ─── Agent Assignment ────────────────────────────────────────────────────────────

export type AssignmentStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface AgentAssignment {
  id: string;
  property_id: string;
  owner_id: string;
  agent_id: string;
  assignment_type: AssignmentType;
  status: AssignmentStatus;
  commission_rate: number;
  commission_type: CommissionType;
  assigned_at: Date;
  expires_at?: Date;
  completed_at?: Date;
  notes?: string;
}

// ─── Commission ───────────────────────────────────────────────────────────────────

export type CommissionStatus = 'pending' | 'earned' | 'paid' | 'cancelled';

export interface Commission {
  id: string;
  assignment_id: string;
  property_id: string;
  agent_id: string;
  owner_id: string;
  amount: number;
  status: CommissionStatus;
  earned_at?: Date;
  paid_at?: Date;
  payment_method?: string;
  transaction_id?: string;
}

// ─── Agent Referral ─────────────────────────────────────────────────────────────

export type ReferralStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface AgentReferral {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  property_id: string;
  status: ReferralStatus;
  commission_split: number; // Percentage split between agents
  referred_at: Date;
  responded_at?: Date;
  completed_at?: Date;
  notes?: string;
}

// ─── Agent Marketplace ───────────────────────────────────────────────────────────

export type AgentSpecialty = 'condo' | 'house' | 'apartment' | 'townhouse' | 'villa' | 'commercial';

export interface AgentProfile {
  id: string;
  user_id: string;
  company_name?: string;
  license_number?: string;
  specialties: AgentSpecialty[];
  service_areas: string[];
  rating: number;
  total_deals: number;
  response_time_avg: number; // in minutes
  approval_status: 'pending' | 'approved' | 'rejected';
  bio?: string;
  website?: string;
  facebook_page?: string;
  line_id?: string;
  commission_rates: {
    property_type: string;
    rate: number;
  }[];
  created_at: Date;
  updated_at: Date;
}

export interface AgentMarketplaceFilter {
  location?: string;
  specialties?: AgentSpecialty[];
  min_rating?: number;
  min_deals?: number;
  max_response_time?: number;
  page: number;
  limit: number;
}
