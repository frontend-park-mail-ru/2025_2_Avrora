import { API_CONFIG } from "../config.js";

export const API = {
  get: async (endpoint, params = {}) => {
    try {
      const url = new URL(API_CONFIG.API_BASE_URL + endpoint);

      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          url.searchParams.append(key, params[key]);
        }
      });

      // Добавляем timestamp для предотвращения кеширования в development mode
      if (import.meta.env.DEV) {
        url.searchParams.append('_t', Date.now());
      }

      console.log('API GET request:', url.toString());

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        return {
          ok: false,
          status: response.status,
          error: errorData.error || `HTTP error ${response.status}`
        };
      }

      const data = await response.json();
      return {
        ok: true,
        status: response.status,
        data
      };

    } catch (error) {
      console.error('GET request failed:', error);
      return {
        ok: false,
        status: 0,
        error: error.message
      };
    }
  },

  post: async (endpoint, body) => {
    try {
      // Проверка авторизации и заполненности профиля для создания объявлений
      if (endpoint === API_CONFIG.ENDPOINTS.OFFERS.CREATE) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (!userData.id) {
          return {
            ok: false,
            status: 401,
            error: 'User not authenticated'
          };
        }

        // Проверка заполненности профиля
        const requiredFields = ['firstName', 'lastName', 'phone', 'email'];
        const hasCompleteProfile = requiredFields.every(field =>
          userData[field] && userData[field].trim() !== ''
        ) && userData.avatar && !userData.avatar.includes('user.png');

        if (!hasCompleteProfile) {
          return {
            ok: false,
            status: 403,
            error: 'Profile not complete'
          };
        }
      }

      const isFormData = body instanceof FormData;

      const url = API_CONFIG.API_BASE_URL + endpoint;
      console.log('API POST request:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: isFormData ? {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        } : {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: isFormData ? body : JSON.stringify(body),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        return {
          ok: false,
          status: response.status,
          error: errorData.error || `HTTP error ${response.status}`
        };
      }

      const data = await response.json();
      return {
        ok: true,
        status: response.status,
        data
      };

    } catch (error) {
      console.error('POST request failed:', error);
      return {
        ok: false,
        status: 0,
        error: error.message
      };
    }
  },

  put: async (endpoint, body) => {
    try {
      // Проверка авторизации для обновления объявлений
      if (endpoint.startsWith(API_CONFIG.ENDPOINTS.OFFERS.UPDATE)) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (!userData.id) {
          return {
            ok: false,
            status: 401,
            error: 'User not authenticated'
          };
        }
      }

      const isFormData = body instanceof FormData;

      const url = API_CONFIG.API_BASE_URL + endpoint;
      console.log('API PUT request:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: isFormData ? {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        } : {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: isFormData ? body : JSON.stringify(body),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        return {
          ok: false,
          status: response.status,
          error: errorData.error || `HTTP error ${response.status}`
        };
      }

      const data = await response.json();
      return {
        ok: true,
        status: response.status,
        data
      };

    } catch (error) {
      console.error('PUT request failed:', error);
      return {
        ok: false,
        status: 0,
        error: error.message
      };
    }
  },

  delete: async (endpoint) => {
    try {
      // Проверка авторизации для удаления объявлений
      if (endpoint.startsWith(API_CONFIG.ENDPOINTS.OFFERS.DELETE)) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (!userData.id) {
          return {
            ok: false,
            status: 401,
            error: 'User not authenticated'
          };
        }
      }

      const url = API_CONFIG.API_BASE_URL + endpoint;
      console.log('API DELETE request:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        return {
          ok: false,
          status: response.status,
          error: errorData.error || `HTTP error ${response.status}`
        };
      }

      const data = await response.json().catch(() => ({}));
      return {
        ok: true,
        status: response.status,
        data
      };

    } catch (error) {
      console.error('DELETE request failed:', error);
      return {
        ok: false,
        status: 0,
        error: error.message
      };
    }
  }
};