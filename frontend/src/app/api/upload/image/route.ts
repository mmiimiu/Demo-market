/**
 * Image Upload API
 * POST /api/upload/image - Upload image to Cloudinary
 */

import { NextRequest } from 'next/server';
import { apiHandler, ApiResponseBuilder, ApiError } from '@/lib/api/response';
import { requireAuth } from '@/lib/api/auth';
import { CloudinaryService } from '@/lib/services/cloudinary';

/**
 * POST /api/upload/image
 * Upload image to Cloudinary
 */
export const POST = apiHandler(async (req: NextRequest) => {
  const authContext = await requireAuth(req);

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'properties';
    const tags = formData.get('tags') ? (formData.get('tags') as string).split(',') : undefined;

    if (!file) {
      throw new ApiError(400, 'MISSING_FILE', 'File is required');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new ApiError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG, and WebP images are allowed');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new ApiError(400, 'FILE_TOO_LARGE', 'File size must be less than 10MB');
    }

    // Upload to Cloudinary
    const result = await CloudinaryService.uploadImage(file, folder, {
      tags: tags || [authContext.uid],
      context: {
        userId: authContext.uid,
        uploadedAt: new Date().toISOString(),
      },
    });

    return ApiResponseBuilder.success(result);
  } catch (error: any) {
    console.error('Image upload error:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, 'UPLOAD_ERROR', 'Failed to upload image', error.message);
  }
});
