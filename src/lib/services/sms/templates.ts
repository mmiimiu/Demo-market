import { type SMSResult } from './types';
import { sendSMS } from './send';

/**
 * Send OTP via SMS
 */
export async function sendOTP(phoneNumber: string, otp: string): Promise<SMSResult> {
  const message = `รหัส OTP ของคุณคือ: ${otp}\n\nรหัสนี้จะหมดอายุใน 5 นาที\n\n- PrimeRent`;
  return sendSMS(phoneNumber, message);
}

/**
 * Send verification SMS
 */
export async function sendVerification(phoneNumber: string, code: string): Promise<SMSResult> {
  const message = `ยืนยันบัญชี PrimeRent ของคุณด้วยรหัส: ${code}\n\nไม่แชร์รหัสนี้กับผู้อื่น`;
  return sendSMS(phoneNumber, message);
}

/**
 * Send appointment reminder
 */
export async function sendAppointmentReminder(
  phoneNumber: string,
  appointment: {
    propertyName: string;
    date: string;
    time: string;
    location: string;
  }
): Promise<SMSResult> {
  const message = 
    `🏡 การนัดหมายดูห้อง\n\n` +
    `${appointment.propertyName}\n` +
    `📅 ${appointment.date}\n` +
    `⏰ ${appointment.time}\n` +
    `📍 ${appointment.location}\n\n` +
    `- PrimeRent`;
  
  return sendSMS(phoneNumber, message);
}

/**
 * Send payment confirmation
 */
export async function sendPaymentConfirmation(
  phoneNumber: string,
  payment: {
    amount: number;
    description: string;
    transactionId: string;
  }
): Promise<SMSResult> {
  const message = 
    `✅ ชำระเงินสำเร็จ\n\n` +
    `จำนวน: ฿${payment.amount.toLocaleString()}\n` +
    `${payment.description}\n\n` +
    `รหัสอ้างอิง: ${payment.transactionId}\n\n` +
    `- PrimeRent`;
  
  return sendSMS(phoneNumber, message);
}

/**
 * Send contract signing reminder
 */
export async function sendContractReminder(
  phoneNumber: string,
  propertyName: string,
  deadline: string
): Promise<SMSResult> {
  const message = 
    `📋 เซ็นสัญญาเช่า\n\n` +
    `${propertyName}\n\n` +
    `กรุณาลงนามภายใน: ${deadline}\n\n` +
    `- PrimeRent`;
  
  return sendSMS(phoneNumber, message);
}
