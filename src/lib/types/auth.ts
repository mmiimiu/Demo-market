/**
 * Authentication-related types — sessions, tokens, providers, 2FA
 */

// ─── Auth Provider ─────────────────────────────────────────────────────────────

export type AuthProvider = 'email' | 'line' | 'google' | 'phone';

// ─── Session ────────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  user_id: string;
  device_info: string;
  ip_address: string;
  expires_at: Date;
  created_at: Date;
  last_active: Date;
}

// ─── Refresh Token ───────────────────────────────────────────────────────────────

export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked: boolean;
  created_at: Date;
}

// ─── 2FA ───────────────────────────────────────────────────────────────────────

export type TwoFactorMethod = 'totp' | 'sms';

export interface TwoFactorSetup {
  method: TwoFactorMethod;
  secret?: string; // For TOTP
  phone?: string; // For SMS
  verified: boolean;
  enabled: boolean;
}

export interface TwoFactorVerification {
  user_id: string;
  code: string;
  method: TwoFactorMethod;
  expires_at: Date;
}

// ─── Auth Request/Response ───────────────────────────────────────────────────────

export interface LoginRequest {
  provider: AuthProvider;
  email?: string;
  password?: string;
  phone?: string;
  line_id?: string;
  google_id?: string;
  thai_id?: string;
}

export interface RegisterRequest {
  provider: AuthProvider;
  email?: string;
  password?: string;
  phone?: string;
  full_name: string;
  line_id?: string;
  google_id?: string;
  thai_id?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
  user: import('./user').UserProfile;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// ─── Auth Errors ────────────────────────────────────────────────────────────────

export type AuthErrorType = 
  | 'invalid_credentials'
  | 'user_not_found'
  | 'email_already_exists'
  | 'phone_already_exists'
  | 'account_locked'
  | 'token_expired'
  | 'token_invalid'
  | '2fa_required'
  | '2fa_invalid';

export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: Record<string, unknown>;
}
