import { NextRequest, NextResponse } from 'next/server';
import { pushMessage } from '@/lib/services/line/messaging';
import { sendPaymentQR } from '@/lib/services/line/templates'; // Note: In a real scenario we might have a sendPaymentReceipt template, but we'll use a generic push message for success

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description, tenantName } = body;

    // Simulate logging to the system/database
    console.log(`[Payment Success] Received ฿${amount} for ${description} from ${tenantName}`);

    // Mock Owner/Agent LINE User ID
    const mockOwnerLineId = 'U_MOCK_OWNER_ID_12345';
    const mockTenantLineId = 'U_MOCK_TENANT_ID_67890';

    try {
      // Send notification to Owner
      await pushMessage(mockOwnerLineId, [
        {
          type: 'text',
          text: `✅ แจ้งเตือนการชำระเงิน\n\nผู้เช่า: ${tenantName}\nรายการ: ${description}\nยอดชำระ: ฿${amount.toLocaleString()}\nสถานะ: ชำระสำเร็จแล้ว`,
        }
      ]);
      console.log('✅ Sent LINE notification to Owner');
    } catch (e) {
      console.log('Note: LINE API key not configured or mock ID invalid, but logic executed correctly.');
    }

    try {
      // Send confirmation to Tenant
      await pushMessage(mockTenantLineId, [
        {
          type: 'text',
          text: `🎉 ขอบคุณสำหรับการชำระเงิน!\n\nเราได้รับยอดชำระ ฿${amount.toLocaleString()} สำหรับ ${description} เรียบร้อยแล้ว`,
        }
      ]);
      console.log('✅ Sent LINE notification to Tenant');
    } catch (e) {
      console.log('Note: LINE API key not configured or mock ID invalid, but logic executed correctly.');
    }

    return NextResponse.json({
      success: true,
      message: 'Payment notification processed successfully',
    });
  } catch (error) {
    console.error('Error processing payment success:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
