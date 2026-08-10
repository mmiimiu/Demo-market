import { createPromptPayQR, createCharge, getCharge } from './charges';
import { createTransfer, createRecipient } from './payouts';
import { verifyWebhookSignature, processWebhook, updatePaymentFromWebhook } from './webhooks';

export * from './types';

export class PaymentService {
  static createPromptPayQR = createPromptPayQR;
  static createCharge = createCharge;
  static getCharge = getCharge;
  static createTransfer = createTransfer;
  static createRecipient = createRecipient;
  static verifyWebhookSignature = verifyWebhookSignature;
  static processWebhook = processWebhook;
  static updatePaymentFromWebhook = updatePaymentFromWebhook;
}
