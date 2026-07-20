import { type AgentProfile, type MatchRequest } from './types';
import { TIER_WEIGHTS } from './constants';

/**
 * ตรวจสอบว่าเอเจนต์ให้บริการในพื้นที่ที่ต้องการหรือไม่
 * รองรับการ match แบบ fuzzy (ไม่ต้องเหมือนกันทุกตัวอักษร)
 */
export function zoneMatch(agentAreas: string[], location: string): boolean {
  const loc = location.toLowerCase();
  return agentAreas.some(area => {
    const a = area.toLowerCase();
    return loc.includes(a) || a.includes(loc) ||
      // Handle common abbreviations and aliases
      (loc.includes('สุขุมวิท') && (a.includes('อโศก') || a.includes('พร้อมพงษ์') || a.includes('ทองหล่อ'))) ||
      (loc.includes('sukhumvit') && (a.includes('asok') || a.includes('phrom phong')));
  });
}

/**
 * คำนวณ score สำหรับแต่ละเอเจนต์ (0–100)
 *
 * Weights:
 *   Rating            40%
 *   Tier              30%
 *   Response Rate     20%
 *   Availability      10%
 */
export function calculateScore(agent: AgentProfile, request: MatchRequest, zoneMatched: boolean): number {
  // Availability penalty — เอเจนต์ที่รับงานเยอะเกินไปจะได้คะแนนน้อย
  const capacityRatio = agent.activeJobs / Math.max(agent.maxJobs, 1);
  const availabilityScore = Math.max(0, 1 - capacityRatio);

  const ratingScore = (agent.rating / 5);
  const tierScore = TIER_WEIGHTS[agent.tier];
  const responseScore = agent.responseRate;

  const rawScore = (ratingScore * 0.40) + (tierScore * 0.30) + (responseScore * 0.20) + (availabilityScore * 0.10);

  // Specialty bonus (+10 points if agent specializes in requested property type)
  const specialtyBonus = agent.specialties.includes(request.propertyType) ? 0.10 : 0;

  // Zone match bonus (+5 if exact zone)
  const zoneBonus = zoneMatched ? 0.05 : 0;

  // Urgency adjustment — high urgency prefers fast responders
  let urgencyFactor = 1;
  if (request.urgency === 'high' && agent.avgResponseMinutes <= 10) {
    urgencyFactor = 1.15;
  } else if (request.urgency === 'low') {
    urgencyFactor = 1; // No penalty
  }

  const finalScore = Math.min(100, Math.round((rawScore + specialtyBonus + zoneBonus) * urgencyFactor * 100));
  return finalScore;
}

/**
 * Zone Fraud Prevention
 * ถ้า Agent ปฏิเสธงาน (reject) > 60% ของ Lead ในโซนนั้นๆ -> จะทำระบบ shrink zone (เอาโซนนั้นออกจากพื้นที่ให้บริการ) อัตโนมัติ
 */
export function checkZoneFraudAndShrink(
  agent: { uid: string; serviceAreas: string[] },
  zone: string,
  history: { zone: string; status: 'accepted' | 'rejected' }[]
): { serviceAreas: string[]; shrunk: boolean; message?: string } {
  const zoneLeads = history.filter(
    h => h.zone.toLowerCase().includes(zone.toLowerCase()) || zone.toLowerCase().includes(h.zone.toLowerCase())
  );
  
  if (zoneLeads.length < 5) {
    // Require at least 5 leads to prevent premature shrinking on initial rejects
    return { serviceAreas: agent.serviceAreas, shrunk: false };
  }

  const rejectedCount = zoneLeads.filter(h => h.status === 'rejected').length;
  const rejectRate = rejectedCount / zoneLeads.length;

  if (rejectRate > 0.6) {
    const updatedAreas = agent.serviceAreas.filter(
      area => !area.toLowerCase().includes(zone.toLowerCase()) && !zone.toLowerCase().includes(area.toLowerCase())
    );
    return {
      serviceAreas: updatedAreas,
      shrunk: true,
      message: `Agent ${agent.uid} ถูกจำกัดพื้นที่บริการ (Shrink Zone) ออกจากโซน "${zone}" เนื่องจากมีอัตราปฏิเสธงาน (Reject Rate) สูงถึง ${Math.round(rejectRate * 100)}% ซึ่งเกินเกณฑ์ 60%`
    };
  }

  return { serviceAreas: agent.serviceAreas, shrunk: false };
}
