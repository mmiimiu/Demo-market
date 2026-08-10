import { type TransformOptions } from './types';
import { CLOUDINARY_CLOUD_NAME } from './signature';

/**
 * Get transformed image URL
 */
export function getTransformedUrl(
  publicId: string,
  options: TransformOptions = {}
): string {
  const transformations: string[] = [];

  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  if (options.gravity) transformations.push(`g_${options.gravity}`);
  if (options.effect) transformations.push(`e_${options.effect}`);

  const transformStr = transformations.join(',');

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformStr}/${publicId}`;
}

/**
 * Get responsive srcset URLs
 */
export function getResponsiveSrcSet(
  publicId: string,
  widths: number[] = [320, 640, 960, 1280, 1920]
): string {
  return widths
    .map((width) => {
      const url = getTransformedUrl(publicId, {
        width,
        crop: 'scale',
        quality: 'auto',
        format: 'auto',
      });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Get blur placeholder (tiny image)
 */
export function getBlurPlaceholder(publicId: string): string {
  return getTransformedUrl(publicId, {
    width: 30,
    quality: 1,
    format: 'jpg',
    effect: 'blur:1000',
  });
}

/**
 * Optimize existing image (useful for bulk optimization)
 */
export function getOptimizedUrl(publicId: string): string {
  return getTransformedUrl(publicId, {
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Create 360° virtual tour embed URL
 */
export function get360TourUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/e_loop:infinite/${publicId}.gif`;
}
