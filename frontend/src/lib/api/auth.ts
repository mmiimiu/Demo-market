/**
 * Authentication middleware and utilities for API routes
 */

import { adminAuthHelpers } from '@/lib/firebase-admin';
import { ApiError } from './response';
import { userHelpers, type UserRole } from '../db/firestore';

export interface AuthContext {
  uid: string;
  email?: string;
  role: UserRole;
  user: any; // Full user document
}

/**
 * Get the authenticated user from the request
 * Expects Authorization: Bearer <token> header
 */
export async function getAuthContext(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  try {
    // Verify the Firebase ID token
    const decodedToken = await adminAuthHelpers.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get the user document from Firestore
    const user = await userHelpers.getUserById(uid);
    
    if (!user) {
      throw new ApiError(401, 'USER_NOT_FOUND', 'User not found');
    }

    return {
      uid,
      email: decodedToken.email,
      role: user.role,
      user,
    };
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }
}

/**
 * Require authentication
 * Throws if user is not authenticated
 */
export async function requireAuth(req: Request): Promise<AuthContext> {
  return getAuthContext(req);
}

/**
 * Require specific role(s)
 * Throws if user doesn't have one of the required roles
 */
export async function requireRole(
  req: Request,
  roles: UserRole | UserRole[]
): Promise<AuthContext> {
  const authContext = await getAuthContext(req);
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(authContext.role)) {
    throw new ApiError(
      403,
      'INSUFFICIENT_PERMISSIONS',
      `Required role: ${allowedRoles.join(' or ')}`
    );
  }

  return authContext;
}

/**
 * Check if user is authenticated (optional)
 * Returns null if not authenticated
 */
export async function getOptionalAuth(req: Request): Promise<AuthContext | null> {
  try {
    return await getAuthContext(req);
  } catch (error) {
    return null;
  }
}

/**
 * Check if user owns a resource
 */
export function checkOwnership(authContext: AuthContext, resourceOwnerId: string): void {
  if (authContext.uid !== resourceOwnerId && !isAdmin(authContext)) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to access this resource');
  }
}

/**
 * Check if user is admin or superadmin
 */
export function isAdmin(authContext: AuthContext): boolean {
  return authContext.role === 'admin' || authContext.role === 'superadmin';
}

/**
 * Check if user is agent
 */
export function isAgent(authContext: AuthContext): boolean {
  return authContext.role === 'agent';
}

/**
 * Check if user is owner
 */
export function isOwner(authContext: AuthContext): boolean {
  return authContext.role === 'owner';
}

/**
 * Require admin role
 */
export async function requireAdmin(req: Request): Promise<AuthContext> {
  return requireRole(req, ['admin', 'superadmin']);
}

/**
 * Require agent role
 */
export async function requireAgent(req: Request): Promise<AuthContext> {
  return requireRole(req, 'agent');
}

/**
 * Require owner or agent role
 */
export async function requireOwnerOrAgent(req: Request): Promise<AuthContext> {
  return requireRole(req, ['owner', 'agent']);
}
