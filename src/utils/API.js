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

      if (import.meta.env.DEV) {
        url.searchParams.append('_t', Date.now());
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: response.statusText };
        }
        return {
          ok: false,
          status: response.status,
          error: errorData.error || `HTTP error ${response.status}`
        };
      }

      if (response.status === 204) {
        return {
          ok: true,
          status: response.status,
          data: null
        };
      }

      const data = await response.json();
      return {
        ok: true,
        status: response.status,
        data
      };

    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error.message
      };
    }
  },

  post: async (endpoint, body) => {
    try {
      if (endpoint === API_CONFIG.ENDPOINTS.OFFERS.CREATE) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (!userData.id) {
          return {
            ok: false,
            status: 401,
            error: 'User not authenticated'
          };
        }

        const requiredFields = ['firstName', 'lastName', 'phone', 'email'];
        const hasCompleteProfile = requiredFields.every(field =>
          userData[field] && userData[field].trim() !== ''
        ) && userData.avatar && !userData.avatar.includes('default_avatar.jpg');

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
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: response.statusText };
        }
        return {
          ok: false,
          status: response.status,
          error: errorData.error || `HTTP error ${response.status}`
        };
      }

      if (response.status === 204) {
        return {
          ok: true,
          status: response.status,
          data: null
        };
      }

      try {
        const text = await response.text();
        if (!text) {
          return {
            ok: true,
            status: response.status,
            data: null
          };
        }
        const data = JSON.parse(text);
        return {
          ok: true,
          status: response.status,
          data
        };
      } catch (parseError) {
        return {
          ok: true,
          status: response.status,
          data: null
        };
      }

    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error.message
      };
    }
  },

  put: async (endpoint, body) => {
    try {
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
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: response.statusText };
        }
        return {
          ok: false,
          status: response.status,
          error: errorData.error || `HTTP error ${response.status}`
        };
      }

      if (response.status === 204) {
        return {
          ok: true,
          status: response.status,
          data: null
        };
      }

      try {
        const text = await response.text();
        if (!text) {
          return {
            ok: true,
            status: response.status,
            data: null
          };
        }
        const data = JSON.parse(text);
        return {
          ok: true,
          status: response.status,
          data
        };
      } catch (parseError) {
        return {
          ok: true,
          status: response.status,
          data: null
        };
      }

    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error.message
      };
    }
  },

  delete: async (endpoint) => {
    try {
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

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: response.statusText };
        }
        return {
          ok: false,
          status: response.status,
          error: errorData.error || `HTTP error ${response.status}`
        };
      }

      if (response.status === 204) {
        return {
          ok: true,
          status: response.status,
          data: null
        };
      }

      try {
        const text = await response.text();
        if (!text) {
          return {
            ok: true,
            status: response.status,
            data: null
          };
        }
        const data = JSON.parse(text);
        return {
          ok: true,
          status: response.status,
          data
        };
      } catch (parseError) {
        return {
          ok: true,
          status: response.status,
          data: null
        };
      }

    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error.message
      };
    }
  },
  
  promote: async (endpoint, body) => {
    try {
      const url = API_CONFIG.API_BASE_URL + endpoint;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(body),
        credentials: 'include'
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: response.statusText };
        }
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
      return {
        ok: false,
        status: 0,
        error: error.message
      };
    }
  }
};