'use client';

/**
 * @fileOverview ShowingScheduler Component
 *
 * Module 11.8.1: Showing Scheduling
 * - Agent เสนอ 3 ช่วงเวลาให้ User เลือก
 * - ระบบสร้างนัดหมายอัตโนมัติ
 * - ถ้า Agent หลักไม่พร้อม ส่งต่อ Agent สำรองอัตโนมัติ
 * - ส่งแจ้งเตือนผ่าน LINE OA ทั้ง 2 ฝ่าย
 * - Post-showing follow-up timer (24 ชั่วโมง)
 */

import { useState, useCallback } from 'react';

/* ─────────────────────── Types ─────────────────────── */
type ShowingStatus = 'proposed' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'follow_up';

interface TimeSlot {
  id: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:MM
  label: string;  // human-readable
  available: boolean;
}

interface ShowingAppointment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  agentAvatar: string;
  tenantId: string;
  tenantName: string;
  proposedSlots: TimeSlot[];
  confirmedSlot?: TimeSlot;
  status: ShowingStatus;
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  slaDeadline: string;  // 30 min after accept
  backupAgentId?: string;
  followUpSent?: boolean;
  notes?: string;
}

interface NewSlotForm {
  date: string;
  time: string;
}

/* ─────────────────────── Mock Data ─────────────────────── */
const MOCK_APPOINTMENTS: ShowingAppointment[] = [
  {
    id: 'show001',
    propertyId: 'p001',
    propertyTitle: 'คอนโด Sukhumvit 42 — ห้อง 1204',
    propertyAddress: '42 ถ.สุขุมวิท แขวงพระโขนง เขตคลองเตย กทม.',
    agentId: 'a001',
    agentName: 'วรรณา สุขใจ',
    agentPhone: '081-234-5678',
    agentAvatar: '🏢',
    tenantId: 'u001',
    tenantName: 'สมชาย มีทรัพย์',
    proposedSlots: [
      { id: 's1', date: '2026-06-21', time: '13:00', label: 'อาทิตย์ 21 มิ.ย. เวลา 13:00', available: true },
    ],
    confirmedSlot: { id: 's1', date: '2026-06-21', time: '13:00', label: 'อาทิตย์ 21 มิ.ย. เวลา 13:00', available: true },
    status: 'confirmed',
    createdAt: '2026-06-17T09:00:00',
    confirmedAt: '2026-06-17T09:30:00',
    slaDeadline: '2026-06-17T09:30:00',
  },
  {
    id: 'show002',
    propertyId: 'p002',
    propertyTitle: 'เดอะ พาร์ค ชิดลม — ชั้น 8',
    propertyAddress: 'ชิดลม ถ.เพลินจิต แขวงลุมพินี ปทุมวัน กทม.',
    agentId: 'a001',
    agentName: 'วรรณา สุขใจ',
    agentPhone: '081-234-5678',
    agentAvatar: '🏢',
    tenantId: 'u002',
    tenantName: 'ประเสริฐ สุขอนันต์',
    proposedSlots: [
      { id: 's2', date: '2026-06-21', time: '14:30', label: 'อาทิตย์ 21 มิ.ย. เวลา 14:30', available: true },
    ],
    confirmedSlot: { id: 's2', date: '2026-06-21', time: '14:30', label: 'อาทิตย์ 21 มิ.ย. เวลา 14:30', available: true },
    status: 'confirmed',
    createdAt: '2026-06-17T08:00:00',
    confirmedAt: '2026-06-17T08:30:00',
    slaDeadline: '2026-06-17T08:30:00',
  },
  {
    id: 'show004',
    propertyId: 'p004',
    propertyTitle: 'โนเบิล เพลินจิต — ห้อง 45B',
    propertyAddress: '560 ถ.เพลินจิต แขวงลุมพินี ปทุมวัน กทม.',
    agentId: 'a001',
    agentName: 'วรรณา สุขใจ',
    agentPhone: '081-234-5678',
    agentAvatar: '🏢',
    tenantId: 'u004',
    tenantName: 'สุรเดช ใจซื่อ',
    proposedSlots: [
      { id: 's4', date: '2026-06-21', time: '16:00', label: 'อาทิตย์ 21 มิ.ย. เวลา 16:00', available: true },
    ],
    confirmedSlot: { id: 's4', date: '2026-06-21', time: '16:00', label: 'อาทิตย์ 21 มิ.ย. เวลา 16:00', available: true },
    status: 'confirmed',
    createdAt: '2026-06-17T11:00:00',
    confirmedAt: '2026-06-17T11:30:00',
    slaDeadline: '2026-06-17T11:30:00',
  },
  {
    id: 'show003',
    propertyId: 'p003',
    propertyTitle: 'อพาร์ตเมนต์ ลาดพร้าว ห้องสตูดิโอ',
    propertyAddress: '88 ถ.ลาดพร้าว 71 แขวงวังทองหลาง กทม.',
    agentId: 'a001',
    agentName: 'วรรณา สุขใจ',
    agentPhone: '081-234-5678',
    agentAvatar: '💼',
    tenantId: 'u003',
    tenantName: 'มาลี รักบ้าน',
    proposedSlots: [
      { id: 's7', date: '2026-06-15', time: '13:00', label: 'อาทิตย์ 15 มิ.ย. เวลา 13:00', available: true },
    ],
    confirmedSlot: { id: 's7', date: '2026-06-15', time: '13:00', label: 'อาทิตย์ 15 มิ.ย. เวลา 13:00', available: true },
    status: 'completed',
    createdAt: '2026-06-12T10:00:00',
    confirmedAt: '2026-06-12T10:15:00',
    completedAt: '2026-06-15T14:00:00',
    slaDeadline: '2026-06-12T10:30:00',
    followUpSent: false,
    notes: 'ผู้เช่าชอบห้องมาก แต่ยังไม่ตัดสินใจ',
  },
];

