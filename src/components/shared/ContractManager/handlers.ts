import React from 'react';
import { AuditEvent } from './types';

export const handleEditSave = async (
  e: React.FormEvent,
  editMonthlyRent: string,
  editDepositAmount: string,
  editAdvanceRentAmount: string,
  editStartDate: string,
  editEndDate: string,
  contractId: string,
  user: any,
  db: any,
  contract: any,
  setContract: React.Dispatch<React.SetStateAction<any>>,
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
  setAuditLog: React.Dispatch<React.SetStateAction<AuditEvent[]>>,
  toast: (opts: any) => void,
  lang: 'th' | 'en' | 'cn'
) => {
  e.preventDefault();
  const isTh = lang === 'th';
  const updatedFields = {
    monthlyRent: Number(editMonthlyRent),
    depositAmount: Number(editDepositAmount),
    advanceRentAmount: Number(editAdvanceRentAmount),
    startDate: new Date(editStartDate).toISOString(),
    endDate: new Date(editEndDate).toISOString(),
    signatures: {},
    status: 'pending_signatures',
    updatedAt: new Date().toISOString(),
  };
  try {
    if (user && !user.isMock && db) {
      const res = await fetch('/api/contract/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, ...updatedFields }),
      });
      if (!res.ok) throw new Error('Failed to update contract');
    } else {
      const stored = localStorage.getItem('contracts');
      if (stored) {
        const contracts = JSON.parse(stored);
        const idx = contracts.findIndex((c: any) => c.id === contractId);
        if (idx !== -1) { contracts[idx] = { ...contracts[idx], ...updatedFields }; localStorage.setItem('contracts', JSON.stringify(contracts)); }
      }
    }
    const newAudit: AuditEvent = {
      event: 'terms_edited',
      actor: user?.displayName || 'Owner',
      timestamp: new Date().toISOString(),
      detail: `แก้ไขเงื่อนไขสัญญา → ค่าเช่า ฿${Number(editMonthlyRent).toLocaleString()}/เดือน`,
    };
    setAuditLog((prev: AuditEvent[]) => [newAudit, ...prev]);
    setContract((prev: any) => ({ ...prev, ...updatedFields }));
    setIsEditing(false);
    toast({ title: isTh ? 'แก้ไขสัญญาสำเร็จ' : 'Contract Updated', description: isTh ? 'รายละเอียดสัญญาถูกอัปเดตและรีเซ็ตลายเซ็นแล้ว' : 'Contract details saved and signatures reset.' });
  } catch (err: any) {
    toast({ variant: 'destructive', title: isTh ? 'เกิดข้อผิดพลาด' : 'Error', description: err.message });
  }
};

export const handleSignSubmit = async (
  hasSigned: boolean,
  signatureDataUrl: string,
  signingRole: 'tenant' | 'owner' | 'agent' | null,
  contractId: string,
  user: any,
  db: any,
  contract: any,
  setContract: React.Dispatch<React.SetStateAction<any>>,
  setHasSigned: React.Dispatch<React.SetStateAction<boolean>>,
  setSigningRole: React.Dispatch<React.SetStateAction<'tenant' | 'owner' | 'agent' | null>>,
  setAuditLog: React.Dispatch<React.SetStateAction<AuditEvent[]>>,
  toast: (opts: any) => void,
  lang: 'th' | 'en' | 'cn'
) => {
  const isTh = lang === 'th';
  if (!hasSigned || !signatureDataUrl || !signingRole) return;
  try {
    if (user && !user.isMock && db) {
      const res = await fetch('/api/contract/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, role: signingRole, signatureDataUrl, uid: user.uid, name: user.displayName, ipAddress: '127.0.0.1' }),
      });
      if (!res.ok) throw new Error('Failed to sign contract');
    } else {
      const stored = localStorage.getItem('contracts');
      if (stored) {
        const contracts = JSON.parse(stored);
        const idx = contracts.findIndex((c: any) => c.id === contractId);
        if (idx !== -1) {
          contracts[idx].signatures = { ...contracts[idx].signatures, [signingRole]: { signatureDataUrl, name: user.displayName, signedAt: new Date().toISOString() } };
          const sigCount = Object.keys(contracts[idx].signatures).length;
          contracts[idx].status = sigCount >= 2 ? 'active' : 'pending_signatures';
          localStorage.setItem('contracts', JSON.stringify(contracts));
        }
      }
    }
    const newAudit: AuditEvent = {
      event: 'signature_added',
      actor: user?.displayName || signingRole,
      timestamp: new Date().toISOString(),
      detail: `${isTh ? 'ลงนามสัญญาสำเร็จ' : 'Signed successfully'} · IP: 127.0.0.1`,
    };
    setAuditLog((prev: AuditEvent[]) => [newAudit, ...prev]);
    setContract((prev: any) => ({
      ...prev,
      signatures: { ...prev.signatures, [signingRole]: { signatureDataUrl, name: user.displayName, signedAt: new Date().toISOString() } },
      status: Object.keys({ ...prev.signatures, [signingRole]: {} }).length >= 2 ? 'active' : 'pending_signatures'
    }));
    setHasSigned(false);
    setSigningRole(null);
    toast({ title: isTh ? 'ลงนามสำเร็จ' : 'Signature Saved', description: isTh ? 'ลายเซ็นของคุณถูกบันทึกแล้ว' : 'Your signature has been saved.' });
  } catch (err: any) {
    toast({ variant: 'destructive', title: isTh ? 'เกิดข้อผิดพลาด' : 'Error', description: err.message });
  }
};
