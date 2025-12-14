import { ProfileService } from '../../../utils/ProfileService.ts';
import { MediaService } from '../../../utils/MediaService.ts';
import { API_CONFIG } from '../../../config.js';
import { ModalView } from '../../../views/ModalView.js';

interface OfferData {
    id: string;
    offer_type: string;
    property_type: string;
    rooms: number;
    price: number;
    address: string;
    images: string[];
    image_url: string;
    status: string;
    description: string;
    area: number;
    is_promoted?: boolean;
    promotion_expires_at?: string;
}

export class MyAdvertisements {
    private controller: any;
    private offers: OfferData[];
    private isLoading: boolean;
    private parentWidget: any;
    private contentElement: HTMLElement | null;
    private isRendering: boolean;
    private modalView: ModalView;
    
    private daysInput: HTMLInputElement | null = null;
    private premiumYesButton: HTMLButtonElement | null = null;
    private premiumNoButton: HTMLButtonElement | null = null;
    private totalPriceElement: HTMLElement | null = null;
    private isPremium: boolean = false;
    private daysCount: number = 7;
    private currentOfferId: string | null = null;

    constructor(controller: any, parentWidget?: any) {
        this.controller = controller;
        this.parentWidget = parentWidget;
        this.offers = [];
        this.isLoading = false;
        this.contentElement = null;
        this.isRendering = false;
        this.modalView = new ModalView();
        this.isPremium = false;
        this.daysCount = 7;
        this.currentOfferId = null;
    }

