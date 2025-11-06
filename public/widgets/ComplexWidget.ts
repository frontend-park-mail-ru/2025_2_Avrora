import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import { MediaService } from "../utils/MediaService.ts";
import { OffersListWidget } from "./OffersListWidget.ts";

interface ComplexData {
    id?: number;
    ID?: number;
    name?: string;
    Name?: string;
    description?: string;
    Description?: string;
    address?: string;
    Address?: string;
    developer?: string;
    Developer?: string;
    year_built?: number;
    YearBuilt?: number;
    starting_price?: number;
    StartingPrice?: number;
    metro?: string;
    Metro?: string;
    images?: string[];
    ImageURLs?: string[];
    image_url?: string;
    imageURLs?: string[];
    ImageURL?: string;
}

interface OfferData {
    id?: number;
    ID?: number;
    price?: number;
    Price?: number;
    rooms?: number;
    Rooms?: number;
    area?: number;
    Area?: number;
    address?: string;
    Address?: string;
    title?: string;
    metro?: string;
    Metro?: string;
    images?: string[];
    image_url?: string;
    ImageURL?: string;
}

interface FormattedComplexData {
    id: number;
    title: string;
    price: string;
    address: string;
    metro: string;
    description: string;
    developer: string;
    yearBuilt: number;
    images: string[];
    multipleImages: boolean;
}

interface FormattedOfferData {
    id: number;
    title: string;
    price: number;
    formattedPrice: string;
    area: number;
    rooms: number;
    address: string;
    metro: string;
    images: string[];
    multipleImages: boolean;
    description: string;
}

interface EventListener {
    element: EventTarget;
    event: string;
    handler: EventListenerOrEventListenerObject;
}

export class ComplexWidget {
    parent: HTMLElement;
    state: any;
    app: any;
    complexId: number | null;
    eventListeners: EventListener[];
    isLoading: boolean;
    template: HandlebarsTemplateDelegate | null;
    currentSlide: number;
    offersWidget: OffersListWidget | null;

