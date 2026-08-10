/**
 * @fileOverview Credit Usage API Endpoint
 * 
 * Route: POST /api/credit/usage
 * หักเครดิตเมื่อ User ใช้งานฟีเจอร์ที่ต้องจ่ายเครดิต (เช่น Boost, Pin, Renew)
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { CREDIT_COSTS, type CreditTransaction } from '@/lib/credit';
import { getOptionalAuth } from '@/lib/api/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, referenceId } = body;

    // Resolve user from authorization header if present
    const authContext = await getOptionalAuth(req);
    const resolvedUserId = authContext?.uid || userId;

    if (!resolvedUserId || !action) {
      return NextResponse.json({ error: 'userId and action are required' }, { status: 400 });
    }

    // @ts-ignore
    const cost = CREDIT_COSTS[action];
    if (typeof cost !== 'number') {
      return NextResponse.json({ error: 'Invalid action or unknown cost' }, { status: 400 });
    }

    if (adminDb) {
      // ใช้ transaction เพื่อป้องกัน race condition ในการหักยอดและตรวจยอดคงเหลือ
      const result = await adminDb!.runTransaction(async (t) => {
        const userRef = adminDb!.collection('users').doc(resolvedUserId);
        const userDoc = await t.get(userRef);
        
        let currentBalance = 0;
        if (userDoc.exists) {
          currentBalance = userDoc.data()?.creditBalance || 0;
        }

        if (currentBalance < cost) {
          throw new Error('INSUFFICIENT_CREDITS');
        }

        const newBalance = currentBalance - cost;

        // บันทึกธุรกรรม
        const txRef = adminDb!.collection('credit_transactions').doc();
        const txData: CreditTransaction = {
          id: txRef.id,
          userId: resolvedUserId,
          type: 'usage',
          amount: -cost,
          balanceAfter: newBalance,
          description: `Credit Used: ${action}`,
          referenceId: referenceId || 'none',
          createdAt: new Date(),
        };

        t.set(txRef, txData);
        t.update(userRef, { creditBalance: newBalance });

        return newBalance;
      });

      return NextResponse.json({ success: true, deducted: cost, remainingBalance: result });
    } else {
      // Mock for local dev
      return NextResponse.json({ success: true, deducted: cost, remainingBalance: 9999, mock: true });
    }

  } catch (error: any) {
    console.error('[credit-usage] Error:', error);
    if (error.message === 'INSUFFICIENT_CREDITS') {
       return NextResponse.json({ error: 'ยอดเครดิตไม่เพียงพอ กรุณาเติมเครดิตเพิ่ม' }, { status: 402 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

