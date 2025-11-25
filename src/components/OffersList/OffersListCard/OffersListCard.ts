import { MediaService } from "../../../utils/MediaService.ts";
import { API } from "../../../utils/API.js";
import { API_CONFIG } from "../../../config.js";

interface OfferListData {
    id?: number;
    ID?: number;
    images?: string[];
    image_url?: string;
    ImageURL?: string;
    isLiked?: boolean;
    likesCount?: number;
    likes_count?: number;
    price?: number;
    rooms?: number;
    area?: number;
    metro?: string;
    address?: string;
    title?: string;
}

interface OfferListState {
    user?: any;
}

interface AppRouter {
    navigate: (path: string) => void;
}

interface App {
    router?: AppRouter;
}

interface SliderElements {
    images: NodeListOf<HTMLElement>;
    dots: NodeListOf<HTMLElement>;
    prev: HTMLElement | null;
    next: HTMLElement | null;
}

interface EventListener {
    element: HTMLElement;
    event: string;
    handler: EventListenerOrEventListenerObject;
}

export class OffersListCard {
    parentElement: HTMLElement;
    offerData: OfferListData;
    state: OfferListState;
    app: App | null;
    currentSlide: number;
    sliderElements: SliderElements;
    eventListeners: EventListener[];

    constructor(parentElement: HTMLElement, offerData: OfferListData, state: OfferListState, app: App | null) {
        this.parentElement = parentElement;
        this.offerData = offerData;
        this.state = state;
        this.app = app;
        this.currentSlide = 0;
        this.sliderElements = {} as SliderElements;
        this.eventListeners = [];
    }

    async render(): Promise<HTMLElement> {
        try {
            const images = this.getImages();
            const likesCount = this.offerData.likesCount || this.offerData.likes_count || 0;
            const isLiked = this.offerData.isLiked || false;
            
            const formattedOffer = {
                id: this.offerData.id || this.offerData.ID,
                title: this.offerData.title || "Без названия",
                price: this.offerData.price || 0,
                area: this.offerData.area || 0,
                rooms: this.offerData.rooms || 0,
                address: this.offerData.address || "Адрес не указан",
                metro: this.offerData.metro || "Метро не указано",
                images: images,
                multipleImages: images.length > 1,
                likeClass: isLiked ? 'liked' : '',
                likeIcon: isLiked ? '../../images/active__like.png' : '../../images/like.png',
                formattedPrice: this.formatPrice(this.offerData.price || 0),
                likesCount: likesCount,
                isLiked: isLiked,
                formattedLikesCount: this.formatLikesCount(likesCount)
            };

            this.parentElement.innerHTML = '';

            const cardElement = this.createCompleteCardElement(formattedOffer);
            this.parentElement.appendChild(cardElement);

            this.initializeSlider();
            this.attachEventListeners();

            // Проверяем статус лайка если пользователь авторизован
            if (this.state.user && this.offerData.id) {
                await this.checkLikeStatus();
            }

            return this.parentElement;
        } catch (error) {
            this.createCompleteFallbackCard();
            return this.parentElement;
        }
    }

    createCompleteCardElement(offer: any): HTMLElement {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'offer-card';
        cardDiv.setAttribute('data-offer-id', offer.id);

        const galleryDiv = document.createElement('div');
        galleryDiv.className = 'offer-card__gallery';

        offer.images.forEach((image: string, index: number) => {
            const img = document.createElement('img');
            img.className = `slider__image ${index === 0 ? 'slider__image_active' : ''}`;
            img.src = image;
            img.alt = `Фото объявления ${index}`;
            img.loading = 'lazy';
            galleryDiv.appendChild(img);
        });

        if (offer.multipleImages) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'slider__btn slider__btn_prev';
            prevBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"></path>
                </svg>
            `;
            galleryDiv.appendChild(prevBtn);

            const nextBtn = document.createElement('button');
            nextBtn.className = 'slider__btn slider__btn_next';
            nextBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"></path>
                </svg>
            `;
            galleryDiv.appendChild(nextBtn);

            const dotsDiv = document.createElement('div');
            dotsDiv.className = 'slider__dots';
            
            offer.images.forEach((_: string, index: number) => {
                const dotBtn = document.createElement('button');
                dotBtn.className = `slider__dot ${index === 0 ? 'slider__dot_active' : ''}`;
                dotBtn.setAttribute('data-index', index.toString());
                dotsDiv.appendChild(dotBtn);
            });
            galleryDiv.appendChild(dotsDiv);
        }

