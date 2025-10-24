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
            if (offersResult.ok && offersResult.data.offers.length > 0) {
                this.offerId = offersResult.data.offers[0].id;
            } else {
                throw new Error("No offers available");
            }
        }

        const endpoint = `${API_CONFIG.ENDPOINTS.OFFERS.BY_ID}/${this.offerId}`;
        const result = await API.get(endpoint);
        
        if (result.ok && result.data) {
            return this.formatOffer(result.data);
        }
        throw new Error(result.error || "Ошибка загрузки объявления");
    }

    formatOffer(apiData) {
        return {
            id: apiData.id,
            title: apiData.title,
            infoDesc: this.generateInfoDesc(apiData),
            metro: apiData.metro,
            address: apiData.address,
            price: this.formatPrice(apiData.price),
            userName: apiData.user_full_name,
            description: apiData.description,
            images: Array.isArray(apiData.images) ? apiData.images : 
                   (apiData.image_url ? [apiData.image_url] : []),
            characteristics: this.getCharacteristics(apiData),
            offerType: apiData.offer_type,
            deposit: apiData.deposit || 0,
            commission: apiData.commission || 0,
            rentalPeriod: this.formatRentalPeriod(apiData.rental_period),
            userId: apiData.user_id,
            userPhone: apiData.user_phone || "+7 XXX XXX-XX-XX"
        };
    }

    generateInfoDesc(apiData) {
        const type = apiData.offer_type === 'sale' ? 'Продажа' : 'Аренда';
        const property = this.getPropertyTypeText(apiData.property_type);
        const category = apiData.category === 'new' ? 'новостройка' : 'вторичка';
        return `${type} ${property}, ${category}`;
    }

    getPropertyTypeText(propertyType) {
        const types = {
            'flat': 'квартиры',
            'house': 'дома',
            'commercial': 'коммерческой недвижимости'
        };
        return types[propertyType] || 'недвижимости';
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
            { title: 'Общая площадь', value: `${apiData.area || '—'} м²`, icon: 'area' },
            { title: 'Жилая площадь', value: `${apiData.living_area || '—'} м²`, icon: 'living' },
            { title: 'Площадь кухни', value: `${apiData.kitchen_area || '—'} м²`, icon: 'kitchen' },
            { title: 'Этаж', value: `${apiData.floor || '—'}/${apiData.total_floors || '—'}`, icon: 'floor' },
            { title: 'Комнат', value: apiData.rooms || '—', icon: 'rooms' },
            { title: 'Тип', value: this.getPropertyTypeDisplay(apiData.property_type), icon: 'type' }
        ];
    }

    getPropertyTypeDisplay(propertyType) {
        const types = {
            'flat': 'Квартира',
            'house': 'Дом',
            'commercial': 'Коммерческая'
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