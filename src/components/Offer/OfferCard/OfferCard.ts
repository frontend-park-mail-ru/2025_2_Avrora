import { API } from "../../../utils/API.js";
import { API_CONFIG } from "../../../config.js";
import { MediaService } from "../../../utils/MediaService.ts";
import { ProfileService } from "../../../utils/ProfileService.ts";

interface OfferCardData {
    id: number;
    title: string;
    infoDesc: string;
    metro: string;
    address: string;
    price: string;
    userName: string;
    description: string;
    images: string[];
    characteristics: Array<{
        title: string;
        value: string;
        icon: string;
        isComplex?: boolean;
        complexId?: string | number;
    }>;
    offerType: string;
    deposit: number;
    commission: number;
    rentalPeriod: string;
    userId: number;
    userPhone: string;
    userAvatar: string;
    views: number;
    housingComplexId?: string | number | null;
    housingComplexName?: string | null;
    priceHistory?: Array<{ date: string; price: number }>;
    likesCount: number;
    isLiked: boolean;
}

interface OfferCardState {
    user?: {
        id?: number;
        ID?: number;
    };
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
    fullscreenBtn: HTMLElement | null;
}

export class OfferCard {
    data: OfferCardData;
    state: OfferCardState;
    app: App | null;
    currentSlide: number;
    sliderElements: SliderElements;
    fullscreenCurrentSlide: number;
    rootEl: HTMLElement | null;
    isPhoneVisible: boolean;
    sellerData: any;
    private isLikeRequestInProgress: boolean;
    private handleFullscreenClick: (() => void) | null = null;
    private hasViewIncremented: boolean = false;

    constructor(data: any = {}, state: OfferCardState = {}, app: App | null = null) {
        this.data = {
            id: data.id || data.ID || 0,
            title: data.title || data.Title || "",
            infoDesc: data.infoDesc || "",
            metro: data.metro || "",
            address: data.address || data.Address || "",
            price: data.price || "",
            userName: data.userName || "Продавец",
            description: data.description || data.Description || "",
            images: Array.isArray(data.images) ? data.images : [],
            characteristics: Array.isArray(data.characteristics) ? data.characteristics : [],
            offerType: data.offerType || data.OfferType || "sale",
            deposit: data.deposit || data.Deposit || 0,
            commission: data.commission || data.Commission || 0,
            rentalPeriod: data.rentalPeriod || "",
            userId: data.userId || data.UserID || 0,
            userPhone: data.userPhone || "+7 XXX XXX-XX-XX",
            userAvatar: data.userAvatar || "../../images/default_avatar.jpg",
            views: data.views || 0,
            housingComplexId: data.housingComplexId || data.housing_complex_id || null,
            housingComplexName: data.housingComplexName || data.housing_complex_name || null,
            priceHistory: data.priceHistory || [],
            likesCount: data.likesCount || data.likes_count || 0,
            isLiked: data.isLiked || data.is_liked || false
        };

        this.state = state;
        this.app = app;
        this.currentSlide = 0;
        this.sliderElements = {} as SliderElements;
        this.fullscreenCurrentSlide = 0;
        this.rootEl = null;
        this.isPhoneVisible = false;
        this.sellerData = null;
        this.isLikeRequestInProgress = false;
        this.hasViewIncremented = false;
    }

