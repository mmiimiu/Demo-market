import { adminDb } from '@/firebase/admin';
import { CreateShowingPayload, TimeSlot } from './types';
import {
  sendShowingProposedNotification,
  sendShowingConfirmedNotification,
  sendShowingFollowUpNotification,
  sendSlaBreachNotification
} from './notifications';

export const showingService = {
  getShowings: async (agentId: string, tenantId: string, status: string) => {
    if (!adminDb) {
      return { showings: [], message: 'Firebase Admin SDK not initialized' };
    }

    let q = adminDb.collection('showings') as FirebaseFirestore.Query;
    if (agentId)  q = q.where('agentId',  '==', agentId);
    if (tenantId) q = q.where('tenantId', '==', tenantId);
    if (status)   q = q.where('status',   '==', status);

    const snap = await q.orderBy('createdAt', 'desc').get();
    const showings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return { showings, total: showings.length };
  },

  createShowing: async (body: CreateShowingPayload) => {
    const { agentId, tenantId, propertyId, proposedSlots, notes } = body;

    // SLA: 30 minutes for agent to contact tenant after acceptance
    const slaDeadline = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const showingData = {
      agentId, tenantId, propertyId,
      proposedSlots: proposedSlots.map((s, i) => ({ ...s, id: `slot_${Date.now()}_${i}` })),
      confirmedSlot: null,
      status: 'proposed',
      slaDeadline,
      slaBreached: false,
      backupAgentId: null,
      followUpSent: false,
      notes: notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!adminDb) {
      return { success: true, showingId: 'mock_id', showing: showingData };
    }

    const ref = await adminDb.collection('showings').add(showingData);

    await sendShowingProposedNotification(tenantId, ref.id, propertyId, proposedSlots.length);

    return { success: true, showingId: ref.id, showing: { id: ref.id, ...showingData } };
  },

  updateShowing: async (params: {
    showingId: string;
    action: 'confirm' | 'cancel' | 'reschedule' | 'complete' | 'follow_up' | 'sla_breach';
    slotId?: string;
    reason?: string;
    userId?: string;
  }) => {
    const { showingId, action, slotId, reason, userId } = params;

    if (!adminDb) {
      return { success: true, showingId, action, message: 'Mock mode' };
    }

    const showingRef  = adminDb.collection('showings').doc(showingId);
    const showingSnap = await showingRef.get();
    if (!showingSnap.exists) {
      throw new Error('Showing not found');
    }

    const showing = showingSnap.data()!;
    const updateData: Record<string, any> = { updatedAt: new Date().toISOString() };

    switch (action) {
      case 'confirm': {
        if (!slotId) throw new Error('slotId required to confirm');
        const confirmedSlot = showing.proposedSlots.find((s: TimeSlot) => s.id === slotId);
        if (!confirmedSlot) throw new Error('Slot not found');

        updateData.confirmedSlot = confirmedSlot;
        updateData.status = 'confirmed';
        updateData.confirmedAt = new Date().toISOString();

        await sendShowingConfirmedNotification(showing.agentId, showing.tenantId, showingId, confirmedSlot);

        // Schedule reminders
        await adminDb.collection('scheduled_reminders').add({
          showingId, confirmedSlot,
          reminders: ['24h', '1h'],
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
        break;
      }

      case 'cancel':
        updateData.status = 'cancelled';
        updateData.cancelReason = reason || null;
        updateData.cancelledBy  = userId || null;
        updateData.cancelledAt  = new Date().toISOString();
        break;

      case 'reschedule':
        updateData.status = 'rescheduled';
        updateData.confirmedSlot = null;
        updateData.rescheduledAt = new Date().toISOString();
        break;

      case 'complete':
        updateData.status = 'completed';
        updateData.completedAt = new Date().toISOString();
        updateData.followUpDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        break;

      case 'follow_up':
        updateData.followUpSent = true;
        updateData.followUpSentAt = new Date().toISOString();
        updateData.status = 'follow_up';
        await sendShowingFollowUpNotification(showing.tenantId, showingId, showing.propertyId);
        break;

      case 'sla_breach':
        updateData.slaBreached = true;
        updateData.status = 'rescheduled';
        updateData.backupAgentId = 'backup_agent_001';
        await sendSlaBreachNotification(showing.tenantId, showingId, 'backup_agent_001');
        break;
    }

    await showingRef.update(updateData);
    return { success: true, showingId, action, update: updateData };
  }
};
