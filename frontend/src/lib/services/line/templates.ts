/**
 * LINE Flex Message Templates — appointment, payment, contract, billing
 */

import { pushMessage, FlexMessage } from './messaging';

/** Send appointment reminder notification */
export async function sendAppointmentReminder(
  userId: string,
  appointment: { date: string; time: string; location: string; propertyName: string; agentName: string; mapUrl?: string }
): Promise<void> {
  const flexMessage: FlexMessage = {
    type: 'flex',
    altText: `นัดหมายดูห้อง: ${appointment.propertyName}`,
    contents: {
      type: 'bubble',
      header: { type: 'box', layout: 'vertical', contents: [{ type: 'text', text: '🗓️ การนัดหมายดูห้อง', weight: 'bold', size: 'xl', color: '#1A56DB' }] },
      body: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: appointment.propertyName, weight: 'bold', size: 'lg', wrap: true },
          { type: 'box', layout: 'vertical', margin: 'lg', spacing: 'sm', contents: [
            { type: 'box', layout: 'baseline', spacing: 'sm', contents: [{ type: 'text', text: 'วันที่:', color: '#aaaaaa', size: 'sm', flex: 2 }, { type: 'text', text: appointment.date, wrap: true, color: '#666666', size: 'sm', flex: 5 }] },
            { type: 'box', layout: 'baseline', spacing: 'sm', contents: [{ type: 'text', text: 'เวลา:', color: '#aaaaaa', size: 'sm', flex: 2 }, { type: 'text', text: appointment.time, wrap: true, color: '#666666', size: 'sm', flex: 5 }] },
            { type: 'box', layout: 'baseline', spacing: 'sm', contents: [{ type: 'text', text: 'สถานที่:', color: '#aaaaaa', size: 'sm', flex: 2 }, { type: 'text', text: appointment.location, wrap: true, color: '#666666', size: 'sm', flex: 5 }] },
            { type: 'box', layout: 'baseline', spacing: 'sm', contents: [{ type: 'text', text: 'เจ้าหน้าที่:', color: '#aaaaaa', size: 'sm', flex: 2 }, { type: 'text', text: appointment.agentName, wrap: true, color: '#666666', size: 'sm', flex: 5 }] },
          ]},
        ],
      },
      footer: { type: 'box', layout: 'vertical', spacing: 'sm', contents: [{ type: 'button', style: 'primary', height: 'sm', action: { type: 'uri', label: 'ดูแผนที่', uri: appointment.mapUrl || 'https://maps.google.com' } }] },
    },
  };
  await pushMessage(userId, [flexMessage]);
}

/** Send QR code for payment */
export async function sendPaymentQR(
  userId: string,
  payment: { amount: number; description: string; qrCodeUrl: string; expiresAt: string }
): Promise<void> {
  const flexMessage: FlexMessage = {
    type: 'flex',
    altText: `ชำระเงิน: ${payment.description}`,
    contents: {
      type: 'bubble',
      header: { type: 'box', layout: 'vertical', contents: [{ type: 'text', text: '💳 ชำระเงิน', weight: 'bold', size: 'xl', color: '#1A56DB' }] },
      hero: { type: 'image', url: payment.qrCodeUrl, size: 'full', aspectRatio: '1:1', aspectMode: 'cover' },
      body: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: payment.description, weight: 'bold', size: 'lg', wrap: true },
          { type: 'box', layout: 'baseline', margin: 'md', contents: [{ type: 'text', text: 'จำนวนเงิน:', size: 'sm', color: '#aaaaaa', flex: 0 }, { type: 'text', text: `฿${payment.amount.toLocaleString()}`, size: 'xl', weight: 'bold', color: '#1A56DB', flex: 0, margin: 'md' }] },
          { type: 'text', text: `⏱️ หมดอายุ: ${new Date(payment.expiresAt).toLocaleString('th-TH')}`, size: 'xs', color: '#ff6b6b', margin: 'md', wrap: true },
        ],
      },
      footer: { type: 'box', layout: 'vertical', contents: [{ type: 'text', text: '⚠️ สแกน QR Code เพื่อชำระเงินผ่าน PromptPay', size: 'xs', color: '#aaaaaa', wrap: true }] },
    },
  };
  await pushMessage(userId, [flexMessage]);
}

