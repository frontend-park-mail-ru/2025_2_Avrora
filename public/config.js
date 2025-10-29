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
      BY_ID: '/offers',
    },
    COMPLEXES: {
      LIST: '/complexes',
      BY_ID: '/complexes',
      NAMES: '/get_residential_complex_names',
    },
    MEDIA: {
      UPLOAD: '/image',
      BY_FILENAME: '/image',
    },
    PROFILE: {
      INFO: '/profile',
      SECURITY: '/profile/security',
      MY_OFFERS: '/profile/myoffers',
    }
  }
};