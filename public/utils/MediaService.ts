import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";


interface UploadResult {
  filename: string;
  url: string;
}

interface APIResponse {
  ok: boolean;
  status: number;
  data?: any;
  error?: string;
}

export class MediaService {
  static async uploadImage(file: File): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const result: APIResponse = await API.post(API_CONFIG.ENDPOINTS.MEDIA.UPLOAD, formData);

      if (result.ok && result.data) {

        let filename = '';

        if (result.data.url) {
          const urlParts = result.data.url.split('/');
          filename = urlParts[urlParts.length - 1];
        }

        if (filename) {
          return {
            filename: filename,
            url: this.getImageUrl(filename)
          };
        }
      }

      throw new Error(result.error || "Ошибка загрузки изображения");
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  static getImageUrl(filename: string | null): string {
    if (!filename) {
      return '../../images/default_offer.jpg';
    }

    if (filename.startsWith('http')) {
      return filename;
    }

    return `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.MEDIA.BY_FILENAME}/${filename}`;
  }

  static async uploadMultipleImages(files: File[]): Promise<UploadResult[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      return results.filter(result => result !== null);
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error;
    }
  }

  static validateImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      throw new Error('Недопустимый формат изображения. Разрешены: JPEG, PNG, GIF, WebP');
    }

    if (file.size > maxSize) {
      throw new Error('Размер изображения не должен превышать 10MB');
    }

    return true;
  }
}