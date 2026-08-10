import { firestoreHelpers, Collections } from '@/lib/db/firestore';

/**
 * Send payment success notification
 */
export async function sendPaymentSuccessNotification(payment: any): Promise<void> {
  console.log('Send payment success notification for payment:', payment.id);
  
  const notificationData = {
    userId: payment.payerId,
    type: 'payment',
    title: {
      th: 'ชำระเงินสำเร็จ',
      en: 'Payment Successful',
      cn: '支付成功',
    },
    message: {
      th: `ชำระเงินจำนวน ${payment.amount} บาท สำเร็จแล้ว`,
      en: `Payment of ${payment.amount} THB completed successfully`,
      cn: `支付 ${payment.amount} 泰铢成功`,
    },
    channels: {
      inApp: true,
      email: true,
      sms: false,
      line: true,
    },
    read: false,
    deliveryStatus: {
      inApp: 'sent',
    },
    priority: 'normal',
  };

  await firestoreHelpers.addDocument(Collections.NOTIFICATIONS, notificationData);
}

/**
 * Send payment failure notification
 */
export async function sendPaymentFailureNotification(payment: any): Promise<void> {
  console.log('Send payment failure notification for payment:', payment.id);

  const notificationData = {
    userId: payment.payerId,
    type: 'payment',
    title: {
      th: 'ชำระเงินไม่สำเร็จ',
      en: 'Payment Failed',
      cn: '支付失败',
    },
    message: {
      th: `การชำระเงินจำนวน ${payment.amount} บาท ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง`,
      en: `Payment of ${payment.amount} THB failed. Please try again`,
      cn: `支付 ${payment.amount} 泰铢失败，请重试`,
    },
    channels: {
      inApp: true,
      email: true,
      sms: false,
      line: true,
    },
    read: false,
    deliveryStatus: {
      inApp: 'sent',
    },
    priority: 'high',
  };

  await firestoreHelpers.addDocument(Collections.NOTIFICATIONS, notificationData);
}
