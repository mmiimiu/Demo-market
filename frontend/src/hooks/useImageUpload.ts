/**
 * Image Upload Hook - Handle multiple image uploads with progress
 */

import { useState } from 'react';
import { api } from '@/lib/api-client';

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export function useImageUpload() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = async (
    files: File[],
    folder?: string,
    tags?: string[]
  ): Promise<string[]> => {
    setIsUploading(true);

    // Initialize progress for all files
    const initialProgress: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending',
    }));
    setUploads(initialProgress);

    const uploadedUrls: string[] = [];

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Update status to uploading
        setUploads(prev => 
          prev.map((upload, idx) => 
            idx === i ? { ...upload, status: 'uploading', progress: 0 } : upload
          )
        );

        try {
          // Simulate progress (since fetch doesn't support upload progress easily)
          const progressInterval = setInterval(() => {
            setUploads(prev =>
              prev.map((upload, idx) =>
                idx === i && upload.progress < 90
                  ? { ...upload, progress: upload.progress + 10 }
                  : upload
              )
            );
          }, 200);

          // Upload image
          const result = await api.upload.image(file, folder, tags);

          clearInterval(progressInterval);

          // Update success status
          setUploads(prev =>
            prev.map((upload, idx) =>
              idx === i
                ? {
                    ...upload,
                    status: 'success',
                    progress: 100,
                    url: result.secureUrl,
                  }
                : upload
            )
          );

          uploadedUrls.push(result.secureUrl);
        } catch (error: any) {
          // Update error status
          setUploads(prev =>
            prev.map((upload, idx) =>
              idx === i
                ? {
                    ...upload,
                    status: 'error',
                    error: error.message,
                  }
                : upload
            )
          );

          console.error(`Error uploading ${file.name}:`, error);
        }
      }

      return uploadedUrls;
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setUploads([]);
  };

  return {
    uploads,
    isUploading,
    uploadImages,
    reset,
  };
}