    async render(): Promise<HTMLElement> {
        try {
            await Promise.all([
                this.data.userId ? this.loadSellerData() : Promise.resolve(),
                this.data.housingComplexId ? this.loadComplexData() : Promise.resolve(),
                this.data.id ? this.loadPriceHistory() : Promise.resolve(),
                this.data.id ? this.loadLikeData() : Promise.resolve()
            ]);

            if (this.data.id && !this.hasViewIncremented) {
                await this.incrementViewCount();
                this.hasViewIncremented = true;
            }

            const template = (Handlebars as any).templates['Offer.hbs'];

            const processedImages = this.data.images.map((img: string) =>
                img.startsWith('http') ? img : MediaService.getImageUrl(img)
            );

            const characteristicsWithComplex = [...this.data.characteristics];

            if (this.data.housingComplexId) {
                const existingComplexIndex = characteristicsWithComplex.findIndex(
                    char => char.title === 'В составе ЖК'
                );

                if (existingComplexIndex === -1) {
                    characteristicsWithComplex.splice(1, 0, {
                        title: 'В составе ЖК',
                        value: this.data.housingComplexName || "...",
                        icon: 'complex',
                        isComplex: true,
                        complexId: this.data.housingComplexId
                    });
                } else {
                    characteristicsWithComplex[existingComplexIndex].value = this.data.housingComplexName || "...";
                }
            }

            const templateData = {
                ...this.data,
                images: processedImages.length > 0 ? processedImages : [MediaService.getImageUrl('default_offer.jpg')],
                characteristics: characteristicsWithComplex,
                userAvatar: this.sellerData?.photo_url ?
                    (this.sellerData.photo_url.startsWith('http') ?
                        this.sellerData.photo_url :
                        MediaService.getImageUrl(this.sellerData.photo_url)) :
                    "../../images/default_avatar.jpg",
                userName: this.sellerData ?
                    `${this.sellerData.first_name || ''} ${this.sellerData.last_name || ''}`.trim() || "Продавец" :
                    "Продавец",
                userPhone: this.sellerData?.phone || "+7 XXX XXX-XX-XX",
                multipleImages: processedImages.length > 1,
                isRent: this.data.offerType === 'rent',
                isOwner: this.state.user && (this.state.user.id === this.data.userId || this.state.user.ID === this.data.userId),
                isAuthenticated: !!this.state.user,
                showContactBtn: !this.state.user || (this.state.user && this.state.user.id !== this.data.userId && this.state.user.ID !== this.data.userId),
                showPhone: this.state.user && this.state.user.id !== this.data.userId && this.state.user.ID !== this.data.userId && this.isPhoneVisible,
                showOwnerActions: this.state.user && (this.state.user.id === this.data.userId || this.state.user.ID === this.data.userId),
                formattedDeposit: this.formatCurrency(this.data.deposit),
                formattedCommission: this.formatCurrency(this.data.commission),
                views: this.data.views,
                likesCount: this.data.likesCount,
                isLiked: this.data.isLiked,
                likeIcon: this.data.isLiked ? '../../images/active__like.png' : '../../images/like.png',
                formattedLikesCount: this.formatLikesCount(this.data.likesCount)
            };

            const html = template(templateData);
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;

            this.rootEl = tempContainer.firstElementChild as HTMLElement;

            if (!this.rootEl) {
                throw new Error('Failed to create offer card element');
            }

            this.initializeSlider();
            this.attachEventListeners();

            return this.rootEl;
        } catch (error) {
            const fallbackElement = document.createElement('div');
            fallbackElement.className = 'offer-card-error';
            fallbackElement.textContent = 'Ошибка загрузки объявления';
            return fallbackElement;
        }
    }

    async incrementViewCount(): Promise<void> {
        if (!this.data.id) return;

        try {
            const response = await API.post(`${API_CONFIG.ENDPOINTS.OFFERS.VIEW}${this.data.id}`, {});

            if (response.ok) {
                const viewCountResponse = await API.get(`${API_CONFIG.ENDPOINTS.OFFERS.VIEWCOUNT}${this.data.id}`);

                if (viewCountResponse.ok && viewCountResponse.data) {
                    this.data.views = viewCountResponse.data.count || this.data.views;
                } else {
                    this.data.views += 1;
                }

                const viewsElement = this.rootEl?.querySelector('.offer__views span');
                if (viewsElement) {
                    viewsElement.textContent = this.data.views.toString();
                }
            }
        } catch (error) {
            this.data.views += 1;
        }
    }

    async loadLikeData(): Promise<void> {
        if (!this.data.id) return;

        try {
            const likesCountResponse = await API.get(`${API_CONFIG.ENDPOINTS.OFFERS.LIKECOUNT}${this.data.id}`);
            if (likesCountResponse.ok && likesCountResponse.data) {
                this.data.likesCount = likesCountResponse.data.count || 0;
            }

            if (this.state.user) {
                const isLikedResponse = await API.get(`${API_CONFIG.ENDPOINTS.OFFERS.IS_LIKED}${this.data.id}`);
                if (isLikedResponse.ok && isLikedResponse.data) {
                    this.data.isLiked = isLikedResponse.data.is_liked || false;
                }
            }
        } catch (error) {}
    }

