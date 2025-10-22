export class OfferCard {
    constructor(data = {}, state = {}, app = null) {
        this.data = {
            id: data.id || 0,
            title: data.title || "",
            infoDesc: data.infoDesc || "",
            metro: data.metro || "",
            address: data.address || "",
            price: data.price || "",
            userName: data.userName || "",
            description: data.description || "",
            images: Array.isArray(data.images) ? data.images : [],
            characteristics: Array.isArray(data.characteristics) ? data.characteristics : [],
            offerType: data.offerType || "sale",
            deposit: data.deposit || 0,
            commission: data.commission || 0,
            rentalPeriod: data.rentalPeriod || "",
            userId: data.userId || 0,
            userPhone: data.userPhone || ""
        };

        this.state = state;
        this.app = app;
        this.currentSlide = 0;
        this.sliderElements = {};
        this.fullscreenCurrentSlide = 0;
    }

    async render() {
        const container = document.createElement('div');
        container.className = 'offer';

        this.renderHeader(container);
        this.renderMain(container);
        this.renderCharacteristics(container);
        this.renderDescription(container);
        this.renderMap(container);

        this.initializeSlider(container);
        this.attachEventListeners(container);

        return container;
    }

    renderHeader(container) {
        const header = document.createElement('div');
        header.className = 'offer__header';

        const title = document.createElement('h1');
        title.className = 'offer__title';
        title.textContent = this.data.title;

        const info = document.createElement('div');
        info.className = 'offer__info';

        const infoDesc = document.createElement('span');
        infoDesc.className = 'offer__info-desc';
        infoDesc.textContent = this.data.infoDesc;

        info.appendChild(infoDesc);

        if (this.data.metro) {
            const metro = document.createElement('span');
            metro.className = 'offer__metro';
            
            const metroIcon = document.createElement('img');
            metroIcon.src = '../images/metro.png';
            metroIcon.alt = 'Метро';
            
            metro.appendChild(metroIcon);
            metro.appendChild(document.createTextNode(this.data.metro));
            info.appendChild(metro);
        }

        const address = document.createElement('span');
        address.className = 'offer__address';
        address.textContent = this.data.address;
        info.appendChild(address);

        header.appendChild(title);
        header.appendChild(info);
        container.appendChild(header);
    }

    renderMain(container) {
        const main = document.createElement('div');
        main.className = 'offer__main';

        this.renderGallery(main);
        this.renderSidebar(main);

        container.appendChild(main);
    }

    renderGallery(container) {
        const gallery = document.createElement('div');
        gallery.className = 'offer__gallery';

        this.data.images.forEach((imageSrc, index) => {
            const img = document.createElement('img');
            img.className = `slider__image ${index === 0 ? 'slider__image_active' : ''}`;
            img.src = imageSrc;
            img.alt = `Фото объявления ${index}`;
            gallery.appendChild(img);
        });

        if (this.data.images.length > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'slider__btn slider__btn_prev';
            prevBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"></path></svg>';
            
            const nextBtn = document.createElement('button');
            nextBtn.className = 'slider__btn slider__btn_next';
            nextBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"></path></svg>';

            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'slider__dots';

            this.data.images.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.className = `slider__dot ${index === 0 ? 'slider__dot_active' : ''}`;
                dotsContainer.appendChild(dot);
            });

            gallery.appendChild(prevBtn);
            gallery.appendChild(nextBtn);
            gallery.appendChild(dotsContainer);
        }

        // Кнопка полноэкранного просмотра
        if (this.data.images.length > 0) {
            const fullscreenBtn = document.createElement('button');
            fullscreenBtn.className = 'slider__fullscreen-btn';
            fullscreenBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 3H5C4.44772 3 4 3.44772 4 4V7M20 7V4C20 3.44772 19.5523 3 19 3H16M16 21H19C19.5523 21 20 20.5523 20 20V17M4 17V20C4 20.5523 4.44772 21 5 21H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
            gallery.appendChild(fullscreenBtn);
        }

        container.appendChild(gallery);
    }

    renderSidebar(container) {
        const sidebar = document.createElement('div');
        sidebar.className = 'offer__sidebar';

        // Price container
        const priceContainer = document.createElement('div');
        priceContainer.className = 'offer__price-container';

        const price = document.createElement('h3');
        price.className = 'offer__price';
        price.textContent = this.data.price;

        const likeBtn = document.createElement('button');
        likeBtn.className = 'offer__like-btn';
        const likeImg = document.createElement('img');
        likeImg.src = '../images/like.png';
        likeImg.alt = 'Добавить в избранное';
        likeBtn.appendChild(likeImg);

        priceContainer.appendChild(price);
        priceContainer.appendChild(likeBtn);
        sidebar.appendChild(priceContainer);

        // Rent info
        if (this.data.offerType === 'rent') {
            this.renderRentInfo(sidebar);
        }

        // Contact section
        this.renderContactSection(sidebar);

        // User info
        this.renderUserInfo(sidebar);

        container.appendChild(sidebar);
    }

    renderRentInfo(container) {
        const rentInfo = document.createElement('div');
        rentInfo.className = 'offer__rent-info';

        const rentList = document.createElement('ul');
        rentList.className = 'offer__rent-list';

        if (this.data.deposit) {
            const depositItem = document.createElement('li');
            depositItem.className = 'offer__rent-item';
            depositItem.textContent = `Залог ............................................................ ${this.formatCurrency(this.data.deposit)}`;
            rentList.appendChild(depositItem);
        }

        const commissionItem = document.createElement('li');
        commissionItem.className = 'offer__rent-item';
        commissionItem.textContent = `Комиссия .............................................................. ${this.data.commission ? this.data.commission + '%' : 'нет'}`;
        rentList.appendChild(commissionItem);

        const prepaymentItem = document.createElement('li');
        prepaymentItem.className = 'offer__rent-item';
        prepaymentItem.textContent = 'Предоплата ................................................... 1 месяц';
        rentList.appendChild(prepaymentItem);

        if (this.data.rentalPeriod) {
            const rentalPeriodItem = document.createElement('li');
            rentalPeriodItem.className = 'offer__rent-item';
            rentalPeriodItem.textContent = `Срок аренды ................................................. ${this.data.rentalPeriod}`;
            rentList.appendChild(rentalPeriodItem);
        }

        rentInfo.appendChild(rentList);
        container.appendChild(rentInfo);
    }

    renderContactSection(container) {
        const contactSection = document.createElement('div');
        contactSection.className = 'offer__contact-section';

        const currentUser = this.state?.user;
        const isOwner = currentUser && currentUser.id === this.data.userId;

        if (isOwner) {
            // Owner sees edit/delete buttons
            const ownerActions = document.createElement('div');
            ownerActions.className = 'offer__owner-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'offer__edit-btn';
            editBtn.textContent = 'Изменить';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'offer__delete-btn';
            deleteBtn.textContent = 'Удалить';

            ownerActions.appendChild(editBtn);
            ownerActions.appendChild(deleteBtn);
            contactSection.appendChild(ownerActions);
        } else {
            if (currentUser) {
                // Authenticated user sees phone number
                const phoneDisplay = document.createElement('div');
                phoneDisplay.className = 'offer__phone-display';

                const phoneLabel = document.createElement('span');
                phoneLabel.className = 'offer__phone-label';
                phoneLabel.textContent = 'Телефон:';

                const phoneNumber = document.createElement('span');
                phoneNumber.className = 'offer__phone-number';
                phoneNumber.textContent = this.data.userPhone;

                phoneDisplay.appendChild(phoneLabel);
                phoneDisplay.appendChild(phoneNumber);
                contactSection.appendChild(phoneDisplay);
            } else {
                // Unauthenticated user sees call button
                const callBtn = document.createElement('button');
                callBtn.className = 'offer__contact-btn';
                callBtn.textContent = 'Позвонить';
                contactSection.appendChild(callBtn);
            }
        }

        container.appendChild(contactSection);
    }

    renderUserInfo(container) {
        const userContainer = document.createElement('div');
        userContainer.className = 'offer__user';

        const userImg = document.createElement('img');
        userImg.src = '../images/user.png';
        userImg.alt = 'Пользователь';

        const userName = document.createElement('span');
        userName.className = 'offer__user-name';
        userName.textContent = this.data.userName;

        userContainer.appendChild(userImg);
        userContainer.appendChild(userName);
        container.appendChild(userContainer);
    }

    renderCharacteristics(container) {
        const section = document.createElement('div');
        section.className = 'offer__section';

        const title = document.createElement('h2');
        title.className = 'offer__section-title';
        title.textContent = 'Характеристики';

        const features = document.createElement('div');
        features.className = 'offer__features';

        this.data.characteristics.forEach(char => {
            const feature = document.createElement('div');
            feature.className = 'offer__feature';

            const icon = document.createElement('img');
            icon.className = 'offer__feature-icon';
            icon.src = `../images/${char.icon}_icon.png`;
            icon.alt = char.title;

            const content = document.createElement('div');
            content.className = 'offer__feature-content';

            const featureTitle = document.createElement('h3');
            featureTitle.className = 'offer__feature-title';
            featureTitle.textContent = char.title;

            const featureValue = document.createElement('p');
            featureValue.className = 'offer__feature-value';
            featureValue.textContent = char.value;

            content.appendChild(featureTitle);
            content.appendChild(featureValue);
            feature.appendChild(icon);
            feature.appendChild(content);
            features.appendChild(feature);
        });

        section.appendChild(title);
        section.appendChild(features);
        container.appendChild(section);
    }

    renderDescription(container) {
        const section = document.createElement('div');
        section.className = 'offer__section';

        const title = document.createElement('h2');
        title.className = 'offer__section-title';
        title.textContent = 'Описание';

        const description = document.createElement('p');
        description.className = 'offer__description';
        description.textContent = this.data.description;

        section.appendChild(title);
        section.appendChild(description);
        container.appendChild(section);
    }

    renderMap(container) {
        const section = document.createElement('div');
        section.className = 'offer__section';

        const title = document.createElement('h2');
        title.className = 'offer__section-title';
        title.textContent = 'Местоположение на карте';

        const map = document.createElement('div');
        map.className = 'offer__map';

        section.appendChild(title);
        section.appendChild(map);
        container.appendChild(section);
    }

    formatCurrency(amount) {
        if (!amount && amount !== 0) return '—';
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0
        }).format(amount);
    }

    initializeSlider(container) {
        const gallery = container.querySelector('.offer__gallery');
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

    attachEventListeners(container) {
        if (this.data.images.length > 1) {
            this.attachSliderEvents();
        }

        const fullscreenBtn = container.querySelector('.slider__fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.openFullscreen());
        }

        const callButton = container.querySelector('.offer__contact-btn');
        if (callButton) {
            callButton.addEventListener('click', () => this.handleCall());
        }

        const editButton = container.querySelector('.offer__edit-btn');
        if (editButton) {
            editButton.addEventListener('click', () => this.handleEdit());
        }

        const deleteButton = container.querySelector('.offer__delete-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => this.showDeleteModal());
        }

        const likeButton = container.querySelector('.offer__like-btn');
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

        if (!images || !images[index] || !dots || !dots[index]) return;
        if (index === this.currentSlide) return;

        images[this.currentSlide].classList.remove('slider__image_active');
        dots[this.currentSlide].classList.remove('slider__dot_active');

        images[index].classList.add('slider__image_active');
        dots[index].classList.add('slider__dot_active');

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
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'fullscreen-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => this.closeFullscreen(overlay));
        
        // Navigation buttons
        const prevBtn = document.createElement('button');
        prevBtn.className = 'fullscreen-nav fullscreen-prev';
        prevBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"></path></svg>';
        prevBtn.addEventListener('click', () => this.navigateFullscreen(-1));
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'fullscreen-nav fullscreen-next';
        nextBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"></path></svg>';
        nextBtn.addEventListener('click', () => this.navigateFullscreen(1));
        
        // Image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'fullscreen-image-container';
        
        this.data.images.forEach((imageSrc, index) => {
            const img = document.createElement('img');
            img.className = `fullscreen-image ${index === this.fullscreenCurrentSlide ? 'fullscreen-image-active' : ''}`;
            img.src = imageSrc;
            img.alt = `Фото объявления ${index}`;
            imageContainer.appendChild(img);
        });
        
        // Counter
        const counter = document.createElement('div');
        counter.className = 'fullscreen-counter';
        counter.textContent = `${this.fullscreenCurrentSlide + 1} / ${this.data.images.length}`;
        
        viewer.appendChild(closeBtn);
        viewer.appendChild(prevBtn);
        viewer.appendChild(nextBtn);
        viewer.appendChild(imageContainer);
        viewer.appendChild(counter);
        overlay.appendChild(viewer);
        
        // Keyboard navigation
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
        
        // Remove event listener when overlay is closed
        const originalClose = overlay.close;
        overlay.close = () => {
            document.removeEventListener('keydown', keyHandler);
            if (originalClose) originalClose();
        };
    }

    handleCall() {
        const currentUser = this.state?.user;
        
        if (!currentUser) {
            this.showAuthModal();
            return;
        }

        console.log('Call button clicked for offer:', this.data.id);
    }

    showAuthModal() {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal__header';

        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Авторизуйтесь, чтобы увидеть номер';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal__close';
        closeBtn.innerHTML = '&times;';

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);

        const modalBody = document.createElement('div');
        modalBody.className = 'modal__body';

        const modalText = document.createElement('p');
        modalText.textContent = 'Войдите в свой аккаунт, чтобы получить контактные данные продавца.';

        modalBody.appendChild(modalText);

        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal__footer';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'modal__btn modal__btn--cancel';
        cancelBtn.textContent = 'Отменить';

        const loginBtn = document.createElement('button');
        loginBtn.className = 'modal__btn modal__btn--login';
        loginBtn.textContent = 'Войти';

        modalFooter.appendChild(cancelBtn);
        modalFooter.appendChild(loginBtn);

        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        modal.appendChild(modalFooter);
        modalOverlay.appendChild(modal);

        const closeModal = () => modalOverlay.remove();

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        loginBtn.addEventListener('click', () => {
            closeModal();
            this.app.router.navigate('/login');
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        document.body.appendChild(modalOverlay);
    }

    showDeleteModal() {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal__header';

        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Удаление объявления';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal__close';
        closeBtn.innerHTML = '&times;';

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);

        const modalBody = document.createElement('div');
        modalBody.className = 'modal__body';

        const modalText = document.createElement('p');
        modalText.textContent = 'Вы уверены, что хотите удалить объявление?';

        modalBody.appendChild(modalText);

        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal__footer';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'modal__btn modal__btn--cancel';
        cancelBtn.textContent = 'Отменить';

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'modal__btn modal__btn--confirm';
        confirmBtn.textContent = 'Да';

        modalFooter.appendChild(cancelBtn);
        modalFooter.appendChild(confirmBtn);

        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        modal.appendChild(modalFooter);
        modalOverlay.appendChild(modal);

        const closeModal = () => modalOverlay.remove();

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        confirmBtn.addEventListener('click', () => {
            this.handleDelete();
            closeModal();
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        document.body.appendChild(modalOverlay);
    }

    handleEdit() {
        console.log('Edit button clicked for offer:', this.data.id);
    }

    async handleDelete() {
        try {
            console.log('Deleting offer:', this.data.id);
            this.app.router.navigate('/');
        } catch (error) {
            console.error('Error deleting offer:', error);
        }
    }

    handleLike() {
        console.log('Like button clicked for offer:', this.data.id);
    }
}