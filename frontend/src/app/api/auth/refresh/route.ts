/**
 * POST /api/auth/refresh
 * Refresh access token endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/auth/core';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.refresh_token) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }
    
    const authResponse = await refreshAccessToken(body.refresh_token);
    
    return NextResponse.json(authResponse, { status: 200 });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 401 }
    );
  }
}
