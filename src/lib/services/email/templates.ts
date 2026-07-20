import { type EmailResult } from './types';
import { sendEmail } from './core';

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  to: string,
  userName: string,
  language: 'th' | 'en' = 'th'
): Promise<EmailResult> {
  const content = language === 'th' ? {
    subject: 'ยินดีต้อนรับสู่ PrimeRent',
    html: `
      <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A56DB;">ยินดีต้อนรับ ${userName}!</h1>
        <p>ขอบคุณที่เลือกใช้ PrimeRent แพลตฟอร์มค้นหาที่พักที่ดีที่สุดในประเทศไทย</p>
        
        <div style="background: #F8FAFF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>เริ่มต้นใช้งาน:</h3>
          <ul>
            <li>🔍 ค้นหาที่พักด้วย AI Smart Search</li>
            <li>❤️ บันทึกที่พักโปรดของคุณ</li>
            <li>📱 ติดต่อเจ้าของหรือ Agent ได้ทันที</li>
            <li>💳 ชำระเงินปลอดภัยผ่าน PromptPay</li>
          </ul>
        </div>
        
        <a href="https://PrimeRent.com" style="display: inline-block; background: #1A56DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
          เริ่มค้นหาเลย
        </a>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          ต้องการความช่วยเหลือ? ติดต่อเราที่ support@PrimeRent.com
        </p>
      </div>
    `,
  } : {
    subject: 'Welcome to PrimeRent',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A56DB;">Welcome ${userName}!</h1>
        <p>Thank you for choosing PrimeRent, Thailand's best property search platform</p>
        
        <div style="background: #F8FAFF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Get Started:</h3>
          <ul>
            <li>🔍 Search properties with AI Smart Search</li>
            <li>❤️ Save your favorite properties</li>
            <li>📱 Contact owners or agents instantly</li>
            <li>💳 Secure payment via PromptPay</li>
          </ul>
        </div>
        
        <a href="https://PrimeRent.com" style="display: inline-block; background: #1A56DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
          Start Searching
        </a>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Need help? Contact us at support@PrimeRent.com
        </p>
      </div>
    `,
  };

  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
  });
}

/**
 * Send email verification
 */
export async function sendVerificationEmail(
  to: string,
  verificationLink: string,
  language: 'th' | 'en' = 'th'
): Promise<EmailResult> {
  const content = language === 'th' ? {
    subject: 'ยืนยันอีเมลของคุณ',
    html: `
      <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A56DB;">ยืนยันอีเมลของคุณ</h1>
        <p>กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ</p>
        
        <a href="${verificationLink}" style="display: inline-block; background: #1A56DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          ยืนยันอีเมล
        </a>
        
        <p style="color: #666; font-size: 14px;">
          ลิงก์นี้จะหมดอายุใน 15 นาที<br/>
          หากคุณไม่ได้สมัครสมาชิก กรุณาเพิกเฉยอีเมลนี้
        </p>
      </div>
    `,
  } : {
    subject: 'Verify Your Email',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A56DB;">Verify Your Email</h1>
        <p>Please click the button below to verify your email address</p>
        
        <a href="${verificationLink}" style="display: inline-block; background: #1A56DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        
        <p style="color: #666; font-size: 14px;">
          This link will expire in 15 minutes<br/>
          If you didn't sign up, please ignore this email
        </p>
      </div>
    `,
  };

  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  resetLink: string,
  language: 'th' | 'en' = 'th'
): Promise<EmailResult> {
  const content = language === 'th' ? {
    subject: 'รีเซ็ตรหัสผ่านของคุณ',
    html: `
      <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A56DB;">รีเซ็ตรหัสผ่าน</h1>
        <p>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        
        <a href="${resetLink}" style="display: inline-block; background: #1A56DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          รีเซ็ตรหัสผ่าน
        </a>
        
        <p style="color: #666; font-size: 14px;">
          ลิงก์นี้จะหมดอายุใน 15 นาที<br/>
          หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยอีเมลนี้
        </p>
      </div>
    `,
  } : {
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A56DB;">Reset Your Password</h1>
        <p>We received a request to reset your password</p>
        
        <a href="${resetLink}" style="display: inline-block; background: #1A56DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        
        <p style="color: #666; font-size: 14px;">
          This link will expire in 15 minutes<br/>
          If you didn't request a password reset, please ignore this email
        </p>
      </div>
    `,
  };

  return sendEmail({
    to,
    subject: content.subject,
    html: content.html,
  });
}

/**
 * Send inquiry notification to owner/agent
 */
export async function sendInquiryNotification(
  to: string,
  inquiry: {
    userName: string;
    propertyName: string;
    message: string;
    inquiryUrl: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: `มีผู้สนใจห้อง: ${inquiry.propertyName}`,
    html: `
      <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A56DB;">มีผู้สนใจห้องของคุณ!</h1>
        
        <div style="background: #F8FAFF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>ห้อง:</strong> ${inquiry.propertyName}</p>
          <p><strong>ผู้สนใจ:</strong> ${inquiry.userName}</p>
          <p><strong>ข้อความ:</strong></p>
          <p style="white-space: pre-wrap;">${inquiry.message}</p>
        </div>
        
        <a href="${inquiry.inquiryUrl}" style="display: inline-block; background: #1A56DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
          ดูรายละเอียด
        </a>
      </div>
    `,
  });
}

/**
 * Send payment receipt
 */
export async function sendPaymentReceipt(
  to: string,
  payment: {
    amount: number;
    description: string;
    transactionId: string;
    date: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: `ใบเสร็จการชำระเงิน - ${payment.description}`,
    html: `
      <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A56DB;">ใบเสร็จการชำระเงิน</h1>
        
        <div style="background: #F8FAFF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>รายการ:</strong> ${payment.description}</p>
          <p><strong>จำนวนเงิน:</strong> ฿${payment.amount.toLocaleString()}</p>
          <p><strong>รหัสอ้างอิง:</strong> ${payment.transactionId}</p>
          <p><strong>วันที่:</strong> ${payment.date}</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          ขอบคุณที่เลือกใช้บริการ PrimeRent<br/>
          หากมีคำถาม ติดต่อเราที่ support@PrimeRent.com
        </p>
      </div>
    `,
  });
}

/**
 * Send Co-Broke Pitch Email
 */
export async function sendCoBrokePitchEmail(
  to: string,
  pitch: { agentName: string; propertyName: string; pitchUrl: string }
): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: `คุณได้รับข้อเสนอ Co-Broke ใหม่สำหรับ ${pitch.propertyName}`,
    html: `
      <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A56DB;">ข้อเสนอ Co-Broke ใหม่!</h1>
        <div style="background: #F8FAFF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Agent:</strong> ${pitch.agentName}</p>
          <p><strong>โครงการ:</strong> ${pitch.propertyName}</p>
        </div>
        <a href="${pitch.pitchUrl}" style="display: inline-block; background: #1A56DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
          ดูข้อเสนอ
        </a>
      </div>
    `,
  });
}

/**
 * Send Tenant Proposal Email
 */
export async function sendTenantProposalEmail(
  to: string,
  proposal: { tenantName: string; agentName: string; dashboardUrl: string }
): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: `มี Agent เสนอห้องให้คุณ!`,
    html: `
      <div style="font-family: 'Sarabun', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1A56DB;">สวัสดี ${proposal.tenantName}</h1>
        <div style="background: #F8FAFF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Agent ${proposal.agentName}</strong> ได้ส่งห้องที่ตรงกับความต้องการของคุณมาให้พิจารณา</p>
        </div>
        <a href="${proposal.dashboardUrl}" style="display: inline-block; background: #1A56DB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
          ดูห้องที่นำเสนอ
        </a>
      </div>
    `,
  });
}
