import { API_CONFIG } from "../config.js";

export const API = {
  get: async (endpoint, params = {}) => {
    const mockOffers = {
      1: {
        id: 1,
        user_id: 1,
        location_id: 101,
        category_id: 1,
        title: "Уютная 2-комнатная квартира в центре",
        description: "Сделан евроремонт, новая сантехника. Пластиковые окна, современная кухня, санузел совмещенный. Рядом метро, парк, школы и детские сады.",
        images: [
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
        ],
        price: 8500000,
        area: 58.5,
        rooms: 2,
        address: "Москва, Тверская ул., 15",
        offer_type: "sale",
        property_type: "flat",
        category: "secondary",
        floor: 3,
        total_floors: 9,
        living_area: 40.0,
        kitchen_area: 12.0,
        metro: "Парк культуры",
        created_at: "2025-09-28T20:43:04.955938Z",
        updated_at: "2025-09-28T20:43:04.955938Z",
        user_full_name: "Иван Иванов",
        user_phone: "+7 (999) 123-45-67",
        user_avatar_url: "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg",
        rental_period: null,
        deposit: 0,
        commission: 0
      },
      2: {
        id: 2,
        user_id: 2,
        location_id: 102,
        category_id: 2,
        title: "Сдам однушку у метро",
        description: "Все удобства, рядом парк. Квартира после ремонта, чистая, светлая. Вся необходимая бытовая техника. Подходит для семьи или одного человека.",
        images: [
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
        ],
        price: 65000,
        area: 38.2,
        rooms: 1,
        address: "Санкт-Петербург, Невский пр., 42",
        offer_type: "rent",
        property_type: "flat",
        category: "secondary",
        floor: 5,
        total_floors: 12,
        living_area: 25.0,
        kitchen_area: 8.0,
        metro: "Невский проспект",
        created_at: "2025-09-28T20:43:04.955938Z",
        updated_at: "2025-09-28T20:43:04.955938Z",
        user_full_name: "Петр Петров",
        user_phone: "+7 (888) 765-43-21",
        user_avatar_url: "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg",
        rental_period: "monthly",
        deposit: 65000,
        commission: 0
      },
      3: {
        id: 3,
        user_id: 3,
        location_id: 103,
        category_id: 1,
        title: "Продам дом за городом",
        description: "Участок 10 соток, гараж, баня. Кирпичный дом, теплый, уютный. Отделка под ключ. Рядом лес, речка. Идеально для постоянного проживания.",
        images: [
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
        ],
        price: 12000000,
        area: 120,
        rooms: 4,
        address: "Московская обл., г. Истра, ул. Лесная, 7",
        offer_type: "sale",
        property_type: "house",
        category: "secondary",
        floor: 1,
        total_floors: 2,
        living_area: 80.0,
        kitchen_area: 15.0,
        metro: "Щукинская",
        created_at: "2025-09-28T20:43:04.955938Z",
        updated_at: "2025-09-28T20:43:04.955938Z",
        user_full_name: "Мария Сидорова",
        user_phone: "+7 (777) 555-44-33",
        user_avatar_url: "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg",
        rental_period: null,
        deposit: 0,
        commission: 3
      }
  };

    if (endpoint === API_CONFIG.ENDPOINTS.OFFERS.LIST) {
      const queryParams = new URLSearchParams();
      if (params.property_type) queryParams.append('property_type', params.property_type);
      if (params.offer_type) queryParams.append('offer_type', params.offer_type);
      if (params.category) queryParams.append('category', params.category);
      if (params.location) queryParams.append('location', params.location);
      if (params.min_price) queryParams.append('min_price', params.min_price);
      if (params.max_price) queryParams.append('max_price', params.max_price);
      if (params.min_area) queryParams.append('min_area', params.min_area);
      if (params.max_area) queryParams.append('max_area', params.max_area);

      const queryString = queryParams.toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;

      // Преобразуем полные данные в формат для списка
      const offersForList = Object.values(mockOffers).map(offer => ({
        id: offer.id,
        offer_type: offer.offer_type,
        property_type: offer.property_type,
        price: offer.price,
        area: offer.area,
        rooms: offer.rooms,
        floor: offer.floor,
        total_floors: offer.total_floors,
        address: offer.address,
        metro: offer.metro,
        images: offer.images,
        offer_url: `https://homa.com/offers/${offer.id}`
      }));

      return {
        ok: true,
        status: 200,
        data: {
          meta: { total: offersForList.length, offset: 0 },
          offers: offersForList
        }
      };
    }

    if (endpoint.startsWith(API_CONFIG.ENDPOINTS.OFFERS.BY_ID + '/')) {
      const offerId = endpoint.split('/').pop();
      const offer = mockOffers[offerId];

      if (offer) {
        return {
          ok: true,
          status: 200,
          data: offer
        };
      } else {
        return { ok: false, status: 404, error: "Offer not found" };
      }
    }

    if (endpoint === API_CONFIG.ENDPOINTS.COMPLEXES.LIST) {
      return {
        ok: true,
        status: 200,
        data: {
          complexes: [
            {
              id: 1,
              title: "ЖК «Турандот»",
              address: "Москва, улица Арбат, 24",
              city: "Москва",
              developer: "ООО Девелопер",
              built_year: 2024,
              imageUrl: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
              status: "Строится",
              metro: "Арбатская"
            },
            {
              id: 2,
              title: "ЖК «Девелопер»",
              address: "Москва, Кутузовский пр-т, 32",
              city: "Москва",
              developer: "ООО СтройГрупп",
              built_year: 2023,
              imageUrl: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
              status: "Сдан",
              metro: "Кутузовская"
            }
          ]
        }
      };
    }

    if (endpoint.startsWith(API_CONFIG.ENDPOINTS.COMPLEXES.BY_ID + '/')) {
      const complexId = endpoint.split('/').pop();
      return {
        ok: true,
        status: 200,
        data: {
          id: parseInt(complexId),
          name: "ЖК «Турандот»",
          price_from: 28800000,
          address: "Москва, улица Арбат, 24",
          metro: "Арбатская",
          description: "ЖК «Турандот» — это элитный клубный дом в самом сердце старой Москвы, на престижном Арбате. Роскошная архитектура в стиле французского неоклассицизма, закрытая охраняемая территория и эксклюзивные апартаменты с индивидуальной отделкой.",
          images: [
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
          ],
          apartments: [
            {
              id: 1,
              title: "2-комн. кв., 58.5м², 3/9 этаж",
              price: 8500000,
              rooms: 2,
              area: 58.5,
              floor: "3/9",
              address: "Москва, Тверская ул., 15",
              metro: "Парк культуры",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 2,
              title: "1-комн. кв., 38.2м², 5/12 этаж",
              price: 65000,
              rooms: 1,
              area: 38.2,
              floor: "5/12",
              address: "Санкт-Петербург, Невский пр., 42",
              metro: "Невский проспект",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            }
          ]
        }
      };
    }

    if (endpoint.startsWith(API_CONFIG.ENDPOINTS.PROFILE.INFO)) {
      return {
        ok: true,
        status: 200,
        data: {
          id: 1,
          first_name: "Иван",
          last_name: "Иванов",
          email: "user@example.com",
          phone: "+79261234567",
          photo_url: "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg"
        }
      };
    }

    if (endpoint === API_CONFIG.ENDPOINTS.PROFILE.MY_OFFERS) {
      return {
        ok: true,
        status: 200,
        data: [
          {
            id: 1,
            offer_type: "sale",
            property_type: "flat",
            price: 8500000,
            area: 58.5,
            rooms: 2,
            floor: 3,
            total_floors: 9,
            address: "Москва, Тверская ул., 15",
            metro: "Парк культуры",
            image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            offer_url: "https://homa.com/offers/1"
          }
        ]
      };
    }

    return { ok: false, status: 404, error: "Not found" };
  },

  post: async (endpoint, body) => {
    if (endpoint === API_CONFIG.ENDPOINTS.AUTH.LOGIN) {
      if (body.password === "111111") {
        document.cookie = "session=fake-cookie; path=/;";
        return {
          ok: true,
          status: 200,
          data: { 
            token: "fake-jwt-token",
            user: { id: 1, email: body.email } // Добавляем объект пользователя
          }
        };
      }
      return { ok: false, status: 401, error: "Неверный email или пароль" };
    }

    if (endpoint === API_CONFIG.ENDPOINTS.AUTH.REGISTER) {
      document.cookie = "session=fake-cookie; path=/;";
      return {
        ok: true,
        status: 201,
        data: { 
          token: "fake-jwt-token",
          user: { id: Date.now(), email: body.email } // Добавляем объект пользователя
        }
      };
    }

    if (endpoint === API_CONFIG.ENDPOINTS.AUTH.LOGOUT) {
      document.cookie = "session=; Max-Age=0; path=/;";
      return { 
        ok: true, 
        status: 200, 
        data: { 
          message: "Logged out"
        } 
      };
    }

    if (endpoint === API_CONFIG.ENDPOINTS.OFFERS.CREATE) {
      return {
        ok: true,
        status: 201,
        data: {
          url: "https://homa.com/offers/123"
        }
      };
    }

    if (endpoint === API_CONFIG.ENDPOINTS.MEDIA.UPLOAD) {
      return {
        ok: true,
        status: 201,
        data: {
          url: "https://homa.com/media/image123.jpg"
        }
      };
    }

    return { ok: false, status: 404, error: "Not found" };
  },

  put: async (endpoint, body) => {
    if (endpoint.startsWith(API_CONFIG.ENDPOINTS.OFFERS.BY_ID + '/')) {
      return {
        ok: true,
        status: 200,
        data: { message: "OK" }
      };
    }

    if (endpoint === API_CONFIG.ENDPOINTS.PROFILE.INFO) {
      return {
        ok: true,
        status: 200,
        data: {
          message: "Профиль обновлен",
          profile: {
            id: 1,
            first_name: body.first_name || "Иван",
            last_name: body.last_name || "Иванов",
            email: body.email || "user@example.com",
            phone: body.phone || "+79261234567",
            photo_url: "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg"
          }
        }
      };
    }

    if (endpoint === API_CONFIG.ENDPOINTS.PROFILE.SECURITY) {
      return {
        ok: true,
        status: 200,
        data: { message: "OK" }
      };
    }

    return { ok: false, status: 404, error: "Not found" };
  },

  delete: async (endpoint) => {
    if (endpoint.startsWith(API_CONFIG.ENDPOINTS.OFFERS.BY_ID + '/')) {
      return {
        ok: true,
        status: 200,
        data: { message: "OK" }
      };
    }

    return { ok: false, status: 404, error: "Not found" };
  }
};