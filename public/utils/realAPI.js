import { API_CONFIG } from "../config.js";

async function apiRequest(endpoint, options = {}) {
    try {
        const token = localStorage.getItem('authToken');

        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_CONFIG.API_BASE_URL}${endpoint}`, {
            method: options.method || 'GET',
            headers,
            credentials: 'include',
            body: options.body ? JSON.stringify(options.body) : undefined
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { ok: false, status: response.status, error: data.message || data.error || 'Ошибка запроса' };
        }

        return { ok: true, status: response.status, data };
    } catch (err) {
        return { ok: false, status: 500, error: err.message };
    }
}

export const API = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body }),
    put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};
