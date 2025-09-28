import { API_CONFIG } from "../config.js";

export const API = {
    get: async (endpoint) => {
        if (endpoint === API_CONFIG.ENDPOINTS.BOARDS.OFFERS) {
            return {
                ok: true,
                status: 200,
                data: {
                    boards: [
                        {id: 1, user_id: 1, location_id: 2, category_id: 2, 
                        title: "Квартира в апартаментах", description: "Соседи алкаши", 
                        price: 500, area: 100, rooms: 3, address: "Улица Пушкина, дом Колотушкина",
                        offer_type: "Срочный", created_at: "2024-01-15T10:30:00Z", updated_at: "2024-01-15T10:30:00Z"},
                        {id: 2, user_id: 2, location_id: 2, category_id: 2, 
                        title: "Студия в центре", description: "Тихий дом", 
                        price: 350, area: 35, rooms: 1, address: "Улица Лермонтова, 5",
                        offer_type: "Долгосрочно", created_at: "2024-02-01T09:00:00Z", updated_at: "2024-02-01T09:00:00Z"},
                        {id: 3, user_id: 3, location_id: 1, category_id: 1, 
                        title: "Комната в коммуналке", description: "Удобно для студентов", 
                        price: 150, area: 18, rooms: 1, address: "Проспект Мира, 10",
                        offer_type: "Долгосрочно", created_at: "2024-03-10T12:00:00Z", updated_at: "2024-03-10T12:00:00Z"},
                        {id: 4, user_id: 4, location_id: 1, category_id: 1, 
                        title: "Комната в коммуналке", description: "Удобно для студентов", 
                        price: 150, area: 18, rooms: 1, address: "Проспект Мира, 10",
                        offer_type: "Долгосрочно", created_at: "2024-03-10T12:00:00Z", updated_at: "2024-03-10T12:00:00Z"},
                        {id: 5, user_id: 5, location_id: 1, category_id: 1, 
                        title: "Комната в коммуналке", description: "Удобно для студентов", 
                        price: 150, area: 18, rooms: 1, address: "Проспект Мира, 10",
                        offer_type: "Долгосрочно", created_at: "2024-03-10T12:00:00Z", updated_at: "2024-03-10T12:00:00Z"},
                    ]
                }
            };
        }
        return { ok: false, status: 404, error: 'Not found' };
    },
    post: async (endpoint, body) => {
        if (endpoint === API_CONFIG.ENDPOINTS.AUTH.LOGIN) {
            if (body.password === '111111') {
                document.cookie = "session=fake-cookie; path=/;";
                return {
                    ok: true,
                    status: 200,
                    data: { user: { id: 1, email: body.email }, token: 'fake-jwt' }
                };
            }
            return { ok: false, status: 401, error: 'Неверный email или пароль' };
        }
        if (endpoint === API_CONFIG.ENDPOINTS.AUTH.REGISTER) {
            document.cookie = "session=fake-cookie; path=/;";
            return {
                ok: true,
                status: 201,
                data: { user: { id: Date.now(), email: body.email }, token: 'fake-jwt' }
            };
        }
        if (endpoint === API_CONFIG.ENDPOINTS.AUTH.LOGOUT) {
            document.cookie = "session=; Max-Age=0; path=/;";
            return { ok: true, status: 200, data: { message: 'Logged out' } };
        }
        return { ok: false, status: 404, error: 'Not found' };
    }
};
