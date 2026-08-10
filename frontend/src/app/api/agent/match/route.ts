/**
 * @fileOverview Agent Matching API Endpoint
 * Route: POST /api/agent/match
 *
 * Body: {
 *   propertyLocation: string,
 *   propertyType: string,
 *   priceRange: { min: number, max: number },
 *   urgency: 'high' | 'medium' | 'low',
 *   requesterId: string,
 *   topN?: number
 * }
 *
 * Returns: Array of MatchResult (top N agents)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  matchAgents,
  calculateCommissionSplit,
  type MatchRequest,
  MOCK_AGENTS,
} from '@/lib/matching-engine';

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      propertyLocation,
      propertyType,
      priceRange,
      urgency = 'medium',
      requesterId,
      topN = 3,
    } = body as MatchRequest & { topN?: number };

    if (!propertyLocation || !propertyType || !requesterId) {
      return NextResponse.json(
        { error: 'propertyLocation, propertyType, and requesterId are required' },
        { status: 400 }
      );
    }

    const request: MatchRequest = {
      propertyLocation,
      propertyType,
      priceRange: priceRange || { min: 0, max: 999999 },
      urgency,
      requesterId,
    };

    const results = matchAgents(MOCK_AGENTS, request, topN);

    if (results.length === 0) {
      return NextResponse.json({
        results: [],
        message: 'ไม่พบเอเจนต์ที่พร้อมรับงานในขณะนี้ กรุณาลองใหม่ภายหลัง',
      });
    }

    // Attach commission preview for each matched agent
    const enrichedResults = results.map(r => {
      const sampleCommission = Math.round(request.priceRange.max * 0.5); // ~0.5 month
      const commission = calculateCommissionSplit(sampleCommission, r.agent.tier, false);
      return { ...r, commissionPreview: commission };
    });

    return NextResponse.json({
      results: enrichedResults,
      totalCandidates: MOCK_AGENTS.length,
      matchedInZone: results.filter(r => !r.isRadiusExpanded).length,
    });
  } catch (error) {
    console.error('[agent-match] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET — ดูเอเจนต์ทั้งหมด (สำหรับ admin debug)
export async function GET() {
  return NextResponse.json({
    totalAgents: MOCK_AGENTS.length,
    available: MOCK_AGENTS.filter(a => a.isAvailable).length,
    byTier: {
      platinum: MOCK_AGENTS.filter(a => a.tier === 'platinum').length,
      gold: MOCK_AGENTS.filter(a => a.tier === 'gold').length,
      silver: MOCK_AGENTS.filter(a => a.tier === 'silver').length,
      bronze: MOCK_AGENTS.filter(a => a.tier === 'bronze').length,
    },
  });
}
