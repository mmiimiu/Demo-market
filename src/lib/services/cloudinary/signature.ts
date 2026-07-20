import crypto from 'crypto';

export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
export const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'primerent_properties';

/**
 * Generate signature for Cloudinary API requests
 */
export function generateSignature(params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  const stringToSign = `${sortedParams}${CLOUDINARY_API_SECRET}`;

  return crypto.createHash('sha256').update(stringToSign).digest('hex');
}
