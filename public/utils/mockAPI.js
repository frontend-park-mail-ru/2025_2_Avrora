export const API = {
    get: async (endpoint) => {
        if (endpoint === '/boards/popular') {
            return {
                ok: true,
                status: 200,
                data: {
                    boards: [
                        { id: 1, title: 'Тестовое объявление 1', description: 'Описание 1' },
                        { id: 2, title: 'Тестовое объявление 2', description: 'Описание 2' },
                        { id: 3, title: 'Тестовое объявление 3', description: 'Описание 3' },
                        { id: 4, title: 'Тестовое объявление 4', description: 'Описание 4' },
                        { id: 5, title: 'Тестовое объявление 5', description: 'Описание 5' },
                        { id: 6, title: 'Тестовое объявление 6', description: 'Описание 6' },
                        { id: 7, title: 'Тестовое объявление 7', description: 'Описание 7' },
                        { id: 8, title: 'Тестовое объявление 8', description: 'Описание 8' },
                        { id: 9, title: 'Тестовое объявление 9', description: 'Описание 9' },
                        { id: 10, title: 'Тестовое объявление 10', description: 'Описание 10' },
                        { id: 11, title: 'Тестовое объявление 11', description: 'Описание 11' },
                        { id: 12, title: 'Тестовое объявление 12', description: 'Описание 12' }
                    ]
                }
            };
        }
        return { ok: false, status: 404, error: 'Not found' };
    },
    post: async (endpoint, body) => {
        if (endpoint === '/auth/login') {
            if (body.email === 'test@test.com' && body.password === '123456') {
                document.cookie = "session=fake-cookie; path=/;";
                return {
                    ok: true,
                    status: 200,
                    data: { user: { id: 1, email: body.email }, token: 'fake-jwt' }
                };
            }
            return { ok: false, status: 401, error: 'Неверный email или пароль' };
        }
        if (endpoint === '/auth/register') {
            document.cookie = "session=fake-cookie; path=/;";
            return {
                ok: true,
                status: 201,
                data: { user: { id: Date.now(), email: body.email }, token: 'fake-jwt' }
            };
        }
        return { ok: false, status: 404, error: 'Not found' };
    }
};
