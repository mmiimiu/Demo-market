/**
 * JWT token generation and verification
 * Access tokens: 15 minutes
 * Refresh tokens: 30 days
 */

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '30d'; // 30 days

/**
 * Generate JWT access token
 * @param payload - Token payload (user_id, role, etc.)
 * @returns JWT token string
 */
export async function generateAccessToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Generate JWT refresh token
 * @param payload - Token payload (user_id, etc.)
 * @returns JWT token string
 */
export async function generateRefreshToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token
 * @param token - JWT token string
 * @returns Decoded payload
 * @throws Error if token is invalid
 */
export async function verifyToken(token: string): Promise<Record<string, unknown>> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as Record<string, unknown>;
}
