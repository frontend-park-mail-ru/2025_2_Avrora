// config.js - обновленный с эндпоинтами поддержки

export const API_CONFIG = {
  API_BASE_URL: 'http://localhost:8080/api/v1',
  ENDPOINTS: {
    AUTH: {
        LOGIN: '/login',
        REGISTER: '/register',
        LOGOUT: '/logout',
    },
    OFFERS: {
        LIST: '/offers',
        CREATE: '/offers/create',
        BY_ID: '/offers/',
        UPDATE: '/offers/update/',
        DELETE: '/offers/delete/',
        MY_OFFERS: '/profile/myoffers/'
    },
    COMPLEXES: {
        LIST: '/complexes/list',
        CREATE: '/complexes/create',
        BY_ID: '/complexes/',
        UPDATE: '/complexes/update/',
        DELETE: '/complexes/delete/',
        NAMES: '/get_residential_complex_names',
    },
    PROFILE: {
        GET: '/profile/',
        UPDATE: '/profile/update/',
        SECURITY: '/profile/security/',
        EMAIL: '/profile/email/',
        MY_OFFERS: '/profile/myoffers/'
    },
    IMAGE: {
        UPLOAD: '/image/upload',
        GET: '/image/',
        BY_FILENAME: '/image'
    },
    MEDIA: {
        UPLOAD: '/image/upload',
        BY_FILENAME: '/image'
    },
    SUPPORT_TICKETS: {
        CREATE: '/support-tickets',
        MY_TICKETS: '/support-tickets/my/',
        BY_ID: '/support-tickets/',
        DELETE: '/support-tickets/delete/',
        ADMIN: {
            LIST: '/admin/support-tickets',
            UPDATE_STATUS: '/admin/support-tickets/status/'
        }
    }
  }
};