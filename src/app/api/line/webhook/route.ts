/**
 * @fileOverview LINE Webhook endpoint — รับ events จาก LINE Platform
 * 
 * Route: POST /api/line/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { LineService } from '@/lib/services/line';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-line-signature') || '';

    // Verify LINE signature
    if (!LineService.verifyWebhookSignature(rawBody, signature)) {
      console.warn('[line-webhook] Invalid signature — rejected.');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const events: any[] = body.events || [];

    // Process events concurrently
    await Promise.all(
      events.map(async (event) => {
        try {
          switch (event.type) {
            case 'follow':
              await LineService.handleFollowEvent(event);
              break;
            case 'unfollow':
              console.log(`[line-webhook] Unfollowed by: ${event.source?.userId}`);
              break;
            case 'message':
              if (event.message?.type === 'text') {
                await LineService.handleTextMessage(event);
              }
              break;
            case 'postback':
              await LineService.handlePostback(event);
              break;
            default:
              console.log(`[line-webhook] Unhandled event type: ${event.type}`);
          }
        } catch (e) {
          console.error(`[line-webhook] Error handling event ${event.type}:`, e);
        }
      })
    );

    // LINE requires 200 OK response
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[line-webhook] Parse error:', error);
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

// LINE Webhook Verification (GET) — ใช้สำหรับ verify webhook URL ใน LINE Console
export async function GET() {
  return NextResponse.json({
    status: 'PrimeRent LINE Webhook is running',
    timestamp: new Date().toISOString(),
  });
}
