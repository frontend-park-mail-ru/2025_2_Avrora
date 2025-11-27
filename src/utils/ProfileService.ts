import { API } from "./API.js";
import { API_CONFIG } from "../config.js";
import { validEmail, validName, validPhone, validPassword, validateForm } from "./Validator.ts";


interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url: string;
  role: string;
}

interface OfferData {
  id: string;
  offer_type: string;
  property_type: string;
  rooms: number;
  price: number;
  address: string;
  images: string[];
  image_url: string;
  status: string;
  description: string;
  area: number;
}

interface EmailData {
  email: string;
  current_password?: string;
}

interface PasswordData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

interface APIResponse {
  ok: boolean;
  status: number;
  data?: any;
  error?: string;
}

interface JWTDecoded {
  user_id?: string;
  [key: string]: any;
}

interface BackendProfileData {
  ID?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Phone?: string;
  AvatarURL?: string;
  Role?: string;
}

interface BackendOfferData {
  ID?: string;
  OfferType?: string;
  PropertyType?: string;
  Rooms?: number;
  Price?: number;
  Address?: string;
  ImageURL?: string;
  Status?: string;
  Description?: string;
  Area?: number;
  Offers?: any[];
}

export class ProfileService {
  static decodeJWT(token: string): JWTDecoded | null {
    try {
      if (!token) return null;

      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  static getCurrentUserId(): string | null {
    try {
      const token = localStorage.getItem('authToken');

      if (token) {
        const decoded = this.decodeJWT(token);

        if (decoded) {
          const userId = decoded.user_id;

          if (userId) {
            return userId;
          }
        }
      }

      const userData = localStorage.getItem('userData');

      if (userData) {
        const user = JSON.parse(userData);
        if (user.id) {
          return user.id;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  static async getProfile(userId: string | null = null): Promise<ProfileData> {
    try {
      const targetUserId = userId || this.getCurrentUserId();
      if (!targetUserId) {
        throw new Error("Не удалось определить ID пользователя. Пожалуйста, войдите заново.");
      }

      const result: APIResponse = await API.get(`${API_CONFIG.ENDPOINTS.PROFILE.GET}${targetUserId}`);

      if (result.ok && result.data) {
        return this.mapProfileData(result.data);
      }

      throw new Error(result.error || "Ошибка загрузки профиля");
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(profileData: Partial<ProfileData>): Promise<{ message: string }> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error("Не удалось определить ID пользователя. Пожалуйста, войдите заново.");
      }

      const result: APIResponse = await API.put(`${API_CONFIG.ENDPOINTS.PROFILE.UPDATE}${userId}`, profileData);

      if (result.ok) {
        return { message: "Профиль успешно обновлен" };
      }

      throw new Error(result.error || "Ошибка обновления профиля");
    } catch (error) {
      throw error;
    }
  }

  static async updateEmail(emailData: EmailData): Promise<{ message: string }> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error("Не удалось определить ID пользователя. Пожалуйста, войдите заново.");
      }

      const result: APIResponse = await API.put(`${API_CONFIG.ENDPOINTS.PROFILE.EMAIL}${userId}`, emailData);

      if (result.ok) {
        return { message: "Email успешно обновлен" };
      }

      throw new Error(result.error || "Ошибка обновления email");
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(passwordData: PasswordData): Promise<{ message: string }> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error("Не удалось определить ID пользователя. Пожалуйста, войдите заново.");
      }

      const result: APIResponse = await API.put(`${API_CONFIG.ENDPOINTS.PROFILE.SECURITY}${userId}`, passwordData);

      if (result.ok) {
        return { message: "Пароль успешно изменен" };
      }

      throw new Error(result.error || "Ошибка смены пароля");
    } catch (error) {
      throw error;
    }
  }

  static async getMyOffers(): Promise<OfferData[]> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error("Не удалось определить ID пользователя. Пожалуйста, войдите заново.");
      }

      const result: APIResponse = await API.get(`${API_CONFIG.ENDPOINTS.PROFILE.MY_OFFERS}${userId}`);

      if (result.ok) {
        let offers: any[] = [];

        if (result.data && Array.isArray(result.data.Offers)) {
          offers = result.data.Offers;
        }

        return offers.map((offer: BackendOfferData) => this.mapOfferData(offer));
      }

      throw new Error(result.error || "Ошибка загрузки объявлений");
    } catch (error) {
      throw error;
    }
  }

  static async uploadAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const result: APIResponse = await API.post(API_CONFIG.ENDPOINTS.IMAGE.UPLOAD, formData);

      if (result.ok && result.data) {
        let filename = '';

        if (result.data.url) {
          filename = result.data.url.split('/').pop() || '';
        }

        if (filename) {
          return `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE.GET}${filename}`;
        }
      }

      throw new Error(result.error || "Ошибка загрузки аватара");
    } catch (error) {
      throw error;
    }
  }

  static validateProfile(profileData: Partial<ProfileData>): ValidationResult {
    const validation = validateForm({
      first_name: {
        value: profileData.first_name || '',
        type: 'name',
        required: true
      },
      last_name: {
        value: profileData.last_name || '',
        type: 'name',
        required: true
      },
      email: {
        value: profileData.email || '',
        type: 'email',
        required: true
      },
      phone: {
        value: profileData.phone || '',
        type: 'phone',
        required: true
      }
    });

    return validation;
  }

  static validatePassword(passwordData: PasswordData): ValidationResult {
    const validation = validateForm({
      old_password: {
        value: passwordData.old_password,
        type: 'password',
        required: true
      },
      new_password: {
        value: passwordData.new_password,
        type: 'password',
        required: true
      },
      confirm_password: {
        value: passwordData.confirm_password,
        type: 'custom',
        required: true,
        validator: (value: string) => {
          const errors: string[] = [];
          if (value !== passwordData.new_password) {
            errors.push("Пароли не совпадают");
          }
          return errors;
        }
      }
    });

    return validation;
  }

  static mapProfileData(backendData: BackendProfileData): ProfileData {
    return {
      id: backendData.ID || '',
      first_name: backendData.FirstName || '',
      last_name: backendData.LastName || '',
      email: backendData.Email || '',
      phone: backendData.Phone || '',
      photo_url: backendData.AvatarURL || '../../images/user.png',
      role: backendData.Role || 'user'
    };
  }

  static mapOfferData(backendData: BackendOfferData): OfferData {
    let images: string[] = [];
    if (backendData.ImageURL) {
      images = [backendData.ImageURL];
    }

    const formattedImages = images.map(img => {
      if (img.startsWith('http')) {
        return img;
      }
      return `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE.BY_FILENAME}/${img}`;
    });

    return {
      id: backendData.ID || '',
      offer_type: backendData.OfferType || 'rent',
      property_type: backendData.PropertyType || 'flat',
      rooms: backendData.Rooms || 1,
      price: backendData.Price || 0,
      address: backendData.Address || '',
      images: formattedImages,
      image_url: formattedImages[0] || '../../images/default_offer.jpg',
      status: backendData.Status || 'active',
      description: backendData.Description  || '',
      area: backendData.Area || 0
    };
  }
}