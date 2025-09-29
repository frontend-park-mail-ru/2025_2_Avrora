import { API_CONFIG } from "../config.js";

/**
 * Выполняет HTTP-запрос к API с обработкой ошибок и авторизацией
 * @param {string} endpoint - Конечная точка API
 * @param {Object} options - Опции запроса
 * @param {string} options.method - HTTP метод (GET, POST, PUT, DELETE)
 * @param {Object} options.headers - Дополнительные заголовки запроса
 * @param {Object} options.body - Тело запроса (будет преобразовано в JSON)
 * @returns {Promise<Object>} Объект с результатом запроса
 * @async
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
 * Объект для работы с API, предоставляющий методы для HTTP запросов
 * @namespace
 */
export const API = {
    /**
     * Выполняет GET запрос
     * @param {string} endpoint - Конечная точка API
     * @returns {Promise<Object>} Результат запроса
     */
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
    
    /**
     * Выполняет POST запрос
     * @param {string} endpoint - Конечная точка API
     * @param {Object} body - Тело запроса
     * @returns {Promise<Object>} Результат запроса
     */
    post: (endpoint, body) => apiRequest(endpoint, { method: 'POST', body }),
    
    /**
     * Выполняет PUT запрос
     * @param {string} endpoint - Конечная точка API
     * @param {Object} body - Тело запроса
     * @returns {Promise<Object>} Результат запроса
     */
    put: (endpoint, body) => apiRequest(endpoint, { method: 'PUT', body }),
    
    /**
     * Выполняет DELETE запрос
     * @param {string} endpoint - Конечная точка API
     * @returns {Promise<Object>} Результат запроса
     */
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};