import { API } from "../../../utils/API.js";
import { API_CONFIG } from "../../../config.js";
import { MediaService } from "../../../utils/MediaService.js";
import { ProfileService } from "../../../utils/ProfileService.js";

export class OfferCard {
    constructor(data = {}, state = {}, app = null) {
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
            userAvatar: data.userAvatar || MediaService.getImageUrl('user.png')
        };

        this.state = state;
        this.app = app;
        this.currentSlide = 0;
        this.sliderElements = {};
        this.fullscreenCurrentSlide = 0;
        this.rootEl = null;
        this.isPhoneVisible = false;
        this.sellerData = null;
    }

    async render() {
        try {
            if (this.data.userId) {
                await this.loadSellerData();
            }

            const template = Handlebars.templates['Offer.hbs'];

            const processedImages = this.data.images.map(img =>
                img.startsWith('http') ? img : MediaService.getImageUrl(img)
            );

            const templateData = {
                ...this.data,
                images: processedImages.length > 0 ? processedImages : [MediaService.getImageUrl('default_offer.jpg')],
                userAvatar: this.sellerData?.photo_url ?
                    (this.sellerData.photo_url.startsWith('http') ?
                        this.sellerData.photo_url :
                        MediaService.getImageUrl(this.sellerData.photo_url)) :
                    MediaService.getImageUrl('user.png'),
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
                formattedCommission: this.formatCurrency(this.data.commission)
            };

            const html = template(templateData);
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;

            this.rootEl = tempContainer.firstElementChild;

            if (!this.rootEl) {
                throw new Error('Failed to create offer card element');
            }

            this.initializeSlider();
            this.attachEventListeners();

            return this.rootEl;
        } catch (error) {
            console.error('Error in OfferCard.render:', error);
            const fallbackElement = document.createElement('div');
            fallbackElement.className = 'offer-card-error';
            fallbackElement.textContent = 'Ошибка загрузки объявления';
            return fallbackElement;
        }
    }

    async loadSellerData() {
        try {
            this.sellerData = await ProfileService.getProfile(this.data.userId);
        } catch (error) {
            console.error('Error loading seller data:', error);
            this.sellerData = null;
        }
    }

    initializeSlider() {
        const gallery = this.rootEl.querySelector('.offer__gallery');
        if (!gallery) return;

        this.sliderElements = {
            images: gallery.querySelectorAll('.slider__image'),
            dots: gallery.querySelectorAll('.slider__dot'),
            prev: gallery.querySelector('.slider__btn_prev'),
            next: gallery.querySelector('.slider__btn_next'),
            fullscreenBtn: gallery.querySelector('.slider__fullscreen-btn')
        };

        if (this.data.images.length <= 1) {
            this.hideSliderControls();
        } else {
            this.showSlide(0);
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

    attachEventListeners() {
        if (this.data.images.length > 1) {
            this.attachSliderEvents();
        }

        const fullscreenBtn = this.rootEl.querySelector('.slider__fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.openFullscreen());
        }

        const callButton = this.rootEl.querySelector('.offer__contact-btn');
        if (callButton) {
            callButton.addEventListener('click', () => this.handleCall());
        }

        const editButton = this.rootEl.querySelector('.offer__edit-btn');
        if (editButton) {
            editButton.addEventListener('click', () => this.handleEdit());
        }

        const deleteButton = this.rootEl.querySelector('.offer__delete-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => this.showDeleteModal());
        }

        const likeButton = this.rootEl.querySelector('.offer__like-btn');
        if (likeButton) {
            likeButton.addEventListener('click', () => this.handleLike());
        }
    }

    attachSliderEvents() {
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

    showSlide(index) {
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

    openFullscreen() {
        this.fullscreenCurrentSlide = this.currentSlide;
        this.createFullscreenViewer();
    }

    createFullscreenViewer() {
        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-overlay';

        const viewer = document.createElement('div');
        viewer.className = 'fullscreen-viewer';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'fullscreen-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => this.closeFullscreen(overlay));

        const prevBtn = document.createElement('button');
        prevBtn.className = 'fullscreen-nav fullscreen-prev';
        prevBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"></path></svg>';
        prevBtn.addEventListener('click', () => this.navigateFullscreen(-1));

        const nextBtn = document.createElement('button');
        nextBtn.className = 'fullscreen-nav fullscreen-next';
        nextBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"></path></svg>';
        nextBtn.addEventListener('click', () => this.navigateFullscreen(1));

        const imageContainer = document.createElement('div');
        imageContainer.className = 'fullscreen-image-container';

        this.data.images.forEach((imageSrc, index) => {
            const img = document.createElement('img');
            img.className = `fullscreen-image ${index === this.fullscreenCurrentSlide ? 'fullscreen-image-active' : ''}`;
            img.src = imageSrc.startsWith('http') ? imageSrc : MediaService.getImageUrl(imageSrc);
            img.alt = `Фото объявления ${index + 1}`;
            imageContainer.appendChild(img);
        });

        const counter = document.createElement('div');
        counter.className = 'fullscreen-counter';
        counter.textContent = `${this.fullscreenCurrentSlide + 1} / ${this.data.images.length}`;

        viewer.appendChild(closeBtn);
        viewer.appendChild(prevBtn);
        viewer.appendChild(nextBtn);
        viewer.appendChild(imageContainer);
        viewer.appendChild(counter);
        overlay.appendChild(viewer);

        this.attachFullscreenKeyboardEvents(overlay);

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }

    closeFullscreen(overlay) {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        document.body.style.overflow = '';
    }

    navigateFullscreen(direction) {
        this.fullscreenCurrentSlide = (this.fullscreenCurrentSlide + direction + this.data.images.length) % this.data.images.length;
        this.updateFullscreenView();
    }

    updateFullscreenView() {
        const images = document.querySelectorAll('.fullscreen-image');
        const counter = document.querySelector('.fullscreen-counter');

        if (images && counter) {
            images.forEach((img, index) => {
                img.classList.toggle('fullscreen-image-active', index === this.fullscreenCurrentSlide);
            });
            counter.textContent = `${this.fullscreenCurrentSlide + 1} / ${this.data.images.length}`;
        }
    }

    attachFullscreenKeyboardEvents(overlay) {
        const keyHandler = (e) => {
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
        overlay._keyHandler = keyHandler;
    }

    handleCall() {
        const currentUser = this.state?.user;

        if (!currentUser) {
            this.showAuthModal();
            return;
        }

        this.isPhoneVisible = true;

        const contactBtn = this.rootEl.querySelector('.offer__contact-btn');
        const phoneDisplay = this.rootEl.querySelector('.offer__phone-display');

        if (contactBtn) {
            contactBtn.style.display = 'none';
        }

        if (phoneDisplay) {
            phoneDisplay.style.display = 'block';
        } else {
            this.createPhoneDisplay();
        }
    }

    createPhoneDisplay() {
        const sidebar = this.rootEl.querySelector('.offer__sidebar');
        if (!sidebar) return;

        const phoneDisplay = document.createElement('div');
        phoneDisplay.className = 'offer__phone-display';
        phoneDisplay.style.display = 'block';
        phoneDisplay.innerHTML = `
            <span class="offer__phone-label">Телефон:</span>
            <span class="offer__phone-number">${this.sellerData?.phone || this.data.userPhone}</span>
        `;

        const contactBtn = this.rootEl.querySelector('.offer__contact-btn');
        if (contactBtn) {
            contactBtn.parentNode.insertBefore(phoneDisplay, contactBtn.nextSibling);
            contactBtn.style.display = 'none';
        }
    }

    showAuthModal() {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal__header">
                <h3>Авторизуйтесь, чтобы увидеть номер</h3>
                <button class="modal__close">&times;</button>
            </div>
            <div class="modal__body">
                <p>Войдите в свой аккаунт, чтобы получить контактные данные продавца.</p>
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

        modal.querySelector('.modal__close').addEventListener('click', closeModal);
        modal.querySelector('.modal__btn--cancel').addEventListener('click', closeModal);
        modal.querySelector('.modal__btn--login').addEventListener('click', () => {
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

    showDeleteModal() {
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

        modal.querySelector('.modal__close').addEventListener('click', closeModal);
        modal.querySelector('.modal__btn--cancel').addEventListener('click', closeModal);
        modal.querySelector('.modal__btn--confirm').addEventListener('click', () => {
            this.handleDelete();
            closeModal();
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    }

    handleEdit() {
        if (this.app?.router?.navigate) {
            this.app.router.navigate(`/edit-offer/${this.data.id}`);
        } else {
            window.history.pushState({}, "", `/edit-offer/${this.data.id}`);
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    }

    async handleDelete() {
        try {
            const result = await API.delete(`${API_CONFIG.ENDPOINTS.OFFERS.DELETE}${this.data.id}`);

            if (result.ok) {
                this.showSuccess('Объявление успешно удалено!');

                setTimeout(() => {
                    if (this.app?.router?.navigate) {
                        this.app.router.navigate('/profile/myoffers');
                    }
                }, 1500);
            } else {
                this.showError('Не удалось удалить объявление. Попробуйте позже.');
            }
        } catch (error) {
            this.showError('Произошла ошибка при удалении объявления.');
        }
    }

    showSuccess(message) {
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

        modal.querySelector('.modal__close').addEventListener('click', closeModal);
        modal.querySelector('.modal__btn--confirm').addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    }

    showError(message) {
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

        modal.querySelector('.modal__close').addEventListener('click', closeModal);
        modal.querySelector('.modal__btn--confirm').addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    }

    handleLike() {
        console.log('Like button clicked for offer:', this.data.id);
    }

    formatCurrency(amount) {
        if (!amount && amount !== 0) return '—';
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0
        }).format(amount);
    }
}