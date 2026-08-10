import { sendSMS, checkStatus, sendBulkSMS, estimateCost } from './send';
import { sendOTP, sendVerification, sendAppointmentReminder, sendPaymentConfirmation, sendContractReminder } from './templates';

export * from './types';
export * from './otp';

export class SMSService {
  static sendSMS = sendSMS;
  static sendOTP = sendOTP;
  static sendVerification = sendVerification;
  static sendAppointmentReminder = sendAppointmentReminder;
  static sendPaymentConfirmation = sendPaymentConfirmation;
  static sendContractReminder = sendContractReminder;
  static checkStatus = checkStatus;
  static sendBulkSMS = sendBulkSMS;
  static estimateCost = estimateCost;
}
