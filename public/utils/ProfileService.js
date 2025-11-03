// ProfileService.js
import { API } from "./API.js";
import { API_CONFIG } from "../config.js";

export class ProfileService {
  static decodeJWT(token) {
    try {
      if (!token) return null;

      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  static getCurrentUserId() {
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

  static async getProfile() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error("Не удалось определить ID пользователя. Пожалуйста, войдите заново.");
      }

      const result = await API.get(`${API_CONFIG.ENDPOINTS.PROFILE.GET}${userId}`);

      if (result.ok && result.data) {
        return this.mapProfileData(result.data);
      }

      throw new Error(result.error || "Ошибка загрузки профиля");
    } catch (error) {
      console.error('Error loading profile:', error);
      throw error;
    }
  }

  static async updateProfile(profileData) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error("Не удалось определить ID пользователя. Пожалуйста, войдите заново.");
      }

      const result = await API.put(`${API_CONFIG.ENDPOINTS.PROFILE.UPDATE}${userId}`, profileData);

      if (result.ok) {
        return { message: "Профиль успешно обновлен" };
      }

      throw new Error(result.error || "Ошибка обновления профиля");
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  static async changePassword(passwordData) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error("Не удалось определить ID пользователя. Пожалуйста, войдите заново.");
      }

      const result = await API.put(`${API_CONFIG.ENDPOINTS.PROFILE.SECURITY}${userId}`, passwordData);

      if (result.ok) {
        return { message: "Пароль успешно изменен" };
      }

      throw new Error(result.error || "Ошибка смены пароля");
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

    static async getMyOffers() {
      try {
        const userId = this.getCurrentUserId();
        if (!userId) {
          throw new Error("Не удалось определить ID пользователя. Пожалуйста, войдите заново.");
        }

        const result = await API.get(`${API_CONFIG.ENDPOINTS.PROFILE.MY_OFFERS}${userId}`);

        if (result.ok) {
          // Обрабатываем разные форматы ответа
          let offers = [];

          if (Array.isArray(result.data)) {
            offers = result.data;
          } else if (result.data && Array.isArray(result.data.offers)) {
            offers = result.data.offers;
          } else if (result.data && Array.isArray(result.data.Offers)) {
            offers = result.data.Offers;
          }

          return offers.map(offer => this.mapOfferData(offer));
        }

        throw new Error(result.error || "Ошибка загрузки объявлений");
      } catch (error) {
        console.error('Error loading my offers:', error);
        throw error;
      }
    }

    static async uploadAvatar(file) {
      try {
        const formData = new FormData();
        formData.append('image', file); // Изменено с 'file' на 'image' чтобы соответствовать бэкенду

        // Убедитесь, что передаем formData напрямую
        const result = await API.post(API_CONFIG.ENDPOINTS.IMAGE.UPLOAD, formData);

        if (result.ok && result.data) {
          // Обрабатываем разные форматы ответа
          return result.data.url || result.data.file_url ||
                 (result.data.filename ? `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE.GET}${result.data.filename}` : null);
        }

        throw new Error(result.error || "Ошибка загрузки аватара");
      } catch (error) {
        console.error('Error uploading avatar:', error);
        throw error;
      }
    }

  static validateProfile(profileData) {
    const errors = [];

    if (!profileData.first_name?.trim()) {
      errors.push('Имя обязательно');
    }

    if (!profileData.last_name?.trim()) {
      errors.push('Фамилия обязательна');
    }

    if (!profileData.email?.trim()) {
      errors.push('Email обязателен');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        errors.push('Некорректный формат email');
      }
    }

    if (!profileData.phone?.trim()) {
      errors.push('Телефон обязателен');
    } else {
      const phoneDigits = profileData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        errors.push('Некорректный формат телефона');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePassword(passwordData) {
    const errors = [];

    if (!passwordData.old_password) {
      errors.push('Текущий пароль обязателен');
    }

    if (!passwordData.new_password) {
      errors.push('Новый пароль обязателен');
    } else if (passwordData.new_password.length < 6) {
      errors.push('Новый пароль должен содержать минимум 6 символов');
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.push('Пароли не совпадают');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static mapProfileData(backendData) {
    return {
      id: backendData.ID || backendData.id || '',
      first_name: backendData.FirstName || backendData.first_name || '',
      last_name: backendData.LastName || backendData.last_name || '',
      email: backendData.Email || backendData.email || '',
      phone: backendData.Phone || backendData.phone || '',
      photo_url: backendData.AvatarURL || backendData.avatar_url || backendData.photo_url || '../../images/user.png',
      role: backendData.Role || backendData.role || 'user'
    };
  }

  static mapOfferData(backendData) {
    return {
      id: backendData.ID || backendData.id || '',
      offer_type: backendData.OfferType || backendData.offer_type || 'rent',
      property_type: backendData.PropertyType || backendData.property_type || 'flat',
      rooms: backendData.Rooms || backendData.rooms || 1,
      price: backendData.Price || backendData.price || 0,
      address: backendData.Address || backendData.address || '',
      image_url: backendData.ImageURL || backendData.image_url || backendData.main_image || `${API_CONFIG.BASE_URL}/image/default_offer.jpg`
    };
  }
}