    constructor(parent: HTMLElement, state: any, app: any) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.complexId = null;
        this.eventListeners = [];
        this.isLoading = false;
        this.template = null;
        this.currentSlide = 0;
        this.offersWidget = null;
    }

    async loadTemplate(): Promise<HandlebarsTemplateDelegate> {
        if (this.template) return this.template;
        try {
            this.template = Handlebars.templates['Complex.hbs'];
            return this.template;
        } catch (error) {
            console.error('Failed to load template:', error);
            throw new Error('Template loading failed');
        }
    }

    async render(): Promise<void> {
        await this.renderWithParams({});
    }

    async renderWithParams(params: any = {}): Promise<void> {
        try {
            this.isLoading = true;
            this.renderLoading();

            this.complexId = params.id || null;

            if (!this.complexId) {
                throw new Error("Complex ID is required");
            }

            const complexData = await this.loadComplex();
            await this.renderContent(complexData);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error("Error rendering complex detail:", error);
            this.renderError("Не удалось загрузить информацию о ЖК");
        } finally {
            this.isLoading = false;
        }
    }

    async loadComplex(): Promise<FormattedComplexData> {

        if (!this.complexId) {
            throw new Error("Complex ID is required");
        }

        const endpoint = `${API_CONFIG.ENDPOINTS.COMPLEXES.BY_ID}/${this.complexId}`;

        const result = await API.get(endpoint);

        if (result.ok && result.data) {
            return this.formatComplexData(result.data);
        }

        if (result.status === 404) {
            throw new Error("ЖК не найден");
        }

        throw new Error(result.error || "Ошибка загрузки информации о ЖК");
    }

    formatComplexData(apiData: ComplexData): FormattedComplexData {
        const complexId = apiData.id || apiData.ID;
        const name = apiData.name || apiData.Name || "Название не указано";
        const description = apiData.description || apiData.Description || "";
        const address = apiData.address || apiData.Address || "Адрес не указан";
        const developer = apiData.developer || apiData.Developer || "";
        const yearBuilt = apiData.year_built || apiData.YearBuilt;
        const startingPrice = apiData.starting_price || apiData.StartingPrice;

        let images: string[] = [];
        if (Array.isArray(apiData.images)) {
            images = apiData.images.map(img => MediaService.getImageUrl(img));
        } else if (Array.isArray(apiData.ImageURLs)) {
            images = apiData.ImageURLs.map(img => MediaService.getImageUrl(img));
        } else if (apiData.image_url) {
            images = [MediaService.getImageUrl(apiData.image_url)];
        } else if (apiData.imageURLs) {
            images = apiData.imageURLs.map(img => MediaService.getImageUrl(img));
        } else if (apiData.ImageURL) {
            images = [MediaService.getImageUrl(apiData.ImageURL)];
        }

        if (images.length === 0) {
            images = [MediaService.getImageUrl('default_complex.jpg')];
        }

        const formatPrice = (price: number): string => {
            if (!price) return "—";
            return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
        };

        return {
            id: complexId,
            title: name,
            price: formatPrice(startingPrice),
            address: address,
            metro: apiData.metro || apiData.Metro || "Метро не указано",
            description: description,
            developer: developer,
            yearBuilt: yearBuilt,
            images: images,
            multipleImages: images.length > 1
        };
    }

    async renderContent(complexData: FormattedComplexData): Promise<void> {
        this.cleanup();

        const template = await this.loadTemplate();
        const html = template(complexData);

        const container = document.createElement('div');
        container.innerHTML = html;
        this.parent.appendChild(container.firstElementChild);

        this.initializeComplexSlider();

        await this.loadAndRenderComplexOffers();
    }

    async loadAndRenderComplexOffers(): Promise<void> {
        try {
            const offers = await this.loadComplexOffers();
            this.renderApartments(offers);
        } catch (error) {
            console.error('Error loading complex offers:', error);
            this.renderEmptyApartments();
        }
    }

    async loadComplexOffers(): Promise<FormattedOfferData[]> {
        const result = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, {
            complex_id: this.complexId
        });

        if (result.ok) {
            const responseData = result.data || result;
            let offers: OfferData[] = [];

            if (Array.isArray(responseData.Offers)) {
                offers = responseData.Offers;
            } else if (Array.isArray(responseData.offers)) {
                offers = responseData.offers;
            } else if (Array.isArray(responseData.data)) {
                offers = responseData.data;
            }

            return offers.map(offer => this.formatOfferData(offer));
        }

        throw new Error(result.error || "Ошибка загрузки объявлений ЖК");
    }

    formatOfferData(apiData: OfferData): FormattedOfferData {
        const offerId = apiData.id || apiData.ID;
        const price = apiData.price || apiData.Price || 0;
        const rooms = apiData.rooms || apiData.Rooms || 0;
        const area = apiData.area || apiData.Area || 0;
        const address = apiData.address || apiData.Address || "Адрес не указан";

        let images: string[] = [];
        if (Array.isArray(apiData.images)) {
            images = apiData.images.map(img => MediaService.getImageUrl(img));
        } else if (apiData.image_url) {
            images = [MediaService.getImageUrl(apiData.image_url)];
        } else if (apiData.ImageURL) {
            images = [MediaService.getImageUrl(apiData.ImageURL)];
        }

        if (images.length === 0) {
            images = [MediaService.getImageUrl('default_offer.jpg')];
        }

        return {
            id: offerId,
            title: apiData.title || "Без названия",
            price: price,
            formattedPrice: new Intl.NumberFormat('ru-RU').format(price),
            area: area,
            rooms: rooms,
            address: address,
            metro: apiData.metro || apiData.Metro || "Метро не указано",
            images: images,
            multipleImages: images.length > 1,
            description: `${rooms}-комн. · ${area}м²`
        };
    }

    renderApartments(offers: FormattedOfferData[]): void {
        const apartmentsContainer = this.parent.querySelector('.complex__apartments');
        if (!apartmentsContainer) return;

        if (offers.length === 0) {
            apartmentsContainer.innerHTML = '<p class="complex__empty">Нет доступных апартаментов в этом ЖК</p>';
            return;
        }

        this.offersWidget = new OffersListWidget(apartmentsContainer as HTMLElement, this.state, this.app);
        (this.offersWidget as any).renderWithOffers(offers, false);
    }

    renderEmptyApartments(): void {
        const apartmentsContainer = this.parent.querySelector('.complex__apartments');
        if (apartmentsContainer) {
            apartmentsContainer.innerHTML = '<p class="complex__empty">Нет доступных апартаментов</p>';
        }
    }

    initializeComplexSlider(): void {
        const sliderContainer = this.parent.querySelector('.complex__slider-images');
        if (!sliderContainer) return;

        const images = sliderContainer.querySelectorAll('.complex__slider-image');
        const dots = sliderContainer.querySelectorAll('.complex__slider-dot');
        const nextBtn = sliderContainer.querySelector('.complex__slider-btn_next');
        const prevBtn = sliderContainer.querySelector('.complex__slider-btn_prev');

        if (images.length <= 1) {
            if (prevBtn) (prevBtn as HTMLElement).style.display = 'none';
            if (nextBtn) (nextBtn as HTMLElement).style.display = 'none';
            if (dots.length > 0) {
                const dotsContainer = dots[0].parentElement;
                if (dotsContainer) (dotsContainer as HTMLElement).style.display = 'none';
            }
            return;
        }

        if (images.length > 0) {
            images[0].classList.add('complex__slider-image_active');
        }
        if (dots.length > 0) {
            dots[0].classList.add('complex__slider-dot_active');
        }

        if (prevBtn) {
            this.addEventListener(prevBtn, 'click', (e: Event) => {
                e.stopPropagation();
                this.showComplexSlide((this.currentSlide - 1 + images.length) % images.length);
            });
        }

        if (nextBtn) {
            this.addEventListener(nextBtn, 'click', (e: Event) => {
                e.stopPropagation();
                this.showComplexSlide((this.currentSlide + 1) % images.length);
            });
        }

        dots.forEach((dot, index) => {
            this.addEventListener(dot, 'click', (e: Event) => {
                e.stopPropagation();
                this.showComplexSlide(index);
            });
        });

        this.addEventListener(document, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                this.showComplexSlide((this.currentSlide - 1 + images.length) % images.length);
            } else if (e.key === 'ArrowRight') {
                this.showComplexSlide((this.currentSlide + 1) % images.length);
            }
        });
    }

    showComplexSlide(index: number): void {
        const sliderContainer = this.parent.querySelector('.complex__slider-images');
        if (!sliderContainer) return;

        const images = sliderContainer.querySelectorAll('.complex__slider-image');
        const dots = sliderContainer.querySelectorAll('.complex__slider-dot');

        if (!images[index] || !dots[index] || index === this.currentSlide) return;

        if (images[this.currentSlide]) {
            images[this.currentSlide].classList.remove('complex__slider-image_active');
        }
        if (dots[this.currentSlide]) {
            dots[this.currentSlide].classList.remove('complex__slider-dot_active');
        }

        if (images[index]) {
            images[index].classList.add('complex__slider-image_active');
        }
        if (dots[index]) {
            dots[index].classList.add('complex__slider-dot_active');
        }

        this.currentSlide = index;
    }

    renderLoading(): void {
        this.cleanup();

        const loadingDiv = document.createElement("div");
        loadingDiv.className = "complex__loading";
        loadingDiv.textContent = "Загрузка информации о ЖК...";
        this.parent.appendChild(loadingDiv);
    }

    renderError(message: string): void {
        this.cleanup();

        const errorDiv = document.createElement("div");
        errorDiv.className = "complex__error";

        const errorText = document.createElement("p");
        errorText.textContent = message;
        errorDiv.appendChild(errorText);

        const retryButton = document.createElement("button");
        retryButton.textContent = "Попробовать снова";
        retryButton.className = "complex__retry-btn";
        retryButton.addEventListener("click", () => this.renderWithParams({ id: this.complexId }));
        errorDiv.appendChild(retryButton);

        this.parent.appendChild(errorDiv);
    }

    addEventListener(element: EventTarget, event: string, handler: EventListenerOrEventListenerObject): void {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    removeEventListeners(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }

    cleanup(): void {
        this.removeEventListeners();
        
        if (this.offersWidget) {
            this.offersWidget.cleanup();
            this.offersWidget = null;
        }
        
        this.parent.innerHTML = "";
        this.currentSlide = 0;
    }
}