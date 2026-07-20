/**
 * @fileOverview Tenant Move-in Checklist API Endpoint
 * 
 * Route: POST /api/tenant/checklist
 * บันทึกข้อมูลสภาพห้องก่อนย้ายเข้า พร้อมรูปถ่ายเป็นหลักฐาน ป้องกันข้อพิพาทเรื่องเงินประกัน
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, contractId, items } = body;

    if (!propertyId || !contractId || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Missing required checklist data' }, { status: 400 });
    }

    if (adminDb) {
      // 1. บันทึก Checklist document
      const checklistRef = adminDb.collection('move_in_checklists').doc();
      await checklistRef.set({
        propertyId,
        contractId,
        items,
        status: 'submitted',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 2. แจ้งเตือนไปยัง Owner ว่าผู้เช่าได้ส่ง Move-in Checklist แล้ว
      // (TODO: Push Notification / LINE OA to Owner/Agent)

      return NextResponse.json({ success: true, checklistId: checklistRef.id });
    } else {
      // Mock for local dev
      return NextResponse.json({ success: true, checklistId: `mock_chk_${Date.now()}` });
    }

  } catch (error: any) {
    console.error('[tenant-checklist] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
