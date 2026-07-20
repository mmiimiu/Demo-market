/**
 * AgentMarketplace component types
 */

import type { AgentProfile, AgentMarketplaceFilter, AgentSpecialty } from '@/lib/types/collaboration';

export interface AgentMarketplaceProps {
  onAssignAgent?: (agentId: string) => void;
  initialFilter?: Partial<AgentMarketplaceFilter>;
}

export interface AgentCardProps {
  agent: AgentProfile;
  onAssign?: () => void;
  onViewProfile?: () => void;
}
