import { BillItem } from './types';

export function buildBillingFlexMessage(
  period: string,
  roomNumber: string,
  items: BillItem[],
  totalAmount: number,
  dueDate: string,
  billId: string
) {
  return {
    type: 'flex' as const,
    altText: `บิลค่าเช่าเดือน ${period} — ห้อง ${roomNumber}`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#6366f1',
        paddingAll: '20px',
        contents: [
          { type: 'text', text: '🧾 บิลค่าเช่า', color: '#ffffff', size: 'xl', weight: 'bold' as const },
          { type: 'text', text: `ห้อง ${roomNumber} • เดือน ${period}`, color: 'rgba(255,255,255,0.8)', size: 'sm' },
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md' as const,
        contents: [
          ...items.map((item) => ({
            type: 'box',
            layout: 'horizontal' as const,
            contents: [
              { type: 'text', text: item.label, color: '#555555', size: 'sm', flex: 3 },
              { type: 'text', text: `฿${item.amount.toLocaleString()}`, color: '#111111', size: 'sm', weight: 'bold' as const, align: 'end' as const, flex: 2 },
            ],
          })),
          { type: 'separator' as const },
          { type: 'box',
            layout: 'horizontal' as const,
            contents: [
              { type: 'text', text: 'ยอดรวม', weight: 'bold' as const, flex: 3 },
              { type: 'text', text: `฿${totalAmount.toLocaleString()}`, weight: 'bold' as const, color: '#6366f1', size: 'lg' as const, align: 'end' as const, flex: 2 },
            ]
          },
          { type: 'text', text: `ครบกำหนด: ${dueDate}`, size: 'xs' as const, color: '#999999', margin: 'sm' as const },
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm' as const,
        contents: [
          { type: 'button' as const, style: 'primary' as const, color: '#6366f1', action: { type: 'uri' as const, label: 'ชำระเงินออนไลน์', uri: `${process.env.NEXT_PUBLIC_APP_URL}/payment/${billId}` } },
          { type: 'button' as const, style: 'secondary' as const, action: { type: 'uri' as const, label: 'แนบสลิปการโอน', uri: `${process.env.NEXT_PUBLIC_APP_URL}/payment/${billId}/slip` } },
        ]
      },
    },
  };
}
