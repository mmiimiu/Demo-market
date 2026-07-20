import { adminDb } from '@/firebase/admin';

export async function sendShowingProposedNotification(
  tenantId: string,
  showingId: string,
  propertyId: string,
  proposedSlotsCount: number
): Promise<void> {
  if (!adminDb) return;
  await adminDb.collection('notifications').add({
    userId: tenantId,
    type: 'showing_proposed',
    title: '📅 Agent เสนอวันนัดดูห้อง',
    message: `Agent เสนอ ${proposedSlotsCount} ช่วงเวลาให้คุณเลือก — กรุณาเลือกภายใน 24 ชั่วโมง`,
    data: { showingId, propertyId },
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export async function sendShowingConfirmedNotification(
  agentId: string,
  tenantId: string,
  showingId: string,
  confirmedSlot: any
): Promise<void> {
  if (!adminDb) return;
  for (const uid of [agentId, tenantId]) {
    await adminDb.collection('notifications').add({
      userId: uid,
      type: 'showing_confirmed',
      title: '✅ ยืนยันนัดดูห้องแล้ว',
      message: `นัดดูห้อง: ${confirmedSlot.label} — Reminder จะส่ง 24 ชม. และ 1 ชม. ก่อนถึงเวลา`,
      data: { showingId, confirmedSlot },
      read: false,
      createdAt: new Date().toISOString(),
    });
  }
}

export async function sendShowingFollowUpNotification(
  tenantId: string,
  showingId: string,
  propertyId: string
): Promise<void> {
  if (!adminDb) return;
  await adminDb.collection('notifications').add({
    userId: tenantId,
    type: 'showing_follow_up',
    title: '📞 Agent ติดตามผลการดูห้อง',
    message: 'Agent อยากทราบว่าคุณสนใจห้องที่ดูไปไหม? หากสนใจห้องอื่นเพิ่มเติม Agent มีข้อเสนอใหม่ให้',
    data: { showingId, propertyId },
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export async function sendSlaBreachNotification(
  tenantId: string,
  showingId: string,
  backupAgentId: string
): Promise<void> {
  if (!adminDb) return;
  await adminDb.collection('notifications').add({
    userId: tenantId,
    type: 'warm_handoff',
    title: '🔄 เปลี่ยน Agent ให้คุณอัตโนมัติ',
    message: 'Agent เดิมไม่ตอบภายใน 30 นาที — ระบบส่งต่อ Agent สำรองให้คุณแล้วพร้อมข้อมูลครบ',
    data: { showingId, backupAgentId },
    read: false,
    createdAt: new Date().toISOString(),
  });
}
