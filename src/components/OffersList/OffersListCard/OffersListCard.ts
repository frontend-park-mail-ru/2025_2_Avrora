import { MediaService } from "../../../utils/MediaService.ts";

interface OfferListData {
    id?: number;
    ID?: number;
    images?: string[];
    image_url?: string;
    ImageURL?: string;
    isLiked?: boolean;
    price?: number;
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

    render(): HTMLElement {
        try {
            const template = (Handlebars as any).templates['OffersList.hbs'];

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

            const formattedOffer = {
                ...this.offerData,
                images: images,
                multipleImages: images.length > 1,
                likeClass: this.offerData.isLiked ? 'liked' : '',
                likeIcon: this.offerData.isLiked ? '../../images/active__like.png' : '../../images/like.png',
                formattedPrice: this.formatPrice(this.offerData.price || 0)
            };

            const html = template({ offers: [formattedOffer] });
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;

            const cardElement = tempContainer.querySelector('.offer-card');
            if (cardElement) {
                this.parentElement.innerHTML = '';
                this.parentElement.appendChild(cardElement);
                this.initializeSlider();
                this.attachEventListeners();
            }

            return this.parentElement;
        } catch (error) {
            console.error('Error rendering OffersListCard:', error);
            return this.parentElement;
        }
    }

    initializeSlider(): void {
        const gallery = this.parentElement.querySelector('.offer-card__gallery');
        if (!gallery) return;

        this.sliderElements = {
            images: gallery.querySelectorAll('.slider__image'),
            dots: gallery.querySelectorAll('.slider__dot'),
            prev: gallery.querySelector('.slider__btn_prev'),
            next: gallery.querySelector('.slider__btn_next')
        } as SliderElements;

        const imageCount = this.offerData.images ? this.offerData.images.length : 0;
        if (imageCount <= 1) {
            this.hideSliderControls();
        } else {
            this.attachSliderEvents();
        }

        if (this.sliderElements.images.length > 0) {
            this.sliderElements.images[0].classList.add('slider__image_active');
        }
        if (this.sliderElements.dots.length > 0) {
            this.sliderElements.dots[0].classList.add('slider__dot_active');
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
                this.showSlide((this.currentSlide - 1 + (this.offerData.images?.length || 0)) % (this.offerData.images?.length || 1));
            });
        }

        if (next) {
            this.addEventListener(next, 'click', (e: Event) => {
                e.stopPropagation();
                this.showSlide((this.currentSlide + 1) % (this.offerData.images?.length || 1));
            });
        }

        if (dots) {
            dots.forEach((dot, index) => {
                this.addEventListener(dot, 'click', (e: Event) => {
                    e.stopPropagation();
                    this.showSlide(index);
                });
            });
        }
    }

    showSlide(index: number): void {
        const { images, dots } = this.sliderElements;

        if (!images || !images[index] || !dots || !dots[index]) return;
        if (index === this.currentSlide) return;

        images[this.currentSlide].classList.remove('slider__image_active');
        dots[this.currentSlide].classList.remove('slider__dot_active');

        images[index].classList.add('slider__image_active');
        dots[index].classList.add('slider__dot_active');

        this.currentSlide = index;
    }

    attachEventListeners(): void {
        this.parentElement.addEventListener('click', (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.closest('.slider__btn') || target.closest('.slider__dot') || target.closest('.offer-card__like')) {
                return;
            }

            const offerId = this.offerData.id || this.offerData.ID;
            const path = `/offers/${offerId}`;

            if (this.app?.router?.navigate) {
                this.app.router.navigate(path);
            } else {
                window.history.pushState({}, "", path);
                window.dispatchEvent(new PopStateEvent("popstate"));
            }
        });

        const likeButton = this.parentElement.querySelector('.offer-card__like');
        if (likeButton) {
            this.addEventListener(likeButton as HTMLElement, 'click', (e: Event) => {
                e.stopPropagation();
                this.handleLike();
            });
        }
    }

    handleLike(): void {
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