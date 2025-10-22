export class OffersListCard {
    constructor(element, offerData, state, app) {
        this.element = element;
        this.offerData = offerData;
        this.state = state;
        this.app = app;
        
        this.currentImageIndex = 0;
        this.images = Array.isArray(offerData.images) ? offerData.images : [];
        this.eventListeners = [];

        this.initialize();
    }

    initialize() {
        this.attachEventListeners();
        
        if (this.images.length > 1) {
            this.setupSliderEvents();
            this.setupSwipeEvents();
        }
    }

    attachEventListeners() {
        const likeButton = this.element.querySelector('.offer-card__like');
        if (likeButton) {
            this.addEventListener(likeButton, 'click', (e) => this.handleLike(e));
        }

        this.addEventListener(this.element, 'click', (e) => this.onCardClick(e));
    }

    onCardClick(e) {
        const interactiveSelectors = ['.offer-card__like', '.slider__btn', '.slider__dot'];
        const isInteractive = interactiveSelectors.some(selector => 
            e.target.closest(selector)
        );

        if (isInteractive) {
            return;
        }

        const path = `/offers/${this.offerData.id}`;
        if (this.app?.router?.navigate) {
            this.app.router.navigate(path);
        } else {
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    }

    setupSliderEvents() {
        const prevBtn = this.element.querySelector('.slider__btn_prev');
        const nextBtn = this.element.querySelector('.slider__btn_next');
        const dots = this.element.querySelectorAll('.slider__dot');

        if (prevBtn) {
            this.addEventListener(prevBtn, 'click', (e) => {
                e.stopPropagation();
                this.prevImage();
            });
        }

        if (nextBtn) {
            this.addEventListener(nextBtn, 'click', (e) => {
                e.stopPropagation();
                this.nextImage();
            });
        }

        dots.forEach(dot => {
            this.addEventListener(dot, 'click', (e) => {
                e.stopPropagation();
                const index = parseInt(e.currentTarget.dataset.index, 10);
                this.goToImage(index);
            });
        });
    }

    setupSwipeEvents() {
        const gallery = this.element.querySelector('.offer-card__gallery');
        if (!gallery) return;

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

        this.addEventListener(gallery, 'touchstart', handleTouchStart, { passive: true });
        this.addEventListener(gallery, 'touchmove', handleTouchMove, { passive: true });
        this.addEventListener(gallery, 'touchend', handleTouchEnd);
    }

    prevImage() {
        this.currentImageIndex = this.currentImageIndex > 0
            ? this.currentImageIndex - 1
            : this.images.length - 1;
        this.updateSlider();
    }

    nextImage() {
        this.currentImageIndex = this.currentImageIndex < this.images.length - 1
            ? this.currentImageIndex + 1
            : 0;
        this.updateSlider();
    }

    goToImage(index) {
        this.currentImageIndex = index;
        this.updateSlider();
    }

    updateSlider() {
        const images = this.element.querySelectorAll('.slider__image');
        const dots = this.element.querySelectorAll('.slider__dot');

        images.forEach((img, index) => {
            img.classList.toggle('slider__image_active', index === this.currentImageIndex);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('slider__dot_active', index === this.currentImageIndex);
        });
    }

    async handleLike(event) {
        event.stopPropagation();

        if (!this.state.user) {
            if (this.app?.router?.navigate) {
                this.app.router.navigate("/login");
            }
            return;
        }

        const likeButton = event.currentTarget;
        const isLikedNow = !likeButton.classList.contains("liked");
        
        likeButton.classList.toggle("liked", isLikedNow);

        const likeIcon = likeButton.querySelector("img");
        if (likeIcon) {
            likeIcon.src = isLikedNow
                ? "../../images/active__like.png"
                : "../../images/like.png";
        }

        this.offerData.isLiked = isLikedNow;
    }

    addEventListener(element, event, handler, options) {
        if (element) {
            element.addEventListener(event, handler, options);
            this.eventListeners.push({ element, event, handler, options });
        }
    }

    cleanup() {
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.eventListeners = [];
    }
}