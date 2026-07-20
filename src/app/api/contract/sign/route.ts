/**
 * @fileOverview Sign Contract API Endpoint
 * 
 * Route: POST /api/contract/sign
 * บันทึกลายเซ็น (E-Signature) ของแต่ละฝ่าย (Owner, Tenant, Agent)
 * อัปเดตสถานะสัญญาเป็น active หากเซ็นครบ
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { evaluateContractStatus, type DigitalContract } from '@/lib/contract';
import { LineService } from '@/lib/services/line';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractId, role, signatureDataUrl, uid, name, ipAddress } = body;

    if (!contractId || !role || !signatureDataUrl) {
      return NextResponse.json({ error: 'Missing required signature data' }, { status: 400 });
    }

    if (!['owner', 'tenant', 'agent'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (adminDb) {
      const contractRef = adminDb.collection('contracts').doc(contractId);
      
      // Use transaction to ensure thread-safe status evaluation
      const result = await adminDb.runTransaction(async (t) => {
        const doc = await t.get(contractRef);
        if (!doc.exists) {
          throw new Error('Contract not found');
        }

        const contractData = doc.data() as DigitalContract;
        
        if (contractData.status !== 'draft' && contractData.status !== 'pending_signatures') {
          throw new Error(`Contract cannot be signed in its current status: ${contractData.status}`);
        }

        // Update signature for the specific role
        contractData.signatures[role as 'owner'|'tenant'|'agent'] = {
          uid: uid || 'unknown',
          name: name || 'Unknown Signer',
          role: role as 'owner'|'tenant'|'agent',
          signedAt: new Date(),
          signatureDataUrl,
          ipAddress: ipAddress || req.headers.get('x-forwarded-for') || '0.0.0.0'
        };

        // Re-evaluate contract status
        const newStatus = evaluateContractStatus(contractData);
        contractData.status = newStatus;
        contractData.updatedAt = new Date();

        t.update(contractRef, {
          [`signatures.${role}`]: contractData.signatures[role as 'owner'|'tenant'|'agent'],
          status: newStatus,
          updatedAt: contractData.updatedAt
        });

        return { contractData, newStatus };
      });

      // Post-transaction LINE Sync Notifications
      try {
        const { contractData, newStatus } = result;
        const requiredRoles = ['owner', 'tenant'];
        if (contractData.agentId) requiredRoles.push('agent');

        const missingRoles = requiredRoles.filter((r) => !contractData.signatures[r as 'owner'|'tenant'|'agent']?.signedAt);

        // Notify the LAST person to sign
        if (newStatus === 'pending_signatures' && missingRoles.length === 1) {
          const missingRole = missingRoles[0];
          const missingUid = contractData[`${missingRole}Id` as keyof DigitalContract] as string;
          
          if (missingUid) {
            const userDoc = await adminDb.collection('users').doc(missingUid).get();
            const lineUserId = userDoc.data()?.lineUserId;
            
            if (lineUserId) {
              const moveInStr = contractData.startDate ? new Date(contractData.startDate).toLocaleDateString('th-TH') : 'N/A';
              const signUrl = `https://liff.line.me/YOUR_LIFF_ID/sign?contractId=${contractId}&lang=th`; // replace YOUR_LIFF_ID with real one
              
              await LineService.sendContractReminder(lineUserId, {
                propertyName: contractData.propertyName,
                moveInDate: moveInStr,
                signUrl
              });
              console.log(`[line-sync] Sent contract reminder to ${missingRole} via LINE.`);
            }
          }
        }

        // Notify ALL parties when completed
        if (newStatus === 'active' && missingRoles.length === 0) {
          const uidsToNotify = [contractData.ownerId, contractData.tenantId];
          if (contractData.agentId) uidsToNotify.push(contractData.agentId);

          for (const uidToNotify of uidsToNotify) {
            const userDoc = await adminDb.collection('users').doc(uidToNotify).get();
            const lineUserId = userDoc.data()?.lineUserId;
            if (lineUserId) {
              await LineService.pushMessage(lineUserId, [{
                type: 'text',
                text: `✅ สัญญาเช่า "${contractData.propertyName}" ได้รับการเซ็นครบทุกฝ่ายแล้ว และมีผลสมบูรณ์\n\nสามารถดู/ดาวน์โหลดสัญญา (PDF) ได้ที่ระบบ PrimeRent ของคุณ`
              }]);
            }
          }
          console.log(`[line-sync] Sent contract completion notifications.`);
        }
      } catch (notifyErr) {
        console.error('[line-sync] Failed to send LINE notifications:', notifyErr);
        // Do not fail the API if notification fails
      }

      return NextResponse.json({ success: true, message: 'Signature saved successfully' });
    } else {
      // Mock for local dev
      return NextResponse.json({ success: true, message: 'Mock signature saved' });
    }

  } catch (error: any) {
    console.error('[contract-sign] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
