/**
 * @fileOverview e-KYC Helper
 * Wrapper สำหรับการเชื่อมต่อบริการยืนยันตัวตน (e-KYC)
 * 
 * รองรับ:
 * 1. NDID (National Digital ID) - สำหรับผู้มีสัญชาติไทย
 * 2. iDenfy / Jumio Liveness Check - สำหรับชาวต่างชาติ หรือทางเลือกอื่น
 */

export type KYCMethod = 'ndid' | 'liveness_check';
export type KYCStatus = 'pending' | 'verified' | 'failed' | 'rejected';

export interface KYCSession {
  sessionId: string;
  method: KYCMethod;
  redirectUrl: string; // URL สำหรับให้ user เข้าไปทำ KYC (กรณี liveness check)
  status: KYCStatus;
  createdAt: Date;
}

export interface KYCResult {
  sessionId: string;
  status: KYCStatus;
  verificationData?: {
    firstName?: string;
    lastName?: string;
    idCardNumber?: string; // Masked e.g. 1-xxxx-xxxxx-xx-x
    nationality?: string;
    faceMatchScore?: number;
  };
  errorReason?: string;
}

// ─── Mock Implementations ─────────────────────────────────────────────────────

/**
 * เริ่มต้นเซสชัน KYC ใหม่
 */
export async function startKYCSession(
  userId: string,
  method: KYCMethod,
  returnUrl: string
): Promise<KYCSession> {
  const sessionId = `kyc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // Redirect to local verify session page for mock e-KYC
  const mockRedirectUrl = `/kyc/verify-session?sessionId=${sessionId}&returnUrl=${encodeURIComponent(returnUrl)}`;
    
  return {
    sessionId,
    method,
    redirectUrl: mockRedirectUrl,
    status: 'pending',
    createdAt: new Date(),
  };
}

/**
 * ตรวจสอบสถานะ KYC ของ Session
 */
export async function checkKYCStatus(sessionId: string): Promise<KYCResult> {
  // จำลองการเรียก API ตรวจสอบสถานะ
  // ของจริงจะนำ session id ไปเช็คผ่าน provider API
  
  // สมมติให้ผ่านเสมอเพื่อประโยชน์ในการเดโม่
  return {
    sessionId,
    status: 'verified',
    verificationData: {
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      idCardNumber: '1-xxxx-xxxxx-xx-x',
      nationality: 'TH',
      faceMatchScore: 98.5
    }
  };
}

/**
 * ตรวจสอบ Webhook Signature จาก KYC Provider
 */
export function verifyKYCWebhook(payload: string, signature: string): boolean {
  const secret = process.env.KYC_WEBHOOK_SECRET;
  if (!secret) return true; // Dev mode
  
  const crypto = require('crypto');
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return expected === signature;
}
