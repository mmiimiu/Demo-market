/**
 * @fileOverview Agent Showing Scheduling API
 *
 * Route: GET/POST/PATCH /api/agent/showing
 *
 * GET   /api/agent/showing?agentId=&tenantId=&status=
 * POST  /api/agent/showing  { agentId, tenantId, propertyId, proposedSlots[] }
 * PATCH /api/agent/showing  { showingId, action: 'confirm'|'cancel'|'reschedule'|'complete'|'follow_up', slotId? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { showingService, type CreateShowingPayload } from '@/lib/services/showing';

/* ─────────────── GET: List Showings ─────────────── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId  = searchParams.get('agentId')  || '';
    const tenantId = searchParams.get('tenantId') || '';
    const status   = searchParams.get('status')   || '';

    const result = await showingService.getShowings(agentId, tenantId, status);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ─────────────── POST: Create Showing with Proposed Slots ─────────────── */
export async function POST(req: NextRequest) {
  try {
    const body: CreateShowingPayload = await req.json();
    const { agentId, tenantId, propertyId, proposedSlots } = body;

    if (!agentId || !tenantId || !propertyId || !proposedSlots?.length) {
      return NextResponse.json({ error: 'agentId, tenantId, propertyId, and proposedSlots are required' }, { status: 400 });
    }

    if (proposedSlots.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 proposed slots allowed' }, { status: 400 });
    }

    const result = await showingService.createShowing(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ─────────────── PATCH: Update Showing Status ─────────────── */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { showingId, action, slotId, reason, userId } = body as {
      showingId: string;
      action: 'confirm' | 'cancel' | 'reschedule' | 'complete' | 'follow_up' | 'sla_breach';
      slotId?: string;
      reason?: string;
      userId?: string;
    };

    if (!showingId || !action) {
      return NextResponse.json({ error: 'showingId and action are required' }, { status: 400 });
    }

    const result = await showingService.updateShowing({
      showingId,
      action,
      slotId,
      reason,
      userId
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
