import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";

export class ProfileService {
    static async getProfile(userId?: number): Promise<any> {
        const id = userId || this.getCurrentUserId();
        if (!id) throw new Error("User ID not found");
        const res = await API.get(`${API_CONFIG.ENDPOINTS.PROFILE.GET}${id}`);
        if (res.ok && res.data) return res.data;
        throw new Error(res.error || "Failed to load profile");
    }

    static getCurrentUserId(): number | null {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.user_id || null;
            } catch {
                // Ignore parsing errors
            }
        }
        const user = JSON.parse(localStorage.getItem('userData') || '{}');
        return user.id || null;
    }

    static async getMyOffers(): Promise<any[]> {
        const userId = this.getCurrentUserId();
        if (!userId) throw new Error("Not authenticated");
        const res = await API.get(`${API_CONFIG.ENDPOINTS.PROFILE.MY_OFFERS}${userId}`);
        if (res.ok) {
            if (Array.isArray(res.data)) return res.data;
            if (res.data && Array.isArray(res.data.offers)) return res.data.offers;
        }
        return [];
    }
}