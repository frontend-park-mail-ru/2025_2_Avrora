interface OfferData {
    category: string | null;
    offer_type: string | null;
    property_type: string | null;
    address: string | null;
    floor: number | null;
    total_floors: number | null;
    rooms: number | null;
    area: number | null;
    living_area: number | null;
    kitchen_area: number | null;
    price: number | null;
    deposit: number | null;
    commission: number | null;
    rental_period: string | null;
    description: string | null;
    images: ImageData[];
    status: string;
    in_housing_complex: boolean;
    housing_complex: string | null;
    complex_status: string | null;
    complex_name: string | null;
}

interface ImageData {
    filename: string;
    url: string;
}

interface Stage1Data {
    category?: string | null;
    offer_type?: string | null;
    property_type?: string | null;
}

interface Stage2Data {
    address?: string | null;
    floor?: number | null;
    total_floors?: number | null;
    in_housing_complex?: boolean;
    housing_complex?: string | null;
    complex_status?: string | null;
    complex_name?: string | null;
}

interface Stage3Data {
    rooms?: number | string | null;
    area?: number | null;
    living_area?: number | null;
    kitchen_area?: number | null;
}

interface Stage4Data {
    price?: number | null;
    deposit?: number | null;
    commission?: number | null;
    rental_period?: string | null;
}

interface Stage5Data {
    description?: string | null;
    images?: ImageData[];
}

interface APIOfferData {
    category?: string;
    offer_type?: string;
    OfferType?: string;
    property_type?: string;
    PropertyType?: string;
    address?: string;
    Address?: string;
    floor?: number | string;
    Floor?: number | string;
    total_floors?: number | string;
    TotalFloors?: number | string;
    rooms?: number | string;
    Rooms?: number | string;
    area?: number | string;
    Area?: number | string;
    living_area?: number | string;
    LivingArea?: number | string;
    kitchen_area?: number | string;
    KitchenArea?: number | string;
    price?: number | string;
    Price?: number | string;
    deposit?: number | string;
    Deposit?: number | string;
    commission?: number | string;
    Commission?: number | string;
    rental_period?: string;
    RentalPeriod?: string;
    description?: string;
    Description?: string;
    images?: any[];
    image_urls?: any[];
    ImageURLs?: any[];
    status?: string;
    in_housing_complex?: boolean;
    housing_complex?: string;
}

export class OfferCreateDataManager {
    private data: OfferData;

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
            status: 'active',
            in_housing_complex: false,
            housing_complex: null,
            complex_status: null,
            complex_name: null
        };
    }

    updateStage1(data: Stage1Data): void {
        if (data.category !== undefined) this.data.category = data.category;
        if (data.offer_type !== undefined) this.data.offer_type = data.offer_type;
        if (data.property_type !== undefined) this.data.property_type = data.property_type;
    }

    updateStage2(data: Stage2Data): void {
        if (data.address !== undefined) this.data.address = data.address;
        if (data.floor !== undefined) this.data.floor = this.normalizeNumber(data.floor);
        if (data.total_floors !== undefined) this.data.total_floors = this.normalizeNumber(data.total_floors);

        if (data.complex_status !== undefined) {
            this.data.complex_status = data.complex_status;
            this.data.in_housing_complex = data.complex_status === 'yes';
        }

        if (data.in_housing_complex !== undefined) {
            this.data.in_housing_complex = data.in_housing_complex;
            this.data.complex_status = data.in_housing_complex ? 'yes' : 'no';
        }

        if (data.complex_name !== undefined) {
            this.data.complex_name = data.complex_name;
            if (this.data.in_housing_complex && data.complex_name) {
                this.data.housing_complex = data.complex_name;
            }
        }

        if (data.housing_complex !== undefined) {
            this.data.housing_complex = data.housing_complex;
            if (this.data.in_housing_complex && data.housing_complex) {
                this.data.complex_name = data.housing_complex;
            }
        }

        if (!this.data.in_housing_complex) {
            this.data.housing_complex = null;
            this.data.complex_name = null;
        }
    }

    updateStage3(data: Stage3Data): void {
        if (data.rooms !== undefined) {
            this.data.rooms = this.normalizeNumber(data.rooms);
        }
        if (data.area !== undefined) this.data.area = this.normalizeNumber(data.area);
        if (data.living_area !== undefined) this.data.living_area = this.normalizeNumber(data.living_area);
        if (data.kitchen_area !== undefined) this.data.kitchen_area = this.normalizeNumber(data.kitchen_area);
    }

    updateStage4(data: Stage4Data): void {
        if (data.price !== undefined) this.data.price = this.normalizeNumber(data.price);
        if (data.deposit !== undefined) this.data.deposit = this.normalizeNumber(data.deposit);
        if (data.commission !== undefined) this.data.commission = this.normalizeNumber(data.commission);
        if (data.rental_period !== undefined) this.data.rental_period = data.rental_period;
    }

    updateStage5(data: Stage5Data): void {
        if (data.description !== undefined) this.data.description = data.description;
        if (data.images !== undefined) this.data.images = data.images;
    }

    getData(): OfferData {
        return { ...this.data };
    }

    clear(): void {
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
            status: 'active',
            in_housing_complex: false,
            housing_complex: null,
            complex_status: null,
            complex_name: null
        };
    }

    populateFromAPI(apiData: APIOfferData): void {
        const inHousingComplex = apiData.in_housing_complex || false;
        const housingComplex = apiData.housing_complex || null;

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
            status: apiData.status || 'active',
            in_housing_complex: inHousingComplex,
            housing_complex: housingComplex,
            complex_status: inHousingComplex ? 'yes' : 'no',
            complex_name: housingComplex
        };
    }

    private normalizeNumber(value1: number | string | undefined | null, value2?: number | string | undefined | null): number | null {
        let value = value1 !== undefined ? value1 : value2;

        if (value === undefined || value === null) {
            return null;
        }

        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? null : parsed;
        }

        return value;
    }

    private normalizeImages(images: any[]): ImageData[] {
        if (!Array.isArray(images)) return [];

        return images.map(img => {
            if (typeof img === 'string') {
                return {
                    filename: img,
                    url: img
                };
            }
            return {
                filename: img.filename || img.url || '',
                url: img.url || img.filename || ''
            };
        }).filter(img => img.filename && img.filename.trim() !== '');
    }
}