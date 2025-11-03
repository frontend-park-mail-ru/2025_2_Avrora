import { API } from "./API.js";
import { API_CONFIG } from "../../config.js";

export class ComplexService {
    static async getComplexNames() {
        try {
            const result = await API.get(API_CONFIG.ENDPOINTS.COMPLEXES.NAMES);

            // Обрабатываем разные форматы ответа
            if (result.ok && result.data) {
                const responseData = result.data || result;

                if (Array.isArray(responseData)) {
                    return responseData;
                } else if (Array.isArray(responseData.complexes)) {
                    return responseData.complexes;
                } else if (Array.isArray(responseData.Complexes)) {
                    return responseData.Complexes;
                }
            }

            throw new Error(result.error || "Ошибка загрузки названий ЖК");
        } catch (error) {
            console.error('Error loading complex names:', error);
            return [];
        }
    }

    static async getComplexes(params = {}) {
        try {
            const result = await API.get(API_CONFIG.ENDPOINTS.COMPLEXES.LIST, params);

            // Обрабатываем разные форматы ответа
            if (result.ok && result.data) {
                const responseData = result.data || result;

                let complexes = [];
                let meta = {};

                if (Array.isArray(responseData.Complexes)) {
                    complexes = responseData.Complexes;
                    meta = responseData.Meta || {};
                } else if (Array.isArray(responseData.complexes)) {
                    complexes = responseData.complexes;
                    meta = responseData.meta || {};
                } else if (Array.isArray(responseData.data)) {
                    complexes = responseData.data;
                    meta = responseData.meta || {};
                }

                return { complexes, meta };
            }

            throw new Error(result.error || "Ошибка загрузки списка ЖК");
        } catch (error) {
            console.error('Error loading complexes:', error);
            return { complexes: [], meta: {} };
        }
    }

    static async getComplexById(complexId) {
        try {
            const endpoint = `${API_CONFIG.ENDPOINTS.COMPLEXES.LIST}/${complexId}`;
            const result = await API.get(endpoint);

            if (result.ok && result.data) {
                return result.data;
            }

            throw new Error(result.error || "Ошибка загрузки информации о ЖК");
        } catch (error) {
            console.error('Error loading complex:', error);
            throw error;
        }
    }

    static async searchComplexes(searchTerm) {
        try {
            const complexes = await this.getComplexNames();
            return complexes.filter(complex => {
                const name = complex.name || complex.Name || complex.title || "";
                return name.toLowerCase().includes(searchTerm.toLowerCase());
            });
        } catch (error) {
            console.error('Error searching complexes:', error);
            return [];
        }
    }
}