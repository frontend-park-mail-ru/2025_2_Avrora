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
            images: []
        };
    }

    updateStage1(data) {
        if (data.category !== undefined) this.data.category = data.category;
        if (data.offer_type !== undefined) this.data.offer_type = data.offer_type;
        if (data.property_type !== undefined) this.data.property_type = data.property_type;
    }

    updateStage2(data) {
        if (data.address !== undefined) this.data.address = data.address;
        if (data.floor !== undefined) this.data.floor = data.floor;
        if (data.total_floors !== undefined) this.data.total_floors = data.total_floors;
    }

    updateStage3(data) {
        if (data.rooms !== undefined) this.data.rooms = data.rooms;
        if (data.area !== undefined) this.data.area = data.area;
        if (data.living_area !== undefined) this.data.living_area = data.living_area;
        if (data.kitchen_area !== undefined) this.data.kitchen_area = data.kitchen_area;
    }

    updateStage4(data) {
        if (data.price !== undefined) this.data.price = data.price;
        if (data.deposit !== undefined) this.data.deposit = data.deposit;
        if (data.commission !== undefined) this.data.commission = data.commission;
        if (data.rental_period !== undefined) this.data.rental_period = data.rental_period;
    }

    updateStage5(data) {
        if (data.description !== undefined) this.data.description = data.description;
        if (data.images !== undefined) this.data.images = data.images;
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
            images: []
        };
    }

    populateFromAPI(apiData) {
        this.data = {
            category: apiData.category || null,
            offer_type: apiData.offer_type || null,
            property_type: apiData.property_type || null,
            address: apiData.address || null,
            floor: apiData.floor || null,
            total_floors: apiData.total_floors || null,
            rooms: apiData.rooms || null,
            area: apiData.area || null,
            living_area: apiData.living_area || null,
            kitchen_area: apiData.kitchen_area || null,
            price: apiData.price || null,
            deposit: apiData.deposit || null,
            commission: apiData.commission || null,
            rental_period: apiData.rental_period || null,
            description: apiData.description || null,
            images: apiData.images || []
        };
    }
}