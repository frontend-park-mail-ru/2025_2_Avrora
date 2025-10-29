import { API } from "./API.js";
import { API_CONFIG } from "../../config.js";

export class ComplexService {
    static async getComplexNames() {
        try {
            const result = await API.get(API_CONFIG.ENDPOINTS.COMPLEXES.NAMES);

            if (result.ok && Array.isArray(result.data)) {
                return result.data;
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

            if (result.ok && result.data && Array.isArray(result.data.complexes)) {
                return result.data;
            }

            throw new Error(result.error || "Ошибка загрузки списка ЖК");
        } catch (error) {
            console.error('Error loading complexes:', error);
            return { complexes: [], meta: {} };
        }
    }

    static async getComplexById(complexId) {
        try {
            const endpoint = `${API_CONFIG.ENDPOINTS.COMPLEXES.BY_ID}/${complexId}`;
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
            return complexes.filter(complex =>
                complex.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        } catch (error) {
            console.error('Error searching complexes:', error);
            return [];
        }
    }
}