        const likeBtn = document.createElement('button');
        likeBtn.className = 'offer-card__like';
        likeBtn.setAttribute('data-offer-id', offer.id);
        likeBtn.innerHTML = `
            <img src="${offer.likeIcon}" alt="${offer.isLiked ? 'Убрать из избранного' : 'Добавить в избранное'}">
            <span class="offer-card__likes-counter ${offer.isLiked ? 'offer-card__likes-counter--active' : ''}">
                ${offer.formattedLikesCount}
            </span>
        `;
        galleryDiv.appendChild(likeBtn);

        cardDiv.appendChild(galleryDiv);

        const priceSpan = document.createElement('span');
        priceSpan.className = 'offer-card__price';
        priceSpan.textContent = `${offer.formattedPrice} ₽`;
        cardDiv.appendChild(priceSpan);

        const descSpan = document.createElement('span');
        descSpan.className = 'offer-card__description';
        descSpan.textContent = `${offer.rooms ? `${offer.rooms}-комн.` : 'Студия'} · ${offer.area}м²`;
        cardDiv.appendChild(descSpan);

        const metroSpan = document.createElement('span');
        metroSpan.className = 'offer-card__metro';
        metroSpan.innerHTML = `
            <img src="../images/metro.png" alt="Метро">
            ${offer.metro}
        `;
        cardDiv.appendChild(metroSpan);

        const addressSpan = document.createElement('span');
        addressSpan.className = 'offer-card__address';
        addressSpan.textContent = offer.address;
        cardDiv.appendChild(addressSpan);

