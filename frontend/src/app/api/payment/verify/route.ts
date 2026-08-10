import { NextRequest, NextResponse } from 'next/server';

const pollCounts = new Map<string, number>();

/**
 * POST /api/payment/verify
 * Mock payment verification endpoint for PromptPay QR payment polling.
 * In production, integrate with your payment gateway (e.g., Omise, 2C2P) for real-time status.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, amount } = body;

    if (!paymentId) {
      return NextResponse.json({ status: 'error', message: 'Missing paymentId' }, { status: 400 });
    }

    // Increment poll count to simulate real gateway confirming transaction after scanning
    const count = (pollCounts.get(paymentId) || 0) + 1;
    pollCounts.set(paymentId, count);

    const finalStatus = count >= 3 ? 'successful' : 'pending';

    return NextResponse.json({
      status: finalStatus,
      paymentId,
      amount: amount || 0,
      timestamp: new Date().toISOString(),
      gateway: 'promptpay_qr',
      message: finalStatus === 'successful' ? 'Payment confirmed successfully' : 'Payment verification in progress.',
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

/**
 * GET /api/payment/verify?paymentId=xxx
 * Status check for a specific payment.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('paymentId') || 'unknown';
  
  const count = (pollCounts.get(paymentId) || 0) + 1;
  pollCounts.set(paymentId, count);
  const finalStatus = count >= 3 ? 'successful' : 'pending';

  return NextResponse.json({
    status: finalStatus,
    paymentId,
    gateway: 'promptpay_qr',
  });
}
