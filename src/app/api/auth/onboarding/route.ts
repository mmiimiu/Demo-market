import { NextRequest } from 'next/server';
import { 
  apiHandler, 
  ApiResponseBuilder, 
  getRequestBody,
  ApiError 
} from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth';
import { adminAuthHelpers, adminFirestoreHelpers } from '@/lib/firebase-admin';
import { type UserRole } from '@/lib/types';

interface OnboardingRequestBody {
  role: UserRole;
  profileData?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phone?: string;
  };
}

/**
 * POST /api/auth/onboarding
 * Sets custom user claims for role and updates Firestore onboarding status
 */
export const POST = apiHandler(async (req: NextRequest) => {
  const authContext = await requireAuth(req);
  const body = await getRequestBody<OnboardingRequestBody>(req);
  const { role, profileData } = body;

  const validRoles: UserRole[] = ['renter', 'landlord', 'agent'];
  if (!role || !validRoles.includes(role)) {
    throw new ApiError(400, 'INVALID_ROLE', `Role must be one of: ${validRoles.join(', ')}`);
  }

  try {
    const uid = authContext.uid;

    // 1. Set Custom Claims in Firebase Auth
    await adminAuthHelpers.setCustomClaims(uid, {
      role,
      onboardingCompleted: true
    });

    // 2. Update Firestore User Document
    const updateData: any = {
      role,
      onboardingCompleted: true,
      updatedAt: new Date(),
    };

    if (profileData) {
      if (profileData.displayName) {
        updateData.displayName = profileData.displayName;
      }
      if (profileData.phone) {
        updateData.phone = profileData.phone;
        updateData.phoneNumber = profileData.phone; // compat
      }
    }

    await adminFirestoreHelpers.setUser(uid, updateData);

    return ApiResponseBuilder.success({
      message: 'Onboarding completed successfully',
      uid,
      role,
      onboardingCompleted: true
    });
  } catch (error: any) {
    console.error('Error during onboarding API:', error);
    throw new ApiError(500, 'ONBOARDING_ERROR', 'Failed to complete onboarding', error.message);
  }
});
