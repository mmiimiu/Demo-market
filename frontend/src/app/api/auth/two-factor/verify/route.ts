/**
 * POST /api/auth/two-factor/verify
 * Verify 2FA code
 */

import { NextRequest, NextResponse } from 'next/server';
import { verify2FACode } from '@/lib/auth/two-factor';
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
    const userId = payload.user_id as string;

    const body = await request.json();
    const { code, method } = body;

    if (!code || !method || !['totp', 'sms'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const isValid = await verify2FACode(userId, code, method);

    if (isValid) {
      return NextResponse.json({ valid: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