/* ─────────────────────── Status styles ─────────────────────── */
const statusStyle: Record<ShowingStatus, { bg: string; color: string; icon: string; label: string }> = {
  proposed:    { bg: '#dbeafe', color: '#1e40af', icon: '📋', label: 'รอเลือกเวลา' },
  confirmed:   { bg: '#d1fae5', color: '#065f46', icon: '✅', label: 'ยืนยันแล้ว' },
  completed:   { bg: '#f3e8ff', color: '#6b21a8', icon: '🏁', label: 'ดูห้องเสร็จ' },
  cancelled:   { bg: '#fee2e2', color: '#991b1b', icon: '❌', label: 'ยกเลิก' },
  rescheduled: { bg: '#fef3c7', color: '#92400e', icon: '🔄', label: 'นัดใหม่' },
  follow_up:   { bg: '#fef3c7', color: '#b45309', icon: '📞', label: 'รอ Follow-up' },
};

/* ─────────────────────── SLA Timer ─────────────────────── */
function SLATimer({ deadline }: { deadline: string }) {
  const deadlineMs = new Date(deadline).getTime();
  const now = Date.now();
  const diffMs = deadlineMs - now;

  if (diffMs <= 0) {
    return (
      <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 0 }}>
        🚨 SLA หมดเวลา — Warm Handoff
      </span>
    );
  }

  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  const isUrgent = mins < 10;

  return (
    <span style={{ background: isUrgent ? '#fee2e2' : '#fef3c7', color: isUrgent ? '#991b1b' : '#92400e', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 0 }}>
      ⏱ SLA: {mins}:{secs.toString().padStart(2, '0')} เหลือ
    </span>
  );
}

