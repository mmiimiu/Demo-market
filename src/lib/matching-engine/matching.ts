import { type AgentProfile, type MatchRequest, type MatchResult, type HandoffResult } from './types';
import { TIER_LABELS } from './constants';
import { zoneMatch, calculateScore } from './scoring';

/**
 * จับคู่เอเจนต์ที่เหมาะสมที่สุดจาก pool ที่ให้มา
 *
 * @param agents    - รายชื่อเอเจนต์ทั้งหมดที่พร้อมรับงาน
 * @param request   - รายละเอียด property/renter ที่ต้องการ
 * @param topN      - จำนวนเอเจนต์ที่ต้องการส่งคืน (default: 3)
 */
export function matchAgents(
  agents: AgentProfile[],
  request: MatchRequest,
  topN: number = 3
): MatchResult[] {
  const now = new Date();
  const SLA_MINUTES = 30;

  // Filter: available agents with capacity
  const available = agents.filter(a => a.isAvailable && a.activeJobs < a.maxJobs);
  if (available.length === 0) return [];

  // Round 1: Zone match
  let zoneMatched = available.filter(a => zoneMatch(a.serviceAreas, request.propertyLocation));
  let isRadiusExpanded = false;

  // Round 2: Dynamic radius expansion — ถ้าไม่มีเอเจนต์ในพื้นที่ใช้ pool ทั้งหมด
  if (zoneMatched.length === 0) {
    zoneMatched = available; // Expand radius to all available agents
    isRadiusExpanded = true;
    console.log(`[matching-engine] No agents in zone "${request.propertyLocation}" — expanded radius.`);
  }

  // Score all candidates
  const scored = zoneMatched.map(agent => {
    const exactZone = zoneMatch(agent.serviceAreas, request.propertyLocation);
    const score = calculateScore(agent, request, exactZone);

    const matchReasons: string[] = [];
    if (exactZone && !isRadiusExpanded) matchReasons.push(`📍 ให้บริการในพื้นที่ ${request.propertyLocation}`);
    if (isRadiusExpanded) matchReasons.push('🔄 ขยายรัศมีการค้นหา');
    if (agent.specialties.includes(request.propertyType)) matchReasons.push(`🏠 เชี่ยวชาญ ${request.propertyType}`);
    if (agent.tier === 'platinum' || agent.tier === 'gold') matchReasons.push(`${TIER_LABELS[agent.tier]}`);
    if (agent.responseRate >= 0.95) matchReasons.push(`⚡ ตอบกลับเร็ว ${Math.round(agent.responseRate * 100)}%`);
    if (agent.rating >= 4.5) matchReasons.push(`⭐ Rating ${agent.rating}/5`);

    const slaDeadline = new Date(now.getTime() + SLA_MINUTES * 60 * 1000);

    return {
      agent,
      score,
      matchReasons: matchReasons.slice(0, 3), // Top 3 reasons
      isRadiusExpanded,
      estimatedResponseMinutes: agent.avgResponseMinutes,
      slaDeadline,
    } as MatchResult;
  });

  // Sort by score descending, return top N
  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}

/**
 * Warm Handoff — ส่งต่องานให้เอเจนต์ใหม่ เมื่อ SLA หมดหรือเอเจนต์ปัจจุบันไม่ตอบ
 *
 * @param originalAgentId   - UID เอเจนต์ที่ไม่ตอบ
 * @param agents            - Pool เอเจนต์ทั้งหมด
 * @param request           - Request เดิม
 * @param reason            - เหตุผลที่ handoff
 */
export function warmHandoff(
  originalAgentId: string,
  agents: AgentProfile[],
  request: MatchRequest,
  reason: 'sla_timeout' | 'agent_declined' | 'agent_offline' = 'sla_timeout'
): HandoffResult | null {
  // Exclude original agent
  const candidates = agents.filter(a => a.uid !== originalAgentId && a.isAvailable && a.activeJobs < a.maxJobs);
  if (candidates.length === 0) return null;

  const [best] = matchAgents(candidates, request, 1);
  if (!best) return null;

  const reasonLabels = {
    sla_timeout: 'SLA 30 นาทีหมดเวลา',
    agent_declined: 'เอเจนต์ปฏิเสธงาน',
    agent_offline: 'เอเจนต์ออฟไลน์',
  };

  return {
    originalAgentId,
    newAgent: best.agent,
    handoffReason: reasonLabels[reason],
    handoffAt: new Date(),
  };
}

export interface MatchPitch {
  id: string;
  senderId: string;
  senderRole: 'agent' | 'owner' | 'tenant';
  receiverId: string;
  propertyId?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

/**
 * Creates a manual pitch request from one user to another based on a match.
 * The receiver will see this in their notifications and can choose to accept,
 * which will then open a chat room.
 */
export function createMatchPitch(
  senderId: string,
  senderRole: 'agent' | 'owner' | 'tenant',
  receiverId: string,
  propertyId?: string
): MatchPitch {
  // In a real app, this would insert a record into the database.
  // For now, we return a mock object.
  console.log(`[matching-engine] Pitch created from ${senderRole} ${senderId} to ${receiverId} for property ${propertyId}`);
  return {
    id: `pitch_${Date.now()}`,
    senderId,
    senderRole,
    receiverId,
    propertyId,
    status: 'pending',
    createdAt: new Date()
  };
}
