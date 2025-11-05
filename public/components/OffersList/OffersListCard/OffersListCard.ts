import { MediaService } from "../../../utils/MediaService.ts";

interface OfferData {
    id?: number;
    ID?: number;
    images?: string[];
    image_url?: string;
    ImageURL?: string;
    price?: string | number;
    isLiked?: boolean;
    [key: string]: any;
}

interface SliderElements {
    images: NodeListOf<Element>;
    dots: NodeListOf<Element>;
    prev: Element | null;
    next: Element | null;
}

interface EventListener {
    element: EventTarget;
    event: string;
    handler: EventListenerOrEventListenerObject;
}

interface FormattedOffer {
    images: string[];
    multipleImages: boolean;
    likeClass: string;
    likeIcon: string;
    formattedPrice: string;
    [key: string]: any;
}

export class OffersListCard {
    parentElement: HTMLElement;
    offerData: OfferData;
    state: any;
    app: any;
    currentSlide: number;
    sliderElements: SliderElements;
    eventListeners: EventListener[];

    constructor(parentElement: HTMLElement, offerData: OfferData, state: any, app: any) {
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

            // Обрабатываем разные форматы изображений и используем MediaService для правильного URL
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

            // Если изображений нет, используем дефолтное
            if (images.length === 0) {
                images = [MediaService.getImageUrl('default_offer.jpg')];
            }

            const formattedOffer: FormattedOffer = {
                ...this.offerData,
                images: images,
                multipleImages: images.length > 1,
                likeClass: this.offerData.isLiked ? 'liked' : '',
                likeIcon: this.offerData.isLiked ? '../../images/active__like.png' : '../../images/like.png',
                formattedPrice: this.formatPrice(this.offerData.price)
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
        };

        console.log('Offer card slider elements:', {
            images: this.sliderElements.images.length,
            dots: this.sliderElements.dots.length,
            hasPrev: !!this.sliderElements.prev,
            hasNext: !!this.sliderElements.next
        });

        // Обрабатываем случаи, когда изображений нет или только одно
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

        if (prev) (prev as HTMLElement).style.display = 'none';
        if (next) (next as HTMLElement).style.display = 'none';
        if (dots && dots.length > 0) {
            const dotsContainer = dots[0].parentElement;
            if (dotsContainer) (dotsContainer as HTMLElement).style.display = 'none';
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
            const target = e.target as Element;
            if (target.closest('.slider__btn') || target.closest('.slider__dot') || target.closest('.offer-card__like')) {
                return;
            }

            // Убедитесь, что ID корректно обрабатывается
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
            this.addEventListener(likeButton, 'click', (e: Event) => {
                e.stopPropagation();
                this.handleLike();
            });
        }
    }

    handleLike(): void {
        console.log('Like button clicked for offer:', this.offerData.id);
        // TODO: Implement like functionality with API call
    }

    formatPrice(price: string | number | undefined): string {
        if (!price) return '0';
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('ru-RU').format(numericPrice);
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
        this.parentElement.innerHTML = '';
    }
}