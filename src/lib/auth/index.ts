/**
 * Authentication library barrel
 * Exports all auth-related utilities
 */

export { hashPassword, verifyPassword } from './password';
export { generateAccessToken, generateRefreshToken, verifyToken } from './jwt';
export { registerUser, loginUser, refreshAccessToken } from './core';
export {
  createSession,
  validateSession,
  revokeSession,
  revokeAllSessions,
  getUserSessions,
} from './session';
export {
  setupTOTP,
  setupSMS,
  verify2FACode,
  generate2FACode,
  enable2FA,
  disable2FA,
} from './two-factor';
