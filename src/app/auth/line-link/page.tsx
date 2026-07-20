'use client';

/**
 * @fileOverview LINE Account Link Page
 * หน้าเชื่อมบัญชี LINE กับ Firebase account
 *
 * Route: /auth/line-link?lineUserId=Uxxxxxxxx
 *
 * Flow:
 * 1. ผู้ใช้ follow LINE OA → Webhook ส่งลิงก์นี้
 * 2. ผู้ใช้กด "เชื่อมบัญชี" → Login ด้วย Firebase ถ้ายังไม่ได้ login
 * 3. POST /api/line/sync → บันทึก lineUserId ใน Firestore
 * 4. แสดง success state
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/firebase';

export const dynamic = 'force-dynamic';

type Status = 'idle' | 'linking' | 'success' | 'error' | 'already_linked';

function LineLinkContent() {
  const searchParams = useSearchParams();
  const lineUserId = searchParams.get('lineUserId') || '';
  const { user, loading } = useUser();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Check if already linked on mount
  useEffect(() => {
    if (!user || !user.uid) return;
    fetch(`/api/line/sync?uid=${user.uid}`)
      .then(r => r.json())
      .then(data => {
        if (data.linked) setStatus('already_linked');
      })
      .catch(() => {});
  }, [user]);

  const handleLink = async () => {
    if (!user?.uid) return;
    if (!lineUserId) {
      setErrorMsg('ไม่พบ LINE User ID — กรุณาเพิ่มเพื่อน OA ใหม่');
      setStatus('error');
      return;
    }

    setStatus('linking');
    try {
      const res = await fetch('/api/line/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: user.uid, lineUserId }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
      } else if (res.status === 409) {
        setErrorMsg('LINE นี้ถูกเชื่อมกับบัญชีอื่นแล้ว');
        setStatus('error');
      } else {
        setErrorMsg(data.error || 'เกิดข้อผิดพลาด');
        setStatus('error');
      }
    } catch {
      setErrorMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      setStatus('error');
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <p style={styles.subText}>กำลังตรวจสอบบัญชี...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h2 style={styles.title}>เข้าสู่ระบบก่อน</h2>
          <p style={styles.subText}>
            กรุณาเข้าสู่ระบบ PrimeRent ก่อนเชื่อมบัญชี LINE ของคุณ
          </p>
          <a href="/" style={styles.primaryBtn}>
            ไปหน้าเข้าสู่ระบบ
          </a>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={styles.title}>เชื่อมบัญชีสำเร็จ!</h2>
          <p style={styles.subText}>
            บัญชี LINE ของคุณเชื่อมกับ PrimeRent แล้ว<br />
            คุณจะได้รับการแจ้งเตือนสำคัญผ่าน LINE
          </p>
          <a href="/" style={styles.primaryBtn}>กลับหน้าหลัก</a>
        </div>
      </div>
    );
  }

  if (status === 'already_linked') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔗</div>
          <h2 style={styles.title}>เชื่อมบัญชีแล้ว</h2>
          <p style={styles.subText}>
            บัญชีของคุณเชื่อมกับ LINE อยู่แล้วครับ<br />
            คุณพร้อมรับการแจ้งเตือนผ่าน LINE
          </p>
          <a href="/" style={styles.primaryBtn}>กลับหน้าหลัก</a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* LINE Logo + PrimeRent */}
        <div style={styles.iconRow}>
          <div style={styles.lineIcon}>LINE</div>
          <div style={styles.linkIcon}>🔗</div>
          <div style={styles.primeIcon}>P</div>
        </div>

        <h2 style={styles.title}>เชื่อมบัญชี LINE</h2>
        <p style={styles.subText}>
          เชื่อม LINE ของคุณกับ <strong>PrimeRent</strong><br />
          เพื่อรับการแจ้งเตือนสำคัญ เช่น
        </p>

        <div style={styles.featureList}>
          {[
            ['📅', 'นัดหมายดูห้อง'],
            ['💰', 'บิลค่าเช่ารายเดือน'],
            ['⚠️', 'หมดอายุสัญญา'],
            ['🏠', 'อัปเดตสถานะที่พัก'],
          ].map(([icon, text]) => (
            <div key={text} style={styles.featureItem}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* User info */}
        <div style={styles.userBadge}>
          <span style={{ fontSize: 16 }}>👤</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{user.displayName || user.email}</div>
            <div style={{ fontSize: 11, color: '#888' }}>บัญชีที่จะเชื่อม</div>
          </div>
        </div>

        {status === 'error' && (
          <div style={styles.errorBox}>{errorMsg}</div>
        )}

        <button
          onClick={handleLink}
          disabled={status === 'linking'}
          style={{ ...styles.lineBtn, opacity: status === 'linking' ? 0.6 : 1 }}
        >
          {status === 'linking' ? '⏳ กำลังเชื่อม...' : '🟢 เชื่อมบัญชี LINE'}
        </button>

        <a href="/" style={styles.cancelLink}>ไม่ใช่ตอนนี้</a>
      </div>
    </div>
  );
}

export default function LineLinkPage() {
  return (
    <Suspense fallback={
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <p style={styles.subText}>กำลังโหลด...</p>
        </div>
      </div>
    }>
      <LineLinkContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f0f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: '40px 32px',
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 8px 48px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  iconRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  lineIcon: {
    backgroundColor: '#06C755',
    color: '#fff',
    fontWeight: 900,
    fontSize: 13,
    padding: '8px 14px',
    borderRadius: 12,
  },
  linkIcon: { fontSize: 24 },
  primeIcon: {
    backgroundColor: '#1a73e8',
    color: '#fff',
    fontWeight: 900,
    fontSize: 20,
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: 800, fontSize: 22, color: '#1a1a2e', margin: 0 },
  subText: { color: '#666', fontSize: 14, lineHeight: 1.6, margin: 0 },
  featureList: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: '10px 16px',
    width: '100%',
    border: '1px solid #dbeafe',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    color: '#e53e3e',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 600,
    border: '1px solid #fed7d7',
    width: '100%',
  },
  lineBtn: {
    backgroundColor: '#06C755',
    color: '#fff',
    border: 'none',
    borderRadius: 16,
    height: 56,
    fontSize: 16,
    fontWeight: 800,
    cursor: 'pointer',
    width: '100%',
    transition: 'opacity 0.2s',
  },
  primaryBtn: {
    backgroundColor: '#1a73e8',
    color: '#fff',
    borderRadius: 16,
    height: 56,
    fontSize: 15,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    textDecoration: 'none',
  },
  cancelLink: {
    color: '#888',
    fontSize: 13,
    textDecoration: 'none',
    marginTop: 4,
  },
  spinner: {
    width: 40, height: 40,
    border: '4px solid #e2e8f0',
    borderTopColor: '#1a73e8',
    borderRadius: '50%',
  },
};
