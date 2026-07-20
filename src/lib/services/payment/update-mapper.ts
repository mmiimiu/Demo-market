export function mapWebhookEventToUpdates(key: string, data: any, paymentType: string): any {
  const updates: any = {};
  
  switch (key) {
    case 'charge.complete':
      updates.status = 'completed';
      updates.completedAt = new Date();
      if (data.source?.type === 'promptpay' && data.source?.scannable_code) {
        updates['qrCode.scannedAt'] = new Date();
      }
      break;

    case 'charge.failed':
      updates.status = 'failed';
      updates.failureMessage = data.failure_message;
      break;

    case 'charge.pending':
      updates.status = 'processing';
      break;

    case 'transfer.create':
      if (paymentType === 'payout') {
        updates.status = 'processing';
      }
      break;

    case 'transfer.paid':
      if (paymentType === 'payout') {
        updates.status = 'completed';
        updates.completedAt = new Date();
      }
      break;

    case 'transfer.failed':
      if (paymentType === 'payout') {
        updates.status = 'failed';
        updates.failureMessage = data.failure_message;
      }
      break;
  }
  
  return updates;
}
