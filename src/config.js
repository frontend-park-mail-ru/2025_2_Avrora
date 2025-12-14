const API_BASE_URL = import.meta.env.API_URL;

export const API_CONFIG = {
  API_BASE_URL: API_BASE_URL,
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
        MY_OFFERS: '/profile/myoffers/',
        PRICE_HISTORY: '/offers/pricehistory/',
        LIKE: '/offers/like/',
        IS_LIKED: '/offers/isliked/',
        VIEW: '/offers/view/',
        VIEWCOUNT: '/offers/viewcount/',
        LIKECOUNT: '/offers/likecount/',
        PAID_OFFERS: '/paid_offers',
        LIKED: '/offers/liked'
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
    }
  }
};