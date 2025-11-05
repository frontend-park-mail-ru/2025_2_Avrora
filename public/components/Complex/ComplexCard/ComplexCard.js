export class ComplexCard {
    constructor(data = {}, state = {}, app = null) {
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

    async render() {
        try {
            const template = Handlebars.templates['Complex.hbs'];

            const templateData = {
                ...this.data,
                multipleImages: this.data.images.length > 1
            };

            const html = template(templateData);
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;

            this.rootEl = tempContainer.firstElementChild;

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

    initializeSlider() {
        // Если изображений меньше 2, скрываем контролы и выходим
        if (this.data.images.length <= 1) {
            this.hideSliderControls();
            return;
        }

        // Инициализируем первый слайд
        this.showSlide(this.currentSlide);
    }

    hideSliderControls() {
        const controls = this.rootEl.querySelector('.complex__slider-controls');
        const dots = this.rootEl.querySelector('.complex__slider-dots');

        if (controls) controls.style.display = 'none';
        if (dots) dots.style.display = 'none';
    }

    attachEventListeners() {
        // Прикрепляем события слайдера если есть несколько изображений
        if (this.data.images.length > 1) {
            this.attachSliderEvents();
        }

        // Прикрепляем обработчики для апартаментов
        this.attachApartmentEvents();
    }

    attachSliderEvents() {
        // Находим элементы каждый раз при прикреплении событий
        const prevBtn = this.rootEl.querySelector('.complex__slider-btn_prev');
        const nextBtn = this.rootEl.querySelector('.complex__slider-btn_next');
        const dots = this.rootEl.querySelectorAll('.complex__slider-dot');

        console.log('Found slider elements:', {
            prevBtn: !!prevBtn,
            nextBtn: !!nextBtn,
            dots: dots.length
        });

        // Кнопка "назад"
        if (prevBtn) {
            this.addEventListener(prevBtn, 'click', () => {
                this.prevSlide();
            });
        }

        // Кнопка "вперед"
        if (nextBtn) {
            this.addEventListener(nextBtn, 'click', () => {
                this.nextSlide();
            });
        }

        // Точки навигации
        if (dots && dots.length > 0) {
            dots.forEach((dot, index) => {
                this.addEventListener(dot, 'click', () => {
                    this.showSlide(index);
                });
            });
        }
    }

    attachApartmentEvents() {
        const apartmentElements = this.rootEl.querySelectorAll('.complex__apartment');
        apartmentElements.forEach(apartment => {
            const apartmentId = apartment.dataset.apartmentId;
            if (apartmentId) {
                this.addEventListener(apartment, 'click', () => {
                    this.handleApartmentClick(apartmentId);
                });
            }
        });
    }

    prevSlide() {
        const newIndex = (this.currentSlide - 1 + this.data.images.length) % this.data.images.length;
        console.log('Previous slide:', this.currentSlide, '->', newIndex);
        this.showSlide(newIndex);
    }

    nextSlide() {
        const newIndex = (this.currentSlide + 1) % this.data.images.length;
        console.log('Next slide:', this.currentSlide, '->', newIndex);
        this.showSlide(newIndex);
    }

    showSlide(index) {
        console.log('Showing slide:', index);

        // Находим все элементы заново
        const images = this.rootEl.querySelectorAll('.complex__slider-image');
        const dots = this.rootEl.querySelectorAll('.complex__slider-dot');

        console.log('Found for slide change:', {
            images: images.length,
            dots: dots.length,
            currentIndex: this.currentSlide,
            newIndex: index
        });

        // Скрываем текущий слайд
        if (images[this.currentSlide]) {
            images[this.currentSlide].classList.remove('complex__slider-image_active');
        }

        // Убираем активный класс с текущей точки
        if (dots[this.currentSlide]) {
            dots[this.currentSlide].classList.remove('complex__slider-dot_active');
        }

        // Показываем новый слайд
        if (images[index]) {
            images[index].classList.add('complex__slider-image_active');
        }

        // Активируем новую точку
        if (dots[index]) {
            dots[index].classList.add('complex__slider-dot_active');
        }

        this.currentSlide = index;
    }

    handleApartmentClick(apartmentId) {
        console.log('Apartment clicked:', apartmentId);
        const path = `/offers/${apartmentId}`;
        if (this.app?.router?.navigate) {
            this.app.router.navigate(path);
        } else {
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    }

    addEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
}