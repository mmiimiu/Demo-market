import crypto from 'crypto';

/**
 * OTP Manager - Generate and verify OTP codes
 */
export class OTPManager {
  /**
   * Generate a random 6-digit OTP
   */
  static generate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate OTP with expiry (store in cache/database)
   */
  static async generateWithExpiry(
    phoneNumber: string,
    expiryMinutes: number = 5
  ): Promise<{ otp: string; expiresAt: Date }> {
    const otp = this.generate();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // TODO: Store in Redis or Firestore with expiry
    // For now, return the values
    return { otp, expiresAt };
  }

  /**
   * Verify OTP (check against stored value)
   */
  static async verify(
    phoneNumber: string,
    otpCode: string
  ): Promise<{ valid: boolean; error?: string }> {
    // TODO: Implement verification against stored OTP
    // Check expiry, attempt count, etc.
    
    return { valid: true };
  }

  /**
   * Hash OTP for secure storage
   */
  static hash(otp: string, salt: string): string {
    return crypto
      .createHmac('sha256', salt)
      .update(otp)
      .digest('hex');
  }
}