    async render(): Promise<HTMLElement> {
        if (this.isRendering) {
            return this.contentElement || document.createElement("div");
        }
        
        this.isRendering = true;

        if (this.contentElement) {
            this.contentElement.innerHTML = '';
        } else {
            this.contentElement = document.createElement("div");
            this.contentElement.className = "profile__content";
        }

        try {
            await this.loadOffers();
            
            const block = document.createElement("div");
            block.className = "profile__block";

            const title = document.createElement("h1");
            title.className = "profile__title";
            title.textContent = `Мои объявления (${this.offers.length})`;

            block.appendChild(title);

            if (this.isLoading) {
                const loadingDiv = document.createElement("div");
                loadingDiv.className = "profile__loading";
                loadingDiv.textContent = "Загрузка объявлений...";
                block.appendChild(loadingDiv);
                this.contentElement.appendChild(block);
                return this.contentElement;
            }

            if (this.offers.length === 0) {
                const emptyMessage = document.createElement("div");
                emptyMessage.className = "profile__empty";
                emptyMessage.textContent = "У вас пока нет объявлений";
                block.appendChild(emptyMessage);
            } else {
                for (const offerData of this.offers) {
                    try {
                        const ad = this.createAd(offerData);
                        block.appendChild(ad);
                    } catch (error) {
                    }
                }
            }

            this.contentElement.appendChild(block);
            
        } catch (error) {
            this.contentElement.innerHTML = `
                <div class="profile__error">
                    <p>Не удалось загрузить объявления</p>
                    <button class="profile__retry-button">Попробовать снова</button>
                </div>
            `;
            
            const retryBtn = this.contentElement.querySelector('.profile__retry-button');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => this.render());
            }
        }
        
        this.isRendering = false;
        return this.contentElement;
    }

    async updateData(): Promise<void> {
        if (!this.contentElement || this.isRendering) {
            return;
        }

        this.isRendering = true;
        
        try {
            await this.loadOffers();

            this.contentElement.innerHTML = '';

            const block = document.createElement("div");
            block.className = "profile__block";

            const title = document.createElement("h1");
            title.className = "profile__title";
            title.textContent = `Мои объявления (${this.offers.length})`;

            block.appendChild(title);

            if (this.offers.length === 0) {
                const emptyMessage = document.createElement("div");
                emptyMessage.className = "profile__empty";
                emptyMessage.textContent = "У вас пока нет объявлений";
                block.appendChild(emptyMessage);
            } else {
                for (const offerData of this.offers) {
                    try {
                        const ad = this.createAd(offerData);
                        block.appendChild(ad);
                    } catch (error) {

                    }
                }
            }

            this.contentElement.appendChild(block);
            
        } catch (error) {

        } finally {
            this.isRendering = false;
        }
    }

    private async loadOffers(): Promise<void> {
        try {
            this.offers = await ProfileService.getMyOffers();
            await this.checkPromotionStatus();
        } catch (error) {
            this.offers = [];
            throw error;
        }
    }

    private async checkPromotionStatus(): Promise<void> {
        try {
            const { API } = await import('../../../utils/API.js');
            const response = await API.get(API_CONFIG.ENDPOINTS.OFFERS.PAID_OFFERS);
            
            if (response.ok && response.data) {
                let paidOffers = [];
                
                if (response.data.Offers && Array.isArray(response.data.Offers)) {
                    paidOffers = response.data.Offers;
                } else if (response.data.offers && Array.isArray(response.data.offers)) {
                    paidOffers = response.data.offers;
                } else if (Array.isArray(response.data)) {
                    paidOffers = response.data;
                }

                const paidOfferIds = new Set(paidOffers.map((offer: any) => offer.ID || offer.id));
                
                for (const offer of this.offers) {
                    offer.is_promoted = paidOfferIds.has(offer.id);
                }
            }
        } catch (error) {

        }
    }

    private formatExpiryDate(dateString: string): string {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    private createAd(offerData: OfferData): HTMLElement {
        const ad = document.createElement("div");
        ad.className = "profile__ad";
        ad.dataset.offerId = offerData.id;

        const img = document.createElement("img");
        img.className = "profile__ad-image";

        let imageUrl = offerData.image_url || offerData.images?.[0];
        if (imageUrl) {
            img.src = MediaService.getOfferImageUrl(imageUrl);
        } else {
            img.src = MediaService.getAvatarUrl("default_offer.jpg");
        }
        
        img.alt = "Объявление";
        img.loading = "lazy";
        img.onerror = () => {
            img.src = MediaService.getAvatarUrl("default_offer.jpg");
        };

        const info = document.createElement("div");
        info.className = "profile__ad-info";

        const infoTitle = document.createElement("h1");
        infoTitle.className = "profile__ad-title";

        const typeText = offerData.offer_type === 'sale' ? 'Продажа' : 'Аренда';
        const propertyText = this.getPropertyTypeText(offerData.property_type);
        const price = this.formatPrice(offerData.price);

        infoTitle.textContent = `${typeText} ${offerData.rooms}-комн. ${propertyText}, ${price}`;

        const infoText = document.createElement("span");
        infoText.className = "profile__ad-text";
        infoText.textContent = offerData.address || 'Адрес не указан';

        if (offerData.is_promoted) {
            const promotedBadge = document.createElement("div");
            promotedBadge.className = "profile__ad-promoted-badge";
            
            const badgeText = document.createElement("span");
            badgeText.textContent = "🔥 Продвигается";
            
            if (offerData.promotion_expires_at) {
                const expiryText = document.createElement("span");
                expiryText.className = "profile__ad-promoted-expiry";
                expiryText.textContent = `До: ${this.formatExpiryDate(offerData.promotion_expires_at)}`;
                promotedBadge.appendChild(expiryText);
            }
            
            promotedBadge.appendChild(badgeText);
            info.appendChild(promotedBadge);
        }

        const actions = document.createElement("div");
        actions.className = "profile__ad-actions";

        const editButton = document.createElement("button");
        editButton.className = "profile__ad-action profile__ad-action--edit";
        editButton.textContent = "Редактировать";
        editButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.controller.navigate(`/edit-offer/${offerData.id}`);
        });

        const promotionButton = document.createElement("button");
        promotionButton.className = `profile__ad-action ${offerData.is_promoted ? 'profile__ad-action--promotion-active' : 'profile__ad-action--promotion'}`;
        promotionButton.textContent = offerData.is_promoted ? "Управлять продвижением" : "Продвижение";
        promotionButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.showPromotionModal(offerData);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "profile__ad-action profile__ad-action--delete";
        deleteButton.textContent = "Удалить";
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.handleDeleteOffer(offerData.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(promotionButton);
        actions.appendChild(deleteButton);

        info.appendChild(infoTitle);
        info.appendChild(infoText);
        info.appendChild(actions);

        ad.appendChild(img);
        ad.appendChild(info);

        ad.addEventListener('click', (e) => {
            if (!(e.target as Element).closest('.profile__ad-actions')) {
                this.controller.navigate(`/offers/${offerData.id}`);
            }
        });

        return ad;
    }

    private getPropertyTypeText(propertyType: string): string {
        const types: { [key: string]: string } = {
            'flat': 'кв.',
            'house': 'дом',
            'garage': 'гараж',
            'apartment': 'апартаменты',
            'studio': 'студия'
        };
        return types[propertyType] || 'недвижимость';
    }

    private formatPrice(price: number): string {
        if (!price || price === 0) return 'цена не указана';
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }

    private showPromotionModal(offerData: OfferData): void {
        this.currentOfferId = offerData.id;
        
        if (offerData.is_promoted) {
            this.showPromotionManagementModal(offerData);
        } else {
            this.showPromotionPurchaseModal(offerData);
        }
    }

    private showPromotionManagementModal(offerData: OfferData): void {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal__header';

        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Управление продвижением';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal__close';
        closeBtn.innerHTML = '&times;';

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);

        const modalBody = document.createElement('div');
        modalBody.className = 'modal__body';

        const modalText = document.createElement('p');
        modalText.textContent = `✅ Объявление "${offerData.address}" уже продвигается`;
        
        if (offerData.promotion_expires_at) {
            const expiryText = document.createElement('p');
            expiryText.textContent = `Действует до: ${this.formatExpiryDate(offerData.promotion_expires_at)}`;
            expiryText.style.color = '#666';
            expiryText.style.marginTop = '8px';
            modalBody.appendChild(expiryText);
        }

        const disclaimer = document.createElement('p');
        disclaimer.textContent = 'Для управления продвижением обратитесь в поддержку.';
        disclaimer.style.color = '#999';
        disclaimer.style.fontSize = '14px';
        disclaimer.style.marginTop = '16px';

        modalBody.appendChild(modalText);
        modalBody.appendChild(disclaimer);

        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal__footer';

        const closeButton = document.createElement('button');
        closeButton.className = 'modal__btn modal__btn--confirm';
        closeButton.textContent = 'Закрыть';

        modalFooter.appendChild(closeButton);

        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        modal.appendChild(modalFooter);
        modalOverlay.appendChild(modal);

        const closeModal = () => modalOverlay.remove();

        closeBtn.addEventListener('click', closeModal);
        closeButton.addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        document.body.appendChild(modalOverlay);
    }

    private showPromotionPurchaseModal(offerData: OfferData): void {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.maxWidth = '500px';

        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal__header';

        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Платное продвижение';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal__close';
        closeBtn.innerHTML = '&times;';

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);

        const modalBody = document.createElement('div');
        modalBody.className = 'modal__body';

        const subtitle = document.createElement('p');
        subtitle.textContent = 'Выберите срок, в течение которого Ваше объявление будет лучшим';
        subtitle.style.color = '#666';
        subtitle.style.marginBottom = '24px';
        subtitle.style.textAlign = 'center';

        const daysField = document.createElement('div');
        daysField.style.marginBottom = '20px';
        
        const daysLabel = document.createElement('label');
        daysLabel.textContent = 'Количество дней';
        daysLabel.style.display = 'block';
        daysLabel.style.fontSize = '14px';
        daysLabel.style.fontWeight = '500';
        daysLabel.style.marginBottom = '8px';
        daysLabel.style.color = '#333';
        
        this.daysInput = document.createElement('input');
        this.daysInput.type = 'number';
        this.daysInput.min = '1';
        this.daysInput.value = '7';
        this.daysInput.style.width = '100%';
        this.daysInput.style.padding = '12px 16px';
        this.daysInput.style.fontSize = '16px';
        this.daysInput.style.border = '2px solid #A0A8BE';
        this.daysInput.style.borderRadius = '8px';
        this.daysInput.style.outline = 'none';
        this.daysInput.style.transition = 'border-color 0.3s ease';
        
        this.daysInput.addEventListener('focus', () => {
            this.daysInput.style.borderColor = '#1FBB72';
        });
        
        this.daysInput.addEventListener('blur', () => {
            this.daysInput.style.borderColor = '#A0A8BE';
        });
        
        this.daysInput.addEventListener('input', () => {
            this.daysCount = parseInt(this.daysInput?.value || '7');
            if (this.daysCount < 1) {
                this.daysCount = 1;
                if (this.daysInput) this.daysInput.value = '1';
            }
            this.updateTotalPrice();
        });

        daysField.appendChild(daysLabel);
        daysField.appendChild(this.daysInput);

        const premiumField = document.createElement('div');
        premiumField.style.marginBottom = '20px';
        
        const premiumLabel = document.createElement('label');
        premiumLabel.textContent = 'Тип «Премиум»';
        premiumLabel.style.display = 'block';
        premiumLabel.style.fontSize = '14px';
        premiumLabel.style.fontWeight = '500';
        premiumLabel.style.marginBottom = '8px';
        premiumLabel.style.color = '#333';
        
        const premiumToggle = document.createElement('div');
        premiumToggle.style.display = 'flex';
        premiumToggle.style.gap = '12px';
        premiumToggle.style.marginTop = '8px';

        this.premiumYesButton = document.createElement('button');
        this.premiumYesButton.textContent = 'Да';
        this.premiumYesButton.style.flex = '1';
        this.premiumYesButton.style.padding = '12px 16px';
        this.premiumYesButton.style.fontSize = '16px';
        this.premiumYesButton.style.fontWeight = '500';
        this.premiumYesButton.style.border = '2px solid #A0A8BE';
        this.premiumYesButton.style.backgroundColor = 'white';
        this.premiumYesButton.style.borderRadius = '8px';
        this.premiumYesButton.style.cursor = 'pointer';
        this.premiumYesButton.style.transition = 'all 0.3s ease';

        this.premiumNoButton = document.createElement('button');
        this.premiumNoButton.textContent = 'Нет';
        this.premiumNoButton.style.flex = '1';
        this.premiumNoButton.style.padding = '12px 16px';
        this.premiumNoButton.style.fontSize = '16px';
        this.premiumNoButton.style.fontWeight = '500';
        this.premiumNoButton.style.border = '2px solid #1FBB72';
        this.premiumNoButton.style.backgroundColor = '#1FBB72';
        this.premiumNoButton.style.color = 'white';
        this.premiumNoButton.style.borderRadius = '8px';
        this.premiumNoButton.style.cursor = 'pointer';
        this.premiumNoButton.style.transition = 'all 0.3s ease';

        this.isPremium = false;
        this.premiumYesButton.classList.add('active');
        this.premiumNoButton.classList.add('active');

        this.premiumYesButton.addEventListener('click', () => {
            this.isPremium = true;
            this.premiumYesButton.style.borderColor = '#1FBB72';
            this.premiumYesButton.style.backgroundColor = '#1FBB72';
            this.premiumYesButton.style.color = 'white';
            this.premiumNoButton.style.borderColor = '#A0A8BE';
            this.premiumNoButton.style.backgroundColor = 'white';
            this.premiumNoButton.style.color = 'inherit';
            this.updateTotalPrice();
        });

        this.premiumNoButton.addEventListener('click', () => {
            this.isPremium = false;
            this.premiumNoButton.style.borderColor = '#1FBB72';
            this.premiumNoButton.style.backgroundColor = '#1FBB72';
            this.premiumNoButton.style.color = 'white';
            this.premiumYesButton.style.borderColor = '#A0A8BE';
            this.premiumYesButton.style.backgroundColor = 'white';
            this.premiumYesButton.style.color = 'inherit';
            this.updateTotalPrice();
        });

        premiumToggle.appendChild(this.premiumYesButton);
        premiumToggle.appendChild(this.premiumNoButton);

        premiumField.appendChild(premiumLabel);
        premiumField.appendChild(premiumToggle);

        const totalBlock = document.createElement('div');
        totalBlock.style.display = 'flex';
        totalBlock.style.justifyContent = 'space-between';
        totalBlock.style.alignItems = 'center';
        totalBlock.style.padding = '20px';
        totalBlock.style.backgroundColor = '#f8f9fa';
        totalBlock.style.borderRadius = '12px';
        totalBlock.style.margin = '24px 0';

        const totalLabel = document.createElement('span');
        totalLabel.textContent = 'Итоговая цена';
        totalLabel.style.fontFamily = '"Inter", sans-serif';
        totalLabel.style.fontSize = '18px';
        totalLabel.style.fontWeight = '600';
        totalLabel.style.color = '#333';

        this.totalPriceElement = document.createElement('span');
        this.totalPriceElement.textContent = '700 ₽';
        this.totalPriceElement.style.fontFamily = '"Inter", sans-serif';
        this.totalPriceElement.style.fontSize = '24px';
        this.totalPriceElement.style.fontWeight = '700';
        this.totalPriceElement.style.color = '#1FBB72';

        totalBlock.appendChild(totalLabel);
        totalBlock.appendChild(this.totalPriceElement);

        const payButton = document.createElement('button');
        payButton.textContent = 'Оплатить';
        payButton.style.width = '100%';
        payButton.style.padding = '16px';
        payButton.style.fontFamily = '"Inter", sans-serif';
        payButton.style.fontSize = '18px';
        payButton.style.fontWeight = '600';
        payButton.style.color = 'white';
        payButton.style.backgroundColor = '#1FBB72';
        payButton.style.border = 'none';
        payButton.style.borderRadius = '8px';
        payButton.style.cursor = 'pointer';
        payButton.style.transition = 'all 0.3s ease';
        payButton.style.marginTop = '8px';

        payButton.addEventListener('mouseenter', () => {
            payButton.style.backgroundColor = '#18955c';
            payButton.style.transform = 'translateY(-1px)';
            payButton.style.boxShadow = '0 4px 8px rgba(31, 187, 114, 0.3)';
        });

        payButton.addEventListener('mouseleave', () => {
            payButton.style.backgroundColor = '#1FBB72';
            payButton.style.transform = 'translateY(0)';
            payButton.style.boxShadow = 'none';
        });

        payButton.addEventListener('click', async () => {
            if (this.currentOfferId) {
                await this.createYooKassaPayment(this.currentOfferId);
            }
        });

        modalBody.appendChild(subtitle);
        modalBody.appendChild(daysField);
        modalBody.appendChild(premiumField);
        modalBody.appendChild(totalBlock);
        modalBody.appendChild(payButton);

        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal__footer';

        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        modal.appendChild(modalFooter);
        modalOverlay.appendChild(modal);

        const closeModal = () => {
            modalOverlay.remove();
            this.currentOfferId = null;
        };

        closeBtn.addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        document.body.appendChild(modalOverlay);

        this.updateTotalPrice();
    }

    private updateTotalPrice(): void {
        if (!this.totalPriceElement) return;

        const basePricePerDay = 100;
        let totalPrice = this.daysCount * basePricePerDay;

        if (this.isPremium) {
            totalPrice *= 1.5;
        }

        this.totalPriceElement.textContent = new Intl.NumberFormat('ru-RU').format(Math.round(totalPrice)) + ' ₽';
    }

    private async createYooKassaPayment(offerId: string): Promise<void> {
        try {
            const { API } = await import('../../../utils/API.js');
            
            const response = await API.post(`${API_CONFIG.ENDPOINTS.OFFERS.GET_PAYMENT_LINK}${offerId}`, {});

            if (response.ok && response.data) {
                let paymentUrl = response.data;
                
                if (typeof paymentUrl === 'string') {
                    paymentUrl = paymentUrl.trim();
                    paymentUrl = paymentUrl.replace(/^["']|["']$/g, '');

                    if (paymentUrl && (paymentUrl.startsWith('http://') || paymentUrl.startsWith('https://'))) {
                        const newWindow = window.open(paymentUrl, '_blank');
                        
                        const modalOverlay = document.querySelector('.modal-overlay');
                        if (modalOverlay) {
                            modalOverlay.remove();
                        }
                        
                        if (newWindow) {
                            this.showPaymentStartedModal(paymentUrl);
                        } else {
                            this.showPaymentLinkModal(paymentUrl);
                        }
                    } else {
                        this.showErrorModal('Ошибка платежа', `Получена некорректная ссылка для оплаты. Свяжитесь с поддержкой.`);
                    }
                } else {
                    this.showErrorModal('Ошибка платежа', 'Неверный формат ответа от сервера. Ожидалась ссылка.');
                }
            } else {
                this.showErrorModal('Ошибка при создании платежа', 
                    response.error || 'Не удалось создать платеж. Пожалуйста, попробуйте позже.');
            }

        } catch (error) {
            this.showErrorModal('Ошибка при создании платежа', 
                'Не удалось создать платеж. Пожалуйста, попробуйте позже или обратитесь в поддержку.');
        }
    }

    private showPaymentStartedModal(paymentUrl: string): void {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.maxWidth = '500px';

        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal__header';

        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Платеж создан';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal__close';
        closeBtn.innerHTML = '&times;';

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);

        const modalBody = document.createElement('div');
        modalBody.className = 'modal__body';

        const successIcon = document.createElement('div');
        successIcon.innerHTML = '✅';
        successIcon.style.textAlign = 'center';
        successIcon.style.fontSize = '48px';
        successIcon.style.marginBottom = '20px';

        const message = document.createElement('p');
        message.textContent = 'Вы будете перенаправлены на страницу оплаты ЮKassa. Если окно не открылось автоматически, нажмите кнопку ниже:';
        message.style.textAlign = 'center';
        message.style.marginBottom = '20px';

        const openPaymentButton = document.createElement('button');
        openPaymentButton.textContent = 'Перейти к оплате';
        openPaymentButton.style.width = '100%';
        openPaymentButton.style.padding = '16px';
        openPaymentButton.style.fontFamily = '"Inter", sans-serif';
        openPaymentButton.style.fontSize = '18px';
        openPaymentButton.style.fontWeight = '600';
        openPaymentButton.style.color = 'white';
        openPaymentButton.style.backgroundColor = '#1FBB72';
        openPaymentButton.style.border = 'none';
        openPaymentButton.style.borderRadius = '8px';
        openPaymentButton.style.cursor = 'pointer';
        openPaymentButton.style.transition = 'all 0.3s ease';
        openPaymentButton.style.marginBottom = '16px';

        openPaymentButton.addEventListener('click', () => {
            window.open(paymentUrl, '_blank');
        });

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Скопировать ссылку';
        copyButton.style.width = '100%';
        copyButton.style.padding = '12px';
        copyButton.style.fontFamily = '"Inter", sans-serif';
        copyButton.style.fontSize = '16px';
        copyButton.style.fontWeight = '500';
        copyButton.style.color = '#333';
        copyButton.style.backgroundColor = '#f5f5f5';
        copyButton.style.border = '1px solid #ddd';
        copyButton.style.borderRadius = '8px';
        copyButton.style.cursor = 'pointer';
        copyButton.style.marginBottom = '16px';

        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(paymentUrl).then(() => {
                copyButton.textContent = 'Скопировано!';
                copyButton.style.backgroundColor = '#1FBB72';
                copyButton.style.color = 'white';
                setTimeout(() => {
                    copyButton.textContent = 'Скопировать ссылку';
                    copyButton.style.backgroundColor = '#f5f5f5';
                    copyButton.style.color = '#333';
                }, 2000);
            });
        });

        const note = document.createElement('p');
        note.textContent = 'После успешной оплаты статус продвижения обновится автоматически в течение нескольких минут. Для обновления статуса обновите страницу.';
        note.style.color = '#666';
        note.style.fontSize = '14px';
        note.style.textAlign = 'center';

        modalBody.appendChild(successIcon);
        modalBody.appendChild(message);
        modalBody.appendChild(openPaymentButton);
        modalBody.appendChild(copyButton);
        modalBody.appendChild(note);

        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal__footer';

        const closeButton = document.createElement('button');
        closeButton.className = 'modal__btn modal__btn--confirm';
        closeButton.textContent = 'Закрыть';

        modalFooter.appendChild(closeButton);

        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        modal.appendChild(modalFooter);
        modalOverlay.appendChild(modal);

        const closeModal = () => modalOverlay.remove();

        closeBtn.addEventListener('click', closeModal);
        closeButton.addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        document.body.appendChild(modalOverlay);
    }

    private showPaymentLinkModal(paymentUrl: string): void {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.maxWidth = '500px';

        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal__header';

        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Окно было заблокировано';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal__close';
        closeBtn.innerHTML = '&times;';

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);

        const modalBody = document.createElement('div');
        modalBody.className = 'modal__body';

        const warningIcon = document.createElement('div');
        warningIcon.innerHTML = '⚠️';
        warningIcon.style.textAlign = 'center';
        warningIcon.style.fontSize = '48px';
        warningIcon.style.marginBottom = '20px';

        const message = document.createElement('p');
        message.textContent = 'Браузер заблокировал всплывающее окно. Скопируйте ссылку ниже и откройте ее в новом окне:';
        message.style.textAlign = 'center';
        message.style.marginBottom = '20px';

        const urlContainer = document.createElement('div');
        urlContainer.style.display = 'flex';
        urlContainer.style.gap = '8px';
        urlContainer.style.marginBottom = '20px';

        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.value = paymentUrl;
        urlInput.readOnly = true;
        urlInput.style.flex = '1';
        urlInput.style.padding = '12px 16px';
        urlInput.style.border = '1px solid #ddd';
        urlInput.style.borderRadius = '4px';
        urlInput.style.fontSize = '14px';

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Копировать';
        copyButton.style.padding = '12px 16px';
        copyButton.style.backgroundColor = '#f5f5f5';
        copyButton.style.border = '1px solid #ddd';
        copyButton.style.borderRadius = '4px';
        copyButton.style.cursor = 'pointer';

        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(paymentUrl).then(() => {
                copyButton.textContent = 'Скопировано!';
                copyButton.style.backgroundColor = '#1FBB72';
                copyButton.style.color = 'white';
                setTimeout(() => {
                    copyButton.textContent = 'Копировать';
                    copyButton.style.backgroundColor = '#f5f5f5';
                    copyButton.style.color = 'inherit';
                }, 2000);
            });
        });

        urlContainer.appendChild(urlInput);
        urlContainer.appendChild(copyButton);

        const openButton = document.createElement('button');
        openButton.textContent = 'Открыть ссылку';
        openButton.style.width = '100%';
        openButton.style.padding = '16px';
        openButton.style.fontFamily = '"Inter", sans-serif';
        openButton.style.fontSize = '18px';
        openButton.style.fontWeight = '600';
        openButton.style.color = 'white';
        openButton.style.backgroundColor = '#1FBB72';
        openButton.style.border = 'none';
        openButton.style.borderRadius = '8px';
        openButton.style.cursor = 'pointer';
        openButton.style.transition = 'all 0.3s ease';
        openButton.style.marginBottom = '16px';

        openButton.addEventListener('click', () => {
            window.open(paymentUrl, '_blank');
        });

        modalBody.appendChild(warningIcon);
        modalBody.appendChild(message);
        modalBody.appendChild(urlContainer);
        modalBody.appendChild(openButton);

        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal__footer';

        const closeButton = document.createElement('button');
        closeButton.className = 'modal__btn modal__btn--confirm';
        closeButton.textContent = 'Закрыть';

        modalFooter.appendChild(closeButton);

        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        modal.appendChild(modalFooter);
        modalOverlay.appendChild(modal);

        const closeModal = () => modalOverlay.remove();

        closeBtn.addEventListener('click', closeModal);
        closeButton.addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        document.body.appendChild(modalOverlay);
    }

    private showErrorModal(title: string, message: string): void {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal__header';

        const modalTitle = document.createElement('h3');
        modalTitle.textContent = title;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal__close';
        closeBtn.innerHTML = '&times;';

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);

        const modalBody = document.createElement('div');
        modalBody.className = 'modal__body';

        const modalText = document.createElement('p');
        modalText.textContent = message;

        modalBody.appendChild(modalText);

        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal__footer';

        const closeButton = document.createElement('button');
        closeButton.className = 'modal__btn modal__btn--confirm';
        closeButton.textContent = 'Закрыть';

        modalFooter.appendChild(closeButton);

        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        modal.appendChild(modalFooter);
        modalOverlay.appendChild(modal);

        const closeModal = () => modalOverlay.remove();

        closeBtn.addEventListener('click', closeModal);
        closeButton.addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        document.body.appendChild(modalOverlay);
    }

    private async handleDeleteOffer(offerId: string): Promise<void> {
        try {
            const confirmed = confirm('Вы уверены, что хотите удалить это объявление?');
            
            if (!confirmed) return;

            this.isLoading = true;
            await this.updateData();

            const { API } = await import('../../../utils/API.js');

            const result = await API.delete(`${API_CONFIG.ENDPOINTS.OFFERS.DELETE}${offerId}`);

            if (result.ok) {
                this.offers = this.offers.filter(offer => offer.id !== offerId);
                
                await this.updateData();

                if (this.parentWidget && typeof this.parentWidget.updateSidebar === 'function') {
                    await this.parentWidget.updateSidebar();
                }

                if (this.parentWidget && typeof this.parentWidget.forceUpdate === 'function') {
                    await this.parentWidget.forceUpdate();
                }

                alert('Объявление успешно удалено');
            } else {
                throw new Error(result.error || 'Не удалось удалить объявление');
            }
        } catch (error) {
            alert((error as Error).message || 'Не удалось удалить объявление');
        } finally {
            this.isLoading = false;
        }
    }

    cleanup(): void {
        if (this.contentElement) {
            this.contentElement.innerHTML = '';
        }
        this.contentElement = null;
    }
}