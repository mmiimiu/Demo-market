/**
 * @fileOverview Update Contract API Endpoint
 * 
 * Route: PUT /api/contract/update
 * แก้ไขรายละเอียดสัญญาเช่า (ค่าเช่า, เงินมัดจำ, วันเข้าอยู่)
 * และทำการรีเซ็ตลายเซ็นต์ของทุกฝ่ายเพื่อความถูกต้องทางกฎหมาย
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { LineService } from '@/lib/services/line';
import { type DigitalContract } from '@/lib/contract';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      contractId, monthlyRent, depositAmount, advanceRentAmount, 
      startDate, endDate 
    } = body;

    if (!contractId) {
      return NextResponse.json({ error: 'contractId is required' }, { status: 400 });
    }

    const updateData: any = {
      monthlyRent: Number(monthlyRent),
      depositAmount: Number(depositAmount),
      advanceRentAmount: Number(advanceRentAmount),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      signatures: {}, // Reset signatures on edit
      status: 'pending_signatures',
      updatedAt: new Date(),
    };

    if (body.addendums) {
      updateData.addendums = body.addendums;
    }

    if (adminDb) {
      const contractRef = adminDb.collection('contracts').doc(contractId);
      
      const doc = await contractRef.get();
      if (!doc.exists) throw new Error('Contract not found');
      const contractData = doc.data() as DigitalContract;

      await contractRef.update(updateData);

      // Notify all parties via LINE
      const uidsToNotify = [contractData.ownerId, contractData.tenantId];
      if (contractData.agentId) uidsToNotify.push(contractData.agentId);

      for (const uidToNotify of uidsToNotify) {
        try {
          const userDoc = await adminDb.collection('users').doc(uidToNotify).get();
          const lineUserId = userDoc.data()?.lineUserId;
          if (lineUserId) {
            const moveInStr = updateData.startDate.toLocaleDateString('th-TH');
            const signUrl = `https://liff.line.me/YOUR_LIFF_ID/sign?contractId=${contractId}&lang=th`;
            
            await LineService.pushMessage(lineUserId, [{
              type: 'text',
              text: `⚠️ สัญญาเช่า "${contractData.propertyName}" มีการแก้ไขข้อมูลและเอกสารแนบท้าย\n\nกรุณาตรวจสอบข้อมูลที่แก้ไขและทำการลงนาม (เซ็น) ใหม่อีกครั้ง เพื่อให้สัญญามีผลสมบูรณ์`
            }]);
            
            await LineService.sendContractReminder(lineUserId, {
              propertyName: contractData.propertyName,
              moveInDate: moveInStr,
              signUrl
            });
          }
        } catch (err) {
          console.error(`[line-sync] Error notifying user ${uidToNotify}:`, err);
        }
      }

      return NextResponse.json({ success: true, message: 'Contract updated and signatures reset.' });
    } else {
      // Mock dev response
      return NextResponse.json({ 
        success: true, 
        message: 'Mock Contract updated locally.',
        contract: updateData
      });
    }

  } catch (error: any) {
    console.error('[contract-update] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