    async loadSellerData(): Promise<void> {
        try {
            this.sellerData = await ProfileService.getProfile(this.data.userId);
        } catch (error) {
            this.sellerData = null;
        }
    }

    async loadComplexData(): Promise<void> {
        if (!this.data.housingComplexId) return;

        try {
            const response = await API.get(`${API_CONFIG.ENDPOINTS.COMPLEXES.BY_ID}${this.data.housingComplexId}`);

            if (response.ok && response.data) {
                this.data.housingComplexName = response.data.name || response.data.Name || null;
            } else {
                this.data.housingComplexName = null;
            }
        } catch (error) {
            this.data.housingComplexName = null;
        }
    }

    async loadPriceHistory(): Promise<void> {
        if (!this.data.id) return;

        try {
            const endpoint = `${API_CONFIG.ENDPOINTS.OFFERS.PRICE_HISTORY}/${this.data.id}`;
            const response = await API.get(endpoint);

            if (response.ok && response.data) {
                this.data.priceHistory = this.transformPriceHistoryData(response.data);
            }
        } catch (error) {}
    }

    async handleLike(): Promise<void> {
        if (!this.data.id) return;

        if (this.isLikeRequestInProgress) return;

        const currentUser = this.state?.user;
        if (!currentUser) {
            this.showAuthModal();
            return;
        }

        this.isLikeRequestInProgress = true;

        try {
            const previousLikedState = this.data.isLiked;
            const previousLikesCount = this.data.likesCount;

            const newLikedState = !previousLikedState;
            const newLikesCount = previousLikedState ? previousLikesCount - 1 : previousLikesCount + 1;

            this.data.isLiked = newLikedState;
            this.data.likesCount = newLikesCount;

            this.updateLikeUI();

            const response = await API.post(`${API_CONFIG.ENDPOINTS.OFFERS.LIKE}${this.data.id}`, {});

            if (!response.ok) {
                this.data.isLiked = previousLikedState;
                this.data.likesCount = previousLikesCount;
                this.updateLikeUI();
                return;
            }

            await this.updateLikeCount();

        } catch (error) {
        } finally {
            this.isLikeRequestInProgress = false;
        }
    }

    async updateLikeCount(): Promise<void> {
        if (!this.data.id) return;

        try {
            const response = await API.get(`${API_CONFIG.ENDPOINTS.OFFERS.LIKECOUNT}${this.data.id}`);

            if (response.ok && response.data) {
                const newLikesCount = response.data.count || 0;

                if (this.data.likesCount !== newLikesCount) {
                    this.data.likesCount = newLikesCount;
                    this.updateLikeUI();
                }
            }
        } catch (error) {}
    }

