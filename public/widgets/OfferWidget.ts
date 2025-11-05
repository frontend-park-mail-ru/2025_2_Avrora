import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import { MediaService } from "../utils/MediaService.ts";
import { ProfileService } from "../utils/ProfileService.ts";
import { OfferCard } from "../components/Offer/OfferCard/OfferCard.ts";
import { Modal } from '../components/OfferCreate/Modal/Modal.ts';

interface OfferWidgetParams {
    id?: string | number;
}

interface OfferData {
    id?: string | number;
    ID?: string | number;
    user_id?: string | number;
    UserID?: string | number;
    price?: number;
    Price?: number;
    area?: number;
    Area?: number;
    rooms?: number;
    Rooms?: number;
    floor?: number;
    Floor?: number;
    total_floors?: number;
    TotalFloors?: number;
    address?: string;
    Address?: string;
    offer_type?: string;
    OfferType?: string;
    property_type?: string;
    PropertyType?: string;
    living_area?: number;
    LivingArea?: number;
    kitchen_area?: number;
    KitchenArea?: number;
    description?: string;
    Description?: string;
    title?: string;
    Title?: string;
    images?: string[];
    ImageURLs?: string[];
    image_url?: string;
    ImageURL?: string;
    deposit?: number;
    Deposit?: number;
    commission?: number;
    Commission?: number;
    rental_period?: string;
    RentalPeriod?: string;
    [key: string]: any;
}

interface SellerData {
    first_name?: string;
    last_name?: string;
    phone?: string;
    photo_url?: string;
    [key: string]: any;
}

interface FormattedOffer {
    id: string | number;
    title: string;
    infoDesc: string;
    metro: string;
    address: string;
    price: string;
    userName: string;
    userPhone: string;
    userAvatar: string;
    description: string;
    images: string[];
    characteristics: Array<{
        title: string;
        value: string;
        icon: string;
    }>;
    offerType?: string;
    deposit?: number;
    commission?: number;
    rentalPeriod: string;
    userId?: string | number;
    showOwnerActions: boolean;
    showContactBtn: boolean;
    showPhone: boolean;
}

interface EventListener {
    element: EventTarget;
    event: string;
    handler: EventListenerOrEventListenerObject;
}

export class OfferWidget {
    private parent: HTMLElement;
    private state: any;
    private app: any;
    private offerId: string | number | null;
    private eventListeners: EventListener[];
    private isLoading: boolean;
    private offerCard: OfferCard | null;

