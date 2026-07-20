import { db } from '@/firebase/config';
import { collection, addDoc, doc, updateDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

export interface PaymentRecord {
  id?: string;
  contractId: string;
  propertyId: string;
  tenantId: string;
  ownerId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'line_pay' | 'bank_transfer' | 'cash';
  slipImageUrl?: string;
  slipVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  createdAt: any;
}

export class LineService {
  /**
   * Send LINE message to notify about rent payment
   */
  static async sendPaymentNotification(lineUserId: string, paymentDetails: {
    propertyName: string;
    amount: number;
    dueDate: string;
  }) {
    try {
      // LINE Messaging API integration
      // This requires LINE Channel Access Token and User ID
      const lineApiUrl = 'https://api.line.me/v2/bot/message/push';
      const lineAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

      if (!lineAccessToken) {
        console.warn('LINE Channel Access Token not configured');
        return false;
      }

      const message = {
        to: lineUserId,
        messages: [
          {
            type: 'text',
            text: `💰 แจ้งเตือนชำระค่าเช่า\n\n` +
                  `ทรัพย์สิน: ${paymentDetails.propertyName}\n` +
                  `จำนวนเงิน: ฿${paymentDetails.amount.toLocaleString()}\n` +
                  `วันครบกำหนด: ${paymentDetails.dueDate}\n\n` +
                  `กรุณาชำระภายในวันครบกำหนด\n` +
                  `ส่งสลิปยืนยันได้ที่แอปพลิเคชัน`
          }
        ]
      };

      const response = await fetch(lineApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lineAccessToken}`,
        },
        body: JSON.stringify(message),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending LINE notification:', error);
      return false;
    }
  }

  /**
   * Send LINE message with payment confirmation
   */
  static async sendPaymentConfirmation(lineUserId: string, paymentDetails: {
    propertyName: string;
    amount: number;
    paymentDate: string;
  }) {
    try {
      const lineApiUrl = 'https://api.line.me/v2/bot/message/push';
      const lineAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

      if (!lineAccessToken) {
        console.warn('LINE Channel Access Token not configured');
        return false;
      }

      const message = {
        to: lineUserId,
        messages: [
          {
            type: 'text',
            text: `✅ รับชำระค่าเช่าเรียบร้อย\n\n` +
                  `ทรัพย์สิน: ${paymentDetails.propertyName}\n` +
                  `จำนวนเงิน: ฿${paymentDetails.amount.toLocaleString()}\n` +
                  `วันที่ชำระ: ${paymentDetails.paymentDate}\n\n` +
                  `ขอบคุณที่ชำระตรงเวลาครับ/ค่ะ`
          }
        ]
      };

      const response = await fetch(lineApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lineAccessToken}`,
        },
        body: JSON.stringify(message),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending LINE confirmation:', error);
      return false;
    }
  }

  /**
   * Send LINE message for slip upload request
   */
  static async requestSlipUpload(lineUserId: string, paymentDetails: {
    propertyName: string;
    amount: number;
  }) {
    try {
      const lineApiUrl = 'https://api.line.me/v2/bot/message/push';
      const lineAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

      if (!lineAccessToken) {
        console.warn('LINE Channel Access Token not configured');
        return false;
      }

      const message = {
        to: lineUserId,
        messages: [
          {
            type: 'text',
            text: `📎 กรุณาอัปโหลดสลิปโอนเงิน\n\n` +
                  `ทรัพย์สิน: ${paymentDetails.propertyName}\n` +
                  `จำนวนเงิน: ฿${paymentDetails.amount.toLocaleString()}\n\n` +
                  `ส่งสลิปยืนยันผ่านแอปพลิเคชันเพื่อยืนยันการชำระเงิน`
          }
        ]
      };

      const response = await fetch(lineApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lineAccessToken}`,
        },
        body: JSON.stringify(message),
      });

      return response.ok;
    } catch (error) {
      console.error('Error requesting slip upload:', error);
      return false;
    }
  }

  /**
   * เชื่อมต่อ OA เพื่อรับ inquiry จากนอก platform
   * เมื่อผู้ใช้นอกแพลตฟอร์มติดต่อสอบถามเข้ามาทาง LINE OA 
   * ระบบจะสร้างห้องแชทและแจ้งเตือนไปยัง Agent/ผู้ดูแลประกาศของห้องเช่านั้นโดยอัตโนมัติ
   */
  static async handleIncomingLineInquiry(inquiry: {
    lineUserId: string;
    lineUserName: string;
    propertyId: string;
    messageText: string;
    agentId: string;
  }) {
    try {
      console.log(`[LINE OA INQUIRY] Incoming inquiry from LINE User: ${inquiry.lineUserName} for property ${inquiry.propertyId}`);
      
      const newInquiryId = `line_inq_${Date.now()}`;
      
      // Save simulated inquiry to localStorage for demo mapping
      const stored = localStorage.getItem('primerent_line_inquiries');
      const list = stored ? JSON.parse(stored) : [];
      list.push({
        id: newInquiryId,
        ...inquiry,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('primerent_line_inquiries', JSON.stringify(list));

      // Simulate creating a chat room on platform so agent can reply directly
      const chatKey = 'primerent_chats';
      const chats = localStorage.getItem(chatKey) ? JSON.parse(localStorage.getItem(chatKey)!) : [];
      const newRoom = {
        roomId: `room_${newInquiryId}`,
        title: `LINE: ${inquiry.lineUserName} (สนใจห้อง #${inquiry.propertyId})`,
        propertyId: inquiry.propertyId,
        agentId: inquiry.agentId,
        tenantId: inquiry.lineUserId,
        tenantName: `${inquiry.lineUserName} (LINE OA)`,
        messages: [
          {
            id: `msg_1`,
            senderId: inquiry.lineUserId,
            senderName: inquiry.lineUserName,
            text: inquiry.messageText,
            timestamp: new Date().toISOString(),
          }
        ],
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(chatKey, JSON.stringify([newRoom, ...chats]));

      // Add notification for Agent
      const storedNotifs = localStorage.getItem('primerent_notifications');
      const notifs = storedNotifs ? JSON.parse(storedNotifs) : [];
      const newNotif = {
        id: `n_line_${Date.now()}`,
        type: 'chat_message',
        title: `💬 Inquiry ใหม่จาก LINE OA`,
        description: `${inquiry.lineUserName} สนใจประกาศของคุณ: "${inquiry.messageText.substring(0, 40)}..."`,
        timestamp: new Date().toISOString(),
        read: false,
        href: `/chat?roomId=room_${newInquiryId}`,
      };
      localStorage.setItem('primerent_notifications', JSON.stringify([newNotif, ...notifs]));

      return { success: true, inquiryId: newInquiryId, roomId: newRoom.roomId };
    } catch (error) {
      console.error('Error handling incoming LINE inquiry:', error);
      return { success: false, error };
    }
  }
}