    private updateLikeUI(): void {
        if (!this.rootEl) return;

        const likeButton = this.rootEl.querySelector('.offer__like-btn') as HTMLElement;
        const likeIcon = likeButton?.querySelector('img') as HTMLImageElement;
        const likesCounter = this.rootEl.querySelector('.offer__likes-counter') as HTMLElement;

        if (likeIcon) {
            likeIcon.src = this.data.isLiked ? '../../images/active__like.png' : '../../images/like.png';
            likeIcon.alt = this.data.isLiked ? 'Убрать из избранного' : 'Добавить в избранное';
        }

        if (likesCounter) {
            const currentLikesCount = this.data.likesCount || 0;
            likesCounter.textContent = this.formatLikesCount(currentLikesCount);
            likesCounter.classList.toggle('offer__likes-counter--active', this.data.isLiked);
        }

        if (likeButton) {
            likeButton.classList.add('offer__like-btn--animating');
            setTimeout(() => {
                likeButton.classList.remove('offer__like-btn--animating');
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

    initializeSlider(): void {
        const gallery = this.rootEl!.querySelector('.offer__gallery');
        if (!gallery) {
            return;
        }

        this.sliderElements = {
            images: gallery.querySelectorAll('.slider__image'),
            dots: gallery.querySelectorAll('.slider__dot'),
            prev: gallery.querySelector('.slider__btn_prev'),
            next: gallery.querySelector('.slider__btn_next'),
            fullscreenBtn: gallery.querySelector('.slider__fullscreen-btn')
        } as SliderElements;

        if (this.data.images.length <= 1) {
            this.hideSliderControls();
        } else {
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

    attachEventListeners(): void {
        if (!this.rootEl) {
            return;
        }

        this.rootEl.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;

            const fullscreenBtn = target.closest('.slider__fullscreen-btn');
            if (fullscreenBtn) {
                e.preventDefault();
                e.stopPropagation();
                this.openFullscreen();
                return;
            }

            const complexLink = target.closest('.offer__feature-value--complex');
            if (complexLink) {
                e.preventDefault();
                e.stopPropagation();
                const complexId = complexLink.getAttribute('data-complex-id');
                if (complexId) {
                    this.handleComplexNavigation(complexId);
                }
                return;
            }
        });

        this.attachFullscreenButtonDirectly();

        if (this.data.images.length > 1) {
            this.attachSliderEvents();
        }

        this.attachOtherEventListeners();
    }

    private attachFullscreenButtonDirectly(): void {
        const attachHandler = () => {
            const fullscreenBtn = this.rootEl?.querySelector('.slider__fullscreen-btn');

            if (fullscreenBtn) {
                if (this.handleFullscreenClick) {
                    fullscreenBtn.removeEventListener('click', this.handleFullscreenClick);
                }

                this.handleFullscreenClick = () => {
                    this.openFullscreen();
                };

                fullscreenBtn.addEventListener('click', this.handleFullscreenClick);
            }
        };

        attachHandler();

        setTimeout(attachHandler, 500);
    }

    private attachOtherEventListeners(): void {
        const callButton = this.rootEl!.querySelector('.offer__contact-btn');
        if (callButton) {
            callButton.addEventListener('click', () => this.handleCall());
        }

        const editButton = this.rootEl!.querySelector('.offer__edit-btn');
        if (editButton) {
            editButton.addEventListener('click', () => this.handleEdit());
        }

        const deleteButton = this.rootEl!.querySelector('.offer__delete-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => this.showDeleteModal());
        }

        const likeButton = this.rootEl!.querySelector('.offer__like-btn');
        if (likeButton) {
            likeButton.addEventListener('click', () => this.handleLike());
        }
    }

    attachSliderEvents(): void {
        const { prev, next, dots } = this.sliderElements;

        if (prev) {
            prev.addEventListener('click', () => {
                this.showSlide((this.currentSlide - 1 + this.data.images.length) % this.data.images.length);
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                this.showSlide((this.currentSlide + 1) % this.data.images.length);
            });
        }

        if (dots) {
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.showSlide(index));
            });
        }
    }

    showSlide(index: number): void {
        const { images, dots } = this.sliderElements;

        if (!images || images.length === 0 || !dots || dots.length === 0) return;
        if (index === this.currentSlide) return;

        if (images[this.currentSlide]) {
            images[this.currentSlide].classList.remove('slider__image_active');
        }
        if (dots[this.currentSlide]) {
            dots[this.currentSlide].classList.remove('slider__dot_active');
        }

        if (images[index]) {
            images[index].classList.add('slider__image_active');
        }
        if (dots[index]) {
            dots[index].classList.add('slider__dot_active');
        }

        this.currentSlide = index;
    }

    openFullscreen(): void {
        if (!this.data.images || this.data.images.length === 0) {
            return;
        }

        this.fullscreenCurrentSlide = this.currentSlide;
        this.createFullscreenViewer();
    }

    createFullscreenViewer(): void {
        const existingOverlay = document.querySelector('.fullscreen-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.98);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const viewer = document.createElement('div');
        viewer.className = 'fullscreen-viewer';
        viewer.style.cssText = `
            position: relative;
            width: 100vw;
            height: 100vh;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'fullscreen-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            background: rgba(0, 0, 0, 0.8);
            border: none;
            color: white;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            font-size: 32px;
            cursor: pointer;
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            closeBtn.style.transform = 'scale(1.1)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(0, 0, 0, 0.8)';
            closeBtn.style.transform = 'scale(1)';
        });
        closeBtn.addEventListener('click', () => this.closeFullscreen(overlay));

        const prevBtn = document.createElement('button');
        prevBtn.className = 'fullscreen-nav fullscreen-prev';
        prevBtn.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>';
        prevBtn.style.cssText = `
            position: fixed;
            left: 30px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.8);
            border: none;
            color: white;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;
        prevBtn.addEventListener('mouseenter', () => {
            prevBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            prevBtn.style.transform = 'translateY(-50%) scale(1.1)';
        });
        prevBtn.addEventListener('mouseleave', () => {
            prevBtn.style.background = 'rgba(0, 0, 0, 0.8)';
            prevBtn.style.transform = 'translateY(-50%) scale(1)';
        });
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigateFullscreen(-1);
        });

