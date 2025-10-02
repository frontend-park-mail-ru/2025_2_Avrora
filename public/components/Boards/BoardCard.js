/**
 * Класс карточки объявления с возможностью лайка и слайдером фото
 * @class
 */
export class BoardCard {
    /**
     * Создает экземпляр карточки объявления
     * @param {Object} boardData - Данные объявления
     * @param {Object} state - Состояние приложения
     * @param {App} app - Экземпляр главного приложения
     */
    constructor(boardData, state, app) {
        this.boardData = boardData;
        this.state = state;
        this.app = app;
        this.currentImageIndex = 0;
        this.images = this.getImagesArray();
        this.cardElement = null;
    }

    /**
     * Получает массив изображений для слайдера
     * @returns {Array} Массив URL изображений
     */
    getImagesArray() {
        if (Array.isArray(this.boardData.images) && this.boardData.images.length > 0) {
            const validImages = this.boardData.images.filter(img => img && img.trim() !== '');
            return validImages;
        }
        return [];
    }

    /**
     * Рендерит карточку объявления со слайдером
     * @returns {HTMLElement} DOM-элемент карточки
     */
    render() {
        this.cardElement = document.createElement('div');
        this.cardElement.className = 'board__block';

        this.renderSlider();
        this.renderContent();

        this.setEventListeners();
        return this.cardElement;
    }

    /**
     * Рендерит слайдер с изображениями
     */
    renderSlider() {
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'board__image__slider';

        this.images.forEach((image, index) => {
            const imgElement = document.createElement('img');
            imgElement.className = `slider__image ${index === 0 ? 'slider__image__active' : ''}`;
            imgElement.src = image;
            imgElement.alt = `Фото объявления ${index + 1}`;
            imgElement.dataset.index = index;
            imgElement.loading = 'lazy';
            sliderContainer.appendChild(imgElement);
        });

        if (this.images.length > 1) {
            sliderContainer.appendChild(this.createSliderButton('prev', 'Предыдущее фото'));
            sliderContainer.appendChild(this.createSliderButton('next', 'Следующее фото'));
            sliderContainer.appendChild(this.createSliderDots());
        }

        sliderContainer.appendChild(this.createLikeButton());

        this.cardElement.appendChild(sliderContainer);
    }

    /**
     * Создает кнопку управления слайдером
     * @param {string} direction - Направление (prev/next)
     * @param {string} label - Текст для accessibility
     * @returns {HTMLElement} Кнопка слайдера
     */
    createSliderButton(direction, label) {
        const button = document.createElement('button');
        button.className = `slider__btn slider__btn__${direction}`;
        button.setAttribute('aria-label', label);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', direction === 'prev' ? 'M15 18L9 12L15 6' : 'M9 18L15 12L9 6');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '2');

        svg.appendChild(path);
        button.appendChild(svg);

        return button;
    }

