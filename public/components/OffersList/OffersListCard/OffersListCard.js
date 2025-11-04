import { MediaService } from "../../../utils/MediaService.js";

export class OffersListCard {
    constructor(parentElement, offerData, state, app) {
        this.parentElement = parentElement;
        this.offerData = offerData;
        this.state = state;
        this.app = app;
        this.currentSlide = 0;
        this.sliderElements = {};
        this.eventListeners = [];
    }

    render() {
        try {
            const template = Handlebars.templates['OffersList.hbs'];

            // Обрабатываем разные форматы изображений и используем MediaService для правильного URL
            let images = [];
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

            const formattedOffer = {
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

    initializeSlider() {
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

    hideSliderControls() {
        const { prev, next, dots } = this.sliderElements;

        if (prev) prev.style.display = 'none';
        if (next) next.style.display = 'none';
        if (dots && dots.length > 0) {
            const dotsContainer = dots[0].parentElement;
            if (dotsContainer) dotsContainer.style.display = 'none';
        }
    }

    attachSliderEvents() {
        const { prev, next, dots } = this.sliderElements;

        if (prev) {
            this.addEventListener(prev, 'click', (e) => {
                e.stopPropagation();
                this.showSlide((this.currentSlide - 1 + this.offerData.images.length) % this.offerData.images.length);
            });
        }

        if (next) {
            this.addEventListener(next, 'click', (e) => {
                e.stopPropagation();
                this.showSlide((this.currentSlide + 1) % this.offerData.images.length);
            });
        }

        if (dots) {
            dots.forEach((dot, index) => {
                this.addEventListener(dot, 'click', (e) => {
                    e.stopPropagation();
                    this.showSlide(index);
                });
            });
        }
    }

    showSlide(index) {
        const { images, dots } = this.sliderElements;

        if (!images || !images[index] || !dots || !dots[index]) return;
        if (index === this.currentSlide) return;

        images[this.currentSlide].classList.remove('slider__image_active');
        dots[this.currentSlide].classList.remove('slider__dot_active');

        images[index].classList.add('slider__image_active');
        dots[index].classList.add('slider__dot_active');

        this.currentSlide = index;
    }

    attachEventListeners() {
        this.parentElement.addEventListener('click', (e) => {
            if (e.target.closest('.slider__btn') || e.target.closest('.slider__dot') || e.target.closest('.offer-card__like')) {
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
            this.addEventListener(likeButton, 'click', (e) => {
                e.stopPropagation();
                this.handleLike();
            });
        }
    }

    handleLike() {
        console.log('Like button clicked for offer:', this.offerData.id);
        // TODO: Implement like functionality with API call
    }

    formatPrice(price) {
        if (!price) return '0';
        return new Intl.NumberFormat('ru-RU').format(price);
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
        this.parentElement.innerHTML = '';
    }
}