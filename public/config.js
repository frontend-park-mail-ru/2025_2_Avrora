/**
 * Конфигурация API и endpoints приложения
 * @module config
 */

/**
 * Объект конфигурации API
 * @type {Object}
 */
export const API_CONFIG = {
    /** Базовый URL API */
    API_BASE_URL: 'http://localhost:8080/api/v1',

    /** Endpoints API */
    ENDPOINTS: {
        /** Endpoints аутентификации */
        AUTH: {
            /** Endpoint для входа */
            LOGIN: '/login',
            /** Endpoint для регистрации */
            REGISTER: '/register',
            /** Endpoint для выхода */
            LOGOUT: '/logout',
        },
        /** Endpoints объявлений */
        BOARDS: {
            /** Endpoint для получения объявлений */
            OFFERS: '/offers',
        }
    }
};
