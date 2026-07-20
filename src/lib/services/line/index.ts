/**
 * LINE Messaging API Service — barrel re-export
 * Backward-compatible: `LineService.pushMessage(...)` still works.
 * 
 * Domain split:
 * - messaging.ts  → core push/reply/broadcast/verify
 * - templates.ts  → flex message builders (appointment, payment, contract, billing)
 * - webhook.ts    → event handlers
 */

export * from './messaging';
export * from './templates';
export * from './webhook';

// Legacy class facade — keeps any code using `LineService.x()` working
import { pushMessage, replyMessage, broadcastMessage, verifyWebhookSignature } from './messaging';
import { sendAppointmentReminder, sendPaymentQR, sendContractReminder, sendMonthlyBilling } from './templates';
import { handleFollowEvent, handleTextMessage, handlePostback } from './webhook';

export class LineService {
  static pushMessage = pushMessage;
  static replyMessage = replyMessage;
  static broadcastMessage = broadcastMessage;
  static verifyWebhookSignature = verifyWebhookSignature;
  static sendAppointmentReminder = sendAppointmentReminder;
  static sendPaymentQR = sendPaymentQR;
  static sendContractReminder = sendContractReminder;
  static sendMonthlyBilling = sendMonthlyBilling;
  static handleFollowEvent = handleFollowEvent;
  static handleTextMessage = handleTextMessage;
  static handlePostback = handlePostback;
}
