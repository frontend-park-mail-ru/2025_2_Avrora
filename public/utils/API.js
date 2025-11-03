// API.js
import { API_CONFIG } from "../config.js";

export const API = {
  get: async (endpoint, params = {}) => {
    try {
      const url = new URL(API_CONFIG.API_BASE_URL + endpoint);

      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

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
      const isFormData = body instanceof FormData;

      const response = await fetch(API_CONFIG.API_BASE_URL + endpoint, {
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
      const isFormData = body instanceof FormData;

      const response = await fetch(API_CONFIG.API_BASE_URL + endpoint, {
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
      const response = await fetch(API_CONFIG.API_BASE_URL + endpoint, {
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