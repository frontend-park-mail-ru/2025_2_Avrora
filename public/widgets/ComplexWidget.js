import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import { OffersListWidget } from "./OffersListWidget.js";

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
        this.offersWidget = null;
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

            console.log('ComplexWidget params:', params);
            
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

    async loadComplex() {
        console.log('Loading complex with ID:', this.complexId);
        
        if (!this.complexId) {
            throw new Error("Complex ID is required");
        }

        // Используем правильный endpoint для получения комплекса по ID
        const endpoint = `${API_CONFIG.ENDPOINTS.COMPLEXES.BY_ID}/${this.complexId}`;
        console.log('API endpoint:', endpoint);

        const result = await API.get(endpoint);

        if (result.ok && result.data) {
            console.log('Complex data loaded:', result.data);
            return this.formatComplexData(result.data);
        }

        if (result.status === 404) {
            throw new Error("ЖК не найден");
        }

        throw new Error(result.error || "Ошибка загрузки информации о ЖК");
    }

    formatComplexData(apiData) {
        // Обрабатываем разные форматы полей от бэкенда
        const complexId = apiData.id || apiData.ID;
        const name = apiData.name || apiData.Name || "Название не указано";
        const description = apiData.description || apiData.Description || "";
        const address = apiData.address || apiData.Address || "Адрес не указан";
        const developer = apiData.developer || apiData.Developer || "";
        const yearBuilt = apiData.year_built || apiData.YearBuilt;
        const startingPrice = apiData.starting_price || apiData.StartingPrice;

        // Обрабатываем изображения
        let images = [];
        if (Array.isArray(apiData.images)) {
            images = apiData.images;
        } else if (Array.isArray(apiData.ImageURLs)) {
            images = apiData.ImageURLs;
        } else if (apiData.image_url) {
            images = [apiData.image_url];
        } else if (apiData.imageURLs) {
            images = apiData.imageURLs;
        }

        const formatPrice = (price) => {
            if (!price) return "—";
            return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
        };

        return {
            id: complexId,
            title: name,
            price: formatPrice(startingPrice),
            address: address,
            metro: "Метро не указано", // Бэкенд не возвращает metro для детальной страницы
            description: description,
            developer: developer,
            yearBuilt: yearBuilt,
            images: images,
            multipleImages: images.length > 1
        };
    }

    async renderContent(complexData) {
        this.cleanup();

        const template = await this.loadTemplate();
        const html = template(complexData);

        const container = document.createElement('div');
        container.innerHTML = html;
        this.parent.appendChild(container.firstElementChild);

        this.initializeComplexSlider();

        // Убираем рендер апартаментов, так как бэкенд их не возвращает
        this.renderEmptyApartments();
    }

    renderEmptyApartments() {
        const apartmentsContainer = this.parent.querySelector('.complex__apartments');
        if (apartmentsContainer) {
            apartmentsContainer.innerHTML = '<p class="complex__empty">Нет доступных апартаментов</p>';
        }
    }

    initializeComplexSlider() {
        const sliderContainer = this.parent.querySelector('.complex__slider-images');
        if (!sliderContainer) return;

        const images = sliderContainer.querySelectorAll('.slider__image');
        const dots = sliderContainer.querySelectorAll('.slider__dot');
        const nextBtn = sliderContainer.querySelector('.slider__btn_next');
        const prevBtn = sliderContainer.querySelector('.slider__btn_prev');

        console.log('Complex slider elements:', { images: images.length, dots: dots.length, prevBtn: !!prevBtn, nextBtn: !!nextBtn });

        if (images.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (dots.length > 0) {
                const dotsContainer = dots[0].parentElement;
                if (dotsContainer) dotsContainer.style.display = 'none';
            }
            return;
        }

        if (images.length > 0) {
            images[0].classList.add('slider__image_active');
        }
        if (dots.length > 0) {
            dots[0].classList.add('slider__dot_active');
        }

        if (prevBtn) {
            this.addEventListener(prevBtn, 'click', (e) => {
                e.stopPropagation();
                this.showComplexSlide((this.currentSlide - 1 + images.length) % images.length);
            });
        }

        if (nextBtn) {
            this.addEventListener(nextBtn, 'click', (e) => {
                e.stopPropagation();
                this.showComplexSlide((this.currentSlide + 1) % images.length);
            });
        }

        dots.forEach((dot, index) => {
            this.addEventListener(dot, 'click', (e) => {
                e.stopPropagation();
                this.showComplexSlide(index);
            });
        });
    }

    showComplexSlide(index) {
        const sliderContainer = this.parent.querySelector('.complex__slider-images');
        if (!sliderContainer) return;

        const images = sliderContainer.querySelectorAll('.slider__image');
        const dots = sliderContainer.querySelectorAll('.slider__dot');

        if (!images[index] || !dots[index] || index === this.currentSlide) return;

        images[this.currentSlide].classList.remove('slider__image_active');
        dots[this.currentSlide].classList.remove('slider__dot_active');

        images[index].classList.add('slider__image_active');
        dots[index].classList.add('slider__dot_active');

        this.currentSlide = index;
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
        
        if (this.offersWidget) {
            this.offersWidget.cleanup();
            this.offersWidget = null;
        }
        
        this.parent.innerHTML = "";
        this.currentSlide = 0;
    }
}