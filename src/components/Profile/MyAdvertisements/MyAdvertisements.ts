import { ProfileService } from '../../../utils/ProfileService.ts';
import { MediaService } from '../../../utils/MediaService.ts';
import { Modal } from '../../../components/OfferCreate/Modal/Modal.ts';
import { API_CONFIG } from '../../../config.js';

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
}

interface ModalConfig {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: string;
    onConfirm?: () => void;
}

export class MyAdvertisements {
    private controller: any;
    private offers: OfferData[];
    private isLoading: boolean;
    private parentWidget: any;
    private contentElement: HTMLElement | null;
    private isRendering: boolean;

    constructor(controller: any, parentWidget?: any) {
        this.controller = controller;
        this.parentWidget = parentWidget;
        this.offers = [];
        this.isLoading = false;
        this.contentElement = null;
        this.isRendering = false;
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
        } catch (error) {
            this.offers = [];
            throw error;
        }
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

        const actions = document.createElement("div");
        actions.className = "profile__ad-actions";

        const editButton = document.createElement("button");
        editButton.className = "profile__ad-action profile__ad-action--edit";
        editButton.textContent = "Редактировать";
        editButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.controller.navigate(`/edit-offer/${offerData.id}`);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "profile__ad-action profile__ad-action--delete";
        deleteButton.textContent = "Удалить";
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.handleDeleteOffer(offerData.id);
        });

        actions.appendChild(editButton);
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

    private async handleDeleteOffer(offerId: string): Promise<void> {
        try {
            const confirmed = await Modal.confirm({
                title: 'Удаление объявления',
                message: 'Вы уверены, что хотите удалить это объявление?',
                confirmText: 'Удалить',
                cancelText: 'Отмена'
            });

            if (confirmed) {
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

                    Modal.show({
                        title: 'Успех',
                        message: 'Объявление успешно удалено',
                        type: 'info'
                    });
                } else {
                    throw new Error(result.error || 'Не удалось удалить объявление');
                }
            }
        } catch (error) {
            Modal.show({
                title: 'Ошибка',
                message: (error as Error).message || 'Не удалось удалить объявление',
                type: 'error'
            });
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