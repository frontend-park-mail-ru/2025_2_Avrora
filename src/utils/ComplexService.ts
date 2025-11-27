import { API } from "./API.js";
import { API_CONFIG } from "../config.js";


interface Complex {
  id?: string | number;
  name?: string;
  Name?: string;
  title?: string;
  [key: string]: any;
}

interface ComplexesResponse {
  complexes: Complex[];
  meta: Record<string, any>;
}

interface APIResponse {
  ok: boolean;
  status: number;
  data?: any;
  error?: string;
}

interface ComplexParams {
  [key: string]: any;
}

export class ComplexService {
  static async getComplexNames(): Promise<Complex[]> {
    try {
      const result: APIResponse = await API.get(API_CONFIG.ENDPOINTS.COMPLEXES.NAMES);

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
      return [];
    }
  }

  static async getComplexes(params: ComplexParams = {}): Promise<ComplexesResponse> {
    try {
      const result: APIResponse = await API.get(API_CONFIG.ENDPOINTS.COMPLEXES.LIST, params);

      if (result.ok && result.data) {
        const responseData = result.data || result;

        let complexes: Complex[] = [];
        let meta: Record<string, any> = {};

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
      return { complexes: [], meta: {} };
    }
  }

  static async getComplexById(complexId: string | number): Promise<Complex> {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.COMPLEXES.LIST}/${complexId}`;
      const result: APIResponse = await API.get(endpoint);

      if (result.ok && result.data) {
        return result.data;
      }

      throw new Error(result.error || "Ошибка загрузки информации о ЖК");
    } catch (error) {
      throw error;
    }
  }

  static async searchComplexes(searchTerm: string): Promise<Complex[]> {
    try {
      const complexes = await this.getComplexNames();
      return complexes.filter(complex => {
        const name = complex.name || complex.Name || complex.title || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    } catch (error) {
      return [];
    }
  }
}