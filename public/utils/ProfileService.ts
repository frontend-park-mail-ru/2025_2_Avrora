// ProfileService.ts - полный исправленный код

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

// Support Ticket Interfaces
interface SupportTicket {
  id: string;
  user_id?: string;
  signed_email: string;
  response_email: string;
  name: string;
  category: string;
  description: string;
  status: string;
  photo_urls: string[];
  created_at: string;
  updated_at: string;
}

interface CreateSupportTicketRequest {
  user_id?: string;
  signed_email: string;
  response_email: string;
  name: string;
  category: string;
  description: string;
  photo_urls?: string[];
}

interface SupportTicketsResponse {
  tickets: SupportTicket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
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
      console.error('Error decoding JWT:', error);
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

      console.error('No user ID found');
      return null;
    } catch (error) {
      console.error('Error getting user ID:', error);
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
      console.error('Error loading profile:', error);
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
      console.error('Error updating profile:', error);
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
      console.error('Error updating email:', error);
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
      console.error('Error changing password:', error);
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
      console.error('Error loading my offers:', error);
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
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  // Support Ticket Methods
  static async createSupportTicket(ticketData: CreateSupportTicketRequest): Promise<SupportTicket> {
    try {
      // Если пользователь авторизован, добавляем его ID
      const userId = this.getCurrentUserId();
      if (userId) {
        ticketData.user_id = userId;
      }

      const result: APIResponse = await API.post('/support-tickets', ticketData);

      if (result.ok && result.data) {
        return result.data;
      }

      throw new Error(result.error || "Ошибка создания обращения в поддержку");
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  }

  static async getMySupportTickets(page: number = 1, limit: number = 10): Promise<SupportTicketsResponse> {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error("Не удалось определить ID пользователя. Пожалуйста, войдите заново.");
      }

      const params = {
        page: page.toString(),
        limit: limit.toString()
      };

      const result: APIResponse = await API.get(`/support-tickets/my/${userId}`, params);

      if (result.ok && result.data) {
        return result.data;
      }

      // Если ошибка 500 (таблица еще не создана или другие проблемы), логируем и возвращаем пустой результат
      console.warn('Failed to load support tickets, server returned:', result.status, result.error);
      return {
        tickets: [],
        meta: {
          total: 0,
          page: page,
          limit: limit,
          pages: 0
        }
      };
    } catch (error) {
      console.error('Error loading support tickets:', error);
      // В случае ошибки возвращаем пустой результат
      return {
        tickets: [],
        meta: {
          total: 0,
          page: page,
          limit: limit,
          pages: 0
        }
      };
    }
  }

  static async getSupportTicket(ticketId: string): Promise<SupportTicket> {
    try {
      const result: APIResponse = await API.get(`/support-tickets/${ticketId}`);

      if (result.ok && result.data) {
        return result.data;
      }

      throw new Error(result.error || "Ошибка загрузки обращения");
    } catch (error) {
      console.error('Error loading support ticket:', error);
      throw error;
    }
  }

  static async deleteSupportTicket(ticketId: string): Promise<{ message: string }> {
    try {
      const result: APIResponse = await API.delete(`/support-tickets/delete/${ticketId}`);

      if (result.ok) {
        return { message: "Обращение успешно удалено" };
      }

      throw new Error(result.error || "Ошибка удаления обращения");
    } catch (error) {
      console.error('Error deleting support ticket:', error);
      throw error;
    }
  }

  static async getAllSupportTickets(page: number = 1, limit: number = 10): Promise<SupportTicketsResponse> {
    try {
      const params = {
        page: page.toString(),
        limit: limit.toString()
      };

      const result: APIResponse = await API.get(`/admin/support-tickets`, params);

      if (result.ok && result.data) {
        return result.data;
      }

      throw new Error(result.error || "Ошибка загрузки всех обращений");
    } catch (error) {
      console.error('Error loading all support tickets:', error);
      throw error;
    }
  }

  static async updateSupportTicketStatus(ticketId: string, status: string): Promise<{ message: string }> {
    try {
      const result: APIResponse = await API.put(`/admin/support-tickets/status/${ticketId}`, { status });

      if (result.ok) {
        return { message: "Статус обращения успешно обновлен" };
      }

      throw new Error(result.error || "Ошибка обновления статуса обращения");
    } catch (error) {
      console.error('Error updating support ticket status:', error);
      throw error;
    }
  }

  // Validation Methods
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

  static validateSupportTicket(ticketData: CreateSupportTicketRequest): ValidationResult {
    const validation = validateForm({
      signed_email: {
        value: ticketData.signed_email,
        type: 'email',
        required: true
      },
      response_email: {
        value: ticketData.response_email,
        type: 'email',
        required: true
      },
      name: {
        value: ticketData.name,
        type: 'name',
        required: true
      },
      category: {
        value: ticketData.category,
        type: 'custom',
        required: true,
        validator: (value: string) => {
          const errors: string[] = [];
          const validCategories = ['bug', 'general', 'billing', 'feature'];
          if (!validCategories.includes(value)) {
            errors.push("Неверная категория обращения");
          }
          return errors;
        }
      },
      description: {
        value: ticketData.description,
        type: 'custom',
        required: true,
        validator: (value: string) => {
          const errors: string[] = [];
          if (value.length < 1) {
            errors.push("Описание не может быть пустым");
          }
          if (value.length > 5000) {
            errors.push("Описание слишком длинное");
          }
          return errors;
        }
      }
    });

    return validation;
  }

  // Helper Methods
  static getCategoryDisplayName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      'bug': 'Ошибка',
      'general': 'Общий вопрос',
      'billing': 'Биллинг',
      'feature': 'Предложение функции'
    };
    return categoryNames[category] || category;
  }

  static getStatusDisplayName(status: string): string {
    const statusNames: { [key: string]: string } = {
      'open': 'Открыт',
      'in_progress': 'В работе',
      'closed': 'Закрыт',
      'resolved': 'Решен'
    };
    return statusNames[status] || status;
  }

  static getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'open': '#f39c12',
      'in_progress': '#3498db',
      'closed': '#95a5a6',
      'resolved': '#27ae60'
    };
    return statusColors[status] || '#95a5a6';
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