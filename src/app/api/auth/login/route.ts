/**
 * POST /api/auth/login
 * User login endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth/core';
import type { LoginRequest } from '@/lib/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    
    // Validate required fields
    if (!body.provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }
    
    if (body.provider === 'email' && (!body.email || !body.password)) {
      return NextResponse.json(
        { error: 'Email and password are required for email login' },
        { status: 400 }
      );
    }
    
    const authResponse = await loginUser(body);
    
    return NextResponse.json(authResponse, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
