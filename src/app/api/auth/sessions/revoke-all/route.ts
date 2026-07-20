/**
 * DELETE /api/auth/sessions/revoke-all
 * Revoke all sessions except current
 */

import { NextRequest, NextResponse } from 'next/server';
import { revokeAllSessions } from '@/lib/auth/session';
import { verifyToken } from '@/lib/auth/jwt';

export async function DELETE(request: NextRequest) {
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
    const currentSessionId = payload.session_id as string;

    const revokedCount = await revokeAllSessions(userId, currentSessionId);

    return NextResponse.json(
      { revoked_count: revokedCount },
      { status: 200 }
    );
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke sessions' },
      { status: 500 }
    );
  }
}
