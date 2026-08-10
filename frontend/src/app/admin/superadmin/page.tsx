'use client';

/**
 * @fileOverview SuperAdmin Analytics Dashboard
 *
 * Route: /admin/superadmin
 * ระบบ Analytics สำหรับ SuperAdmin ระดับ Infrastructure
 * - KPI Overview: DAU, Listings, Revenue, Agent Performance, Fraud Rate
 * - Security Dashboard: Failed login, Suspicious IP, IDOR attempts, Rate limit
 * - Data Classification: Public / Internal / Sensitive
 * - System Health Monitor
 */

import { useState, useEffect } from 'react';

/* ─────────────────────── Types ─────────────────────── */
type SATab = 'kpi' | 'security' | 'data' | 'system';

interface KPIMetric {
  label: string;
  value: string | number;
  trend: number; // percent change
  icon: string;
  sparkline: number[]; // last 7 days
}

interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'suspicious_ip' | 'idor_attempt' | 'rate_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip: string;
  timestamp: string;
  resolved: boolean;
}

interface DataAsset {
  name: string;
  tier: 'public' | 'internal' | 'sensitive';
  records: number;
  encrypted: boolean;
  lastAccess: string;
  accessPolicy: string;
}

interface SystemService {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  latency: string;
  lastCheck: string;
}

/* ─────────────────────── Mock Data ─────────────────────── */
const MOCK_KPIS: KPIMetric[] = [
  { label: 'DAU (Daily Active Users)', value: '4,821', trend: 8.3, icon: '👥', sparkline: [3200, 3500, 3800, 4100, 4200, 4600, 4821] },
  { label: 'Listings Active', value: '3,291', trend: 5.2, icon: '🏠', sparkline: [2800, 2950, 3050, 3100, 3180, 3250, 3291] },
  { label: 'Revenue MTD', value: '฿284,500', trend: 12.1, icon: '💰', sparkline: [180000, 210000, 230000, 248000, 260000, 275000, 284500] },
  { label: 'Agent Close Rate', value: '34.2%', trend: 2.8, icon: '🤝', sparkline: [28, 29.5, 31, 32, 33, 33.8, 34.2] },
  { label: 'Fraud Rate', value: '0.12%', trend: -15.4, icon: '🚨', sparkline: [0.25, 0.22, 0.18, 0.16, 0.14, 0.13, 0.12] },
  { label: 'Avg Response Time', value: '18 min', trend: -8.2, icon: '⚡', sparkline: [32, 28, 25, 22, 20, 19, 18] },
];

const MOCK_SECURITY: SecurityEvent[] = [
  { id: 'sec001', type: 'failed_login', severity: 'high', description: 'Failed login attempts > 10 ครั้งในชั่วโมงเดียว', ip: '185.220.101.45', timestamp: '2026-06-17 15:42', resolved: false },
  { id: 'sec002', type: 'suspicious_ip', severity: 'critical', description: 'IP จาก Tor Exit Node เข้าถึง /api/admin', ip: '94.102.49.190', timestamp: '2026-06-17 14:30', resolved: false },
  { id: 'sec003', type: 'idor_attempt', severity: 'high', description: 'พยายามเข้าถึง user data โดยไม่มีสิทธิ์ /api/users/u005', ip: '192.168.1.99', timestamp: '2026-06-17 12:15', resolved: true },
  { id: 'sec004', type: 'rate_limit', severity: 'medium', description: 'Rate limit hit: /api/ai-search — 500 req/min', ip: '203.150.32.18', timestamp: '2026-06-17 11:00', resolved: true },
  { id: 'sec005', type: 'failed_login', severity: 'low', description: 'Credential stuffing attempt ตรวจพบ pattern', ip: '45.155.204.86', timestamp: '2026-06-16 22:00', resolved: true },
];

const MOCK_DATA: DataAsset[] = [
  { name: 'Property Listings', tier: 'public', records: 3291, encrypted: false, lastAccess: '2026-06-17', accessPolicy: 'Everyone can read' },
  { name: 'User Profiles', tier: 'internal', records: 12847, encrypted: true, lastAccess: '2026-06-17', accessPolicy: 'Authenticated users only' },
  { name: 'KYC Documents', tier: 'sensitive', records: 2341, encrypted: true, lastAccess: '2026-06-17', accessPolicy: 'Admin + SA only, AES-256' },
  { name: 'Payment Records', tier: 'sensitive', records: 8932, encrypted: true, lastAccess: '2026-06-17', accessPolicy: 'Finance team + SA, TLS 1.3' },
  { name: 'Chat Messages', tier: 'internal', records: 156420, encrypted: true, lastAccess: '2026-06-17', accessPolicy: 'Participants + Admin on request' },
  { name: 'Audit Logs', tier: 'sensitive', records: 45200, encrypted: true, lastAccess: '2026-06-17', accessPolicy: 'SA only, immutable, 7yr retention' },
];

