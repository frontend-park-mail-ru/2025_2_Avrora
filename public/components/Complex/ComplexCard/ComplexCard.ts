interface ComplexCardData {
    id: number;
    title: string;
    address: string;
    metro: string;
    developer: string;
    yearBuilt: string;
    description: string;
    price: string;
    images: string[];
    apartments: any[];
}

export class ComplexCard {
    data: ComplexCardData;
    state: any;
    app: any;
    currentSlide: number;
    rootEl: HTMLElement | null;
    eventListeners: Array<{ element: EventTarget; event: string; handler: EventListener }>;

    constructor(data: any = {}, state: any = {}, app: any = null) {
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
            const template = (Handlebars as any).templates['Complex.hbs'];

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
            console.error('Error in ComplexCard.render:', error);
            const fallbackElement = document.createElement('div');
            fallbackElement.className = 'complex-card-error';
            fallbackElement.textContent = 'Ошибка загрузки комплекса';
            return fallbackElement;
        }
    }

    private initializeSlider(): void {
        if (this.data.images.length <= 1) {
            this.hideSliderControls();
            return;
        }

        this.showSlide(this.currentSlide);
    }

    private hideSliderControls(): void {
        if (!this.rootEl) return;

        const controls = this.rootEl.querySelector('.complex__slider-controls');
        const dots = this.rootEl.querySelector('.complex__slider-dots');

        if (controls) (controls as HTMLElement).style.display = 'none';
        if (dots) (dots as HTMLElement).style.display = 'none';
    }

    private attachEventListeners(): void {
        if (!this.rootEl) return;

        if (this.data.images.length > 1) {
            this.attachSliderEvents();
        }

        this.attachApartmentEvents();
    }

    private attachSliderEvents(): void {
        if (!this.rootEl) return;

        const prevBtn = this.rootEl.querySelector('.complex__slider-btn_prev');
        const nextBtn = this.rootEl.querySelector('.complex__slider-btn_next');
        const dots = this.rootEl.querySelectorAll('.complex__slider-dot');

        console.log('Found slider elements:', {
            prevBtn: !!prevBtn,
            nextBtn: !!nextBtn,
            dots: dots.length
        });

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

    private attachApartmentEvents(): void {
        if (!this.rootEl) return;

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

    private prevSlide(): void {
        const newIndex = (this.currentSlide - 1 + this.data.images.length) % this.data.images.length;
        console.log('Previous slide:', this.currentSlide, '->', newIndex);
        this.showSlide(newIndex);
    }

    private nextSlide(): void {
        const newIndex = (this.currentSlide + 1) % this.data.images.length;
        console.log('Next slide:', this.currentSlide, '->', newIndex);
        this.showSlide(newIndex);
    }

    private showSlide(index: number): void {
        if (!this.rootEl) return;

        console.log('Showing slide:', index);

        const images = this.rootEl.querySelectorAll('.complex__slider-image');
        const dots = this.rootEl.querySelectorAll('.complex__slider-dot');

        console.log('Found for slide change:', {
            images: images.length,
            dots: dots.length,
            currentIndex: this.currentSlide,
            newIndex: index
        });

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

    private handleApartmentClick(apartmentId: string): void {
        console.log('Apartment clicked:', apartmentId);
        const path = `/offers/${apartmentId}`;
        if (this.app?.router?.navigate) {
            this.app.router.navigate(path);
        } else {
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    }

    private addEventListener(element: EventTarget, event: string, handler: EventListener): void {
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