    /**
     * Создает индикаторы точек слайдера
     * @returns {HTMLElement} Контейнер с точками
     */
    createSliderDots() {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'slider__dots';

        this.images.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `slider__dot ${index === 0 ? 'slider__dot__active' : ''}`;
            dot.dataset.index = index;
            dot.setAttribute('aria-label', `Перейти к фото ${index + 1}`);
            dotsContainer.appendChild(dot);
        });

        return dotsContainer;
    }

    /**
     * Создает кнопку лайка
     * @returns {HTMLElement} Кнопка лайка
     */
    createLikeButton() {
        const likeButton = document.createElement('span');
        likeButton.className = `board__like ${this.boardData.likeClass}`;
        likeButton.dataset.adId = this.boardData.id;

        const likeIcon = document.createElement('img');
        likeIcon.src = this.boardData.likeIcon;
        likeIcon.alt = 'Лайк';

        likeButton.appendChild(likeIcon);
        return likeButton;
    }

    /**
     * Рендерит основное содержимое карточки
     */
    renderContent() {
        const priceElement = document.createElement('span');
        priceElement.className = 'board__price';
        priceElement.textContent = `${this.formatPrice(this.boardData.price)} ₽`;
        this.cardElement.appendChild(priceElement);

        const descriptionElement = document.createElement('span');
        descriptionElement.className = 'board__description';
        
        const roomsText = this.boardData.rooms ? `${this.boardData.rooms}-комн.` : '';
        const areaText = this.boardData.area ? `${this.boardData.area}м²` : '';
        descriptionElement.textContent = `${roomsText} · ${areaText}`;
        
        this.cardElement.appendChild(descriptionElement);

        const metroElement = document.createElement('span');
        metroElement.className = 'board__metro';

        const metroIcon = document.createElement('img');
        metroIcon.src = '../../images/metro.png';
        metroIcon.alt = 'Метро';

        metroElement.appendChild(metroIcon);
        metroElement.appendChild(document.createTextNode(` ${this.boardData.metro}`));
        this.cardElement.appendChild(metroElement);

        const addressElement = document.createElement('span');
        addressElement.className = 'board__address';
        addressElement.textContent = this.boardData.address;
        this.cardElement.appendChild(addressElement);
    }

    /**
     * Форматирует цену для отображения
     * @param {number} price - Цена объявления
     * @returns {string} Отформатированная цена или сообщение об отсутствии цены
     */
    formatPrice(price) {
        if (price == null) return "Цена не указана";
        return new Intl.NumberFormat("ru-RU").format(price);
    }

    /**
     * Устанавливает обработчики событий для карточки
     */
    setEventListeners() {
        const likeButton = this.cardElement.querySelector(".board__like");
        if (likeButton) {
            likeButton.addEventListener("click", (e) => this.handleLike(e));
        }

        if (this.images.length > 1) {
            this.setupSliderEvents();
        }
    }

    /**
     * Настраивает обработчики событий для слайдера
     */
    setupSliderEvents() {
        const prevBtn = this.cardElement.querySelector('.slider__btn__prev');
        const nextBtn = this.cardElement.querySelector('.slider__btn__next');
        const dots = this.cardElement.querySelectorAll('.slider__dot');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevImage());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextImage());
        }

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.goToImage(index);
            });
        });

        this.setupSwipeEvents();
    }

    /**
     * Переходит к предыдущему изображению
     */
    prevImage() {
        this.currentImageIndex = this.currentImageIndex > 0 
            ? this.currentImageIndex - 1 
            : this.images.length - 1;
        this.updateSlider();
    }

    /**
     * Переходит к следующему изображению
     */
    nextImage() {
        this.currentImageIndex = this.currentImageIndex < this.images.length - 1 
            ? this.currentImageIndex + 1 
            : 0;
        this.updateSlider();
    }

    /**
     * Переходит к конкретному изображению
     * @param {number} index - Индекс изображения
     */
    goToImage(index) {
        this.currentImageIndex = index;
        this.updateSlider();
    }

    /**
     * Обновляет состояние слайдера
     */
    updateSlider() {
        const images = this.cardElement.querySelectorAll('.slider__image');
        const dots = this.cardElement.querySelectorAll('.slider__dot');

        images.forEach((img, index) => {
            img.classList.toggle('slider__image__active', index === this.currentImageIndex);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('slider__dot__active', index === this.currentImageIndex);
        });
    }

    /**
     * Настраивает обработчики свайпа для мобильных устройств
     */
    setupSwipeEvents() {
        const slider = this.cardElement.querySelector('.board__image__slider');
        let startX = 0;
        let endX = 0;

        const handleTouchStart = (e) => {
            startX = e.touches[0].clientX;
        };

        const handleTouchMove = (e) => {
            endX = e.touches[0].clientX;
        };

        const handleTouchEnd = () => {
            const diff = startX - endX;
            const swipeThreshold = 50;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextImage(); 
                } else {
                    this.prevImage(); 
                }
            }
        };

        slider.addEventListener('touchstart', handleTouchStart, { passive: true });
        slider.addEventListener('touchmove', handleTouchMove, { passive: true });
        slider.addEventListener('touchend', handleTouchEnd);
    }

    /**
     * Обрабатывает клик по кнопке лайка
     * @param {Event} event - Событие клика
     * @async
     */
    async handleLike(event) {
        if (!this.state.user) {
            this.app.router.navigate("/login");
            return;
        }

        const likeButton = event.currentTarget;
        const adId = likeButton.dataset.adId;
        if (!adId) return;

        const isLikedNow = !likeButton.classList.contains("liked");
        likeButton.classList.toggle("liked", isLikedNow);

        const likeIcon = likeButton.querySelector("img");
        if (likeIcon) {
            likeIcon.src = isLikedNow
                ? "../../images/active__like.png"
                : "../../images/like.png";
        }

        this.boardData.isLiked = isLikedNow;
    }
}