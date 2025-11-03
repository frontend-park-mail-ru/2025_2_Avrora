import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import { OfferCard } from "../components/Offer/OfferCard/OfferCard.js";

export class OfferWidget {
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.offerId = null;
        this.eventListeners = [];
        this.isLoading = false;
        this.offerCard = null;
    }

    async render() {
        await this.renderWithParams({});
    }

    async renderWithParams(params = {}) {
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

    async loadOffer() {
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
            return this.formatOffer(result.data);
        }
        throw new Error(result.error || "Ошибка загрузки объявления");
    }

    formatOffer(apiData) {
        // Обрабатываем разные форматы полей от бэкенда
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

        // Обрабатываем изображения
        let images = [];
        if (Array.isArray(apiData.images)) {
            images = apiData.images;
        } else if (Array.isArray(apiData.ImageURLs)) {
            images = apiData.ImageURLs;
        } else if (apiData.image_url) {
            images = [apiData.image_url];
        }

        return {
            id: offerId,
            title: title,
            infoDesc: this.generateInfoDesc(offerType, propertyType),
            metro: this.extractMetroFromAddress(address),
            address: address,
            price: this.formatPrice(price),
            userName: "Продавец", // Временное значение, пока бэкенд не отдает информацию о пользователе
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
            deposit: apiData.deposit || 0,
            commission: apiData.commission || 0,
            rentalPeriod: this.formatRentalPeriod(apiData.rental_period || apiData.RentalPeriod),
            userId: userId,
            userPhone: "+7 XXX XXX-XX-XX" // Временное значение
        };
    }

    generateInfoDesc(offerType, propertyType) {
        const type = offerType === 'sale' ? 'Продажа' : 'Аренда';
        const property = this.getPropertyTypeText(propertyType);
        return `${type} ${property}`;
    }

    getPropertyTypeText(propertyType) {
        const types = {
            'apartment': 'квартиры',
            'house': 'дома',
            'flat': 'квартиры'
        };
        return types[propertyType] || 'недвижимости';
    }

    extractMetroFromAddress(address) {
        // Простая эвристика для извлечения метро из адреса
        // В реальном приложении это должно приходить с бэкенда
        if (address.includes('Москва') || address.includes('Moscow')) {
            return "Ближайшее метро";
        }
        return "Метро не указано";
    }

    formatPrice(price) {
        if (!price) return "Цена не указана";
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0
        }).format(price);
    }

    formatRentalPeriod(period) {
        if (!period) return "";

        const periodMap = {
            'monthly': 'ежемесячно',
            'yearly': 'ежегодно',
            'daily': 'ежедневно',
            'weekly': 'еженедельно'
        };
        return periodMap[period] || period;
    }

    getCharacteristics(apiData) {
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

    getPropertyTypeDisplay(propertyType) {
        const types = {
            'apartment': 'Квартира',
            'house': 'Дом',
            'flat': 'Квартира'
        };
        return types[propertyType] || 'Не указано';
    }

    renderLoading() {
        this.cleanup();
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "loading";
        loadingDiv.textContent = "Загрузка объявления...";
        this.parent.appendChild(loadingDiv);
    }

    async renderContent(offerData) {
        this.cleanup();
        this.offerCard = new OfferCard(offerData, this.state, this.app);
        const element = await this.offerCard.render();
        this.parent.appendChild(element);
    }

    renderError(message) {
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

    cleanup() {
        this.removeEventListeners();
        this.parent.innerHTML = "";
        this.offerCard = null;
    }

    removeEventListeners() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
}