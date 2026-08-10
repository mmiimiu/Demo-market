/**
 * GET /api/collaboration/commissions
 * Get commissions for authenticated user (agent or owner)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentCommissions, getOwnerCommissions } from '@/lib/collaboration/commissions';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
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
    const userId = payload.user_id as string;
    const role = payload.role as string;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;

    let commissions;
    if (role === 'agent') {
      commissions = await getAgentCommissions(userId, status);
    } else if (role === 'landlord') {
      commissions = await getOwnerCommissions(userId);
    } else {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    return NextResponse.json({ commissions }, { status: 200 });
  } catch (error) {
    console.error('Get commissions error:', error);
    return NextResponse.json(
      { error: 'Failed to get commissions' },
      { status: 500 }
    );
  }
}
