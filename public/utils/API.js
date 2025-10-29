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
      },
      4: {
        id: 4,
        user_id: 4,
        location_id: 104,
        category_id: 1,
        title: "3-комнатная квартира в новостройке",
        description: "Современная планировка, панорамные окна, вид на парк. Чистовая отделка, все коммуникации. Подземный паркинг, детская площадка.",
        images: [
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
        ],
        price: 12500000,
        area: 78.0,
        rooms: 3,
        address: "Москва, Ленинский пр-т, 125",
        offer_type: "sale",
        property_type: "flat",
        category: "new",
        floor: 12,
        total_floors: 25,
        living_area: 55.0,
        kitchen_area: 15.0,
        metro: "Ленинский проспект",
        created_at: "2025-09-28T20:43:04.955938Z",
        updated_at: "2025-09-28T20:43:04.955938Z",
        user_full_name: "Алексей Козлов",
        user_phone: "+7 (666) 444-33-22",
        user_avatar_url: "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg",
        rental_period: null,
        deposit: 0,
        commission: 0
      },
      5: {
        id: 5,
        user_id: 5,
        location_id: 105,
        category_id: 2,
        title: "Студия в историческом центре",
        description: "Уютная студия с французскими окнами, высокие потолки, паркет. Ремонт премиум-класса. Рядом набережная, театры, рестораны.",
        images: [
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
        ],
        price: 45000,
        area: 32.5,
        rooms: 1,
        address: "Санкт-Петербург, наб. реки Мойки, 15",
        offer_type: "rent",
        property_type: "flat",
        category: "secondary",
        floor: 2,
        total_floors: 5,
        living_area: 25.0,
        kitchen_area: 7.5,
        metro: "Адмиралтейская",
        created_at: "2025-09-28T20:43:04.955938Z",
        updated_at: "2025-09-28T20:43:04.955938Z",
        user_full_name: "Елена Васнецова",
        user_phone: "+7 (555) 333-22-11",
        user_avatar_url: "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg",
        rental_period: "monthly",
        deposit: 90000,
        commission: 0
      },
      6: {
        id: 6,
        user_id: 6,
        location_id: 106,
        category_id: 1,
        title: "Таунхаус в коттеджном поселке",
        description: "Собственный земельный участок, терраса, камин. Европейская отделка, система умный дом. Круглосуточная охрана, инфраструктура.",
        images: [
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
        ],
        price: 18500000,
        area: 145.0,
        rooms: 5,
        address: "Московская обл., г. Одинцово, ул. Садовая, 8",
        offer_type: "sale",
        property_type: "house",
        category: "secondary",
        floor: 2,
        total_floors: 2,
        living_area: 110.0,
        kitchen_area: 25.0,
        metro: "Кунцевская",
        created_at: "2025-09-28T20:43:04.955938Z",
        updated_at: "2025-09-28T20:43:04.955938Z",
        user_full_name: "Дмитрий Орлов",
        user_phone: "+7 (444) 222-11-00",
        user_avatar_url: "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg",
        rental_period: null,
        deposit: 0,
        commission: 2
      },
      7: {
        id: 7,
        user_id: 7,
        location_id: 107,
        category_id: 2,
        title: "2-комнатная квартира для семьи",
        description: "Просторная кухня-гостиная, детская комната, гардеробная. Консьерж, фитнес-центр. Тихий двор, зеленая территория.",
        images: [
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
        ],
        price: 85000,
        area: 65.0,
        rooms: 2,
        address: "Москва, ул. Льва Толстого, 18",
        offer_type: "rent",
        property_type: "flat",
        category: "new",
        floor: 7,
        total_floors: 16,
        living_area: 48.0,
        kitchen_area: 17.0,
        metro: "Парк культуры",
        created_at: "2025-09-28T20:43:04.955938Z",
        updated_at: "2025-09-28T20:43:04.955938Z",
        user_full_name: "Сергей Николаев",
        user_phone: "+7 (333) 111-00-99",
        user_avatar_url: "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg",
        rental_period: "yearly",
        deposit: 170000,
        commission: 0
      },
      8: {
        id: 8,
        user_id: 8,
        location_id: 108,
        category_id: 1,
        title: "Апартаменты в бизнес-классе",
        description: "Панорамные виды, отделка под ключ, smart-технологии. Собственный SPA-комплекс, бассейн. Престижный район.",
        images: [
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
        ],
        price: 22500000,
        area: 95.0,
        rooms: 3,
        address: "Москва, Пресненская наб., 12",
        offer_type: "sale",
        property_type: "flat",
        category: "new",
        floor: 25,
        total_floors: 35,
        living_area: 72.0,
        kitchen_area: 23.0,
        metro: "Выставочная",
        created_at: "2025-09-28T20:43:04.955938Z",
        updated_at: "2025-09-28T20:43:04.955938Z",
        user_full_name: "Анна Смирнова",
        user_phone: "+7 (222) 000-99-88",
        user_avatar_url: "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg",
        rental_period: null,
        deposit: 0,
        commission: 0
      }
  };


    if (endpoint === API_CONFIG.ENDPOINTS.OFFERS.LIST) {
        const queryParams = new URLSearchParams();

        // Обработка параметров согласно API
        if (params.property_type) queryParams.append('property_type', params.property_type);
        if (params.offer_type) queryParams.append('offer_type', params.offer_type);
        if (params.category) queryParams.append('category', params.category);
        if (params.location) queryParams.append('location', params.location);
        if (params.min_price) queryParams.append('min_price', params.min_price);
        if (params.max_price) queryParams.append('max_price', params.max_price);
        if (params.min_area) queryParams.append('min_area', params.min_area);
        if (params.max_area) queryParams.append('max_area', params.max_area);

        const page = params.page || 1;
        const limit = params.limit || 20; // или другое значение по умолчанию
        const offset = (page - 1) * limit;

        // Добавляем пагинацию, если API поддерживает
        queryParams.append('page', page);
        queryParams.append('limit', limit);

        const queryString = queryParams.toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        const allOffers = Object.values(mockOffers);

        // Фильтрация офферов по параметрам
        let filteredOffers = allOffers;

        if (params.property_type) {
            filteredOffers = filteredOffers.filter(offer =>
                offer.property_type === params.property_type
            );
        }

        if (params.offer_type) {
            filteredOffers = filteredOffers.filter(offer =>
                offer.offer_type === params.offer_type
            );
        }

        if (params.category) {
            filteredOffers = filteredOffers.filter(offer =>
                offer.category === params.category
            );
        }

        if (params.location) {
            filteredOffers = filteredOffers.filter(offer =>
                offer.address.toLowerCase().includes(params.location.toLowerCase()) ||
                (offer.metro && offer.metro.toLowerCase().includes(params.location.toLowerCase()))
            );
        }

        if (params.min_price) {
            filteredOffers = filteredOffers.filter(offer =>
                offer.price >= parseInt(params.min_price)
            );
        }

        if (params.max_price) {
            filteredOffers = filteredOffers.filter(offer =>
                offer.price <= parseInt(params.max_price)
            );
        }

        if (params.min_area) {
            filteredOffers = filteredOffers.filter(offer =>
                offer.area >= parseInt(params.min_area)
            );
        }

        if (params.max_area) {
            filteredOffers = filteredOffers.filter(offer =>
                offer.area <= parseInt(params.max_area)
            );
        }

        const paginatedOffers = filteredOffers.slice(offset, offset + limit);

        const offersForList = paginatedOffers.map(offer => ({
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
                meta: {
                    total: filteredOffers.length,
                    page: page,
                    limit: limit,
                    total_pages: Math.ceil(filteredOffers.length / limit)
                },
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
      const mockComplexes = [
        {
          id: 1,
          title: "ЖК «Турандот»",
          address: "Москва, улица Арбат, 24",
          city: "Москва",
          developer: "ООО Девелопер",
          built_year: 2024,
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
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
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Сдан",
          metro: "Кутузовская"
        },
        {
          id: 3,
          title: "ЖК «Небо»",
          address: "Москва, Пресненская наб., 8",
          city: "Москва",
          developer: "Capital Group",
          built_year: 2024,
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Строится",
          metro: "Деловой центр"
        },
        {
          id: 4,
          title: "ЖК «Цветочный»",
          address: "Москва, ул. Садовая, 15",
          city: "Москва",
          developer: "ПИК",
          built_year: 2023,
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Сдан",
          metro: "Цветной бульвар"
        },
        {
          id: 5,
          title: "ЖК «Речной»",
          address: "Москва, Ленинградское ш., 65",
          city: "Москва",
          developer: "Самолет",
          built_year: 2024,
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Строится",
          metro: "Речной вокзал"
        },
        {
          id: 6,
          title: "ЖК «Парковый»",
          address: "Москва, ул. Островитянова, 18",
          city: "Москва",
          developer: "Эталон",
          built_year: 2023,
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Сдан",
          metro: "Коньково"
        },
        {
          id: 7,
          title: "ЖК «Солнечный»",
          address: "Москва, пр-т Вернадского, 105",
          city: "Москва",
          developer: "ГК А101",
          built_year: 2024,
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Строится",
          metro: "Проспект Вернадского"
        },
        {
          id: 8,
          title: "ЖК «Лесной»",
          address: "Москва, ул. Ленинградская, 42",
          city: "Москва",
          developer: "Донстрой",
          built_year: 2023,
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Сдан",
          metro: "Сокол"
        },
        {
          id: 9,
          title: "ЖК «Центральный»",
          address: "Москва, ул. Тверская, 10",
          city: "Москва",
          developer: "Мосстройреконструкция",
          built_year: 2024,
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Строится",
          metro: "Тверская"
        },
        {
          id: 10,
          title: "ЖК «Резиденция»",
          address: "Москва, Рублевское ш., 85",
          city: "Москва",
          developer: "Интеко",
          built_year: 2023,
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Сдан",
          metro: "Крылатское"
        }
      ];

      const isMainPage = params.isMainPage || false;
      const page = params.page || 1;
      const limit = isMainPage ? 5 : (params.limit || 8);
      const offset = isMainPage ? 0 : (page - 1) * limit;

      const paginatedComplexes = isMainPage 
        ? mockComplexes.slice(0, 5) 
        : mockComplexes.slice(offset, offset + limit);

      return {
        ok: true,
        status: 200,
        data: {
          complexes: paginatedComplexes,
          meta: {
            total: mockComplexes.length,
            page: page,
            limit: limit,
            total_pages: Math.ceil(mockComplexes.length / limit)
          }
        }
      };
    }

    if (endpoint.startsWith(API_CONFIG.ENDPOINTS.COMPLEXES.BY_ID + '/')) {
      const complexId = endpoint.split('/').pop();

      console.log('Loading complex with ID:', complexId);

      const complexesData = {
        '1': {
          id: 1,
          name: "ЖК «Турандот»",
          price_from: 28800000,
          address: "Москва, улица Арбат, 24",
          metro: "Арбатская",
          description: "ЖК «Турандот» — это элитный клубный дом в самом сердце старой Москвы, на престижном Арбате. Роскошная архитектура в стиле французского неоклассицизма, закрытая охраняемая территория и эксклюзивные апартаменты с индивидуальной отделкой.",
          images: [
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
          ],
          apartments: [
            {
              id: 101,
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
              id: 102,
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
            },
            {
              id: 103,
              title: "3-комн. кв., 75м², 7/9 этаж",
              price: 12000000,
              rooms: 3,
              area: 75,
              floor: "7/9",
              address: "Москва, Тверская ул., 18",
              metro: "Парк культуры",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 104,
              title: "Студия, 32м², 2/9 этаж",
              price: 55000,
              rooms: 1,
              area: 32,
              floor: "2/9",
              address: "Москва, Тверская ул., 12",
              metro: "Парк культуры",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 105,
              title: "2-комн. кв., 65м², 8/9 этаж",
              price: 9500000,
              rooms: 2,
              area: 65,
              floor: "8/9",
              address: "Москва, Тверская ул., 20",
              metro: "Парк культуры",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 106,
              title: "1-комн. кв., 45м², 4/9 этаж",
              price: 75000,
              rooms: 1,
              area: 45,
              floor: "4/9",
              address: "Москва, Тверская ул., 16",
              metro: "Парк культуры",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 107,
              title: "3-комн. кв., 85м², 6/9 этаж",
              price: 13500000,
              rooms: 3,
              area: 85,
              floor: "6/9",
              address: "Москва, Тверская ул., 22",
              metro: "Парк культуры",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 108,
              title: "2-комн. кв., 60м², 1/9 этаж",
              price: 8200000,
              rooms: 2,
              area: 60,
              floor: "1/9",
              address: "Москва, Тверская ул., 14",
              metro: "Парк культуры",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 109,
              title: "Студия, 28м², 3/9 этаж",
              price: 48000,
              rooms: 1,
              area: 28,
              floor: "3/9",
              address: "Москва, Тверская ул., 17",
              metro: "Парк культуры",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 110,
              title: "4-комн. кв., 110м², 9/9 этаж",
              price: 18500000,
              rooms: 4,
              area: 110,
              floor: "9/9",
              address: "Москва, Тверская ул., 24",
              metro: "Парк культуры",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            }
          ]
        },
        '2': {
          id: 2,
          name: "ЖК «Девелопер»",
          price_from: 35000000,
          address: "Москва, Кутузовский пр-т, 32",
          metro: "Кутузовская",
          description: "Современный жилой комплекс бизнес-класса с развитой инфраструктурой. Панорамные окна, подземный паркинг, фитнес-центр и детский сад.",
          images: [
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
          ],
          apartments: [
            {
              id: 201,
              title: "3-комн. кв., 85м², 10/25 этаж",
              price: 18500000,
              rooms: 3,
              area: 85,
              floor: "10/25",
              address: "Москва, Кутузовский пр-т, 32",
              metro: "Кутузовская",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 202,
              title: "2-комн. кв., 65м², 15/25 этаж",
              price: 15500000,
              rooms: 2,
              area: 65,
              floor: "15/25",
              address: "Москва, Кутузовский пр-т, 32",
              metro: "Кутузовская",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 203,
              title: "1-комн. кв., 45м², 5/25 этаж",
              price: 9800000,
              rooms: 1,
              area: 45,
              floor: "5/25",
              address: "Москва, Кутузовский пр-т, 32",
              metro: "Кутузовская",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 204,
              title: "4-комн. кв., 120м², 20/25 этаж",
              price: 25000000,
              rooms: 4,
              area: 120,
              floor: "20/25",
              address: "Москва, Кутузовский пр-т, 32",
              metro: "Кутузовская",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 205,
              title: "Студия, 35м², 3/25 этаж",
              price: 8200000,
              rooms: 1,
              area: 35,
              floor: "3/25",
              address: "Москва, Кутузовский пр-т, 32",
              metro: "Кутузовская",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 206,
              title: "2-комн. кв., 70м², 12/25 этаж",
              price: 16800000,
              rooms: 2,
              area: 70,
              floor: "12/25",
              address: "Москва, Кутузовский пр-т, 32",
              metro: "Кутузовская",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 207,
              title: "3-комн. кв., 95м², 18/25 этаж",
              price: 21000000,
              rooms: 3,
              area: 95,
              floor: "18/25",
              address: "Москва, Кутузовский пр-т, 32",
              metro: "Кутузовская",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 208,
              title: "1-комн. кв., 50м², 8/25 этаж",
              price: 11500000,
              rooms: 1,
              area: 50,
              floor: "8/25",
              address: "Москва, Кутузовский пр-т, 32",
              metro: "Кутузовская",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 209,
              title: "Пентхаус, 150м², 25/25 этаж",
              price: 45000000,
              rooms: 4,
              area: 150,
              floor: "25/25",
              address: "Москва, Кутузовский пр-т, 32",
              metro: "Кутузовская",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 210,
              title: "2-комн. кв., 62м², 7/25 этаж",
              price: 14200000,
              rooms: 2,
              area: 62,
              floor: "7/25",
              address: "Москва, Кутузовский пр-т, 32",
              metro: "Кутузовская",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            }
          ]
        },
        '3': {
          id: 3,
          name: "ЖК «Небо»",
          price_from: 42000000,
          address: "Москва, Пресненская наб., 8",
          metro: "Деловой центр",
          description: "Небоскреб премиум-класса с панорамными видами на город. Высочайший уровень комфорта и безопасности.",
          images: [
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
          ],
          apartments: [
            {
              id: 301,
              title: "4-комн. кв., 120м², 25/40 этаж",
              price: 45000000,
              rooms: 4,
              area: 120,
              floor: "25/40",
              address: "Москва, Пресненская наб., 8",
              metro: "Деловой центр",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 302,
              title: "3-комн. кв., 95м², 30/40 этаж",
              price: 38000000,
              rooms: 3,
              area: 95,
              floor: "30/40",
              address: "Москва, Пресненская наб., 8",
              metro: "Деловой центр",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 303,
              title: "2-комн. кв., 75м², 15/40 этаж",
              price: 28000000,
              rooms: 2,
              area: 75,
              floor: "15/40",
              address: "Москва, Пресненская наб., 8",
              metro: "Деловой центр",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 304,
              title: "1-комн. кв., 55м², 10/40 этаж",
              price: 22000000,
              rooms: 1,
              area: 55,
              floor: "10/40",
              address: "Москва, Пресненская наб., 8",
              metro: "Деловой центр",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 305,
              title: "Пентхаус, 200м², 40/40 этаж",
              price: 85000000,
              rooms: 5,
              area: 200,
              floor: "40/40",
              address: "Москва, Пресненская наб., 8",
              metro: "Деловой центр",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 306,
              title: "3-комн. кв., 110м², 35/40 этаж",
              price: 42000000,
              rooms: 3,
              area: 110,
              floor: "35/40",
              address: "Москва, Пресненская наб., 8",
              metro: "Деловой центр",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 307,
              title: "2-комн. кв., 80м², 20/40 этаж",
              price: 32000000,
              rooms: 2,
              area: 80,
              floor: "20/40",
              address: "Москва, Пресненская наб., 8",
              metro: "Деловой центр",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 308,
              title: "Студия, 45м², 5/40 этаж",
              price: 18000000,
              rooms: 1,
              area: 45,
              floor: "5/40",
              address: "Москва, Пресненская наб., 8",
              metro: "Деловой центр",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 309,
              title: "4-комн. кв., 140м², 38/40 этаж",
              price: 52000000,
              rooms: 4,
              area: 140,
              floor: "38/40",
              address: "Москва, Пресненская наб., 8",
              metro: "Деловой центр",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            },
            {
              id: 310,
              title: "1-комн. кв., 60м², 12/40 этаж",
              price: 24000000,
              rooms: 1,
              area: 60,
              floor: "12/40",
              address: "Москва, Пресненская наб., 8",
              metro: "Деловой центр",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            }
          ]
        }
      };

      const complex = complexesData[complexId];

      if (complex) {
        console.log('Found complex:', complex.name);
        return {
          ok: true,
          status: 200,
          data: complex
        };
      } else {
        console.log('Complex not found, using default');
        return {
          ok: true,
          status: 200,
          data: complexesData['1']
        };
      }
    }

 // Обработка получения информации о профиле
    if (endpoint === API_CONFIG.ENDPOINTS.PROFILE.INFO) {
      console.log('Loading profile info with params:', params);

      // Проверяем авторизацию
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session='));
      if (!sessionCookie) {
        return { ok: false, status: 401, error: "Необходимо авторизоваться" };
      }

      // В реальном приложении здесь будет запрос к серверу
      // Для мока возвращаем данные текущего пользователя
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      if (params.user_id && params.user_id !== userData.id) {
        // Запрос чужого профиля - возвращаем публичные данные
        return {
          ok: true,
          status: 200,
          data: {
            id: params.user_id,
            first_name: "Пользователь",
            last_name: "Сайта",
            email: null, // скрываем email для чужих профилей
            phone: null, // скрываем телефон для чужих профилей
            photo_url: "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg",
            is_current_user: false
          }
        };
      }

      // Запрос текущего пользователя
      return {
        ok: true,
        status: 200,
        data: {
          id: userData.id || 1,
          first_name: userData.firstName || "Иван",
          last_name: userData.lastName || "Иванов",
          email: userData.email || "user@example.com",
          phone: userData.phone || "+79261234567",
          photo_url: userData.avatar || "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg",
          is_current_user: true
        }
      };
    }

    // Обработка получения списка моих объявлений
    if (endpoint === API_CONFIG.ENDPOINTS.PROFILE.MY_OFFERS) {
      console.log('Loading my offers');

      // Проверяем авторизацию
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session='));
      if (!sessionCookie) {
        return { ok: false, status: 401, error: "Необходимо авторизоваться" };
      }

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.id || 1;

      // Фильтруем объявления текущего пользователя
      const mockOffers = {
        // ... существующие mockOffers ...
        1: { id: 1, user_id: 1, /* остальные данные */ },
        2: { id: 2, user_id: 2, /* остальные данные */ },
        // ...
      };

      const userOffers = Object.values(mockOffers).filter(offer =>
        offer.user_id === userId
      ).map(offer => ({
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
        image_url: offer.images && offer.images.length > 0 ? offer.images[0] : "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
        offer_url: `https://homa.com/offers/${offer.id}`
      }));

      return {
        ok: true,
        status: 200,
        data: userOffers
      };
    }

        if (endpoint === API_CONFIG.ENDPOINTS.COMPLEXES.LIST ||
        endpoint === API_CONFIG.ENDPOINTS.COMPLEXES.NAMES) {

      const mockComplexes = [
        {
          id: 1,
          name: "ЖК «Турандот»",
          address: "Москва, улица Арбат, 24",
          metro: "Арбатская",
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Строится"
        },
        {
          id: 2,
          name: "ЖК «Девелопер»",
          address: "Москва, Кутузовский пр-т, 32",
          metro: "Кутузовская",
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Сдан"
        },
        {
          id: 3,
          name: "ЖК «Небо»",
          address: "Москва, Пресненская наб., 8",
          metro: "Деловой центр",
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Строится"
        },
        {
          id: 4,
          name: "ЖК «Цветочный»",
          address: "Москва, ул. Садовая, 15",
          metro: "Цветной бульвар",
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Сдан"
        },
        {
          id: 5,
          name: "ЖК «Речной»",
          address: "Москва, Ленинградское ш., 65",
          metro: "Речной вокзал",
          image_url: "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
          status: "Строится"
        }
      ];

      // Для эндпоинта /get_residential_complex_names возвращаем только названия
    if (endpoint === API_CONFIG.ENDPOINTS.COMPLEXES.NAMES) {
      const mockComplexNames = [
        { id: 1, name: "ЖК «Турандот»" },
        { id: 2, name: "ЖК «Девелопер»" },
        { id: 3, name: "ЖК «Небо»" },
        { id: 4, name: "ЖК «Цветочный»" },
        { id: 5, name: "ЖК «Речной»" },
        { id: 6, name: "ЖК «Парковый»" },
        { id: 7, name: "ЖК «Солнечный»" },
        { id: 8, name: "ЖК «Лесной»" },
        { id: 9, name: "ЖК «Центральный»" },
        { id: 10, name: "ЖК «Резиденция»" }
      ];

      return {
        ok: true,
        status: 200,
        data: mockComplexNames
      };
    }

      // Для /complexes возвращаем полную информацию с пагинацией
      const isMainPage = params.isMainPage || false;
      const page = params.page || 1;
      const limit = isMainPage ? 5 : (params.limit || 8);
      const offset = isMainPage ? 0 : (page - 1) * limit;

      const paginatedComplexes = isMainPage
        ? mockComplexes.slice(0, 5)
        : mockComplexes.slice(offset, offset + limit);

      return {
        ok: true,
        status: 200,
        data: {
          complexes: paginatedComplexes,
          meta: {
            total: mockComplexes.length,
            page: page,
            limit: limit,
            total_pages: Math.ceil(mockComplexes.length / limit)
          }
        }
      };
    }

    if (endpoint.startsWith(API_CONFIG.ENDPOINTS.COMPLEXES.BY_ID + '/')) {
      const complexId = endpoint.split('/').pop();

      console.log('Loading complex with ID:', complexId);

      const complexesData = {
        '1': {
          id: 1,
          name: "ЖК «Турандот»",
          address: "Москва, улица Арбат, 24",
          metro: "Арбатская",
          description: "ЖК «Турандот» — это элитный клубный дом в самом сердце старой Москвы, на престижном Арбате. Роскошная архитектура в стиле французского неоклассицизма, закрытая охраняемая территория и эксклюзивные апартаменты с индивидуальной отделкой.",
          images: [
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
          ],
          apartments: [
            {
              id: 101,
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
              id: 102,
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
        },
        '2': {
          id: 2,
          name: "ЖК «Девелопер»",
          address: "Москва, Кутузовский пр-т, 32",
          metro: "Кутузовская",
          description: "Современный жилой комплекс бизнес-класса с развитой инфраструктурой. Панорамные окна, подземный паркинг, фитнес-центр и детский сад.",
          images: [
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
          ],
          apartments: [
            {
              id: 201,
              title: "3-комн. кв., 85м², 10/25 этаж",
              price: 18500000,
              rooms: 3,
              area: 85,
              floor: "10/25",
              address: "Москва, Кутузовский пр-т, 32",
              metro: "Кутузовская",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            }
          ]
        },
        '3': {
          id: 3,
          name: "ЖК «Небо»",
          address: "Москва, Пресненская наб., 8",
          metro: "Деловой центр",
          description: "Небоскреб премиум-класса с панорамными видами на город. Высочайший уровень комфорта и безопасности.",
          images: [
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
            "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
          ],
          apartments: [
            {
              id: 301,
              title: "4-комн. кв., 120м², 25/40 этаж",
              price: 45000000,
              rooms: 4,
              area: 120,
              floor: "25/40",
              address: "Москва, Пресненская наб., 8",
              metro: "Деловой центр",
              images: [
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg",
                "http://37.139.40.252:8080/api/v1/image/default_offer.jpg"
              ]
            }
          ]
        }
      };

      const complex = complexesData[complexId];

      if (complex) {
        console.log('Found complex:', complex.name);
        return {
          ok: true,
          status: 200,
          data: complex
        };
      } else {
        console.log('Complex not found, using default');
        return {
          ok: false,
          status: 404,
          error: "ЖК не найден"
        };
      }
    }

        // Обработка получения изображения по имени файла
    if (endpoint.startsWith(API_CONFIG.ENDPOINTS.MEDIA.BY_FILENAME + '/')) {
      const filename = endpoint.split('/').pop();
      console.log('Loading image:', filename);

      // В реальном приложении здесь будет запрос к серверу
      // Для мока возвращаем успешный ответ с mock URL
      return {
        ok: true,
        status: 200,
        data: {
          url: `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.MEDIA.BY_FILENAME}/${filename}`
        }
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
            user: { id: 1, email: body.email }
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
          user: { id: Date.now(), email: body.email }
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

    // В методе post добавим обработку создания объявления
    if (endpoint === API_CONFIG.ENDPOINTS.OFFERS.CREATE) {
      console.log('Creating offer with data:', body);

      // Проверяем, заполнен ли профиль пользователя (имитация проверки)
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      if (!userData.firstName || !userData.lastName || !userData.phone) {
        return {
          ok: false,
          status: 403,
          error: "Профиль не заполнен. Пожалуйста, заполните профиль перед созданием объявления."
        };
      }

      // Валидация обязательных полей
      const requiredFields = ['offer_type', 'property_type', 'category', 'address', 'rooms', 'area', 'price'];
      const missingFields = requiredFields.filter(field => !body[field] && body[field] !== 0);

      if (missingFields.length > 0) {
        return {
          ok: false,
          status: 400,
          error: `Не заполнены обязательные поля: ${missingFields.join(', ')}`
        };
      }

      // Генерируем ID для нового объявления
      const newOfferId = Math.max(...Object.keys(mockOffers).map(Number)) + 1;

      // Создаем новое объявление в mock данных
      const newOffer = {
        id: newOfferId,
        user_id: userData.id || 1,
        location_id: 100 + newOfferId,
        category_id: body.category === 'new' ? 1 : 2,
        title: this.generateOfferTitle(body),
        description: body.description || "Описание отсутствует",
        images: body.images && body.images.length > 0 ? body.images.map(img => img.url) : ["http://37.139.40.252:8080/api/v1/image/default_offer.jpg"],
        price: body.price,
        area: body.area,
        rooms: body.rooms,
        address: body.address,
        offer_type: body.offer_type,
        property_type: body.property_type,
        category: body.category,
        floor: body.floor || 1,
        total_floors: body.total_floors || 1,
        living_area: body.living_area || null,
        kitchen_area: body.kitchen_area || null,
        metro: this.generateMetroByAddress(body.address),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_full_name: `${userData.firstName || 'Иван'} ${userData.lastName || 'Иванов'}`,
        user_phone: userData.phone || "+7 (999) 123-45-67",
        user_avatar_url: userData.avatar_url || "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg",
        rental_period: body.rental_period || null,
        deposit: body.deposit || 0,
        commission: body.commission || 0
      };

      // Добавляем в mock данные
      mockOffers[newOfferId] = newOffer;

      console.log('Created new offer:', newOffer);

      // Возвращаем ответ согласно API
      return {
        ok: true,
        status: 201,
        data: {
          url: `https://homa.com/offers/${newOfferId}`
        }
      };
    }

      // Вспомогательные методы для генерации данных
    function generateOfferTitle(offerData) {
      const typeMap = {
        sale: 'Продажа',
        rent: 'Аренда'
      };

      const propertyMap = {
        flat: 'квартиры',
        house: 'дома',
        garage: 'гаража'
      };

      const categoryMap = {
        new: 'новостройка',
        secondary: 'вторичка'
      };

      return `${typeMap[offerData.offer_type] || 'Объявление'} ${propertyMap[offerData.property_type] || 'недвижимости'}, ${categoryMap[offerData.category] || ''}`;
    }

    function generateMetroByAddress(address) {
      // Простая имитация определения метро по адресу
      const metros = ['Китай-город', 'Арбатская', 'Пушкинская', 'Охотный ряд', 'Библиотека им. Ленина'];
      return metros[Math.floor(Math.random() * metros.length)];
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

        // Обработка загрузки изображения
    if (endpoint === API_CONFIG.ENDPOINTS.MEDIA.UPLOAD) {
      console.log('Uploading image:', body);

      // Проверяем авторизацию
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session='));
      if (!sessionCookie) {
        return { ok: false, status: 401, error: "Необходимо авторизоваться" };
      }

      // Валидация данных
      if (!body || !body.file) {
        return { ok: false, status: 400, error: "Файл не предоставлен" };
      }

      // Генерируем уникальное имя файла
      const fileExtension = body.file.name.split('.').pop();
      const filename = `image_${Date.now()}.${fileExtension}`;

      // В реальном приложении здесь будет загрузка файла на сервер
      // Для мока возвращаем успешный ответ с URL
      return {
        ok: true,
        status: 201,
        data: {
          filename: filename,
          url: `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.MEDIA.BY_FILENAME}/${filename}`
        }
      };
    }

    return { ok: false, status: 404, error: "Not found" };
  },

  put: async (endpoint, body) => {
    if (endpoint.startsWith(API_CONFIG.ENDPOINTS.OFFERS.BY_ID + '/')) {
      const offerId = endpoint.split('/').pop();
      console.log('Updating offer', offerId, 'with data:', body);

      // В реальном API здесь будет обновление объявления
      return {
        ok: true,
        status: 200,
        data: {
          message: "OK",
          redirect_url: `https://homa.com/offers/${offerId}`
        }
      };
    }

// Обработка обновления профиля
    if (endpoint === API_CONFIG.ENDPOINTS.PROFILE.INFO) {
      console.log('Updating profile with data:', body);

      // Проверяем авторизацию
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session='));
      if (!sessionCookie) {
        return { ok: false, status: 401, error: "Необходимо авторизоваться" };
      }

      // Валидация данных
      const requiredFields = ['first_name', 'last_name', 'email', 'phone'];
      const missingFields = requiredFields.filter(field => !body[field]);

      if (missingFields.length > 0) {
        return {
          ok: false,
          status: 400,
          error: `Не заполнены обязательные поля: ${missingFields.join(', ')}`
        };
      }

      // Валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return {
          ok: false,
          status: 400,
          error: "Некорректный формат email"
        };
      }

      // Валидация телефона
      const phoneDigits = body.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        return {
          ok: false,
          status: 400,
          error: "Некорректный формат телефона"
        };
      }

      // Обновляем данные пользователя в localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUserData = {
        ...userData,
        id: userData.id || 1,
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email,
        phone: body.phone,
        name: `${body.first_name} ${body.last_name}`,
        avatar: body.photo_url || userData.avatar || "http://37.139.40.252:8080/api/v1/image/default_avatar.jpg"
      };

      localStorage.setItem('userData', JSON.stringify(updatedUserData));

      return {
        ok: true,
        status: 200,
        data: {
          message: "Профиль обновлен",
          profile: {
            id: updatedUserData.id,
            first_name: updatedUserData.firstName,
            last_name: updatedUserData.lastName,
            email: updatedUserData.email,
            phone: updatedUserData.phone,
            photo_url: updatedUserData.avatar
          }
        }
      };
    }

    // Обработка смены пароля
    if (endpoint === API_CONFIG.ENDPOINTS.PROFILE.SECURITY) {
      console.log('Changing password with data:', body);

      // Проверяем авторизацию
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session='));
      if (!sessionCookie) {
        return { ok: false, status: 401, error: "Необходимо авторизоваться" };
      }

      // Валидация данных
      if (!body.current_password) {
        return {
          ok: false,
          status: 400,
          error: "Текущий пароль обязателен"
        };
      }

      if (!body.new_password) {
        return {
          ok: false,
          status: 400,
          error: "Новый пароль обязателен"
        };
      }

      if (body.new_password.length < 6) {
        return {
          ok: false,
          status: 400,
          error: "Новый пароль должен содержать минимум 6 символов"
        };
      }

      if (body.new_password !== body.confirm_password) {
        return {
          ok: false,
          status: 400,
          error: "Пароли не совпадают"
        };
      }

      // Проверяем текущий пароль (в реальном приложении - проверка на сервере)
      // Для мока считаем, что текущий пароль всегда "111111"
      if (body.current_password !== "111111") {
        return {
          ok: false,
          status: 401,
          error: "Неверный текущий пароль"
        };
      }

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