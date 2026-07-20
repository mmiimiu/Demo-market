import { replyMessage } from './messaging';

export async function handleFollowEvent(event: any): Promise<void> {
  const { replyToken, source } = event;
  const lineUserId = source?.userId;

  console.log(`[line-webhook] New follower: ${lineUserId}`);

  await replyMessage(replyToken, [
    {
      type: 'flex',
      altText: 'ยินดีต้อนรับสู่ PrimeRent! 🏠',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🏠 PrimeRent',
              weight: 'bold',
              size: 'xl',
              color: '#ffffff',
            },
          ],
          backgroundColor: '#1a73e8',
          paddingAll: '16px',
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            {
              type: 'text',
              text: 'ยินดีต้อนรับ! 👋',
              weight: 'bold',
              size: 'lg',
            },
            {
              type: 'text',
              text: 'เราจะส่งการแจ้งเตือนสำคัญให้คุณผ่านทางนี้ เช่น\n• นัดหมายดูห้อง\n• บิลค่าเช่ารายเดือน\n• หมดอายุสัญญา',
              wrap: true,
              color: '#555555',
              size: 'sm',
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              style: 'primary',
              color: '#1a73e8',
              action: {
                type: 'uri',
                label: '🔗 เชื่อมบัญชี PrimeRent',
                uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/line-link?lineUserId=${lineUserId}`,
              },
            },
          ],
        },
      },
    },
  ]);
}

export async function handleTextMessage(event: any): Promise<void> {
  const { replyToken, message, source } = event;
  const text: string = message?.text?.toLowerCase().trim() || '';
  const lineUserId = source?.userId;

  let responseText = '';
  if (text.includes('สวัสดี') || text === 'hi' || text === 'hello') {
    responseText = 'สวัสดีครับ! 😊 มีอะไรให้ช่วยไหมครับ?\n\nพิมพ์:\n• "ช่วยเหลือ" — ดูคำสั่งทั้งหมด\n• "ห้อง" — ดูห้องว่าง\n• "บิล" — ดูบิลค่าเช่า';
  } else if (text.includes('ช่วยเหลือ') || text === 'help') {
    responseText = '📖 คำสั่งที่ใช้ได้:\n\n• "ห้อง" — ค้นหาห้องว่าง\n• "บิล" — ดูบิลค่าเช่า\n• "นัด" — ดูนัดหมายของคุณ\n• "ติดต่อ" — ติดต่อทีมงาน';
  } else if (text.includes('ห้อง') || text.includes('room')) {
    responseText = '🏠 ดูห้องว่างทั้งหมดได้ที่:\n' + (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  } else if (text.includes('บิล') || text.includes('bill')) {
    responseText = '💰 ดูบิลค่าเช่าของคุณได้ที่:\n' + (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/owner/dashboard';
  } else if (text.includes('ติดต่อ') || text.includes('contact')) {
    responseText = '📞 ติดต่อทีมงาน PrimeRent:\n• LINE: @primerent\n• Email: support@primerent.th\n• โทร: 02-xxx-xxxx (จ-ศ 9:00-18:00)';
  } else {
    responseText = `ได้รับข้อความของคุณแล้วครับ: "${message.text}"\n\nทีมงานจะตอบกลับภายใน 30 นาที หากเร่งด่วนโทร 02-xxx-xxxx`;
  }

  if (responseText) {
    await replyMessage(replyToken, [{ type: 'text', text: responseText }]);
  }

  console.log(`[line-webhook] Text from ${lineUserId}: "${message.text}"`);
}

export async function handlePostback(event: any): Promise<void> {
  const { replyToken, postback, source } = event;
  const data = postback?.data || '';
  const lineUserId = source?.userId;

  console.log(`[line-webhook] Postback from ${lineUserId}: ${data}`);

  const params = Object.fromEntries(new URLSearchParams(data));

  if (params.action === 'confirm_appointment') {
    await replyMessage(replyToken, [{
      type: 'text',
      text: `✅ ยืนยันนัดหมายสำเร็จแล้วครับ!\n📅 ${params.date} เวลา ${params.time}\n🏠 ${params.property}\n\nเราจะแจ้งเตือนคุณ 1 ชั่วโมงก่อนถึงเวลา`,
    }]);
  } else if (params.action === 'cancel_appointment') {
    await replyMessage(replyToken, [{
      type: 'text',
      text: '❌ ยกเลิกนัดหมายแล้วครับ\n\nหากต้องการนัดใหม่ กดที่ลิงก์ในข้อความก่อนหน้า หรือติดต่อตัวแทนโดยตรง',
    }]);
  } else {
    await replyMessage(replyToken, [{
      type: 'text',
      text: 'ได้รับคำสั่งของคุณแล้วครับ กำลังดำเนินการ...',
    }]);
  }
}