    constructor(parent: HTMLElement, state: any, app: any) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.offerId = null;
        this.eventListeners = [];
        this.isLoading = false;
        this.offerCard = null;
    }

    async render(): Promise<void> {
        await this.renderWithParams({});
    }

    async renderWithParams(params: OfferWidgetParams = {}): Promise<void> {
        try {
            this.isLoading = true;
            this.renderLoading();

            this.offerId = params.id || null;
            const offerData = await this.loadOffer();
            await this.renderContent(offerData);
        } catch (error) {
            console.error("Error rendering offer:", error);
            this.renderError("Не удалось загрузить объявление");
        } finally {
            this.isLoading = false;
        }
    }

    private async loadOffer(): Promise<FormattedOffer> {
        if (!this.offerId) {
            const offersResult = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST);
            if (offersResult.ok && offersResult.data.offers && offersResult.data.offers.length > 0) {
                this.offerId = offersResult.data.offers[0].id || offersResult.data.offers[0].ID;
            } else {
                throw new Error("No offers available");
            }
        }

        const endpoint = `${API_CONFIG.ENDPOINTS.OFFERS.LIST}/${this.offerId}`;
        const result = await API.get(endpoint);

        if (result.ok && result.data) {
            const sellerData = await this.loadSellerData(result.data.user_id || result.data.UserID);
            return this.formatOffer(result.data, sellerData);
        }
        throw new Error(result.error || "Ошибка загрузки объявления");
    }

    private async loadSellerData(userId: string | number | undefined): Promise<SellerData | null> {
        if (!userId) {
            console.warn('No user ID provided for seller data');
            return null;
        }

        try {
            const sellerProfile = await ProfileService.getProfile(userId);
            console.log('Loaded seller profile:', sellerProfile);
            return sellerProfile;
        } catch (error) {
            console.error('Error loading seller profile:', error);
            return null;
        }
    }

    private formatOffer(apiData: OfferData, sellerData: SellerData | null): FormattedOffer {
        const offerId = apiData.id || apiData.ID || '';
        const userId = apiData.user_id || apiData.UserID;
        const price = apiData.price || apiData.Price;
        const area = apiData.area || apiData.Area;
        const rooms = apiData.rooms || apiData.Rooms;
        const floor = apiData.floor || apiData.Floor;
        const totalFloors = apiData.total_floors || apiData.TotalFloors;
        const address = apiData.address || apiData.Address || '';
        const offerType = apiData.offer_type || apiData.OfferType;
        const propertyType = apiData.property_type || apiData.PropertyType;
        const livingArea = apiData.living_area || apiData.LivingArea;
        const kitchenArea = apiData.kitchen_area || apiData.KitchenArea;
        const description = apiData.description || apiData.Description || '';
        const title = apiData.title || apiData.Title || '';

        let images: string[] = [];
        if (Array.isArray(apiData.images)) {
            images = apiData.images.map(img => MediaService.getImageUrl(img));
        } else if (Array.isArray(apiData.ImageURLs)) {
            images = apiData.ImageURLs.map(img => MediaService.getImageUrl(img));
        } else if (apiData.image_url) {
            images = [MediaService.getImageUrl(apiData.image_url)];
        } else if (apiData.ImageURL) {
            images = [MediaService.getImageUrl(apiData.ImageURL)];
        }

        if (images.length === 0) {
            images = [MediaService.getImageUrl('default_offer.jpg')];
        }

        const sellerName = sellerData ?
            `${sellerData.first_name || ''} ${sellerData.last_name || ''}`.trim() || "Продавец" :
            "Продавец";

        const sellerPhone = sellerData ?
            (sellerData.phone || "+7 XXX XXX-XX-XX") :
            "+7 XXX XXX-XX-XX";

        const sellerAvatar = sellerData && sellerData.photo_url ?
            MediaService.getImageUrl(sellerData.photo_url) :
            MediaService.getImageUrl('user.png');

        return {
            id: offerId,
            title: title,
            infoDesc: this.generateInfoDesc(offerType, propertyType),
            metro: this.extractMetroFromAddress(address),
            address: address,
            price: this.formatPrice(price),
            userName: sellerName,
            userPhone: sellerPhone,
            userAvatar: sellerAvatar,
            description: description,
            images: images,
            characteristics: this.getCharacteristics({
                area: area,
                livingArea: livingArea,
                kitchenArea: kitchenArea,
                propertyType: propertyType,
                floor: floor,
                totalFloors: totalFloors,
                rooms: rooms
            }),
            offerType: offerType,
            deposit: apiData.deposit || apiData.Deposit || 0,
            commission: apiData.commission || apiData.Commission || 0,
            rentalPeriod: this.formatRentalPeriod(apiData.rental_period || apiData.RentalPeriod),
            userId: userId,
            showOwnerActions: this.state.user && this.state.user.id === userId,
            showContactBtn: !(this.state.user && this.state.user.id === userId),
            showPhone: this.state.user && this.state.user.id === userId
        };
    }

    private generateInfoDesc(offerType: string | undefined, propertyType: string | undefined): string {
        const type = offerType === 'sale' ? 'Продажа' : 'Аренда';
        const property = this.getPropertyTypeText(propertyType);
        return `${type} ${property}`;
    }

    private getPropertyTypeText(propertyType: string | undefined): string {
        const types: Record<string, string> = {
            'apartment': 'квартиры',
            'house': 'дома',
            'flat': 'квартиры'
        };
        return types[propertyType || ''] || 'недвижимости';
    }

    private extractMetroFromAddress(address: string): string {
        if (address.includes('Москва') || address.includes('Moscow')) {
            return "Ближайшее метро";
        }
        return "Метро не указано";
    }

    private formatPrice(price: number | undefined): string {
        if (!price) return "Цена не указана";
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0
        }).format(price);
    }

    private formatRentalPeriod(period: string | undefined): string {
        if (!period) return "";

        const periodMap: Record<string, string> = {
            'monthly': 'ежемесячно',
            'yearly': 'ежегодно',
            'daily': 'ежедневно',
            'weekly': 'еженедельно'
        };
        return periodMap[period] || period;
    }

    private getCharacteristics(apiData: {
        area?: number;
        livingArea?: number;
        kitchenArea?: number;
        propertyType?: string;
        floor?: number;
        totalFloors?: number;
        rooms?: number;
    }): Array<{ title: string; value: string; icon: string }> {
        return [
            {
                title: 'Общая площадь',
                value: `${apiData.area || '—'} м²`,
                icon: 'area'
            },
            {
                title: 'Жилая площадь',
                value: `${apiData.livingArea || '—'} м²`,
                icon: 'living'
            },
            {
                title: 'Площадь кухни',
                value: `${apiData.kitchenArea || '—'} м²`,
                icon: 'kitchen'
            },
            {
                title: 'Этаж',
                value: `${apiData.floor || '—'}/${apiData.totalFloors || '—'}`,
                icon: 'floor'
            },
            {
                title: 'Количество комнат',
                value: apiData.rooms?.toString() || '—',
                icon: 'rooms'
            },
            {
                title: 'Тип недвижимости',
                value: this.getPropertyTypeDisplay(apiData.propertyType),
                icon: 'type'
            }
        ];
    }

    private getPropertyTypeDisplay(propertyType: string | undefined): string {
        const types: Record<string, string> = {
            'apartment': 'Квартира',
            'house': 'Дом',
            'flat': 'Квартира'
        };
        return types[propertyType || ''] || 'Не указано';
    }

    private renderLoading(): void {
        this.cleanup();
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "loading";
        loadingDiv.textContent = "Загрузка объявления...";
        this.parent.appendChild(loadingDiv);
    }

    private async renderContent(offerData: FormattedOffer): Promise<void> {
        this.cleanup();
        this.offerCard = new OfferCard(offerData, this.state, this.app);
        const element = await this.offerCard.render();
        this.parent.appendChild(element);
    }

    private renderError(message: string): void {
        this.cleanup();

        const errorDiv = document.createElement("div");
        errorDiv.className = "error-state";

        const errorText = document.createElement("p");
        errorText.textContent = message;
        errorDiv.appendChild(errorText);

        const retryButton = document.createElement("button");
        retryButton.textContent = "Попробовать снова";
        retryButton.className = "retry-button";
        retryButton.addEventListener("click", () => this.renderWithParams({ id: this.offerId }));
        errorDiv.appendChild(retryButton);

        this.parent.appendChild(errorDiv);
    }

    cleanup(): void {
        this.removeEventListeners();
        this.parent.innerHTML = "";
        this.offerCard = null;
    }

    private removeEventListeners(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
}