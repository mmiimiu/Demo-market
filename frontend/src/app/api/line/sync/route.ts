/**
 * @fileOverview LINE Account Sync endpoint
 * เชื่อมบัญชี LINE User ID เข้ากับ Firebase UID ของผู้ใช้
 *
 * Route: POST /api/line/sync
 * Body: { firebaseUid: string, lineUserId: string }
 *
 * Route: DELETE /api/line/sync
 * Body: { firebaseUid: string }
 * — ยกเลิกการเชื่อมบัญชี LINE
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { sendPushText } from '@/lib/line-notify';

/** POST — เชื่อมบัญชี LINE กับ Firebase UID */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firebaseUid, lineUserId } = body as {
      firebaseUid?: string;
      lineUserId?: string;
    };

    if (!firebaseUid || !lineUserId) {
      return NextResponse.json(
        { error: 'firebaseUid and lineUserId are required' },
        { status: 400 }
      );
    }

    // Validate lineUserId format (LINE User IDs start with 'U')
    if (!lineUserId.startsWith('U') || lineUserId.length !== 33) {
      return NextResponse.json(
        { error: 'Invalid LINE User ID format' },
        { status: 400 }
      );
    }

    // Check if this lineUserId is already linked to another account
    if (adminDb) {
      const existing = await adminDb
        .collection('users')
        .where('lineUserId', '==', lineUserId)
        .limit(1)
        .get();

      if (!existing.empty && existing.docs[0].id !== firebaseUid) {
        return NextResponse.json(
          { error: 'This LINE account is already linked to another user.' },
          { status: 409 }
        );
      }

      // Update user document
      await adminDb.collection('users').doc(firebaseUid).update({
        lineUserId,
        lineLinkedAt: new Date(),
      });
    }

    // Send confirmation push message via LINE
    await sendPushText(
      lineUserId,
      '✅ เชื่อมบัญชี PrimeRent สำเร็จแล้วครับ!\n\nจากนี้คุณจะได้รับการแจ้งเตือนสำคัญผ่าน LINE นี้ เช่น นัดหมายดูห้อง, บิลค่าเช่า และแจ้งหมดสัญญา\n\n🏠 PrimeRent Team'
    );

    return NextResponse.json({ ok: true, message: 'LINE account linked successfully.' });
  } catch (error) {
    console.error('[line-sync] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** DELETE — ยกเลิกการเชื่อมบัญชี LINE */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { firebaseUid } = body as { firebaseUid?: string };

    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'firebaseUid is required' },
        { status: 400 }
      );
    }

    if (adminDb) {
      // Get current lineUserId before removing
      const userDoc = await adminDb.collection('users').doc(firebaseUid).get();
      const lineUserId = userDoc.data()?.lineUserId;

      // Remove LINE fields
      await adminDb.collection('users').doc(firebaseUid).update({
        lineUserId: null,
        lineLinkedAt: null,
      });

      // Notify via LINE about unlinking
      if (lineUserId) {
        await sendPushText(
          lineUserId,
          '🔓 ยกเลิกการเชื่อมบัญชี PrimeRent แล้วครับ\n\nคุณจะไม่ได้รับการแจ้งเตือนผ่าน LINE อีกต่อไป หากต้องการเชื่อมใหม่ ไปที่เมนู Profile → การแจ้งเตือน LINE'
        );
      }
    }

    return NextResponse.json({ ok: true, message: 'LINE account unlinked successfully.' });
  } catch (error) {
    console.error('[line-sync] DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** GET — ตรวจสอบสถานะการเชื่อมบัญชี */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const firebaseUid = searchParams.get('uid');

  if (!firebaseUid) {
    return NextResponse.json({ error: 'uid query parameter required' }, { status: 400 });
  }

  try {
    if (adminDb) {
      const userDoc = await adminDb.collection('users').doc(firebaseUid).get();
      const data = userDoc.data();
      return NextResponse.json({
        linked: !!data?.lineUserId,
        lineUserId: data?.lineUserId ? `${data.lineUserId.substring(0, 6)}...` : null,
        linkedAt: data?.lineLinkedAt ?? null,
      });
    }
    return NextResponse.json({ linked: false, lineUserId: null, linkedAt: null });
  } catch (error) {
    console.error('[line-sync] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
