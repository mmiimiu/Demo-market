export interface AuditLog {
  id: string;
  action: 'create' | 'edit' | 'delete' | 'renew' | 'boost' | 'pin';
  targetType: 'property' | 'contract' | 'payment';
  targetId: string;
  userId: string;
  timestamp: string;
  details: string;
}

/**
 * บันทึกประวัติการกระทำของระบบ (Audit Log)
 * สำหรับกิจกรรมสำคัญของประกาศ เช่า และการชำระเงิน
 */
export function logAudit(
  action: AuditLog['action'],
  targetType: AuditLog['targetType'],
  targetId: string,
  userId: string,
  details: string
): void {
  try {
    const logsKey = 'primerent_audit_logs';
    const stored = localStorage.getItem(logsKey);
    const list = stored ? JSON.parse(stored) : [];
    
    const newLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      targetType,
      targetId,
      userId,
      timestamp: new Date().toISOString(),
      details,
    };
    
    // Save to local logs store
    localStorage.setItem(logsKey, JSON.stringify([newLog, ...list].slice(0, 100)));
    
    // Console log for audit trail tracking
    console.info(`[AUDIT TRAIL] Action: ${action.toUpperCase()} | Target: ${targetType} (${targetId}) | User: ${userId} | Details: ${details}`);
  } catch (err) {
    console.error('[audit] Failed to record audit log:', err);
  }
}
