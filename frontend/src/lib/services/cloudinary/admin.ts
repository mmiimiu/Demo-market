import { 
  CLOUDINARY_CLOUD_NAME, 
  CLOUDINARY_API_KEY, 
  CLOUDINARY_API_SECRET, 
  CLOUDINARY_UPLOAD_PRESET, 
  generateSignature 
} from './signature';

/**
 * Generate signed upload URL (for direct browser uploads)
 */
export function generateSignedUploadUrl(folder: string = 'properties'): {
  url: string;
  params: Record<string, string>;
} {
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string> = {
    timestamp: timestamp.toString(),
    folder,
    upload_preset: CLOUDINARY_UPLOAD_PRESET,
  };

  const signature = generateSignature(params);

  return {
    url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    params: {
      ...params,
      api_key: CLOUDINARY_API_KEY,
      signature,
    },
  };
}

/**
 * Get folder contents
 */
export async function getFolderContents(folder: string): Promise<any[]> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature({
      folder,
      timestamp,
    });

    const url = new URL(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image`
    );
    url.searchParams.set('type', 'upload');
    url.searchParams.set('prefix', folder);
    url.searchParams.set('max_results', '500');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`
        ).toString('base64')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Cloudinary list failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.resources || [];
  } catch (error: any) {
    console.error('Cloudinary folder list error:', error);
    return [];
  }
}
