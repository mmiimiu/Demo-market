/**
 * DELETE /api/auth/sessions/:sessionId
 * Revoke a specific session
 */

import { NextRequest, NextResponse } from 'next/server';
import { revokeSession } from '@/lib/auth/session';
import { verifyToken } from '@/lib/auth/jwt';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    await verifyToken(token);

    const success = await revokeSession(resolvedParams.sessionId);

    if (success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Failed to revoke session' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Revoke session error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke session' },
      { status: 500 }
    );
  }
}
