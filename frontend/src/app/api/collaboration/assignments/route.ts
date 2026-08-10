/**
 * POST /api/collaboration/assignments
 * Assign an agent to a property
 */

import { NextRequest, NextResponse } from 'next/server';
import { assignAgentToProperty } from '@/lib/collaboration/assignments';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    const ownerId = payload.user_id as string;

    const body = await request.json();
    const { propertyId, agentId, assignmentType, commissionRate, commissionType, notes } = body;

    if (!propertyId || !agentId || !assignmentType || commissionRate === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const assignment = await assignAgentToProperty(
      propertyId,
      agentId,
      ownerId,
      assignmentType,
      commissionRate,
      commissionType || 'one_time',
      notes
    );

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
