import { uploadImage, uploadMultipleImages, uploadVideo } from './upload';
import { getTransformedUrl, getResponsiveSrcSet, getBlurPlaceholder, getOptimizedUrl, get360TourUrl } from './transform';
import { deleteImage, deleteMultipleImages } from './delete';
import { generateSignedUploadUrl, getFolderContents } from './admin';

export * from './types';

export class CloudinaryService {
  static uploadImage = uploadImage;
  static uploadMultipleImages = uploadMultipleImages;
  static uploadVideo = uploadVideo;
  static getTransformedUrl = getTransformedUrl;
  static getResponsiveSrcSet = getResponsiveSrcSet;
  static getBlurPlaceholder = getBlurPlaceholder;
  static deleteImage = deleteImage;
  static deleteMultipleImages = deleteMultipleImages;
  static generateSignedUploadUrl = generateSignedUploadUrl;
  static getFolderContents = getFolderContents;
  static getOptimizedUrl = getOptimizedUrl;
  static get360TourUrl = get360TourUrl;
}
