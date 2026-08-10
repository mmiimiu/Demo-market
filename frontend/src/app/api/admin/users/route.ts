/**
 * @fileOverview Admin User Management API
 *
 * Route: GET/POST /api/admin/users
 * จัดการสมาชิกทั้งระบบ: ดู, suspend, ban, verify
 *
 * GET  /api/admin/users?status=all&role=all&page=1&limit=20
 * POST /api/admin/users  { userId, action: 'suspend'|'ban'|'activate'|'verify', reason? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';

/* ─────────────────────── GET: List Users ─────────────────────── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const role   = searchParams.get('role')   || 'all';
    const page   = parseInt(searchParams.get('page')  || '1');
    const limit  = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    if (!adminDb) {
      // Return mock data if Firebase Admin not configured
      return NextResponse.json({
        users: [],
        total: 0,
        page,
        limit,
        message: 'Firebase Admin SDK not initialized — using mock mode',
      });
    }

    let query = adminDb.collection('users') as FirebaseFirestore.Query;

    if (status !== 'all') query = query.where('status', '==', status);
    if (role !== 'all')   query = query.where('role', '==', role);

    // Pagination
    const offset = (page - 1) * limit;
    const snapshot = await query.limit(limit).get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side search filter (Firestore doesn't support LIKE)
    const filtered = search
      ? users.filter(
          (u: any) =>
            u.name?.includes(search) ||
            u.email?.includes(search) ||
            u.phone?.includes(search)
        )
      : users;

    return NextResponse.json({
      users: filtered,
      total: filtered.length,
      page,
      limit,
    });
  } catch (err: any) {
    console.error('[Admin Users GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ─────────────────────── POST: User Action ─────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, reason, adminId } = body as {
      userId: string;
      action: 'suspend' | 'ban' | 'activate' | 'verify';
      reason?: string;
      adminId?: string;
    };

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action are required' }, { status: 400 });
    }

    const validActions = ['suspend', 'ban', 'activate', 'verify'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      suspend: 'suspended',
      ban: 'banned',
      activate: 'active',
    };

    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
      lastActionBy: adminId || 'admin',
      lastActionReason: reason || null,
    };

    if (action === 'verify') {
      updateData.verified = true;
      updateData.verifiedAt = new Date().toISOString();
    } else {
      updateData.status = statusMap[action];
      if (action === 'ban') {
        updateData.bannedAt = new Date().toISOString();
        updateData.banReason = reason;
      }
    }

    if (!adminDb) {
      return NextResponse.json({
        success: true,
        userId,
        action,
        message: 'Mock mode — no DB update',
      });
    }

    await adminDb.collection('users').doc(userId).update(updateData);

    // Audit log
    await adminDb.collection('audit_logs').add({
      type: 'admin_user_action',
      userId,
      action,
      reason: reason || null,
      performedBy: adminId || 'admin',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      userId,
      action,
      update: updateData,
    });
  } catch (err: any) {
    console.error('[Admin Users POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