        const nextBtn = document.createElement('button');
        nextBtn.className = 'fullscreen-nav fullscreen-next';
        nextBtn.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>';
        nextBtn.style.cssText = `
            position: fixed;
            right: 30px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.8);
            border: none;
            color: white;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;
        nextBtn.addEventListener('mouseenter', () => {
            nextBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            nextBtn.style.transform = 'translateY(-50%) scale(1.1)';
        });
        nextBtn.addEventListener('mouseleave', () => {
            nextBtn.style.background = 'rgba(0, 0, 0, 0.8)';
            nextBtn.style.transform = 'translateY(-50%) scale(1)';
        });
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigateFullscreen(1);
        });

        const imageContainer = document.createElement('div');
        imageContainer.className = 'fullscreen-image-container';
        imageContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            cursor: grab;
        `;

        const counter = document.createElement('div');
        counter.className = 'fullscreen-counter';
        counter.textContent = `${this.fullscreenCurrentSlide + 1} / ${this.data.images.length}`;
        counter.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 18px;
            font-weight: 500;
            z-index: 10001;
        `;

        this.data.images.forEach((imageSrc: string, index: number) => {
            const img = document.createElement('img');
            img.className = `fullscreen-image ${index === this.fullscreenCurrentSlide ? 'fullscreen-image-active' : ''}`;
            img.src = imageSrc.startsWith('http') ? imageSrc : MediaService.getImageUrl(imageSrc);
            img.alt = `Фото объявления ${index + 1}`;
            img.style.cssText = `
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                opacity: ${index === this.fullscreenCurrentSlide ? 1 : 0};
                transition: opacity 0.3s ease;
                pointer-events: none;
            `;
            imageContainer.appendChild(img);
        });

        viewer.appendChild(imageContainer);
        overlay.appendChild(viewer);
        overlay.appendChild(closeBtn);
        overlay.appendChild(prevBtn);
        overlay.appendChild(nextBtn);
        overlay.appendChild(counter);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeFullscreen(overlay);
            }
        });

        let touchStartX = 0;
        let touchEndX = 0;

        overlay.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        overlay.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });

        this.attachFullscreenKeyboardEvents(overlay);

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }

    closeFullscreen(overlay: HTMLElement): void {
        const keyHandler = (overlay as any)._keyHandler;
        if (keyHandler) {
            document.removeEventListener('keydown', keyHandler);
        }

        if (overlay) {
            overlay.style.opacity = '0';

            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }, 300);
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
    }

    navigateFullscreen(direction: number): void {
        const newIndex = (this.fullscreenCurrentSlide + direction + this.data.images.length) % this.data.images.length;

        if (newIndex === this.fullscreenCurrentSlide) return;

        this.fullscreenCurrentSlide = newIndex;
        this.updateFullscreenView();
    }

    updateFullscreenView(): void {
        const images = document.querySelectorAll('.fullscreen-image');
        const counter = document.querySelector('.fullscreen-counter');

        if (images && counter) {
            images.forEach((img, index) => {
                (img as HTMLElement).style.opacity = index === this.fullscreenCurrentSlide ? '1' : '0';
            });

            counter.textContent = `${this.fullscreenCurrentSlide + 1} / ${this.data.images.length}`;
        }
    }
    
    attachFullscreenKeyboardEvents(overlay: HTMLElement): void {
        const keyHandler = (e: KeyboardEvent) => {
            switch(e.key) {
                case 'Escape':
                    this.closeFullscreen(overlay);
                    break;
                case 'ArrowLeft':
                    this.navigateFullscreen(-1);
                    break;
                case 'ArrowRight':
                    this.navigateFullscreen(1);
                    break;
            }
        };

        document.addEventListener('keydown', keyHandler);
        (overlay as any)._keyHandler = keyHandler;
    }

    handleComplexNavigation(complexId: string | number): void {
        if (!complexId) return;

        if (this.app?.router?.navigate) {
            this.app.router.navigate(`/complexes/${complexId}`);
        } else if (window.history && window.history.pushState) {
            window.history.pushState({}, "", `/complexes/${complexId}`);
            window.dispatchEvent(new PopStateEvent("popstate"));
        } else {
            window.location.href = `/complexes/${complexId}`;
        }
    }

    handleCall(): void {
        const currentUser = this.state?.user;

        if (!currentUser) {
            this.showAuthModalForCall();
            return;
        }

        this.isPhoneVisible = true;

        const contactBtn = this.rootEl!.querySelector('.offer__contact-btn') as HTMLElement;
        const phoneDisplay = this.rootEl!.querySelector('.offer__phone-display') as HTMLElement;

        if (contactBtn) {
            contactBtn.style.display = 'none';
        }

        if (phoneDisplay) {
            phoneDisplay.style.display = 'block';
        } else {
            this.createPhoneDisplay();
        }
    }

    createPhoneDisplay(): void {
        const sidebar = this.rootEl!.querySelector('.offer__sidebar');
        if (!sidebar) return;

        const phoneDisplay = document.createElement('div');
        phoneDisplay.className = 'offer__phone-display';
        phoneDisplay.style.display = 'block';
        phoneDisplay.innerHTML = `
            <span class="offer__phone-label">Телефон:</span>
            <span class="offer__phone-number">${this.sellerData?.phone || this.data.userPhone}</span>
        `;

        const contactBtn = this.rootEl!.querySelector('.offer__contact-btn');
        if (contactBtn) {
            contactBtn.parentNode!.insertBefore(phoneDisplay, contactBtn.nextSibling);
            (contactBtn as HTMLElement).style.display = 'none';
        }
    }

    showAuthModal(): void {
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

        const closeBtn = modal.querySelector('.modal__close') as HTMLElement;
        const cancelBtn = modal.querySelector('.modal__btn--cancel') as HTMLElement;
        const loginBtn = modal.querySelector('.modal__btn--login') as HTMLElement;

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (loginBtn) loginBtn.addEventListener('click', () => {
            closeModal();
            this.redirectToLogin();
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    }

    showAuthModalForCall(): void {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal__header">
                <h3>Авторизуйтесь, чтобы увидеть контакты</h3>
                <button class="modal__close">&times;</button>
            </div>
            <div class="modal__body">
                <p>Войдите в свой аккаунт, чтобы увидеть телефон продавца и связаться с ним.</p>
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

        const closeBtn = modal.querySelector('.modal__close') as HTMLElement;
        const cancelBtn = modal.querySelector('.modal__btn--cancel') as HTMLElement;
        const loginBtn = modal.querySelector('.modal__btn--login') as HTMLElement;

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (loginBtn) loginBtn.addEventListener('click', () => {
            closeModal();
            this.redirectToLogin();
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    }

    private redirectToLogin(): void {
        if (this.app?.router?.navigate) {
            this.app.router.navigate('/login');
        } else if (window.history && window.history.pushState) {
            window.history.pushState({}, "", '/login');
            window.dispatchEvent(new PopStateEvent("popstate"));
        } else {
            window.location.href = '/login';
        }
    }

    showDeleteModal(): void {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal__header">
                <h3>Удаление объявления</h3>
                <button class="modal__close">&times;</button>
            </div>
            <div class="modal__body">
                <p>Вы уверены, что хотите удалить объявление?</p>
            </div>
            <div class="modal__footer">
                <button class="modal__btn modal__btn--cancel">Отменить</button>
                <button class="modal__btn modal__btn--confirm">Да</button>
            </div>
        `;

