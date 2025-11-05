// OfferCreateDataManager.js
export class OfferCreateDataManager {
    constructor() {
        this.data = {
            category: null,
            offer_type: null,
            property_type: null,

            address: null,
            floor: null,
            total_floors: null,

            rooms: null,
            area: null,
            living_area: null,
            kitchen_area: null,

            price: null,
            deposit: null,
            commission: null,
            rental_period: null,

            description: null,
            images: [],
            status: 'active' // Добавляем статус по умолчанию
        };
    }

    updateStage1(data) {
        if (data.category !== undefined) this.data.category = data.category;
        if (data.offer_type !== undefined) this.data.offer_type = data.offer_type;
        if (data.property_type !== undefined) this.data.property_type = data.property_type;

        console.log('Stage 1 updated:', this.data);
    }

    updateStage2(data) {
        if (data.address !== undefined) this.data.address = data.address;
        if (data.floor !== undefined) this.data.floor = data.floor;
        if (data.total_floors !== undefined) this.data.total_floors = data.total_floors;

        console.log('Stage 2 updated:', this.data);
    }

    updateStage3(data) {
        if (data.rooms !== undefined) this.data.rooms = data.rooms;
        if (data.area !== undefined) this.data.area = data.area;
        if (data.living_area !== undefined) this.data.living_area = data.living_area;
        if (data.kitchen_area !== undefined) this.data.kitchen_area = data.kitchen_area;

        console.log('Stage 3 updated:', this.data);
    }

    updateStage4(data) {
        if (data.price !== undefined) this.data.price = data.price;
        if (data.deposit !== undefined) this.data.deposit = data.deposit;
        if (data.commission !== undefined) this.data.commission = data.commission;
        if (data.rental_period !== undefined) this.data.rental_period = data.rental_period;

        console.log('Stage 4 updated:', this.data);
    }

    updateStage5(data) {
        if (data.description !== undefined) this.data.description = data.description;
        if (data.images !== undefined) this.data.images = data.images;

        console.log('Stage 5 updated:', this.data);
    }

    getData() {
        return { ...this.data };
    }

    clear() {
        this.data = {
            category: null,
            offer_type: null,
            property_type: null,
            address: null,
            floor: null,
            total_floors: null,
            rooms: null,
            area: null,
            living_area: null,
            kitchen_area: null,
            price: null,
            deposit: null,
            commission: null,
            rental_period: null,
            description: null,
            images: [],
            status: 'active' // Добавляем статус при очистке
        };
    }

    populateFromAPI(apiData) {
        console.log('Populating from API data:', apiData);

        // Преобразуем данные из API в формат фронтенда
        this.data = {
            category: apiData.category || 'secondary',
            offer_type: apiData.offer_type || apiData.OfferType || 'sale',
            property_type: apiData.property_type || apiData.PropertyType || 'apartment',
            address: apiData.address || apiData.Address || null,
            floor: this.normalizeNumber(apiData.floor, apiData.Floor),
            total_floors: this.normalizeNumber(apiData.total_floors, apiData.TotalFloors),
            rooms: this.normalizeNumber(apiData.rooms, apiData.Rooms),
            area: this.normalizeNumber(apiData.area, apiData.Area),
            living_area: this.normalizeNumber(apiData.living_area, apiData.LivingArea),
            kitchen_area: this.normalizeNumber(apiData.kitchen_area, apiData.KitchenArea),
            price: this.normalizeNumber(apiData.price, apiData.Price),
            deposit: this.normalizeNumber(apiData.deposit, apiData.Deposit),
            commission: this.normalizeNumber(apiData.commission, apiData.Commission),
            rental_period: apiData.rental_period || apiData.RentalPeriod || null,
            description: apiData.description || apiData.Description || null,
            images: this.normalizeImages(apiData.images || apiData.image_urls || apiData.ImageURLs || []),
            status: apiData.status || 'active' // Всегда устанавливаем статус
        };

        console.log('Data populated from API:', this.data);
    }

    normalizeNumber(value1, value2) {
        if (value1 !== undefined && value1 !== null) return Number(value1);
        if (value2 !== undefined && value2 !== null) return Number(value2);
        return null;
    }

    normalizeImages(images) {
        if (!Array.isArray(images)) return [];

        return images.map(img => {
            if (typeof img === 'string') {
                return {
                    filename: img,
                    url: img
                };
            }
            return {
                filename: img.filename || img.url,
                url: img.url || img.filename
            };
        });
    }
}