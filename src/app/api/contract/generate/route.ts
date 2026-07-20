/**
 * @fileOverview Generate Contract API Endpoint
 * 
 * Route: POST /api/contract/generate
 * สร้างสัญญาเช่าแบบ Draft เพื่อเตรียมส่งให้ทั้งสามฝ่ายลงนาม
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import type { DigitalContract } from '@/lib/contract';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      propertyId, propertyName, ownerId, tenantId, agentId,
      monthlyRent, depositAmount, advanceRentAmount,
      startDate, endDate 
    } = body;

    if (!propertyId || !ownerId || !tenantId || !monthlyRent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (adminDb) {
      const contractRef = adminDb.collection('contracts').doc();
      const contractData: Partial<DigitalContract> = {
        id: contractRef.id,
        propertyId,
        propertyName,
        ownerId,
        tenantId,
        agentId,
        monthlyRent,
        depositAmount,
        advanceRentAmount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        signatures: {},
        status: 'pending_signatures',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await contractRef.set(contractData);

      // TODO: ส่งแจ้งเตือน LINE OA ไปให้ Owner, Tenant, Agent เข้ามาเซ็น

      return NextResponse.json({ success: true, contractId: contractRef.id });
    } else {
       // Mock for local dev without Firebase Admin
       return NextResponse.json({ 
         success: true, 
         contractId: `mock_contract_${Date.now()}` 
       });
    }

  } catch (error: any) {
    console.error('[contract-generate] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
