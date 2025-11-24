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
    housing_complex_id?: number;
    HousingComplexID?: number;
    complex_id?: number;
    ComplexID?: number;
    housing_complex_name?: string;
    HousingComplexName?: string;
    complex_name?: string;
    ComplexName?: string;
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
    controller: any;
    complexId: number | null;
    complexData: FormattedComplexData | null;
    eventListeners: EventListener[];
    isLoading: boolean;
    template: HandlebarsTemplateDelegate | null;
    currentSlide: number;
    offersWidget: OffersListWidget | null;

    constructor(parent: HTMLElement, controller: any) {
        this.parent = parent;
        this.controller = controller;
        this.complexId = null;
        this.complexData = null;
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
            this.complexData = complexData;
            await this.renderContent(complexData);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
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
            this.renderEmptyApartments();
        }
    }

    async loadComplexOffers(): Promise<FormattedOfferData[]> {
        if (!this.complexId) {
            return [];
        }

        try {
            const result = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, { limit: 10 });

            if (!result.ok) {
                throw new Error(result.error || "Ошибка загрузки объявлений");
            }

            const responseData = result.data || result;
            let offers: OfferData[] = [];

            if (Array.isArray(responseData.Offers)) {
                offers = responseData.Offers;
            } else if (Array.isArray(responseData.offers)) {
                offers = responseData.offers;
            } else if (Array.isArray(responseData.data)) {
                offers = responseData.data;
            }


            const offersWithDetails: OfferData[] = [];
            
            for (const offer of offers) {
                try {
                    const offerId = offer.id || offer.ID;
                    if (!offerId) {
                        continue;
                    }

                    const offerDetailResult = await API.get(`${API_CONFIG.ENDPOINTS.OFFERS.BY_ID}/${offerId}`);
                    
                    if (offerDetailResult.ok && offerDetailResult.data) {
                        const fullOffer = offerDetailResult.data;
                        
                        const images = this.controller.getOfferImages(offerDetailResult.data);
                        
                        const detailedOffer: OfferData = {
                            id: fullOffer.id || fullOffer.ID,
                            price: fullOffer.price || fullOffer.Price,
                            rooms: fullOffer.rooms || fullOffer.Rooms,
                            area: fullOffer.area || fullOffer.Area,
                            address: fullOffer.address || fullOffer.Address,
                            title: fullOffer.title,
                            metro: fullOffer.metro || fullOffer.Metro,
                            images: images,
                            housing_complex_id: fullOffer.housing_complex_id || fullOffer.HousingComplexID,
                            complex_id: fullOffer.complex_id || fullOffer.ComplexID
                        };
                        
                        offersWithDetails.push(detailedOffer);
                    } 
                } catch (error) {

                }
            }

            const filteredOffers = offersWithDetails.filter(offer => {
                const offerComplexId = offer.housing_complex_id || offer.HousingComplexID || offer.complex_id || offer.ComplexID;
                
                if (offerComplexId && offerComplexId == this.complexId) {
                    return true;
                }
                
                return false;
            });


            return filteredOffers.map(offer => this.formatOfferData(offer));
        } catch (error) {
            throw error;
        }
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

        apartmentsContainer.innerHTML = '';
        
        const offersContainer = document.createElement('div');
        offersContainer.className = 'offers__container';
        
        offers.forEach(offer => {
            const offerElement = document.createElement('div');
            offerElement.className = 'offer-card';
            offerElement.setAttribute('data-offer-id', offer.id.toString());
            
            offerElement.innerHTML = `
                <div class="offer-card__gallery">
                    ${offer.images.map((img, index) => `
                        <img class="slider__image ${index === 0 ? 'slider__image_active' : ''}"
                             src="${img}" 
                             alt="Фото объявления ${index}"
                             loading="lazy">
                    `).join('')}
                    
                    ${offer.multipleImages ? `
                        <button class="slider__btn slider__btn_prev">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"></path>
                            </svg>
                        </button>
                        <button class="slider__btn slider__btn_next">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"></path>
                            </svg>
                        </button>
                        
                        <div class="slider__dots">
                            ${offer.images.map((_, index) => `
                                <button class="slider__dot ${index === 0 ? 'slider__dot_active' : ''}"
                                        data-index="${index}"></button>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <button class="offer-card__like" data-offer-id="${offer.id}">
                        <img src="${this.controller.isOfferLiked ? this.controller.isOfferLiked(offer.id) ? '../../images/active__like.png' : '../../images/like.png' : '../../images/like.png'}" alt="Избранное">
                    </button>
                </div>
                
                <span class="offer-card__price">${offer.formattedPrice} ₽</span>
                <span class="offer-card__description">
                    ${offer.rooms > 0 ? `${offer.rooms}-комн.` : 'Студия'} · ${offer.area}м²
                </span>
                <span class="offer-card__metro">
                    <img src="../images/metro.png" alt="Метро">
                    ${offer.metro || 'Метро не указано'}
                </span>
                <span class="offer-card__address">${offer.address}</span>
            `;
            
            offersContainer.appendChild(offerElement);
            
            this.initializeOfferCardSlider(offerElement, offer);
            
            this.addEventListener(offerElement, 'click', (e: Event) => {
                const target = e.target as HTMLElement;
                if (target.closest('.slider__btn') || target.closest('.slider__dot') || target.closest('.offer-card__like')) {
                    return;
                }
                this.navigateToOffer(offer.id);
            });
            
            const likeButton = offerElement.querySelector('.offer-card__like');
            if (likeButton) {
                this.addEventListener(likeButton, 'click', (e: Event) => {
                    e.stopPropagation();
                    this.handleLike(offer.id, likeButton as HTMLElement);
                });
            }
        });
        
        apartmentsContainer.appendChild(offersContainer);
    }

    initializeOfferCardSlider(offerElement: HTMLElement, offer: FormattedOfferData): void {
        if (!offer.multipleImages) return;

        const images = offerElement.querySelectorAll('.slider__image');
        const dots = offerElement.querySelectorAll('.slider__dot');
        const prevBtn = offerElement.querySelector('.slider__btn_prev');
        const nextBtn = offerElement.querySelector('.slider__btn_next');

        let currentSlide = 0;

        const showSlide = (index: number) => {
            images.forEach((img, i) => {
                img.classList.toggle('slider__image_active', i === index);
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('slider__dot_active', i === index);
            });
            currentSlide = index;
        };

        if (prevBtn) {
            this.addEventListener(prevBtn, 'click', (e: Event) => {
                e.stopPropagation();
                const newIndex = (currentSlide - 1 + images.length) % images.length;
                showSlide(newIndex);
            });
        }

        if (nextBtn) {
            this.addEventListener(nextBtn, 'click', (e: Event) => {
                e.stopPropagation();
                const newIndex = (currentSlide + 1) % images.length;
                showSlide(newIndex);
            });
        }

        dots.forEach((dot, index) => {
            this.addEventListener(dot, 'click', (e: Event) => {
                e.stopPropagation();
                showSlide(index);
            });
        });
    }

    navigateToOffer(offerId: number): void {
        const path = `/offers/${offerId}`;
        if (this.controller.router?.navigate) {
            this.controller.router.navigate(path);
        } else {
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    }

    handleLike(offerId: number, likeButton: HTMLElement): void {
        if (this.controller.toggleOfferLike) {
            this.controller.toggleOfferLike(offerId);
            const img = likeButton.querySelector('img');
            if (img) {
                const isLiked = this.controller.isOfferLiked ? this.controller.isOfferLiked(offerId) : false;
                img.src = isLiked ? '../../images/active__like.png' : '../../images/like.png';
            }
        }
    }

    renderEmptyApartments(): void {
        const apartmentsContainer = this.parent.querySelector('.complex__apartments');
        if (apartmentsContainer) {
            apartmentsContainer.innerHTML = '<p class="complex__empty">Нет доступных апартаментов в этом ЖК</p>';
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