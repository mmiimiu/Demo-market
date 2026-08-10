/** Flex Message: แจ้งนัดหมายดูห้อง */
export function buildAppointmentFlex(opts: {
  propertyName: string;
  date: string;
  time: string;
  agentName: string;
  confirmUrl?: string;
}): object {
  return {
    type: 'bubble',
    color: '#ffffff',
    header: {
      type: 'box', layout: 'vertical',
      contents: [{ type: 'text', text: '📅 นัดหมายดูห้อง', weight: 'bold', size: 'lg', color: '#1a73e8' }],
      backgroundColor: '#EBF2FF',
      paddingAll: '16px',
    },
    body: {
      type: 'box', layout: 'vertical', spacing: 'sm',
      contents: [
        { type: 'text', text: opts.propertyName, weight: 'bold', size: 'md', wrap: true },
        { type: 'separator', margin: 'md' },
        buildInfoRow('📆 วันที่', opts.date),
        buildInfoRow('⏰ เวลา', opts.time),
        buildInfoRow('👤 ตัวแทน', opts.agentName),
      ],
    },
    footer: opts.confirmUrl ? {
      type: 'box', layout: 'vertical',
      contents: [{
        type: 'button', style: 'primary',
        color: '#1a73e8',
        action: { type: 'uri', label: '✓ ยืนยันนัดหมาย', uri: opts.confirmUrl },
      }],
    } : undefined,
  };
}

/** Flex Message: แจ้งบิลค่าเช่า */
export function buildRentBillFlex(opts: {
  propertyName: string;
  amount: number;
  dueDate: string;
  payUrl?: string;
}): object {
  return {
    type: 'bubble',
    header: {
      type: 'box', layout: 'vertical',
      contents: [{ type: 'text', text: '🏠 แจ้งบิลค่าเช่า', weight: 'bold', size: 'lg', color: '#ffffff' }],
      backgroundColor: '#2D7DD2',
      paddingAll: '16px',
    },
    body: {
      type: 'box', layout: 'vertical', spacing: 'sm',
      contents: [
        { type: 'text', text: opts.propertyName, weight: 'bold', size: 'md', wrap: true },
        { type: 'separator', margin: 'md' },
        buildInfoRow('💰 ยอดชำระ', `฿${opts.amount.toLocaleString()}`),
        buildInfoRow('📅 ครบกำหนด', opts.dueDate),
      ],
    },
    footer: opts.payUrl ? {
      type: 'box', layout: 'vertical',
      contents: [{
        type: 'button', style: 'primary',
        color: '#2D7DD2',
        action: { type: 'uri', label: '💳 ชำระผ่าน PromptPay', uri: opts.payUrl },
      }],
    } : undefined,
  };
}

/** Flex Message: แจ้งเตือนหมดสัญญา */
export function buildContractExpiryFlex(opts: {
  propertyName: string;
  expiryDate: string;
  daysLeft: number;
  renewUrl?: string;
}): object {
  const urgentColor = opts.daysLeft <= 7 ? '#D62828' : '#F77F00';
  return {
    type: 'bubble',
    header: {
      type: 'box', layout: 'vertical',
      contents: [{ type: 'text', text: '⚠️ สัญญาใกล้หมดอายุ', weight: 'bold', size: 'lg', color: '#ffffff' }],
      backgroundColor: urgentColor,
      paddingAll: '16px',
    },
    body: {
      type: 'box', layout: 'vertical', spacing: 'sm',
      contents: [
        { type: 'text', text: opts.propertyName, weight: 'bold', size: 'md', wrap: true },
        { type: 'separator', margin: 'md' },
        buildInfoRow('📅 หมดอายุ', opts.expiryDate),
        {
          type: 'text',
          text: `เหลืออีก ${opts.daysLeft} วัน`,
          weight: 'bold',
          color: urgentColor,
          size: 'xl',
          margin: 'md',
        },
      ],
    },
    footer: opts.renewUrl ? {
      type: 'box', layout: 'vertical',
      contents: [{
        type: 'button', style: 'primary',
        color: urgentColor,
        action: { type: 'uri', label: '🔄 ต่อสัญญา', uri: opts.renewUrl },
      }],
    } : undefined,
  };
}

function buildInfoRow(label: string, value: string) {
  return {
    type: 'box', layout: 'horizontal',
    contents: [
      { type: 'text', text: label, color: '#888888', size: 'sm', flex: 2 },
      { type: 'text', text: value, weight: 'bold', size: 'sm', flex: 3, wrap: true },
    ],
  };
}
