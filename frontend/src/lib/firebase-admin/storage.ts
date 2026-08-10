import { getAdminStorage } from './config';

/**
 * Admin Storage Helpers
 */
export const adminStorageHelpers = {
  /**
   * Upload file to Cloud Storage
   */
  async uploadFile(
    filePath: string,
    destination: string,
    metadata?: any
  ) {
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    
    await bucket.upload(filePath, {
      destination,
      metadata,
    });

    const file = bucket.file(destination);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Far future
    });

    return url;
  },

  /**
   * Delete file from Cloud Storage
   */
  async deleteFile(path: string) {
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    await bucket.file(path).delete();
  },

  /**
   * Get signed URL for file
   */
  async getSignedUrl(path: string, expiresInMinutes = 60) {
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const file = bucket.file(path);

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });

    return url;
  },

  /**
   * List files in directory
   */
  async listFiles(prefix: string) {
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix });
    return files.map(file => file.name);
  },
};
