import { API as RealAPI } from './realAPI.js';
import { API as MockAPI } from './mockAPI.js';

/**
 * Переключение между реальным API и mockAPI.
 * 
 * Чтобы включить моки — установить:
 *   localStorage.setItem("USE_MOCK_API", "true")
 * 
 * Чтобы вернуться к реальному API:
 *   localStorage.removeItem("USE_MOCK_API")
 */

localStorage.setItem("USE_MOCK_API", "true");

const useMock = localStorage.getItem("USE_MOCK_API") === "true";

export const API = useMock ? MockAPI : RealAPI;