const MOCK_SERVICES: SystemService[] = [
  { name: 'Next.js App Server', status: 'healthy', uptime: '99.98%', latency: '45ms', lastCheck: '2026-06-17 16:50' },
  { name: 'Firebase Firestore', status: 'healthy', uptime: '99.99%', latency: '12ms', lastCheck: '2026-06-17 16:50' },
  { name: 'Firebase Auth', status: 'healthy', uptime: '99.99%', latency: '8ms', lastCheck: '2026-06-17 16:50' },
  { name: 'LINE Messaging API', status: 'healthy', uptime: '99.95%', latency: '120ms', lastCheck: '2026-06-17 16:49' },
  { name: 'Omise Payment Gateway', status: 'degraded', uptime: '99.80%', latency: '380ms', lastCheck: '2026-06-17 16:48' },
  { name: 'Cloudinary CDN', status: 'healthy', uptime: '99.97%', latency: '55ms', lastCheck: '2026-06-17 16:50' },
  { name: 'iDenfy KYC Service', status: 'healthy', uptime: '99.90%', latency: '890ms', lastCheck: '2026-06-17 16:45' },
  { name: 'AI Search (Gemini)', status: 'healthy', uptime: '99.92%', latency: '650ms', lastCheck: '2026-06-17 16:50' },
];

