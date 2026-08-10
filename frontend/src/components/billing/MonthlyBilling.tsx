'use client';

/**
 * @fileOverview Monthly Billing Component
 *
 * Module 17.8 / Owner: Billing & Invoice
 * - ออกบิลค่าเช่า ค่าน้ำ ค่าไฟ ค่าส่วนกลางรายเดือน
 * - จดมิเตอร์น้ำ-ไฟผ่านระบบ
 * - ส่งบิลผ่าน LINE OA อัตโนมัติ
 * - ผู้เช่าโอนและแนบสลิป
 * - ระบบ Reconcile อัตโนมัติ
 * - แสดงยอดค้างชำระ + ประวัติบิลใน Dashboard
 */

import { useState, useCallback } from 'react';

/* ─────────────────────── Types ─────────────────────── */
interface MeterReading {
  type: 'water' | 'electricity';
  previous: number;
  current: number;
  rate: number; // บาท/หน่วย
}

interface BillItem {
  label: string;
  amount: number;
}

interface Bill {
  id: string;
  roomNumber: string;
  tenantName: string;
  tenantLineId?: string;
  period: string; // 'YYYY-MM'
  dueDate: string;
  items: BillItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial';
  paidAmount: number;
  slipUrl?: string;
  sentAt?: string;
  paidAt?: string;
  meters: MeterReading[];
}

interface RoomConfig {
  roomNumber: string;
  tenantName: string;
  tenantLineId: string;
  baseRent: number;
  commonFee: number;
  waterRate: number;
  electricityRate: number;
}

/* ─────────────────────── Mock Data ─────────────────────── */
const MOCK_ROOMS: RoomConfig[] = [
  { roomNumber: '101', tenantName: 'สมชาย มีทรัพย์',    tenantLineId: 'U111aaa', baseRent: 8500,  commonFee: 500, waterRate: 18,  electricityRate: 7 },
  { roomNumber: '202', tenantName: 'วรรณา สุขใจ',        tenantLineId: 'U222bbb', baseRent: 9200,  commonFee: 500, waterRate: 18,  electricityRate: 7 },
  { roomNumber: '305', tenantName: 'อานนท์ ดีงาม',       tenantLineId: 'U333ccc', baseRent: 12000, commonFee: 800, waterRate: 18,  electricityRate: 7 },
  { roomNumber: '408', tenantName: 'มาลี รักบ้าน',       tenantLineId: 'U444ddd', baseRent: 7500,  commonFee: 300, waterRate: 18,  electricityRate: 7 },
];

const MOCK_BILLS: Bill[] = [
  {
    id: 'b001', roomNumber: '101', tenantName: 'สมชาย มีทรัพย์', period: '2026-06', dueDate: '2026-06-25',
    items: [{ label: 'ค่าเช่า', amount: 8500 }, { label: 'ค่าน้ำ (12 หน่วย × ฿18)', amount: 216 }, { label: 'ค่าไฟ (185 หน่วย × ฿7)', amount: 1295 }, { label: 'ค่าส่วนกลาง', amount: 500 }],
    totalAmount: 10511, status: 'paid', paidAmount: 10511, slipUrl: 'slip_b001.jpg', sentAt: '2026-06-01', paidAt: '2026-06-05',
    meters: [{ type: 'water', previous: 120, current: 132, rate: 18 }, { type: 'electricity', previous: 1200, current: 1385, rate: 7 }],
  },
  {
    id: 'b002', roomNumber: '202', tenantName: 'วรรณา สุขใจ', period: '2026-06', dueDate: '2026-06-25',
    items: [{ label: 'ค่าเช่า', amount: 9200 }, { label: 'ค่าน้ำ (8 หน่วย × ฿18)', amount: 144 }, { label: 'ค่าไฟ (210 หน่วย × ฿7)', amount: 1470 }, { label: 'ค่าส่วนกลาง', amount: 500 }],
    totalAmount: 11314, status: 'sent', paidAmount: 0, sentAt: '2026-06-01',
    meters: [{ type: 'water', previous: 80, current: 88, rate: 18 }, { type: 'electricity', previous: 2100, current: 2310, rate: 7 }],
  },
  {
    id: 'b003', roomNumber: '305', tenantName: 'อานนท์ ดีงาม', period: '2026-06', dueDate: '2026-06-25',
    items: [{ label: 'ค่าเช่า', amount: 12000 }, { label: 'ค่าน้ำ (15 หน่วย × ฿18)', amount: 270 }, { label: 'ค่าไฟ (160 หน่วย × ฿7)', amount: 1120 }, { label: 'ค่าส่วนกลาง', amount: 800 }],
    totalAmount: 14190, status: 'overdue', paidAmount: 0, sentAt: '2026-06-01',
    meters: [{ type: 'water', previous: 55, current: 70, rate: 18 }, { type: 'electricity', previous: 980, current: 1140, rate: 7 }],
  },
  {
    id: 'b004', roomNumber: '408', tenantName: 'มาลี รักบ้าน', period: '2026-06', dueDate: '2026-06-25',
    items: [{ label: 'ค่าเช่า', amount: 7500 }, { label: 'ค่าน้ำ (10 หน่วย × ฿18)', amount: 180 }, { label: 'ค่าไฟ (145 หน่วย × ฿7)', amount: 1015 }, { label: 'ค่าส่วนกลาง', amount: 300 }],
    totalAmount: 8995, status: 'partial', paidAmount: 5000, sentAt: '2026-06-01',
    meters: [{ type: 'water', previous: 200, current: 210, rate: 18 }, { type: 'electricity', previous: 3200, current: 3345, rate: 7 }],
  },
];

