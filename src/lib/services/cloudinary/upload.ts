import { type UploadResult } from './types';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from './signature';
import { getTransformedUrl } from './transform';

/**
 * Upload image to Cloudinary
 */
export async function uploadImage(
  file: File | Buffer | string,
  folder: string = 'properties',
  options?: {
    publicId?: string;
    tags?: string[];
    context?: Record<string, string>;
  }
): Promise<UploadResult> {
  try {
    const formData = new FormData();

    // Convert file to appropriate format
    if (file instanceof File) {
      formData.append('file', file);
    } else if (Buffer.isBuffer(file)) {
      const blob = new Blob([file]);
      formData.append('file', blob);
    } else {
      // Assume base64 or URL
      formData.append('file', file);
    }

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    if (options?.publicId) {
      formData.append('public_id', options.publicId);
    }

    if (options?.tags) {
      formData.append('tags', options.tags.join(','));
    }

    if (options?.context) {
      const contextStr = Object.entries(options.context)
        .map(([key, val]) => `${key}=${val}`)
        .join('|');
      formData.append('context', contextStr);
    }

    // Enable auto-optimization
    formData.append('quality', 'auto');
    formData.append('fetch_format', 'auto');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Generate thumbnail
    const thumbnail = getTransformedUrl(data.public_id, {
      width: 400,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    });

    return {
      publicId: data.public_id,
      url: data.url,
      secureUrl: data.secure_url,
      width: data.width,
      height: data.height,
      format: data.format,
      resourceType: data.resource_type,
      bytes: data.bytes,
      thumbnail,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string = 'properties',
  progressCallback?: (progress: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const result = await uploadImage(files[i], folder);
    results.push(result);

    if (progressCallback) {
      progressCallback(((i + 1) / total) * 100);
    }
  }

  return results;
}

/**
 * Upload video to Cloudinary
 */
export async function uploadVideo(
  file: File | Buffer | string,
  folder: string = 'properties/videos'
): Promise<UploadResult> {
  try {
    const formData = new FormData();

    if (file instanceof File) {
      formData.append('file', file);
    } else if (Buffer.isBuffer(file)) {
      const blob = new Blob([file]);
      formData.append('file', blob);
    } else {
      formData.append('file', file);
    }

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    formData.append('resource_type', 'video');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary video upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      publicId: data.public_id,
      url: data.url,
      secureUrl: data.secure_url,
      width: data.width,
      height: data.height,
      format: data.format,
      resourceType: data.resource_type,
      bytes: data.bytes,
    };
  } catch (error: any) {
    console.error('Cloudinary video upload error:', error);
    throw new Error(`Failed to upload video: ${error.message}`);
  }
}