        const closeModal = () => {
            if (modalOverlay.parentNode) {
                modalOverlay.parentNode.removeChild(modalOverlay);
            }
        };

        const closeBtn = modal.querySelector('.modal__close') as HTMLElement;
        const cancelBtn = modal.querySelector('.modal__btn--cancel') as HTMLElement;
        const confirmBtn = modal.querySelector('.modal__btn--confirm') as HTMLElement;

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (confirmBtn) confirmBtn.addEventListener('click', () => {
            this.handleDelete();
            closeModal();
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    }

    handleEdit(): void {
        if (this.app?.router?.navigate) {
            this.app.router.navigate(`/edit-offer/${this.data.id}`);
        } else {
            window.history.pushState({}, "", `/edit-offer/${this.data.id}`);
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    }

    async handleDelete(): Promise<void> {
        try {
            const result = await API.delete(`${API_CONFIG.ENDPOINTS.OFFERS.DELETE}${this.data.id}`);

            if (result.ok) {
                this.showSuccess('Объявление успешно удалено!');

                setTimeout(() => {
                    if (this.app?.router?.navigate) {
                        this.app.router.navigate('/profile/myoffers');
                    } else if (window.history && window.history.pushState) {
                        window.history.pushState({}, "", '/profile/myoffers');
                        window.dispatchEvent(new PopStateEvent("popstate"));
                    } else {
                        window.location.href = '/profile/myoffers';
                    }
                }, 1500);
            } else {
                this.showError('Не удалось удалить объявление. Попробуйте позже.');
            }
        } catch (error) {
            this.showError('Произошла ошибка при удалении объявления.');
        }
    }

    showSuccess(message: string): void {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal__header">
                <h3 style="color: #4CAF50;">Успех</h3>
                <button class="modal__close">&times;</button>
            </div>
            <div class="modal__body">
                <p>${message}</p>
            </div>
            <div class="modal__footer">
                <button class="modal__btn modal__btn--confirm">OK</button>
            </div>
        `;

        const closeModal = () => {
            if (modalOverlay.parentNode) {
                modalOverlay.parentNode.removeChild(modalOverlay);
            }
        };

        const closeBtn = modal.querySelector('.modal__close') as HTMLElement;
        const confirmBtn = modal.querySelector('.modal__btn--confirm') as HTMLElement;

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (confirmBtn) confirmBtn.addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    }

    showError(message: string): void {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal__header">
                <h3 style="color: #f44336;">Ошибка</h3>
                <button class="modal__close">&times;</button>
            </div>
            <div class="modal__body">
                <p>${message}</p>
            </div>
            <div class="modal__footer">
                <button class="modal__btn modal__btn--confirm">OK</button>
            </div>
        `;

        const closeModal = () => {
            if (modalOverlay.parentNode) {
                modalOverlay.parentNode.removeChild(modalOverlay);
            }
        };

        const closeBtn = modal.querySelector('.modal__close') as HTMLElement;
        const confirmBtn = modal.querySelector('.modal__btn--confirm') as HTMLElement;

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (confirmBtn) confirmBtn.addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    }

    formatCurrency(amount: number): string {
        if (!amount && amount !== 0) return '—';
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0
        }).format(amount);
    }

    private transformPriceHistoryData(apiData: any): Array<{ date: string; price: number }> {
        if (Array.isArray(apiData)) {
            return apiData.map((item: any) => ({
                date: item.date || item.Date || item.created_at || new Date().toISOString(),
                price: item.price || item.Price || item.price_value || 0
            }));
        }

        if (apiData.points && Array.isArray(apiData.points)) {
            return this.transformPriceHistoryData(apiData.points);
        }

        if (apiData.data && Array.isArray(apiData.data)) {
            return this.transformPriceHistoryData(apiData.data);
        }

        return [];
    }

    private handleSwipe(touchStartX: number, touchEndX: number): void {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.navigateFullscreen(1);
            } else {
                this.navigateFullscreen(-1);
            }
        }
    }
}