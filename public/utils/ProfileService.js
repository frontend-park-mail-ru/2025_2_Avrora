// [file name]: ProfileService.js
import { API } from "./API.js";
import { API_CONFIG } from "../config.js";
import { validEmail, validName, validPhone, validPassword, validateForm } from "./auth.js";

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

  static async getProfile(userId = null) {
    try {
      const targetUserId = userId || this.getCurrentUserId();
      if (!targetUserId) {
        throw new Error("Не удалось определить ID пользователя. Пожалуйста, войдите заново.");
      }

      const result = await API.get(`${API_CONFIG.ENDPOINTS.PROFILE.GET}${targetUserId}`);

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

  static async updateEmail(emailData) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error("Не удалось определить ID пользователя. Пожалуйста, войдите заново.");
      }

      const result = await API.put(`${API_CONFIG.ENDPOINTS.PROFILE.EMAIL}${userId}`, emailData);

      if (result.ok) {
        return { message: "Email успешно обновлен" };
      }

      throw new Error(result.error || "Ошибка обновления email");
    } catch (error) {
      console.error('Error updating email:', error);
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
        let offers = [];

        if (Array.isArray(result.data)) {
          offers = result.data;
        } else if (result.data && Array.isArray(result.data.offers)) {
          offers = result.data.offers;
        } else if (result.data && Array.isArray(result.data.Offers)) {
          offers = result.data.Offers;
        } else if (result.data && result.data.offers && Array.isArray(result.data.offers)) {
          offers = result.data.offers;
        }

        console.log('Loaded my offers:', offers);
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
      formData.append('image', file);

      const result = await API.post(API_CONFIG.ENDPOINTS.IMAGE.UPLOAD, formData);

      if (result.ok && result.data) {
        let filename = '';

        if (typeof result.data === 'string') {
          filename = result.data;
        } else if (result.data.filename) {
          filename = result.data.filename;
        } else if (result.data.url) {
          filename = result.data.url.split('/').pop();
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

  static validateProfile(profileData) {
    const validation = validateForm({
      first_name: {
        value: profileData.first_name,
        type: 'name',
        required: true
      },
      last_name: {
        value: profileData.last_name,
        type: 'name',
        required: true
      },
      email: {
        value: profileData.email,
        type: 'email',
        required: true
      },
      phone: {
        value: profileData.phone,
        type: 'phone',
        required: true
      }
    });

    return validation;
  }

  static validatePassword(passwordData) {
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
        validator: (value) => {
          const errors = [];
          if (value !== passwordData.new_password) {
            errors.push("Пароли не совпадают");
          }
          return errors;
        }
      }
    });

    return validation;
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
    let images = [];
    if (backendData.images && Array.isArray(backendData.images)) {
      images = backendData.images;
    } else if (backendData.image_url) {
      images = [backendData.image_url];
    } else if (backendData.ImageURL) {
      images = [backendData.ImageURL];
    }

    const formattedImages = images.map(img => {
      if (img.startsWith('http')) {
        return img;
      }
      return `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE.BY_FILENAME}/${img}`;
    });

    return {
      id: backendData.ID || backendData.id || '',
      offer_type: backendData.OfferType || backendData.offer_type || 'rent',
      property_type: backendData.PropertyType || backendData.property_type || 'flat',
      rooms: backendData.Rooms || backendData.rooms || 1,
      price: backendData.Price || backendData.price || 0,
      address: backendData.Address || backendData.address || '',
      images: formattedImages,
      image_url: formattedImages[0] || `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE.BY_FILENAME}/default_offer.jpg`,
      status: backendData.status || 'active',
      description: backendData.Description || backendData.description || '',
      area: backendData.Area || backendData.area || 0
    };
  }
}