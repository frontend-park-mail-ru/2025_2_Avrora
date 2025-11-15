import { OfferCard } from "../components/Offer/OfferCard/OfferCard.ts";

export class OfferWidget {
    private parent: HTMLElement;
    private controller: any;
    private offerId: number | null;
    private eventListeners: Array<{element: HTMLElement, event: string, handler: EventListenerOrEventListenerObject}>;
    private isLoading: boolean;
    private offerCard: OfferCard | null;

    constructor(parent: HTMLElement, controller: any) {
        this.parent = parent;
        this.controller = controller;
        this.offerId = null;
        this.eventListeners = [];
        this.isLoading = false;
        this.offerCard = null;
    }

    async renderWithParams(params: any = {}): Promise<void> {
        try {
            this.isLoading = true;
            this.renderLoading();

            this.offerId = params.id || null;
            if (!this.offerId) {
                throw new Error("Offer ID is required");
            }

            const offerData = await this.loadOffer();
            await this.renderContent(offerData);
        } catch (error) {
            console.error("Error rendering offer:", error);
            this.renderError("Не удалось загрузить объявление");
        } finally {
            this.isLoading = false;
        }
    }

    async loadOffer(): Promise<any> {
        if (!this.offerId) {
            throw new Error("No offer ID provided");
        }

        const result = await this.controller.loadOffer(this.offerId);
        if (result.ok && result.data) {
            const sellerData = await this.controller.loadSellerData(result.data.user_id || result.data.UserID);
            return this.formatOffer(result.data, sellerData);
        }
        throw new Error(result.error || "Ошибка загрузки объявления");
    }

    formatOffer(apiData: any, sellerData: any): any {
        const offerId = apiData.id || apiData.ID;
        const userId = apiData.user_id || apiData.UserID;
        const price = apiData.price || apiData.Price;
        const area = apiData.area || apiData.Area;
        const rooms = apiData.rooms || apiData.Rooms;
        const floor = apiData.floor || apiData.Floor;
        const totalFloors = apiData.total_floors || apiData.TotalFloors;
        const address = apiData.address || apiData.Address;
        const offerType = apiData.offer_type || apiData.OfferType;
        const propertyType = apiData.property_type || apiData.PropertyType;
        const livingArea = apiData.living_area || apiData.LivingArea;
        const kitchenArea = apiData.kitchen_area || apiData.KitchenArea;
        const description = apiData.description || apiData.Description;
        const title = apiData.title || apiData.Title;

        const images = this.controller.getOfferImages(apiData);
        const sellerInfo = this.controller.getSellerInfo(sellerData);

        return {
            id: offerId,
            title: title || "Без названия",
            infoDesc: this.generateInfoDesc(offerType, propertyType),
            metro: this.extractMetroFromAddress(address),
            address: address || "Адрес не указан",
            price: this.formatPrice(price),
            userName: sellerInfo.name,
            userPhone: sellerInfo.phone,
            userAvatar: sellerInfo.avatar,
            description: description || "Описание отсутствует",
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
            showOwnerActions: this.controller.isOfferOwner(apiData),
            showContactBtn: !this.controller.isOfferOwner(apiData),
            showPhone: this.controller.isOfferOwner(apiData)
        };
    }

    generateInfoDesc(offerType: string, propertyType: string): string {
        const type = offerType === 'sale' ? 'Продажа' : 'Аренда';
        const property = this.getPropertyTypeText(propertyType);
        return `${type} ${property}`;
    }

    getPropertyTypeText(propertyType: string): string {
        const types: {[key: string]: string} = {
            'apartment': 'квартиры',
            'house': 'дома',
            'flat': 'квартиры',
            'room': 'комнаты'
        };
        return types[propertyType] || 'недвижимости';
    }

    extractMetroFromAddress(address: string): string {
        if (!address) return "Метро не указано";
        
        if (address.includes('Москва') || address.includes('Moscow')) {
            return "Ближайшее метро";
        }
        return "Метро не указано";
    }

    formatPrice(price: number): string {
        if (!price) return "Цена не указана";
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0
        }).format(price);
    }

    formatRentalPeriod(period: string): string {
        if (!period) return "";
        const periodMap: {[key: string]: string} = {
            'monthly': 'ежемесячно',
            'yearly': 'ежегодно',
            'daily': 'ежедневно',
            'weekly': 'еженедельно'
        };
        return periodMap[period] || period;
    }

    getCharacteristics(apiData: any): any[] {
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
                value: apiData.rooms || '—',
                icon: 'rooms'
            },
            {
                title: 'Тип недвижимости',
                value: this.getPropertyTypeDisplay(apiData.propertyType),
                icon: 'type'
            }
        ];
    }

    getPropertyTypeDisplay(propertyType: string): string {
        const types: {[key: string]: string} = {
            'apartment': 'Квартира',
            'house': 'Дом',
            'flat': 'Квартира',
            'room': 'Комната'
        };
        return types[propertyType] || 'Не указано';
    }

    renderLoading(): void {
        this.cleanup();
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "loading";
        loadingDiv.textContent = "Загрузка объявления...";
        this.parent.appendChild(loadingDiv);
    }

    async renderContent(offerData: any): Promise<void> {
        this.cleanup();
        
        if (!offerData) {
            this.renderError("Данные объявления не получены");
            return;
        }

        try {
            this.offerCard = new OfferCard(offerData, this.controller);
            const element = await this.offerCard.render();
            if (element) {
                this.parent.appendChild(element);
            } else {
                throw new Error("Failed to render offer card");
            }
        } catch (error) {
            console.error("Error rendering offer content:", error);
            this.renderError("Ошибка при отображении объявления");
        }
    }

    renderError(message: string): void {
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
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.parent.innerHTML = "";
        this.offerCard = null;
    }
}