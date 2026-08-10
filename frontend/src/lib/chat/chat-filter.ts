/**
 * Chat Filter System (Data Loss Prevention)
 * Detects and masks phone numbers, emails, and Line IDs in chat messages
 * to prevent off-platform transactions.
 */

// Matches Thai phone numbers (e.g. 0812345678, 081-234-5678, 081 234 5678, +66812345678)
const PHONE_REGEX = /(\+66|0)\s*?[689]\s*?\d\s*?(-|\s)?\s*?\d{3}\s*?(-|\s)?\s*?\d{4}/g;

// Matches email addresses
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Matches common Line ID patterns (e.g., line id: myline123, line: @myline)
const LINE_ID_REGEX = /(line(?:\s*id)?\s*[:=]?\s*@?[a-zA-Z0-9.-]+)/gi;

const WARNING_MESSAGE = "[ข้อมูลถูกซ่อนเพื่อความปลอดภัย]";

/**
 * Masks sensitive contact information in a given text message.
 * @param text The original chat message
 * @returns The masked message and a boolean indicating if masking occurred
 */
export function maskMessage(text: string): { maskedText: string; hasSensitiveInfo: boolean } {
  if (!text) return { maskedText: text, hasSensitiveInfo: false };

  let hasSensitiveInfo = false;
  let maskedText = text;

  if (PHONE_REGEX.test(maskedText)) {
    hasSensitiveInfo = true;
    maskedText = maskedText.replace(PHONE_REGEX, WARNING_MESSAGE);
  }

  if (EMAIL_REGEX.test(maskedText)) {
    hasSensitiveInfo = true;
    maskedText = maskedText.replace(EMAIL_REGEX, WARNING_MESSAGE);
  }

  if (LINE_ID_REGEX.test(maskedText)) {
    hasSensitiveInfo = true;
    maskedText = maskedText.replace(LINE_ID_REGEX, `[Line ID ซ่อน]`);
  }

  return { maskedText, hasSensitiveInfo };
}