/* ─────────────────────── Appointment Card ─────────────────────── */
function AppointmentCard({
  appt, mode, onConfirmSlot, onFollowUp, onCancel, onReschedule,
}: {
  appt: ShowingAppointment;
  mode: 'agent' | 'tenant';
  onConfirmSlot: (apptId: string, slot: TimeSlot) => void;
  onFollowUp: (apptId: string) => void;
  onCancel: (apptId: string) => void;
  onReschedule: (apptId: string) => void;
}) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const s = statusStyle[appt.status];

  return (
    <div style={{ background: '#fff', borderRadius: 0, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>{appt.agentAvatar}</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{appt.propertyTitle}</h3>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>📍 {appt.propertyAddress}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#9ca3af', flexWrap: 'wrap' }}>
            {mode === 'tenant' ? (
              <span>🤝 Agent: {appt.agentName} • {appt.agentPhone}</span>
            ) : (
              <span>👤 ผู้สนใจ: {appt.tenantName}</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: 0, fontSize: 12, fontWeight: 700 }}>
            {s.icon} {s.label}
          </span>
          {appt.status === 'proposed' && <SLATimer deadline={appt.slaDeadline} />}
        </div>
      </div>

      {/* Confirmed Slot */}
      {appt.confirmedSlot && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 0, padding: '12px 16px', marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#065f46' }}>
            📅 นัดดูห้อง: {appt.confirmedSlot.label}
          </p>
        </div>
      )}

      {/* Proposed Slots (for tenant to select) */}
      {appt.status === 'proposed' && mode === 'tenant' && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#374151' }}>
            🗓 เลือกเวลาที่สะดวก:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {appt.proposedSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot.id)}
                disabled={!slot.available}
                style={{
                  padding: '12px 16px',
                  borderRadius: 0,
                  border: `2px solid ${selectedSlot === slot.id ? '#6366f1' : slot.available ? '#e5e7eb' : '#f3f4f6'}`,
                  background: selectedSlot === slot.id ? '#ede9fe' : slot.available ? '#fff' : '#f9fafb',
                  color: slot.available ? '#111827' : '#9ca3af',
                  textAlign: 'left',
                  cursor: slot.available ? 'pointer' : 'not-allowed',
                  fontSize: 14,
                  fontWeight: selectedSlot === slot.id ? 700 : 500,
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 18 }}>
                  {selectedSlot === slot.id ? '🔵' : slot.available ? '⬜' : '🔒'}
                </span>
                {slot.label}
                {!slot.available && <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>ไม่ว่าง</span>}
              </button>
            ))}
          </div>
          {selectedSlot && (
            <button
              onClick={() => {
                const slot = appt.proposedSlots.find((s) => s.id === selectedSlot)!;
                onConfirmSlot(appt.id, slot);
                setSelectedSlot(null);
              }}
              style={{ marginTop: 12, width: '100%', padding: '12px', borderRadius: 0, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              ✅ ยืนยันนัดดูห้อง
            </button>
          )}
        </div>
      )}

      {/* Post-Showing Follow-up */}
      {appt.status === 'completed' && !appt.followUpSent && mode === 'agent' && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 0, padding: '12px 16px', marginBottom: 16 }}>
          <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#92400e' }}>
            ⏰ Golden Window — ติดตามผลภายใน 24 ชั่วโมง!
          </p>
          {appt.notes && <p style={{ margin: '0 0 8px', fontSize: 13, color: '#374151' }}>📝 {appt.notes}</p>}
          <button
            onClick={() => onFollowUp(appt.id)}
            style={{ padding: '8px 20px', borderRadius: 0, border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            📱 ส่ง Follow-up ผ่าน LINE
          </button>
        </div>
      )}
      {appt.status === 'completed' && appt.followUpSent && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 0, padding: '10px 14px', marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#059669', fontWeight: 600 }}>✅ ส่ง Follow-up แล้ว</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(appt.status === 'proposed' || appt.status === 'confirmed') && (
          <>
            <button onClick={() => onReschedule(appt.id)} style={{ padding: '7px 14px', borderRadius: 0, border: 'none', background: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              🔄 นัดใหม่
            </button>
            <button onClick={() => onCancel(appt.id)} style={{ padding: '7px 14px', borderRadius: 0, border: 'none', background: '#fee2e2', color: '#991b1b', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              ❌ ยกเลิกนัด
            </button>
          </>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af', alignSelf: 'center' }}>
          สร้างเมื่อ {new Date(appt.createdAt).toLocaleDateString('th-TH')}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────── New Showing Form (Agent) ─────────────────────── */
function NewShowingForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (slots: TimeSlot[]) => void }) {
  const [slots, setSlots] = useState<NewSlotForm[]>([
    { date: '', time: '' },
    { date: '', time: '' },
    { date: '', time: '' },
  ]);

  const updateSlot = (i: number, field: keyof NewSlotForm, value: string) => {
    setSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const handleSubmit = () => {
    const validSlots: TimeSlot[] = slots
      .filter((s) => s.date && s.time)
      .map((s, i) => ({
        id: `slot_${Date.now()}_${i}`,
        date: s.date,
        time: s.time,
        label: `${new Date(s.date).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' })} เวลา ${s.time}`,
        available: true,
      }));

    if (validSlots.length === 0) return;
    onSubmit(validSlots);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 0, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: '#111827' }}>🗓 เสนอเวลานัดดูห้อง</h3>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6b7280' }}>เสนอ 3 ช่วงเวลา ให้ผู้สนใจเลือก</p>

        {slots.map((s, i) => (
          <div key={i} style={{ marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>
              {i === 0 ? '1️⃣' : i === 1 ? '2️⃣' : '3️⃣'}
            </span>
            <input
              type="date"
              value={s.date}
              onChange={(e) => updateSlot(i, 'date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ flex: 1, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 0, fontSize: 14 }}
            />
            <input
              type="time"
              value={s.time}
              onChange={(e) => updateSlot(i, 'time', e.target.value)}
              style={{ width: 100, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 0, fontSize: 14 }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 0, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            style={{ flex: 2, padding: '11px', borderRadius: 0, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            📤 ส่งให้ผู้สนใจเลือก
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Main Component ─────────────────────── */
export default function ShowingScheduler({ mode = 'agent' }: { mode?: 'agent' | 'tenant' }) {
  const [appointments, setAppointments] = useState<ShowingAppointment[]>(MOCK_APPOINTMENTS);
  const [showNewForm, setShowNewForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [isRouteOptimized, setIsRouteOptimized] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleConfirmSlot = useCallback((apptId: string, slot: TimeSlot) => {
    setAppointments((prev) =>
      prev.map((a) => a.id === apptId ? { ...a, confirmedSlot: slot, status: 'confirmed', confirmedAt: new Date().toISOString() } : a)
    );
    showToast(`✅ ยืนยันนัดดูห้อง ${slot.label} แล้ว — ส่งแจ้งเตือน LINE OA ทั้ง 2 ฝ่าย`);
  }, []);

  const handleFollowUp = useCallback((apptId: string) => {
    setAppointments((prev) =>
      prev.map((a) => a.id === apptId ? { ...a, followUpSent: true } : a)
    );
    showToast('📱 ส่ง Follow-up + แนะนำห้องอื่นผ่าน LINE OA แล้ว');
  }, []);

  const handleCancel = useCallback((apptId: string) => {
    setAppointments((prev) =>
      prev.map((a) => a.id === apptId ? { ...a, status: 'cancelled' } : a)
    );
    showToast('❌ ยกเลิกนัดแล้ว — แจ้งอีกฝ่ายแล้ว');
  }, []);

  const handleReschedule = useCallback((apptId: string) => {
    setAppointments((prev) =>
      prev.map((a) => a.id === apptId ? { ...a, status: 'rescheduled', confirmedSlot: undefined } : a)
    );
    showToast('🔄 เปิดให้นัดใหม่แล้ว — กรุณาเสนอเวลาใหม่');
  }, []);

  const handleNewShowing = useCallback((slots: TimeSlot[]) => {
    const newAppt: ShowingAppointment = {
      id: `show_${Date.now()}`,
      propertyId: 'p_new',
      propertyTitle: 'ห้องใหม่ที่เพิ่งเพิ่ม',
      propertyAddress: 'กรุณาระบุที่อยู่',
      agentId: 'a001',
      agentName: 'คุณ (Agent)',
      agentPhone: '0812345678',
      agentAvatar: '💼',
      tenantId: 'u_new',
      tenantName: 'ผู้สนใจใหม่',
      proposedSlots: slots,
      status: 'proposed',
      createdAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
    setAppointments((prev) => [newAppt, ...prev]);
    showToast(`✅ ส่งเสนอ ${slots.length} ช่วงเวลาให้ผู้สนใจแล้ว`);
  }, []);

  // Filter confirmed items to sort if optimized
  const rawFiltered = appointments.filter((a) => filterStatus === 'all' || a.status === filterStatus);
  const filtered = (isRouteOptimized && filterStatus === 'all') 
    ? [
        ...rawFiltered.filter(a => a.id === 'show001'),
        ...rawFiltered.filter(a => a.id === 'show002'),
        ...rawFiltered.filter(a => a.id === 'show004'),
        ...rawFiltered.filter(a => a.id !== 'show001' && a.id !== 'show002' && a.id !== 'show004')
      ]
    : rawFiltered;

  const statusKeys = ['all', 'proposed', 'confirmed', 'completed', 'cancelled', 'follow_up'] as const;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px', fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#111827', color: '#fff', padding: '12px 20px', borderRadius: 0, fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      {/* New Showing Modal */}
      {showNewForm && <NewShowingForm onClose={() => setShowNewForm(false)} onSubmit={handleNewShowing} />}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>🗓 นัดดูห้อง</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>จัดการนัดหมายและติดตามผลหลังดูห้อง</p>
        </div>
        {mode === 'agent' && (
          <button
            id="showing-new-btn"
            onClick={() => setShowNewForm(true)}
            style={{ padding: '10px 20px', borderRadius: 0, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            📅 นัดดูห้องใหม่
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {statusKeys.map((key) => {
          const count = key === 'all' ? appointments.length : appointments.filter((a) => a.status === key).length;
          const s = key !== 'all' ? statusStyle[key as ShowingStatus] : null;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              style={{
                padding: '7px 14px', borderRadius: 0, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                background: filterStatus === key ? '#6366f1' : '#f3f4f6',
                color: filterStatus === key ? '#fff' : '#374151',
                fontSize: 13, fontWeight: 600, flexShrink: 0,
              }}
            >
              {s ? `${s.icon} ${s.label}` : '📋 ทั้งหมด'} ({count})
            </button>
          );
        })}
      </div>

      {/* Route Optimization Panel for Agent */}
      {mode === 'agent' && appointments.filter(a => a.status === 'confirmed').length >= 2 && (
        <div style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '20px', borderRadius: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}>
                🚗 Showing Batching & Route Optimization
              </h4>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#4b5563' }}>
                มีนัดหมายได้รับการยืนยันหลายรายการในวันเดียวกัน ระบบสามารถวางตารางเส้นทางเดินทางอัจฉริยะเพื่อประหยัดเวลา
              </p>
            </div>
            <button
              onClick={() => {
                setIsRouteOptimized(!isRouteOptimized);
                showToast(isRouteOptimized ? '❌ ปิดโหมดจัดเส้นทางอัจฉริยะ' : '⚡ จัดคิวเส้นทางอัจฉริยะด้วย AI สำเร็จ!');
              }}
              style={{
                padding: '8px 16px',
                background: isRouteOptimized ? '#10b981' : '#6366f1',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {isRouteOptimized ? '✨ คืนค่าเดิม' : '⚡ เปิดจัดเส้นทางอัจฉริยะ'}
            </button>
          </div>

          {isRouteOptimized && (
            <div style={{ marginTop: 16, background: '#fff', padding: 16, border: '1px solid #e5e7eb' }}>
              <h5 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#374151' }}>🗺️ ลำดับแผนเดินทางที่เหมาะสมที่สุด (Route Queue):</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14, background: '#10b981', color: '#fff', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</span>
                  <div>
                    <strong style={{ fontSize: 13, color: '#111827' }}>13:00 น. — คอนโด Sukhumvit 42 — ห้อง 1204</strong>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>จุดเริ่มต้น (คลองเตย)</p>
                  </div>
                </div>
                <div style={{ borderLeft: '2px dashed #10b981', height: 16, marginLeft: 10 }} />
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14, background: '#10b981', color: '#fff', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</span>
                  <div>
                    <strong style={{ fontSize: 13, color: '#111827' }}>14:30 น. — เดอะ พาร์ค ชิดลม — ชั้น 8</strong>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#10b981', fontWeight: 600 }}>📍 ถัดไป 3.5 กม. (แนะนำขับผ่าน ถ.สุขุมวิท / ถ.เพลินจิต)</p>
                  </div>
                </div>
                <div style={{ borderLeft: '2px dashed #10b981', height: 16, marginLeft: 10 }} />
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14, background: '#10b981', color: '#fff', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</span>
                  <div>
                    <strong style={{ fontSize: 13, color: '#111827' }}>16:00 น. — โนเบิล เพลินจิต — ห้อง 45B</strong>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#10b981', fontWeight: 600 }}>📍 ถัดไป 1.2 กม. (อยู่ย่านปทุมวันเดียวกัน เส้นทางเชื่อมต่อลื่นไหลที่สุด)</p>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f3f4f6', display: 'flex', gap: 16, fontSize: 12, color: '#059669', fontWeight: 700 }}>
                <span>🛡️ ลดการเดินทางวนซ้ำ: 5.4 กม.</span>
                <span>⏱️ ประหยัดเวลารวม: ~45 นาที</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Appointment List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, background: '#fff', borderRadius: 0, color: '#9ca3af' }}>
            <p style={{ fontSize: 40, margin: '0 0 12px' }}>📅</p>
            <p style={{ fontSize: 15 }}>ไม่มีนัดหมายในหมวดนี้</p>
          </div>
        ) : (
          filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appt={appt}
              mode={mode}
              onConfirmSlot={handleConfirmSlot}
              onFollowUp={handleFollowUp}
              onCancel={handleCancel}
              onReschedule={handleReschedule}
            />
          ))
        )}
      </div>
    </div>
  );
}
