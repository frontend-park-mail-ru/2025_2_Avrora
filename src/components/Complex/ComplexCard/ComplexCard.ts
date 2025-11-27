interface ComplexCardData {
    id?: number;
    title?: string;
    address?: string;
    metro?: string;
    developer?: string;
    yearBuilt?: number;
    description?: string;
    price?: string;
    images?: string[];
    apartments?: any[];
}

interface EventListener {
    element: EventTarget;
    event: string;
    handler: EventListenerOrEventListenerObject;
}

export class ComplexCard {
    data: ComplexCardData;
    state: any;
    app: any;
    currentSlide: number;
    rootEl: HTMLElement | null;
    eventListeners: EventListener[];

    constructor(data: ComplexCardData = {}, state: any = {}, app: any = null) {
        this.data = {
            id: data.id || 0,
            title: data.title || "",
            address: data.address || "",
            metro: data.metro || "",
            developer: data.developer || "",
            yearBuilt: data.yearBuilt || "",
            description: data.description || "",
            price: data.price || "",
            images: Array.isArray(data.images) ? data.images : [],
            apartments: Array.isArray(data.apartments) ? data.apartments : []
        };

        this.state = state;
        this.app = app;
        this.currentSlide = 0;
        this.rootEl = null;
        this.eventListeners = [];
    }

    async render(): Promise<HTMLElement> {
        try {
            const template = Handlebars.templates['Complex.hbs'];

            const templateData = {
                ...this.data,
                multipleImages: this.data.images.length > 1
            };

            const html = template(templateData);
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;

            this.rootEl = tempContainer.firstElementChild as HTMLElement;

            if (!this.rootEl) {
                throw new Error('Failed to create complex card element');
            }

            this.initializeSlider();
            this.attachEventListeners();

            return this.rootEl;
        } catch (error) {
            const fallbackElement = document.createElement('div');
            fallbackElement.className = 'complex-card-error';
            fallbackElement.textContent = 'Ошибка загрузки комплекса';
            return fallbackElement;
        }
    }

    initializeSlider(): void {
        if (this.data.images.length <= 1) {
            this.hideSliderControls();
            return;
        }

        this.showSlide(this.currentSlide);
    }

    hideSliderControls(): void {
        const controls = this.rootEl.querySelector('.complex__slider-controls');
        const dots = this.rootEl.querySelector('.complex__slider-dots');

        if (controls) (controls as HTMLElement).style.display = 'none';
        if (dots) (dots as HTMLElement).style.display = 'none';
    }

    attachEventListeners(): void {
        if (this.data.images.length > 1) {
            this.attachSliderEvents();
        }

        this.attachApartmentEvents();
    }

    attachSliderEvents(): void {
        const prevBtn = this.rootEl.querySelector('.complex__slider-btn_prev');
        const nextBtn = this.rootEl.querySelector('.complex__slider-btn_next');
        const dots = this.rootEl.querySelectorAll('.complex__slider-dot');

        if (prevBtn) {
            this.addEventListener(prevBtn, 'click', () => {
                this.prevSlide();
            });
        }

        if (nextBtn) {
            this.addEventListener(nextBtn, 'click', () => {
                this.nextSlide();
            });
        }

        if (dots && dots.length > 0) {
            dots.forEach((dot, index) => {
                this.addEventListener(dot, 'click', () => {
                    this.showSlide(index);
                });
            });
        }
    }

    attachApartmentEvents(): void {
        const apartmentElements = this.rootEl.querySelectorAll('.complex__apartment');
        apartmentElements.forEach(apartment => {
            const apartmentId = (apartment as HTMLElement).dataset.apartmentId;
            if (apartmentId) {
                this.addEventListener(apartment, 'click', () => {
                    this.handleApartmentClick(apartmentId);
                });
            }
        });
    }

    prevSlide(): void {
        const newIndex = (this.currentSlide - 1 + this.data.images.length) % this.data.images.length;
        this.showSlide(newIndex);
    }

    nextSlide(): void {
        const newIndex = (this.currentSlide + 1) % this.data.images.length;
        this.showSlide(newIndex);
    }

    showSlide(index: number): void {

        const images = this.rootEl.querySelectorAll('.complex__slider-image');
        const dots = this.rootEl.querySelectorAll('.complex__slider-dot');

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

    handleApartmentClick(apartmentId: string): void {
        const path = `/offers/${apartmentId}`;
        if (this.app?.router?.navigate) {
            this.app.router.navigate(path);
        } else {
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    }

    addEventListener(element: EventTarget, event: string, handler: EventListenerOrEventListenerObject): void {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    cleanup(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
}