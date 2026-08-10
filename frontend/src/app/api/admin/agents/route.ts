/**
 * @fileOverview Admin Agent KYC Management API
 *
 * Route: GET/POST /api/admin/agents
 * ตรวจสอบและอนุมัติ / ปฏิเสธ Agent KYC
 *
 * GET  /api/admin/agents?status=pending
 * POST /api/admin/agents  { agentId, action: 'approve'|'reject', reason? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';

/* ─────────────────────── GET: List Agents Pending KYC ─────────────────────── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    if (!adminDb) {
      return NextResponse.json({ agents: [], message: 'Firebase Admin SDK not initialized' });
    }

    let q = adminDb.collection('users').where('role', '==', 'agent') as FirebaseFirestore.Query;
    if (status !== 'all') {
      q = q.where('kycStatus', '==', status);
    }

    const snap = await q.orderBy('kycSubmittedAt', 'asc').get();
    const agents = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ agents, total: agents.length });
  } catch (err: any) {
    console.error('[Admin Agents GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ─────────────────────── POST: Approve or Reject KYC ─────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, action, reason, adminId } = body as {
      agentId: string;
      action: 'approve' | 'reject';
      reason?: string;
      adminId?: string;
    };

    if (!agentId || !action) {
      return NextResponse.json({ error: 'agentId and action are required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json({ error: 'reason is required when rejecting KYC' }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      kycStatus: action === 'approve' ? 'verified' : 'rejected',
      kycReviewedAt: new Date().toISOString(),
      kycReviewedBy: adminId || 'admin',
      kycRejectionReason: action === 'reject' ? reason : null,
    };

    if (action === 'approve') {
      updateData.status = 'active';
      updateData.verified = true;
      updateData.agentActivatedAt = new Date().toISOString();
    }

    if (!adminDb) {
      return NextResponse.json({ success: true, agentId, action, message: 'Mock mode' });
    }

    await adminDb.collection('users').doc(agentId).update(updateData);

    // Notify agent via line or in-app notification
    await adminDb.collection('notifications').add({
      userId: agentId,
      type: action === 'approve' ? 'kyc_approved' : 'kyc_rejected',
      title: action === 'approve' ? '🎉 KYC อนุมัติแล้ว!' : '❌ KYC ไม่ผ่านการอนุมัติ',
      message: action === 'approve'
        ? 'ยินดีด้วย! KYC ของคุณผ่านการตรวจสอบแล้ว คุณสามารถเริ่มรับงานได้เลย'
        : `KYC ไม่ผ่านเนื่องจาก: ${reason}. กรุณาส่งเอกสารใหม่`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Audit log
    await adminDb.collection('audit_logs').add({
      type: 'admin_agent_kyc',
      agentId,
      action,
      reason: reason || null,
      performedBy: adminId || 'admin',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, agentId, action, update: updateData });
  } catch (err: any) {
    console.error('[Admin Agents POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
