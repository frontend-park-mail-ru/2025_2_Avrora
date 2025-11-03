import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";

export class MediaService {
    static async uploadImage(file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        // Передаем formData напрямую, а не оборачиваем в объект
        const result = await API.post(API_CONFIG.ENDPOINTS.MEDIA.UPLOAD, formData);

        if (result.ok && result.data) {
          return result.data;
        }

        throw new Error(result.error || "Ошибка загрузки изображения");
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }

  static getImageUrl(filename) {
    if (!filename) {
      return `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.MEDIA.BY_FILENAME}/default_offer.jpg`;
    }

    if (filename.startsWith('http')) {
      return filename;
    }

    return `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.MEDIA.BY_FILENAME}/${filename}`;
  }

  static async uploadMultipleImages(files) {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error;
    }
  }

  static validateImage(file) {
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