/* ─────────────────────── Mini Sparkline ─────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={(1) * w} cy={h - ((data[data.length - 1] - min) / range) * h} r={3} fill={color} />
    </svg>
  );
}

/* ─────────────────────── KPI Tab ─────────────────────── */
function KPITab() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        {MOCK_KPIS.map((k) => {
          const up = k.trend > 0;
          const isGoodUp = k.label !== 'Fraud Rate' && k.label !== 'Avg Response Time';
          const positive = (isGoodUp && up) || (!isGoodUp && !up);
          return (
            <div key={k.label} style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.label}</p>
                  <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#111827' }}>{k.value}</p>
                </div>
                <span style={{ fontSize: 28 }}>{k.icon}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: positive ? '#059669' : '#dc2626' }}>
                  {up ? '↑' : '↓'} {Math.abs(k.trend)}%
                </span>
                <Sparkline data={k.sparkline} color={positive ? '#10b981' : '#ef4444'} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>📈 Revenue Breakdown (เดือนนี้)</h3>
        {[
          { label: 'Commission Agent (2.5%)', amount: 142250, pct: 50 },
          { label: 'Credit Top-up', amount: 85350, pct: 30 },
          { label: 'Listing Boost / Pin', amount: 42675, pct: 15 },
          { label: 'Premium Features', amount: 14225, pct: 5 },
        ].map((r) => (
          <div key={r.label} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 14, color: '#374151' }}>{r.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>฿{r.amount.toLocaleString()}</span>
            </div>
            <div style={{ background: '#f3f4f6', borderRadius: 4, height: 8 }}>
              <div style={{ background: '#6366f1', borderRadius: 4, height: 8, width: `${r.pct}%`, transition: 'width 1s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── Security Tab ─────────────────────── */
function SecurityTab() {
  const [events, setEvents] = useState(MOCK_SECURITY);

  const severityColors: Record<string, string> = {
    low: '#6b7280', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed',
  };
  const severityBg: Record<string, string> = {
    low: '#f3f4f6', medium: '#fef3c7', high: '#fee2e2', critical: '#f3e8ff',
  };

  const handleResolve = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, resolved: true } : e)));
  };

  const iconMap: Record<string, string> = {
    failed_login: '🔑', suspicious_ip: '🕵️', idor_attempt: '🚪', rate_limit: '🚦',
  };

  const unresolved = events.filter((e) => !e.resolved).length;

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
          const count = events.filter((e) => e.severity === sev && !e.resolved).length;
          return (
            <div key={sev} style={{ background: severityBg[sev], border: `1px solid ${severityColors[sev]}30`, borderRadius: 12, padding: '16px 24px', flex: 1, minWidth: 120, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: severityColors[sev] }}>{count}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 600, color: severityColors[sev], textTransform: 'uppercase' }}>{sev}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {events.map((e) => (
          <div key={e.id} style={{
            background: '#fff',
            borderRadius: 12,
            padding: 20,
            borderLeft: `4px solid ${severityColors[e.severity]}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            opacity: e.resolved ? 0.6 : 1,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{iconMap[e.type]}</span>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                      background: severityBg[e.severity], color: severityColors[e.severity],
                      padding: '2px 8px', borderRadius: 6,
                    }}>{e.severity}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{e.type.replace(/_/g, ' ')}</span>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: 14, color: '#111827', fontWeight: 600 }}>{e.description}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>IP: {e.ip} • {e.timestamp}</p>
                </div>
              </div>
              <div>
                {e.resolved ? (
                  <span style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>✅ แก้ไขแล้ว</span>
                ) : (
                  <button onClick={() => handleResolve(e.id)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── Data Classification Tab ─────────────────────── */
function DataTab() {
  const tierColors: Record<string, { bg: string; color: string; label: string }> = {
    public: { bg: '#d1fae5', color: '#065f46', label: 'สาธารณะ' },
    internal: { bg: '#dbeafe', color: '#1e40af', label: 'ภายใน' },
    sensitive: { bg: '#fee2e2', color: '#991b1b', label: 'ลับ/ส่วนตัว' },
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['public', 'internal', 'sensitive'] as const).map((t) => {
          const count = MOCK_DATA.filter((d) => d.tier === t).length;
          const c = tierColors[t];
          return (
            <div key={t} style={{ background: c.bg, borderRadius: 12, padding: '12px 20px', flex: 1, minWidth: 120 }}>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: c.color }}>{count} ชุดข้อมูล</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: c.color, fontWeight: 600 }}>{c.label}</p>
            </div>
          );
        })}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['ชุดข้อมูล', 'ระดับ', 'จำนวน Record', 'เข้ารหัส', 'เข้าใช้ล่าสุด', 'นโยบายการเข้าถึง'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_DATA.map((d, i) => {
              const c = tierColors[d.tier];
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>{d.name}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{c.label}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{d.records.toLocaleString()}</td>
                  <td style={{ padding: '14px 16px', fontSize: 16 }}>{d.encrypted ? '🔒' : '🔓'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6b7280' }}>{d.lastAccess}</td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: '#6b7280' }}>{d.accessPolicy}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────── System Health Tab ─────────────────────── */
function SystemTab() {
  const statusColors: Record<string, string> = { healthy: '#059669', degraded: '#f59e0b', down: '#dc2626' };
  const statusBg: Record<string, string> = { healthy: '#d1fae5', degraded: '#fef3c7', down: '#fee2e2' };
  const statusDot: Record<string, string> = { healthy: '🟢', degraded: '🟡', down: '🔴' };

  const [lastBackup] = useState('2026-06-17 03:00 UTC');
  const [nextBackup] = useState('2026-06-18 03:00 UTC');

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 24 }}>
        {MOCK_SERVICES.map((s) => (
          <div key={s.name} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span>{statusDot[s.status]}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{s.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>⬆️ {s.uptime}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>⚡ {s.latency}</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af' }}>{s.lastCheck}</p>
            </div>
            <span style={{ background: statusBg[s.status], color: statusColors[s.status], padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
              {s.status}
            </span>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>💾 Backup & Recovery</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16 }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#15803d', fontWeight: 600 }}>✅ Last Backup</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{lastBackup}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Firestore full export • 2.3GB</p>
          </div>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 16 }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>🕐 Next Backup</p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{nextBackup}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Auto-scheduled • 30-day retention</p>
          </div>
        </div>

        <div style={{ marginTop: 16, padding: '12px 16px', background: '#fef3c7', borderRadius: 10, border: '1px solid #fde68a' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#92400e', fontWeight: 600 }}>
            📋 Insider Trading Policy: ห้ามใช้ข้อมูล Platform เพื่อประโยชน์ส่วนตัวด้านการลงทุน — ทุก access บันทึก Audit Log อัตโนมัติ
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Main Page ─────────────────────── */
export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<SATab>('kpi');

  const tabs: { key: SATab; label: string; icon: string }[] = [
    { key: 'kpi', label: 'KPI Analytics', icon: '📊' },
    { key: 'security', label: 'Security', icon: '🛡️' },
    { key: 'data', label: 'Data Classification', icon: '🗄️' },
    { key: 'system', label: 'System Health', icon: '⚙️' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0533 50%, #0f172a 100%)', padding: '32px 40px 0', borderBottom: '1px solid rgba(139,92,246,0.3)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #7c3aed, #db2777)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              🔐
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>SuperAdmin Command</h1>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Infrastructure & Analytics — Restricted Access</p>
            </div>
            <div style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, padding: '6px 14px' }}>
              <span style={{ fontSize: 12, color: '#f87171', fontWeight: 700 }}>🔴 LIVE</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, marginTop: 24 }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                id={`sa-tab-${t.key}`}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px 10px 0 0',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  background: activeTab === t.key ? '#fff' : 'rgba(255,255,255,0.05)',
                  color: activeTab === t.key ? '#0f172a' : 'rgba(255,255,255,0.6)',
                  transition: 'all 0.2s',
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px' }}>
        {activeTab === 'kpi' && <KPITab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'data' && <DataTab />}
        {activeTab === 'system' && <SystemTab />}
      </div>
    </div>
  );
}