        return cardDiv;
    }

    createCompleteFallbackCard(): void {
        const images = this.getImages();
        const imageUrl = images.length > 0 ? images[0] : MediaService.getImageUrl('default_offer.jpg');
        const likesCount = this.offerData.likesCount || this.offerData.likes_count || 0;
        const isLiked = this.offerData.isLiked || false;

        this.parentElement.innerHTML = `
            <div class="offer-card" data-offer-id="${this.offerData.id || this.offerData.ID}">
                <div class="offer-card__gallery">
                    <img class="slider__image slider__image_active" 
                         src="${imageUrl}" 
                         alt="Фото объявления" 
                         loading="lazy">
                    <button class="offer-card__like" data-offer-id="${this.offerData.id || this.offerData.ID}">
                        <img src="${isLiked ? '../../images/active__like.png' : '../../images/like.png'}" 
                             alt="${isLiked ? 'Убрать из избранного' : 'Добавить в избранное'}">
                        <span class="offer-card__likes-counter ${isLiked ? 'offer-card__likes-counter--active' : ''}">
                            ${this.formatLikesCount(likesCount)}
                        </span>
                    </button>
                </div>
                <span class="offer-card__price">${this.formatPrice(this.offerData.price || 0)} ₽</span>
                <span class="offer-card__description">
                    ${this.offerData.rooms ? `${this.offerData.rooms}-комн.` : 'Студия'} · ${this.offerData.area || 0}м²
                </span>
                <span class="offer-card__metro">
                    <img src="../images/metro.png" alt="Метро">
                    ${this.offerData.metro || "Метро не указано"}
                </span>
                <span class="offer-card__address">${this.offerData.address || "Адрес не указан"}</span>
            </div>
        `;
    }

    getImages(): string[] {
        let images: string[] = [];
        
        if (Array.isArray(this.offerData.images)) {
            images = this.offerData.images.map(img =>
                img.startsWith('http') ? img : MediaService.getImageUrl(img)
            );
        } else if (this.offerData.image_url) {
            images = [MediaService.getImageUrl(this.offerData.image_url)];
        } else if (this.offerData.ImageURL) {
            images = [MediaService.getImageUrl(this.offerData.ImageURL)];
        }

        if (images.length === 0) {
            images = [MediaService.getImageUrl('default_offer.jpg')];
        }

        return images;
    }

    async checkLikeStatus(): Promise<void> {
        if (!this.offerData.id && !this.offerData.ID) return;

        try {
            const offerId = (this.offerData.id || this.offerData.ID).toString();
            const response = await API.get(API_CONFIG.ENDPOINTS.OFFERS.IS_LIKED, { id: offerId });
            
            if (response.ok && response.data) {
                this.offerData.isLiked = response.data.liked || false;
                if (response.data.likes_count !== undefined) {
                    this.offerData.likesCount = response.data.likes_count;
                }
                this.updateLikeUI();
            }
        } catch (error) {
            console.error('Failed to check like status:', error);
        }
    }

    async handleLike(): Promise<void> {
        if (!this.offerData.id && !this.offerData.ID) return;

        const offerId = (this.offerData.id || this.offerData.ID).toString();
        const currentUser = this.state?.user;

        if (!currentUser) {
            this.showAuthModal();
            return;
        }

        try {
            const previousLikedState = this.offerData.isLiked;
            const previousLikesCount = this.offerData.likesCount || this.offerData.likes_count || 0;

            // Оптимистичное обновление
            this.offerData.isLiked = !previousLikedState;
            this.offerData.likesCount = previousLikedState ? previousLikesCount - 1 : previousLikesCount + 1;

            this.updateLikeUI();

            const response = await API.post(API_CONFIG.ENDPOINTS.OFFERS.LIKE, {
                id: offerId
            });

            if (!response.ok) {
                // Откатываем изменения при ошибке
                this.offerData.isLiked = previousLikedState;
                this.offerData.likesCount = previousLikesCount;
                this.updateLikeUI();
                return;
            }

            // Обновляем данные из ответа сервера
            if (response.data) {
                this.offerData.isLiked = response.data.liked;
                if (response.data.likes_count !== undefined) {
                    this.offerData.likesCount = response.data.likes_count;
                }
                this.updateLikeUI();
            }

        } catch (error) {
            console.error('Like operation failed:', error);
        }
    }

    private updateLikeUI(): void {
        const likeButton = this.parentElement.querySelector('.offer-card__like') as HTMLElement;
        const likeIcon = likeButton?.querySelector('img') as HTMLImageElement;
        const likesCounter = this.parentElement.querySelector('.offer-card__likes-counter') as HTMLElement;

        if (likeIcon) {
            likeIcon.src = this.offerData.isLiked ? '../../images/active__like.png' : '../../images/like.png';
            likeIcon.alt = this.offerData.isLiked ? 'Убрать из избранного' : 'Добавить в избранное';
        }

        if (likesCounter) {
            likesCounter.textContent = this.formatLikesCount(this.offerData.likesCount || 0);
            likesCounter.classList.toggle('offer-card__likes-counter--active', this.offerData.isLiked);
        }

        // Анимация
        if (likeButton) {
            likeButton.classList.add('offer-card__like--animating');
            setTimeout(() => {
                likeButton.classList.remove('offer-card__like--animating');
            }, 300);
        }
    }

    private formatLikesCount(count: number): string {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    }

    private showAuthModal(): void {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal__header">
                <h3>Авторизуйтесь, чтобы добавлять в избранное</h3>
                <button class="modal__close">&times;</button>
            </div>
            <div class="modal__body">
                <p>Войдите в свой аккаунт, чтобы сохранять понравившиеся объявления.</p>
            </div>
            <div class="modal__footer">
                <button class="modal__btn modal__btn--cancel">Отменить</button>
                <button class="modal__btn modal__btn--login">Войти</button>
            </div>
        `;

        const closeModal = () => {
            if (modalOverlay.parentNode) {
                modalOverlay.parentNode.removeChild(modalOverlay);
            }
        };

        modal.querySelector('.modal__close')!.addEventListener('click', closeModal);
        modal.querySelector('.modal__btn--cancel')!.addEventListener('click', closeModal);
        modal.querySelector('.modal__btn--login')!.addEventListener('click', () => {
            closeModal();
            if (this.app?.router?.navigate) {
                this.app.router.navigate('/login');
            }
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    }

    initializeSlider(): void {
        const gallery = this.parentElement.querySelector('.offer-card__gallery');
        if (!gallery) {
            return;
        }

        this.sliderElements = {
            images: gallery.querySelectorAll('.slider__image'),
            dots: gallery.querySelectorAll('.slider__dot'),
            prev: gallery.querySelector('.slider__btn_prev'),
            next: gallery.querySelector('.slider__btn_next')
        } as SliderElements;

        const imageCount = this.sliderElements.images.length;
        if (imageCount <= 1) {
            this.hideSliderControls();
        } else {
            this.attachSliderEvents();
            this.showSlide(0);
        }
    }

    hideSliderControls(): void {
        const { prev, next, dots } = this.sliderElements;

        if (prev) prev.style.display = 'none';
        if (next) next.style.display = 'none';
        if (dots && dots.length > 0) {
            const dotsContainer = dots[0].parentElement as HTMLElement;
            if (dotsContainer) dotsContainer.style.display = 'none';
        }
    }

    attachSliderEvents(): void {
        const { prev, next, dots } = this.sliderElements;

        if (prev) {
            this.addEventListener(prev, 'click', (e: Event) => {
                e.stopPropagation();
                e.preventDefault();
                this.showSlide((this.currentSlide - 1 + this.sliderElements.images.length) % this.sliderElements.images.length);
            });
        }

        if (next) {
            this.addEventListener(next, 'click', (e: Event) => {
                e.stopPropagation();
                e.preventDefault();
                this.showSlide((this.currentSlide + 1) % this.sliderElements.images.length);
            });
        }

        if (dots) {
            dots.forEach((dot, index) => {
                this.addEventListener(dot, 'click', (e: Event) => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.showSlide(index);
                });
            });
        }
    }

    showSlide(index: number): void {
        const { images, dots } = this.sliderElements;

        if (!images || images.length === 0 || !images[index]) {
            return;
        }

        images.forEach(img => img.classList.remove('slider__image_active'));
        
        images[index].classList.add('slider__image_active');

        if (dots && dots.length > 0) {
            dots.forEach(dot => dot.classList.remove('slider__dot_active'));
            if (dots[index]) {
                dots[index].classList.add('slider__dot_active');
            }
        }

        this.currentSlide = index;
    }

    attachEventListeners(): void {
        const cardElement = this.parentElement.querySelector('.offer-card');
        if (cardElement) {
            this.addEventListener(cardElement as HTMLElement, 'click', (e: Event) => {
                const target = e.target as HTMLElement;
                
                if (target.closest('.slider__btn') || 
                    target.closest('.slider__dot') || 
                    target.closest('.offer-card__like')) {
                    return;
                }

                const offerId = this.offerData.id || this.offerData.ID;
                if (offerId) {
                    const path = `/offers/${offerId}`;

                    if (this.app?.router?.navigate) {
                        this.app.router.navigate(path);
                    } else {
                        window.history.pushState({}, "", path);
                        window.dispatchEvent(new PopStateEvent("popstate"));
                    }
                }
            });
        }

        const likeButton = this.parentElement.querySelector('.offer-card__like');
        if (likeButton) {
            this.addEventListener(likeButton as HTMLElement, 'click', (e: Event) => {
                e.stopPropagation();
                e.preventDefault();
                this.handleLike();
            });
        }
    }

    formatPrice(price: number): string {
        if (!price) return '0';
        return new Intl.NumberFormat('ru-RU').format(price);
    }

    addEventListener(element: HTMLElement, event: string, handler: EventListenerOrEventListenerObject): void {
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
        this.parentElement.innerHTML = '';
    }
}