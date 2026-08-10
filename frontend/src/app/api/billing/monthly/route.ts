/**
 * @fileOverview Monthly Billing API
 *
 * Route: POST /api/billing/monthly
 * GET  /api/billing/monthly?ownerId=&period=&roomNumber=
 */

import { NextRequest, NextResponse } from 'next/server';
import { billingService, type CreateBillPayload } from '@/lib/services/billing';

/* ─────────────── GET: List Bills ─────────────── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId    = searchParams.get('ownerId')    || '';
    const period     = searchParams.get('period')     || '';
    const roomNumber = searchParams.get('roomNumber') || '';
    const status     = searchParams.get('status')     || '';

    const result = await billingService.getBills(ownerId, period, roomNumber, status);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ─────────────── POST: Create Bill + Send LINE OA ─────────────── */
export async function POST(req: NextRequest) {
  try {
    const body: CreateBillPayload = await req.json();
    const { ownerId, roomNumber, tenantId, period } = body;

    if (!ownerId || !roomNumber || !tenantId || !period) {
      return NextResponse.json({ error: 'Missing required fields: ownerId, roomNumber, tenantId, period' }, { status: 400 });
    }

    const result = await billingService.createBill(body);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[Billing POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ─────────────── PATCH: Update Payment Status ─────────────── */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { billId, paidAmount, slipUrl, confirmedBy } = body as {
      billId: string; paidAmount: number; slipUrl?: string; confirmedBy?: string;
    };

    if (!billId || paidAmount === undefined) {
      return NextResponse.json({ error: 'billId and paidAmount are required' }, { status: 400 });
    }

    const result = await billingService.updateBillPayment({
      billId,
      paidAmount,
      slipUrl,
      confirmedBy
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
