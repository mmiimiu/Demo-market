import { adminDb } from '@/firebase/admin';
import { CreateBillPayload, BillItem } from './types';
import { buildBillingFlexMessage } from './templates';

export const billingService = {
  getBills: async (ownerId: string, period: string, roomNumber: string, status: string) => {
    if (!adminDb) {
      return { bills: [], message: 'Firebase Admin SDK not initialized' };
    }

    let q = adminDb.collection('bills') as FirebaseFirestore.Query;
    if (ownerId)    q = q.where('ownerId', '==', ownerId);
    if (period)     q = q.where('period', '==', period);
    if (roomNumber) q = q.where('roomNumber', '==', roomNumber);
    if (status)     q = q.where('status', '==', status);

    const snap = await q.orderBy('createdAt', 'desc').get();
    const bills = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const summary = {
      total: bills.length,
      paid:    bills.filter((b: any) => b.status === 'paid').length,
      sent:    bills.filter((b: any) => b.status === 'sent').length,
      overdue: bills.filter((b: any) => b.status === 'overdue').length,
      totalRevenue: bills.filter((b: any) => b.status === 'paid').reduce((s: number, b: any) => s + b.totalAmount, 0),
      outstanding:  bills.filter((b: any) => b.status !== 'paid').reduce((s: number, b: any) => s + (b.totalAmount - b.paidAmount), 0),
    };

    return { bills, summary };
  },

  createBill: async (body: CreateBillPayload) => {
    const { ownerId, roomNumber, tenantId, tenantLineId, period, dueDate, baseRent, commonFee, meters } = body;

    // Calculate meter costs
    const items: BillItem[] = [{ label: 'ค่าเช่า', amount: baseRent }];
    let meterTotal = 0;

    for (const m of meters) {
      const units = Math.max(0, m.current - m.previous);
      const amount = units * m.rate;
      meterTotal += amount;
      if (m.type === 'water') {
        items.push({ label: `ค่าน้ำ (${units} หน่วย × ฿${m.rate})`, amount });
      } else {
        items.push({ label: `ค่าไฟ (${units} หน่วย × ฿${m.rate})`, amount });
      }
    }

    items.push({ label: 'ค่าส่วนกลาง', amount: commonFee });
    const totalAmount = baseRent + commonFee + meterTotal;

    const billData: any = {
      ownerId, roomNumber, tenantId, tenantLineId: tenantLineId || null,
      period, dueDate,
      items, meters, totalAmount,
      paidAmount: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: body.notes || null,
    };

    if (!adminDb) {
      return { success: true, bill: { id: 'mock_bill', ...billData }, message: 'Mock mode' };
    }

    const ref = await adminDb.collection('bills').add(billData);

    // Send LINE OA if tenantLineId is provided
    if (tenantLineId) {
      try {
        const lineMessage = {
          to: tenantLineId,
          messages: [buildBillingFlexMessage(period, roomNumber, items, totalAmount, dueDate, ref.id)],
        };

        await fetch('https://api.line.me/v2/bot/message/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
          body: JSON.stringify(lineMessage),
        });

        await adminDb.collection('bills').doc(ref.id).update({ status: 'sent', sentAt: new Date().toISOString() });
        billData.status = 'sent';
      } catch (lineErr) {
        console.warn('[Billing] LINE send failed:', lineErr);
      }
    }

    return { success: true, billId: ref.id, bill: { id: ref.id, ...billData } };
  },

  updateBillPayment: async (params: {
    billId: string;
    paidAmount: number;
    slipUrl?: string;
    confirmedBy?: string;
  }) => {
    const { billId, paidAmount, slipUrl, confirmedBy } = params;

    if (!adminDb) {
      return { success: true, message: 'Mock mode' };
    }

    const billRef = adminDb.collection('bills').doc(billId);
    const billDoc = await billRef.get();
    if (!billDoc.exists) {
      throw new Error('Bill not found');
    }

    const billData = billDoc.data()!;
    const newStatus = paidAmount >= billData.totalAmount ? 'paid' : paidAmount > 0 ? 'partial' : billData.status;

    await billRef.update({
      paidAmount, slipUrl: slipUrl || null,
      status: newStatus,
      paidAt: paidAmount >= billData.totalAmount ? new Date().toISOString() : null,
      confirmedBy: confirmedBy || null,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, billId, newStatus, paidAmount };
  }
};
