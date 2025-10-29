import { API } from "./API.js";
import { API_CONFIG } from "../config.js";

export class ProfileService {
  static async getProfile(userId = null) {
    try {
      const params = userId ? { user_id: userId } : {};
      const result = await API.get(API_CONFIG.ENDPOINTS.PROFILE.INFO, params);

      if (result.ok && result.data) {
        return result.data;
      }

      throw new Error(result.error || "Ошибка загрузки профиля");
    } catch (error) {
      console.error('Error loading profile:', error);
      throw error;
    }
  }

  static async updateProfile(profileData) {
    try {
      const result = await API.put(API_CONFIG.ENDPOINTS.PROFILE.INFO, profileData);

      if (result.ok && result.data) {
        return result.data;
      }

      throw new Error(result.error || "Ошибка обновления профиля");
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  static async changePassword(passwordData) {
    try {
      const result = await API.put(API_CONFIG.ENDPOINTS.PROFILE.SECURITY, passwordData);

      if (result.ok && result.data) {
        return result.data;
      }

      throw new Error(result.error || "Ошибка смены пароля");
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  static async getMyOffers() {
    try {
      const result = await API.get(API_CONFIG.ENDPOINTS.PROFILE.MY_OFFERS);

      if (result.ok && Array.isArray(result.data)) {
        return result.data;
      }

      throw new Error(result.error || "Ошибка загрузки объявлений");
    } catch (error) {
      console.error('Error loading my offers:', error);
      throw error;
    }
  }

  static async uploadAvatar(file) {
    try {
      const { MediaService } = await import('./MediaService.js');
      const result = await MediaService.uploadImage(file);
      return result.url;
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

    if (!passwordData.current_password) {
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
}