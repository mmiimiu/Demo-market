/**
 * POST /api/auth/two-factor/setup
 * Setup 2FA for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { setupTOTP, setupSMS } from '@/lib/auth/two-factor';
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
    const { method, phone } = body;

    if (!method || !['totp', 'sms'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid method' },
        { status: 400 }
      );
    }

    let setup;
    if (method === 'totp') {
      setup = await setupTOTP(userId);
    } else {
      if (!phone) {
        return NextResponse.json(
          { error: 'Phone number required for SMS' },
          { status: 400 }
        );
      }
      setup = await setupSMS(userId, phone);
    }

    return NextResponse.json(setup, { status: 200 });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}
