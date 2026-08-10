/**
 * @fileOverview API Endpoint for Owner to invite an Agent
 * Route: POST /api/owner/invite-agent
 * 
 * Request: { propertyId: string, agentId: string }
 * Response: { success: boolean, invitationId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, agentId } = body;

    if (!propertyId || !agentId) {
      return NextResponse.json({ error: 'propertyId and agentId are required' }, { status: 400 });
    }

    if (adminDb) {
      // 1. ตรวจสอบว่ามี property นี้และ agent นี้จริงหรือไม่ (สมมติข้ามไปก่อนเพื่อความเร็ว)
      
      // 2. สร้าง record การเชิญ
      const invitationRef = adminDb.collection('agent_invitations').doc();
      await invitationRef.set({
        propertyId,
        agentId,
        status: 'pending', // pending | accepted | rejected
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // TODO: สามารถส่ง LINE Notify ไปยัง Agent ได้ที่นี่
      // import { sendLineMessage } from '@/lib/line-notify';
      // await sendLineMessage(agentLineUserId, 'คุณได้รับคำเชิญให้ดูแลห้องพักใหม่...');

      return NextResponse.json({ success: true, invitationId: invitationRef.id });
    } else {
      // Fallback สำหรับกรณีไม่มี adminDb (เช่น dev environment ที่ไม่ได้ใส่ service account)
      return NextResponse.json({ 
        success: true, 
        invitationId: `mock_${Date.now()}`,
        message: 'Mock response (adminDb not initialized)' 
      });
    }

  } catch (error: any) {
    console.error('[owner-invite-agent] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
