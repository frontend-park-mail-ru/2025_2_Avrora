import { API_CONFIG } from "../config.js";

/**
 * Универсальная функция для выполнения API запросов
 * @async
 * @param {string} endpoint - Конечная точка API
 * @param {Object} [options={}] - Опции запроса
 * @returns {Promise<Object>} Результат запроса
 */
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

/**
 * Реализация реального API для работы с бэкендом
 * @module realAPI
 */
export const API = {
    /**
     * GET запрос к API
     * @param {string} endpoint - Конечная точка API
     * @returns {Promise<Object>} Результат запроса
     */
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

    /**
     * POST запрос к API
     * @param {string} endpoint - Конечная точка API
     * @param {Object} body - Тело запроса
     * @returns {Promise<Object>} Результат запроса
     */
    post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body }),

    /**
     * PUT запрос к API
     * @param {string} endpoint - Конечная точка API
     * @param {Object} body - Тело запроса
     * @returns {Promise<Object>} Результат запроса
     */
    put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),

    /**
     * DELETE запрос к API
     * @param {string} endpoint - Конечная точка API
     * @returns {Promise<Object>} Результат запроса
     */
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};
