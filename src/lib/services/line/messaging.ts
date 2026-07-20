/**
 * LINE Messaging API — core transport layer (push/reply/broadcast/verify)
 */

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';
export const LINE_API_URL = 'https://api.line.me/v2/bot';

export interface LineMessage {
  type: 'text' | 'image' | 'flex';
  text?: string;
  originalContentUrl?: string;
  previewImageUrl?: string;
  altText?: string;
  contents?: any;
}

export interface FlexMessage {
  type: 'flex';
  altText: string;
  contents: any;
}

/** Shared auth headers for LINE API */
export function lineAuthHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

/** Send push message to a user */
export async function pushMessage(userId: string, messages: LineMessage[]): Promise<void> {
  try {
    const response = await fetch(`${LINE_API_URL}/message/push`, {
      method: 'POST',
      headers: lineAuthHeaders(),
      body: JSON.stringify({ to: userId, messages }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LINE API error: ${JSON.stringify(error)}`);
    }
    console.log('LINE message sent to user:', userId);
  } catch (error: any) {
    console.error('Error sending LINE message:', error);
    throw new Error(`Failed to send LINE message: ${error.message}`);
  }
}

/** Reply to a message */
export async function replyMessage(replyToken: string, messages: LineMessage[]): Promise<void> {
  try {
    const response = await fetch(`${LINE_API_URL}/message/reply`, {
      method: 'POST',
      headers: lineAuthHeaders(),
      body: JSON.stringify({ replyToken, messages }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LINE API error: ${JSON.stringify(error)}`);
    }
    console.log('LINE reply message sent');
  } catch (error: any) {
    console.error('Error sending LINE reply:', error);
    throw new Error(`Failed to send LINE reply: ${error.message}`);
  }
}

/** Broadcast message to all followers */
export async function broadcastMessage(messages: LineMessage[]): Promise<void> {
  try {
    const response = await fetch(`${LINE_API_URL}/message/broadcast`, {
      method: 'POST',
      headers: lineAuthHeaders(),
      body: JSON.stringify({ messages }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LINE API error: ${JSON.stringify(error)}`);
    }
    console.log('LINE broadcast message sent');
  } catch (error: any) {
    console.error('Error sending LINE broadcast:', error);
    throw new Error(`Failed to send LINE broadcast: ${error.message}`);
  }
}

/** Verify webhook signature */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('SHA256', LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64');
  return hash === signature;
}
