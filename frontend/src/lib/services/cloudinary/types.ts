export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
  bytes: number;
  thumbnail?: string;
}

export interface TransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'limit' | 'pad';
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
  gravity?: 'auto' | 'face' | 'center';
  effect?: string;
}
