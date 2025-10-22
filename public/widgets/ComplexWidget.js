import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";

export class ComplexWidget {
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.complexId = null;
        this.eventListeners = [];
        this.isLoading = false;
        this.template = null;
        this.currentSlide = 0;
    }

    async loadTemplate() {
        if (this.template) return this.template;
        try {
            this.template = Handlebars.templates['Complex.hbs'];
            return this.template;
        } catch (error) {
            console.error('Failed to load template:', error);
            throw new Error('Template loading failed');
        }
    }

    async render() {
        await this.renderWithParams({});
    }

    async renderWithParams(params = {}) {
        try {
            this.isLoading = true;
            this.renderLoading();

            this.complexId = params.id || null;
            const complexData = await this.loadComplex();
            await this.renderContent(complexData);
        } catch (error) {
            console.error("Error rendering complex detail:", error);
            this.renderError("Не удалось загрузить информацию о ЖК");
        } finally {
            this.isLoading = false;
        }
    }

    async loadComplex() {
        if (!this.complexId) {
            const complexesResult = await API.get(API_CONFIG.ENDPOINTS.COMPLEXES.LIST);
            if (complexesResult.ok && complexesResult.data.complexes.length > 0) {
                this.complexId = complexesResult.data.complexes[0].id;
            } else {
                throw new Error("No complexes available");
            }
        }

        const endpoint = `${API_CONFIG.ENDPOINTS.COMPLEXES.BY_ID}/${this.complexId}`;
        const result = await API.get(endpoint);
        
        if (result.ok && result.data) {
            return this.formatComplexData(result.data);
        }
        throw new Error(result.error || "Ошибка загрузки информации о ЖК");
    }

    formatComplexData(apiData) {
        // Форматируем цену для отображения
        const formatPrice = (price) => {
            if (!price) return "—";
            return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
        };

        // Форматируем данные квартир
        const apartments = Array.isArray(apiData.apartments) ? apiData.apartments.map(apartment => ({
            id: apartment.id,
            title: apartment.title,
            price: formatPrice(apartment.price),
            rooms: apartment.rooms,
            area: apartment.area,
            floor: apartment.floor,
            address: apartment.address,
            metro: apartment.metro,
            images: apartment.images || []
        })) : [];

        return {
            title: apiData.name,
            price: formatPrice(apiData.price_from),
            address: apiData.address,
            metro: apiData.metro,
            description: apiData.description,
            images: Array.isArray(apiData.images) ? apiData.images : [],
            multipleImages: Array.isArray(apiData.images) && apiData.images.length > 1,
            apartments: apartments
        };
    }

    async renderContent(complexData) {
        this.cleanup();
        
        const template = await this.loadTemplate();
        const html = template(complexData);
        
        const container = document.createElement('div');
        container.innerHTML = html;
        this.parent.appendChild(container.firstElementChild);

        this.initializeSlider();
        this.attachEventListeners();
    }

    initializeSlider() {
        const images = this.parent.querySelectorAll('.slider__image');
        const dots = this.parent.querySelectorAll('.slider__dot');
        const prevBtn = this.parent.querySelector('.slider__btn_prev');
        const nextBtn = this.parent.querySelector('.slider__btn_next');

        if (images.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (dots.length > 0) {
                const dotsContainer = dots[0].parentElement;
                if (dotsContainer) dotsContainer.style.display = 'none';
            }
            return;
        }

        if (prevBtn) {
            this.addEventListener(prevBtn, 'click', () => {
                this.showSlide((this.currentSlide - 1 + images.length) % images.length);
            });
        }

        if (nextBtn) {
            this.addEventListener(nextBtn, 'click', () => {
                this.showSlide((this.currentSlide + 1) % images.length);
            });
        }

        dots.forEach((dot, index) => {
            this.addEventListener(dot, 'click', () => this.showSlide(index));
        });
    }

    showSlide(index) {
        const images = this.parent.querySelectorAll('.slider__image');
        const dots = this.parent.querySelectorAll('.slider__dot');

        if (!images[index] || !dots[index] || index === this.currentSlide) return;

        images[this.currentSlide].classList.remove('slider__image_active');
        dots[this.currentSlide].classList.remove('slider__dot_active');

        images[index].classList.add('slider__image_active');
        dots[index].classList.add('slider__dot_active');

        this.currentSlide = index;
    }

    attachEventListeners() {
        const apartmentBlocks = this.parent.querySelectorAll('.complex__apartment');
        apartmentBlocks.forEach(block => {
            const apartmentId = block.dataset.apartmentId;
            if (apartmentId) {
                this.addEventListener(block, 'click', () => this.handleApartmentClick(apartmentId));
            }
        });
    }

    handleApartmentClick(apartmentId) {
        const path = `/offers/${apartmentId}`;
        if (this.app?.router?.navigate) {
            this.app.router.navigate(path);
        } else {
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    }

    renderLoading() {
        this.cleanup();
        
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "complex__loading";
        loadingDiv.textContent = "Загрузка информации о ЖК...";
        this.parent.appendChild(loadingDiv);
    }

    renderError(message) {
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

    addEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    removeEventListeners() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }

    cleanup() {
        this.removeEventListeners();
        this.parent.innerHTML = "";
        this.currentSlide = 0;
    }
}