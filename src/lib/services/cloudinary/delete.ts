import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, generateSignature } from './signature';

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature({
      public_id: publicId,
      timestamp,
    });

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary delete failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result === 'ok';
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

/**
 * Delete multiple images
 */
export async function deleteMultipleImages(publicIds: string[]): Promise<number> {
  let deletedCount = 0;

  for (const publicId of publicIds) {
    const success = await deleteImage(publicId);
    if (success) deletedCount++;
  }

  return deletedCount;
}
