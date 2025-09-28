import { API as RealAPI } from './realAPI.js';
import { API as MockAPI } from './mockAPI.js';

/**
 * Модуль для переключения между реальным API и mockAPI
 * @module API
 * 
 * @example
 * // Чтобы включить моки — установить:
 * localStorage.setItem("USE_MOCK_API", "true")
 * 
 * @example
 * // Чтобы вернуться к реальному API:
 * localStorage.removeItem("USE_MOCK_API")
 */

localStorage.setItem("USE_MOCK_API", "true");
// localStorage.removeItem("USE_MOCK_API");

const useMock = localStorage.getItem("USE_MOCK_API") === "true";

/**
 * Экспортируемый API объект, который автоматически выбирает между реальным и mock API
 * @type {Object}
 */
export const API = useMock ? MockAPI : RealAPI;
