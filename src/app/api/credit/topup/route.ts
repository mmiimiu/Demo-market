/**
 * @fileOverview Credit Top-up API Endpoint
 * 
 * Route: POST /api/credit/topup
 * API นี้อาจถูกเรียกจาก Payment Webhook (กรณี successful payment)
 * เพื่อเติมเครดิตเข้าบัญชี User
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { CREDIT_PACKAGES, calculateTotalCredits, type CreditTransaction } from '@/lib/credit';
import { getOptionalAuth } from '@/lib/api/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, packageId, chargeId } = body;

    // Resolve user from authorization header if present
    const authContext = await getOptionalAuth(req);
    const resolvedUserId = authContext?.uid || userId;

    if (!resolvedUserId || !packageId) {
      return NextResponse.json({ error: 'userId and packageId are required' }, { status: 400 });
    }

    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 });
    }

    const creditsToAdd = calculateTotalCredits(packageId);

    if (adminDb) {
      // ใช้ transaction เพื่อป้องกัน race condition ในการอัปเดตยอดคงเหลือ
      await adminDb!.runTransaction(async (t) => {
        const userRef = adminDb!.collection('users').doc(resolvedUserId);
        const userDoc = await t.get(userRef);
        
        let currentBalance = 0;
        if (userDoc.exists) {
          currentBalance = userDoc.data()?.creditBalance || 0;
        }

        const newBalance = currentBalance + creditsToAdd;

        // บันทึกธุรกรรม
        const txRef = adminDb!.collection('credit_transactions').doc();
        const txData: CreditTransaction = {
          id: txRef.id,
          userId: resolvedUserId,
          type: 'topup',
          amount: creditsToAdd,
          balanceAfter: newBalance,
          description: `Top-up Package: ${pkg.name}`,
          referenceId: chargeId || 'unknown_charge',
          createdAt: new Date(),
        };

        t.set(txRef, txData);
        t.update(userRef, { creditBalance: newBalance });
      });

      return NextResponse.json({ success: true, added: creditsToAdd });
    } else {
      // Mock for local dev
      return NextResponse.json({ success: true, added: creditsToAdd, mock: true });
    }

  } catch (error: any) {
    console.error('[credit-topup] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

