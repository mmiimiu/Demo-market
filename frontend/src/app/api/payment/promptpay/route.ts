/**
 * @fileOverview PromptPay QR Generator API Endpoint
 * Route: POST /api/payment/promptpay
 * 
 * Request Body:
 * {
 *   amount: number, // in THB
 *   description: string,
 *   metadata?: Record<string, string>
 * }
 * 
 * Returns: { chargeId, qrCodeBase64, amountTHB, expiresAt }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPromptPayQR } from '@/lib/omise';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, description, metadata = {} } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const qrResult = await createPromptPayQR(amount, description, metadata);

    return NextResponse.json({
      success: true,
      data: qrResult
    });

  } catch (error: any) {
    console.error('[payment-promptpay] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
