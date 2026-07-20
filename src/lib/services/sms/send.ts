import { type SMSResult } from './types';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } from './config';
import { formatPhoneNumber, validatePhoneNumber } from './utils';

/**
 * Send SMS via Twilio
 */
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  try {
    const formattedPhone = formatPhoneNumber(to);

    if (!validatePhoneNumber(formattedPhone)) {
      return {
        success: false,
        error: 'Invalid phone number format',
      };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(
          `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
        ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: TWILIO_PHONE_NUMBER,
        Body: message,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Twilio SMS error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS',
      };
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.sid,
      status: data.status,
    };
  } catch (error: any) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check SMS delivery status
 */
export async function checkStatus(messageId: string): Promise<{
  status: string;
  error?: string;
}> {
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${messageId}.json`;

    const response = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(
          `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
        ).toString('base64'),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check SMS status');
    }

    const data = await response.json();

    return {
      status: data.status,
      error: data.error_message,
    };
  } catch (error: any) {
    console.error('SMS status check error:', error);
    return {
      status: 'unknown',
      error: error.message,
    };
  }
}

/**
 * Send bulk SMS (with rate limiting)
 */
export async function sendBulkSMS(
  recipients: Array<{ phone: string; message: string }>,
  delayMs: number = 1000
): Promise<Array<{ phone: string; result: SMSResult }>> {
  const results: Array<{ phone: string; result: SMSResult }> = [];

  for (const recipient of recipients) {
    const result = await sendSMS(recipient.phone, recipient.message);
    results.push({
      phone: recipient.phone,
      result,
    });

    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Estimate SMS cost (approximate)
 */
export function estimateCost(messageCount: number, pricePerSMS: number = 1.4): number {
  return messageCount * pricePerSMS;
}
