/**
 * Format phone number to E.164 format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, replace with +66 (Thailand country code)
  if (cleaned.startsWith('0')) {
    cleaned = '+66' + cleaned.substring(1);
  }
  // If doesn't start with +, assume Thailand and add +66
  else if (!cleaned.startsWith('+')) {
    cleaned = '+66' + cleaned;
  }
  // If starts with 66 but not +66
  else if (cleaned.startsWith('66') && !cleaned.startsWith('+66')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Basic E.164 format validation
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}
