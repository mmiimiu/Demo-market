import { sendEmail, sendBulkEmails } from './core';
import { 
  sendWelcomeEmail, 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendInquiryNotification, 
  sendPaymentReceipt 
} from './templates';

export * from './types';

export class EmailService {
  static sendEmail = sendEmail;
  static sendWelcomeEmail = sendWelcomeEmail;
  static sendVerificationEmail = sendVerificationEmail;
  static sendPasswordResetEmail = sendPasswordResetEmail;
  static sendInquiryNotification = sendInquiryNotification;
  static sendPaymentReceipt = sendPaymentReceipt;
  static sendBulkEmails = sendBulkEmails;
}