/* ─────────────────────── Status Badge ─────────────────────── */
const statusMap: Record<string, { bg: string; color: string; label: string; icon: string }> = {
  draft:   { bg: '#f3f4f6', color: '#374151', label: 'ร่าง', icon: '📝' },
  sent:    { bg: '#dbeafe', color: '#1e40af', label: 'ส่งแล้ว', icon: '📤' },
  paid:    { bg: '#d1fae5', color: '#065f46', label: 'ชำระแล้ว', icon: '✅' },
  overdue: { bg: '#fee2e2', color: '#991b1b', label: 'เกินกำหนด', icon: '⚠️' },
  partial: { bg: '#fef3c7', color: '#92400e', label: 'ชำระบางส่วน', icon: '⏳' },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? statusMap.draft;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {s.icon} {s.label}
    </span>
  );
}

/* ─────────────────────── Meter Input ─────────────────────── */
function MeterInputRow({ room, onSave }: { room: RoomConfig; onSave: (r: RoomConfig, water: [number, number], elec: [number, number]) => void }) {
  const [waterPrev, setWaterPrev] = useState('');
  const [waterCurr, setWaterCurr] = useState('');
  const [elecPrev,  setElecPrev]  = useState('');
  const [elecCurr,  setElecCurr]  = useState('');

  const waterUnits = Math.max(0, parseInt(waterCurr || '0') - parseInt(waterPrev || '0'));
  const elecUnits  = Math.max(0, parseInt(elecCurr || '0')  - parseInt(elecPrev || '0'));
  const waterAmt   = waterUnits * room.waterRate;
  const elecAmt    = elecUnits  * room.electricityRate;
  const total      = room.baseRent + room.commonFee + waterAmt + elecAmt;

  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>ห้อง {room.roomNumber} — {room.tenantName}</h4>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>ค่าเช่า ฿{room.baseRent.toLocaleString()} + ส่วนกลาง ฿{room.commonFee.toLocaleString()}</p>
        </div>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#6366f1' }}>รวม ฿{total.toLocaleString()}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Water */}
        <div style={{ background: '#eff6ff', borderRadius: 10, padding: 12 }}>
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>💧 มิเตอร์น้ำ (฿{room.waterRate}/หน่วย)</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: '#6b7280' }}>เดือนก่อน</p>
              <input type="number" value={waterPrev} onChange={(e) => setWaterPrev(e.target.value)} placeholder="0" style={{ width: '100%', padding: '8px 10px', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: '#6b7280' }}>เดือนนี้</p>
              <input type="number" value={waterCurr} onChange={(e) => setWaterCurr(e.target.value)} placeholder="0" style={{ width: '100%', padding: '8px 10px', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1d4ed8' }}>{waterUnits} หน่วย = ฿{waterAmt.toLocaleString()}</p>
        </div>

        {/* Electricity */}
        <div style={{ background: '#fffbeb', borderRadius: 10, padding: 12 }}>
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#b45309' }}>⚡ มิเตอร์ไฟ (฿{room.electricityRate}/หน่วย)</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: '#6b7280' }}>เดือนก่อน</p>
              <input type="number" value={elecPrev} onChange={(e) => setElecPrev(e.target.value)} placeholder="0" style={{ width: '100%', padding: '8px 10px', border: '1px solid #fde68a', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: '#6b7280' }}>เดือนนี้</p>
              <input type="number" value={elecCurr} onChange={(e) => setElecCurr(e.target.value)} placeholder="0" style={{ width: '100%', padding: '8px 10px', border: '1px solid #fde68a', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#b45309' }}>{elecUnits} หน่วย = ฿{elecAmt.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onSave(room, [parseInt(waterPrev || '0'), parseInt(waterCurr || '0')], [parseInt(elecPrev || '0'), parseInt(elecCurr || '0')])}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          ➕ สร้างบิลห้องนี้
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── Bill Row ─────────────────────── */
function BillRow({ bill, onSendLine, onViewSlip }: { bill: Bill; onSendLine: (id: string) => void; onViewSlip: (b: Bill) => void }) {
  const s = statusMap[bill.status];
  const outstanding = bill.totalAmount - bill.paidAmount;

  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #f3f4f6', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>ห้อง {bill.roomNumber}</span>
            <StatusBadge status={bill.status} />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{bill.tenantName} • เดือน {bill.period} • ครบกำหนด {bill.dueDate}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827' }}>฿{bill.totalAmount.toLocaleString()}</p>
          {outstanding > 0 && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>ค้างชำระ ฿{outstanding.toLocaleString()}</p>}
        </div>
      </div>

      {/* Bill Items */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        {bill.items.map((item, i) => (
          <div key={i} style={{ background: '#f9fafb', borderRadius: 8, padding: '6px 12px', fontSize: 13 }}>
            <span style={{ color: '#6b7280' }}>{item.label}: </span>
            <span style={{ fontWeight: 700, color: '#111827' }}>฿{item.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {(bill.status === 'draft' || bill.status === 'overdue') && (
          <button onClick={() => onSendLine(bill.id)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#06c755', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            📱 ส่ง LINE OA
          </button>
        )}
        {bill.status === 'sent' && (
          <button onClick={() => onSendLine(bill.id)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #06c755', background: '#f0fdf4', color: '#065f46', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            🔄 ส่งซ้ำ
          </button>
        )}
        {bill.slipUrl && (
          <button onClick={() => onViewSlip(bill)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#dbeafe', color: '#1e40af', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            🧾 ดูสลิป
          </button>
        )}
        {(bill.status === 'sent' || bill.status === 'partial' || bill.status === 'overdue') && (
          <button style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#d1fae5', color: '#065f46', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            ✅ ยืนยันรับเงิน
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── Main Component ─────────────────────── */
export default function MonthlyBilling() {
  const [activeTab, setActiveTab] = useState<'bills' | 'meter'>('bills');
  const [bills, setBills] = useState<Bill[]>(MOCK_BILLS);
  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [sending, setSending] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSendLine = async (billId: string) => {
    setSending(billId);
    await new Promise((r) => setTimeout(r, 1200));
    setBills((prev) => prev.map((b) => b.id === billId ? { ...b, status: 'sent', sentAt: new Date().toISOString() } : b));
    setSending(null);
    showToast('✅ ส่งบิลผ่าน LINE OA เรียบร้อยแล้ว');
  };

  const handleSendAll = async () => {
    const toSend = bills.filter((b) => b.status === 'draft' || b.status === 'overdue');
    for (const b of toSend) await handleSendLine(b.id);
    showToast(`✅ ส่งบิลทั้งหมด ${toSend.length} ห้อง ผ่าน LINE OA แล้ว`);
  };

  const handleCreateBill = useCallback((room: RoomConfig, water: [number, number], elec: [number, number]) => {
    const waterUnits = Math.max(0, water[1] - water[0]);
    const elecUnits  = Math.max(0, elec[1] - elec[0]);
    const waterAmt   = waterUnits * room.waterRate;
    const elecAmt    = elecUnits  * room.electricityRate;
    const total      = room.baseRent + room.commonFee + waterAmt + elecAmt;

    const newBill: Bill = {
      id: `b_${Date.now()}`,
      roomNumber: room.roomNumber,
      tenantName: room.tenantName,
      tenantLineId: room.tenantLineId,
      period: selectedMonth,
      dueDate: `${selectedMonth}-25`,
      items: [
        { label: 'ค่าเช่า', amount: room.baseRent },
        { label: `ค่าน้ำ (${waterUnits} หน่วย × ฿${room.waterRate})`, amount: waterAmt },
        { label: `ค่าไฟ (${elecUnits} หน่วย × ฿${room.electricityRate})`, amount: elecAmt },
        { label: 'ค่าส่วนกลาง', amount: room.commonFee },
      ],
      totalAmount: total,
      status: 'draft',
      paidAmount: 0,
      meters: [
        { type: 'water', previous: water[0], current: water[1], rate: room.waterRate },
        { type: 'electricity', previous: elec[0], current: elec[1], rate: room.electricityRate },
      ],
    };
    setBills((prev) => [newBill, ...prev]);
    setActiveTab('bills');
    showToast(`✅ สร้างบิลห้อง ${room.roomNumber} เรียบร้อย`);
  }, [selectedMonth]);

  // Summary stats
  const totalRevenue = bills.filter((b) => b.status === 'paid').reduce((s, b) => s + b.totalAmount, 0);
  const outstanding  = bills.filter((b) => b.status !== 'paid').reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);
  const overdueCount = bills.filter((b) => b.status === 'overdue').length;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px', fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#111827', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>🧾 ระบบบิลรายเดือน</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>ออกบิล จดมิเตอร์ และส่ง LINE OA อัตโนมัติ</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
          />
          <button onClick={handleSendAll} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: '#06c755', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            📱 ส่งบิลทุกห้อง
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'รายรับเดือนนี้', value: `฿${totalRevenue.toLocaleString()}`, color: '#059669', icon: '💰' },
          { label: 'ยอดค้างชำระ', value: `฿${outstanding.toLocaleString()}`, color: '#dc2626', icon: '⚠️' },
          { label: 'ห้องเกินกำหนด', value: `${overdueCount} ห้อง`, color: '#f59e0b', icon: '🔔' },
          { label: 'ห้องทั้งหมด', value: `${MOCK_ROOMS.length} ห้อง`, color: '#6366f1', icon: '🏠' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{s.label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: '#111827' }}>{s.value}</p>
              </div>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f3f4f6', borderRadius: 10, padding: 4 }}>
        {[{ key: 'bills', label: '📋 บิลทั้งหมด' }, { key: 'meter', label: '🔧 จดมิเตอร์' }].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', background: activeTab === t.key ? '#fff' : 'transparent', color: activeTab === t.key ? '#6366f1' : '#6b7280', boxShadow: activeTab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'bills' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bills.filter((b) => b.period === selectedMonth).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', background: '#fff', borderRadius: 16 }}>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>🧾</p>
              <p>ยังไม่มีบิลสำหรับเดือนนี้</p>
              <button onClick={() => setActiveTab('meter')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                จดมิเตอร์เพื่อสร้างบิล
              </button>
            </div>
          ) : (
            bills
              .filter((b) => b.period === selectedMonth)
              .map((bill) => (
                <BillRow
                  key={bill.id}
                  bill={bill}
                  onSendLine={(id) => handleSendLine(id)}
                  onViewSlip={(b) => showToast(`แสดงสลิป: ${b.slipUrl}`)}
                />
              ))
          )}
        </div>
      )}

      {activeTab === 'meter' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ margin: 0, fontSize: 14, color: '#0369a1', fontWeight: 600 }}>
              💡 กรอกค่ามิเตอร์ของแต่ละห้อง ระบบจะคำนวณบิลให้อัตโนมัติ
            </p>
          </div>
          {MOCK_ROOMS.map((room) => (
            <MeterInputRow key={room.roomNumber} room={room} onSave={handleCreateBill} />
          ))}
        </div>
      )}
    </div>
  );
}
