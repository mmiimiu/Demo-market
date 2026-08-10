import { type AgentTier } from './types';

export const TIER_WEIGHTS: Record<AgentTier, number> = {
  platinum: 1.0,
  gold: 0.85,
  silver: 0.70,
  bronze: 0.55,
};

export const TIER_LABELS: Record<AgentTier, string> = {
  platinum: '💎 Platinum',
  gold: '🥇 Gold',
  silver: '🥈 Silver',
  bronze: '🥉 Bronze',
};
