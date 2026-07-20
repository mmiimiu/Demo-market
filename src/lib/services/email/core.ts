import { type EmailOptions, type EmailResult } from './types';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@PrimeRent.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'PrimeRent';

/**
 * Send email via SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const recipients = Array.isArray(options.to) 
      ? options.to.map(email => ({ email }))
      : [{ email: options.to }];

    const payload: any = {
      personalizations: [
        {
          to: recipients,
          ...(options.dynamicTemplateData && {
            dynamic_template_data: options.dynamicTemplateData,
          }),
        },
      ],
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: options.subject,
    };

    // Use template or content
    if (options.templateId) {
      payload.template_id = options.templateId;
    } else {
      payload.content = [];
      
      if (options.text) {
        payload.content.push({
          type: 'text/plain',
          value: options.text,
        });
      }
      
      if (options.html) {
        payload.content.push({
          type: 'text/html',
          value: options.html,
        });
      }
    }

    // Add attachments
    if (options.attachments) {
      payload.attachments = options.attachments;
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('SendGrid error:', error);
      return {
        success: false,
        error: error.errors?.[0]?.message || 'Failed to send email',
      };
    }

    const messageId = response.headers.get('x-message-id');

    return {
      success: true,
      messageId: messageId || undefined,
    };
  } catch (error: any) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send bulk emails (with rate limiting)
 */
export async function sendBulkEmails(
  emails: EmailOptions[],
  delayMs: number = 100
): Promise<EmailResult[]> {
  const results: EmailResult[] = [];

  for (const email of emails) {
    const result = await sendEmail(email);
    results.push(result);

    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
