import { getAdminAuth } from './config';

/**
 * Admin Auth Helpers
 */
export const adminAuthHelpers = {
  /**
   * Create user with email and password
   */
  async createUser(email: string, password: string, displayName?: string) {
    const auth = getAdminAuth();
    return auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });
  },

  /**
   * Update user
   */
  async updateUser(uid: string, data: {
    email?: string;
    password?: string;
    displayName?: string;
    phoneNumber?: string;
    emailVerified?: boolean;
    disabled?: boolean;
  }) {
    const auth = getAdminAuth();
    return auth.updateUser(uid, data);
  },

  /**
   * Delete user
   */
  async deleteUser(uid: string) {
    const auth = getAdminAuth();
    await auth.deleteUser(uid);
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const auth = getAdminAuth();
    return auth.getUserByEmail(email);
  },

  /**
   * Get user by phone
   */
  async getUserByPhone(phoneNumber: string) {
    const auth = getAdminAuth();
    return auth.getUserByPhoneNumber(phoneNumber);
  },

  /**
   * Verify ID token
   */
  async verifyIdToken(token: string, checkRevoked = true) {
    const auth = getAdminAuth();
    return auth.verifyIdToken(token, checkRevoked);
  },

  /**
   * Create custom token
   */
  async createCustomToken(uid: string, claims?: object) {
    const auth = getAdminAuth();
    return auth.createCustomToken(uid, claims);
  },

  /**
   * Set custom user claims (for roles)
   */
  async setCustomClaims(uid: string, claims: object) {
    const auth = getAdminAuth();
    await auth.setCustomUserClaims(uid, claims);
  },

  /**
   * Generate email verification link
   */
  async generateEmailVerificationLink(email: string) {
    const auth = getAdminAuth();
    return auth.generateEmailVerificationLink(email);
  },

  /**
   * Generate password reset link
   */
  async generatePasswordResetLink(email: string) {
    const auth = getAdminAuth();
    return auth.generatePasswordResetLink(email);
  },

  /**
   * List all users (paginated)
   */
  async listUsers(maxResults = 1000, pageToken?: string) {
    const auth = getAdminAuth();
    return auth.listUsers(maxResults, pageToken);
  },

  /**
   * Disable/Enable user
   */
  async setUserDisabled(uid: string, disabled: boolean) {
    const auth = getAdminAuth();
    await auth.updateUser(uid, { disabled });
  },

  /**
   * Revoke refresh tokens (force logout)
   */
  async revokeRefreshTokens(uid: string) {
    const auth = getAdminAuth();
    await auth.revokeRefreshTokens(uid);
  },
};