/** Send contract signing reminder */
export async function sendContractReminder(
  userId: string,
  contract: { propertyName: string; moveInDate: string; signUrl: string }
): Promise<void> {
  const flexMessage: FlexMessage = {
    type: 'flex',
    altText: `เซ็นสัญญา: ${contract.propertyName}`,
    contents: {
      type: 'bubble',
      header: { type: 'box', layout: 'vertical', contents: [{ type: 'text', text: '📋 เซ็นสัญญาเช่า', weight: 'bold', size: 'xl', color: '#1A56DB' }] },
      body: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: contract.propertyName, weight: 'bold', size: 'lg', wrap: true },
          { type: 'text', text: `วันเข้าอยู่: ${contract.moveInDate}`, size: 'sm', color: '#666666', margin: 'md' },
          { type: 'separator', margin: 'lg' },
          { type: 'text', text: 'กรุณาลงนามในสัญญาเช่าเพื่อยืนยันการเช่า', size: 'sm', color: '#666666', margin: 'lg', wrap: true },
        ],
      },
      footer: { type: 'box', layout: 'vertical', spacing: 'sm', contents: [{ type: 'button', style: 'primary', height: 'sm', action: { type: 'uri', label: 'เซ็นสัญญาเลย', uri: contract.signUrl } }] },
    },
  };
  await pushMessage(userId, [flexMessage]);
}

/** Send monthly billing notification */
export async function sendMonthlyBilling(
  userId: string,
  billing: { propertyName: string; month: string; rent: number; utilities?: number; total: number; dueDate: string; paymentUrl: string }
): Promise<void> {
  const flexMessage: FlexMessage = {
    type: 'flex',
    altText: `บิลค่าเช่าประจำเดือน ${billing.month}`,
    contents: {
      type: 'bubble',
      header: { type: 'box', layout: 'vertical', contents: [{ type: 'text', text: '🧾 บิลค่าเช่า', weight: 'bold', size: 'xl', color: '#1A56DB' }] },
      body: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: billing.propertyName, weight: 'bold', size: 'md', wrap: true },
          { type: 'text', text: `เดือน ${billing.month}`, size: 'sm', color: '#666666', margin: 'xs' },
          { type: 'separator', margin: 'lg' },
          { type: 'box', layout: 'vertical', margin: 'lg', spacing: 'sm', contents: [
            { type: 'box', layout: 'horizontal', contents: [{ type: 'text', text: 'ค่าเช่า', size: 'sm', color: '#666666', flex: 0 }, { type: 'text', text: `฿${billing.rent.toLocaleString()}`, size: 'sm', color: '#111111', align: 'end' }] },
            ...(billing.utilities ? [{ type: 'box' as const, layout: 'horizontal' as const, contents: [{ type: 'text' as const, text: 'ค่าน้ำ-ไฟ', size: 'sm' as const, color: '#666666', flex: 0 }, { type: 'text' as const, text: `฿${billing.utilities.toLocaleString()}`, size: 'sm' as const, color: '#111111', align: 'end' as const }] }] : []),
            { type: 'separator', margin: 'md' },
            { type: 'box', layout: 'horizontal', margin: 'md', contents: [{ type: 'text', text: 'รวมทั้งหมด', size: 'md', color: '#111111', weight: 'bold', flex: 0 }, { type: 'text', text: `฿${billing.total.toLocaleString()}`, size: 'lg', color: '#1A56DB', weight: 'bold', align: 'end' }] },
          ]},
          { type: 'text', text: `⏰ ครบกำหนด: ${billing.dueDate}`, size: 'xs', color: '#ff6b6b', margin: 'lg' },
        ],
      },
      footer: { type: 'box', layout: 'vertical', spacing: 'sm', contents: [{ type: 'button', style: 'primary', height: 'sm', action: { type: 'uri', label: 'ชำระเงินเลย', uri: billing.paymentUrl } }] },
    },
  };
  await pushMessage(userId, [flexMessage]);
}
