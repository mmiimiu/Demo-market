/**
 * GET /api/auth/sessions
 * Get all active sessions for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserSessions } from '@/lib/auth/session';
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

    const sessions = await getUserSessions(userId);

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    );
  }
}
