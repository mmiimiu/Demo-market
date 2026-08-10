/**
 * Current User API
 * GET /api/auth/me - Get current user profile
 * PUT /api/auth/me - Update current user profile
 */

import { NextRequest } from 'next/server';
import { 
  apiHandler, 
  ApiResponseBuilder, 
  getRequestBody,
  ApiError 
} from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth';
import { userHelpers, type User } from '@/lib/db/firestore';

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export const GET = apiHandler(async (req: NextRequest) => {
  const authContext = await requireAuth(req);

  try {
    const user = await userHelpers.getUserById(authContext.uid);

    if (!user) {
      return ApiResponseBuilder.notFound('User');
    }

    // Remove sensitive data
    const sanitizedUser = {
      ...user,
      sessions: undefined, // Don't expose sessions
    };

    return ApiResponseBuilder.success(sanitizedUser);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    throw new ApiError(500, 'FETCH_ERROR', 'Failed to fetch user profile', error.message);
  }
});

/**
 * PUT /api/auth/me
 * Update current user profile
 */
export const PUT = apiHandler(async (req: NextRequest) => {
  const authContext = await requireAuth(req);
  const body = await getRequestBody<Partial<User>>(req);

  try {
    // Protected fields that cannot be updated
    const protectedFields = [
      'id',
      'email',
      'phone',
      'lineUserId',
      'googleId',
      'role',
      'verified',
      'agentProfile.approvalStatus',
      'createdAt',
      'sessions',
    ];

    // Remove protected fields
    const updateData: any = { ...body };
    protectedFields.forEach(field => {
      const parts = field.split('.');
      if (parts.length === 1) {
        delete updateData[parts[0]];
      } else if (parts.length === 2 && updateData[parts[0]]) {
        delete updateData[parts[0]][parts[1]];
      }
    });

    // Update user profile
    await userHelpers.updateUserProfile(authContext.uid, updateData);

    // Fetch updated user
    const updatedUser = await userHelpers.getUserById(authContext.uid);

    return ApiResponseBuilder.success(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    throw new ApiError(500, 'UPDATE_ERROR', 'Failed to update user profile', error.message);
  }
});
