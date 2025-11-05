import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";

interface UploadImageResult {
    filename: string;
    url: string;
}

export class MediaService {
    static async uploadImage(file: File): Promise<UploadImageResult> {
        const formData = new FormData();
        formData.append('image', file);
        const result = await API.post(API_CONFIG.ENDPOINTS.MEDIA.UPLOAD, formData);
        if (result.ok && result.data) {
            let filename = '';
            if (typeof result.data === 'string') {
                filename = result.data;
            } else if (result.data.filename) {
                filename = result.data.filename;
            } else if (result.data.url) {
                filename = result.data.url.split('/').pop() || '';
            }
            if (filename) {
                return { filename, url: this.getImageUrl(filename) };
            }
        }
        throw new Error(result.error || "Ошибка загрузки изображения");
    }

    static getImageUrl(filename: string): string {
        if (!filename) {
            return `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.MEDIA.BY_FILENAME}/default_offer.jpg`;
        }
        if (filename.startsWith('http')) return filename;
        return `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.MEDIA.BY_FILENAME}/${filename}`;
    }

    static validateImage(file: File): boolean {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 10 * 1024 * 1024;
        if (!validTypes.includes(file.type)) {
            throw new Error('Недопустимый формат изображения');
        }
        if (file.size > maxSize) {
            throw new Error('Размер изображения превышает 10 МБ');
        }
        return true;
    }
}