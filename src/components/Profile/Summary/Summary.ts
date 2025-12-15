import { ProfileService } from '../../../utils/ProfileService.ts';
import { MediaService } from '../../../utils/MediaService.ts';
import { API } from '../../../utils/API.js';
import { API_CONFIG } from '../../../config.js';
import { EventDispatcher } from '../../../utils/EventDispatcher.js';

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

interface ServerOfferData {
    ID?: string;
    id?: string;
    OfferType?: string;
    offer_type?: string;
    PropertyType?: string;
    property_type?: string;
    Rooms?: number;
    rooms?: number;
    Price?: number;
    price?: number;
    Address?: string;
    address?: string;
    ImageURL?: string;
    image_url?: string;
    Images?: string[];
    images?: string[];
    Status?: string;
    status?: string;
    Description?: string;
    description?: string;
    Area?: number;
    area?: number;
    Title?: string;
    title?: string;
}

export class Summary {
    private controller: any;
    private myOffers: OfferData[];
    private favorites: OfferData[];
    private contentElement: HTMLElement | null;
    private isRendering: boolean;
    private favoritesCount: number;
    private favoritesLoading: boolean;
    private favoritesRefreshInterval: number | null;

    constructor(controller: any) {
        this.controller = controller;
        this.myOffers = [];
        this.favorites = [];
        this.contentElement = null;
        this.isRendering = false;
        this.favoritesCount = 0;
        this.favoritesLoading = false;
        this.favoritesRefreshInterval = null;
        
        window.addEventListener('favoritesUpdated', () => {
            this.refreshFavoritesData();
        });

        window.addEventListener('favoritesCountUpdated', (event) => {
            this.favoritesCount = event.detail.count;
            this.updateFavoritesBlock();
        });

        window.addEventListener('authChanged', () => {
            this.refreshFavoritesData();
        });
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
            await this.loadData();
            await this.refreshFavoritesData();
            
            const quickAdBlock = this.createQuickAdBlock();
            const paidPromotionBlock = this.createPaidPromotionBlock();
            const myAdsBlock = await this.createMyAdsBlock();
            const favoritesBlock = await this.createFavoritesBlock();

            this.contentElement.appendChild(quickAdBlock);
            this.contentElement.appendChild(myAdsBlock);
            this.contentElement.appendChild(favoritesBlock);
            this.contentElement.appendChild(paidPromotionBlock);
            
            this.startAutoRefresh();
            
        } catch (error) {
            this.contentElement.innerHTML = `
                <div class="profile__error">
                    <p>Не удалось загрузить данные сводки</p>
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
            await this.loadData();
            await this.refreshFavoritesData();

            this.contentElement.innerHTML = '';

            const quickAdBlock = this.createQuickAdBlock();
            const paidPromotionBlock = this.createPaidPromotionBlock();
            const myAdsBlock = await this.createMyAdsBlock();
            const favoritesBlock = await this.createFavoritesBlock();

            this.contentElement.appendChild(quickAdBlock);
            this.contentElement.appendChild(myAdsBlock);
            this.contentElement.appendChild(favoritesBlock);
            this.contentElement.appendChild(paidPromotionBlock);
            
        } catch (error) {
        } finally {
            this.isRendering = false;
        }
    }

    private async refreshFavoritesData(): Promise<void> {
        try {
            await this.updateFavoritesCount();
            await this.updateFavoritesBlock();
        } catch (error) {
        }
    }

    private async updateFavoritesCount(): Promise<void> {
        try {
            if (!this.controller?.user) {
                this.favoritesCount = 0;
                return;
            }

            const response = await API.get(`${API_CONFIG.ENDPOINTS.OFFERS.LIKED}?limit=1&page=1`);
            
            if (response.ok && response.data && response.data.Meta) {
                const newCount = response.data.Meta.Total || 0;
                if (newCount !== this.favoritesCount) {
                    this.favoritesCount = newCount;
                    EventDispatcher.dispatchFavoritesCountUpdated(this.favoritesCount);
                }
            } else {
                this.favoritesCount = 0;
            }
        } catch (error) {
            this.favoritesCount = 0;
        }
    }

    private async updateFavoritesBlock(): Promise<void> {
        if (!this.contentElement) return;
        
        const favoritesTitles = this.contentElement.querySelectorAll('.profile__title');
        favoritesTitles.forEach(title => {
            if (title.textContent?.includes('Избранное')) {
                title.textContent = `Избранное (${this.favoritesCount})`;
            }
        });
        
        const favoritesBlock = this.contentElement.querySelector('.profile__block:nth-child(3)');
        if (favoritesBlock) {
            const newFavoritesBlock = await this.createFavoritesBlock();
            favoritesBlock.replaceWith(newFavoritesBlock);
        }
    }

    private async loadData(): Promise<void> {
        try {
            if (this.controller?.user) {
                this.myOffers = await ProfileService.getMyOffers();
            } else {
                this.myOffers = [];
            }
        } catch (error) {
            this.myOffers = [];
        }
    }

    private startAutoRefresh(): void {
        if (this.favoritesRefreshInterval) {
            clearInterval(this.favoritesRefreshInterval);
        }
        
        this.favoritesRefreshInterval = window.setInterval(() => {
            if (this.controller?.user) {
                this.updateFavoritesCount();
            }
        }, 30000);
    }

    private createQuickAdBlock(): HTMLElement {
        const block = document.createElement("div");
        block.className = "profile__block";

        const title = document.createElement("h1");
        title.className = "profile__title";
        title.textContent = "Добавление объявления в 1 клик";

        const text = document.createElement("span");
        text.className = "profile__text";
        text.textContent = "Воспользуйтесь функцией «Добавление в один клик», чтобы быстро и без лишних хлопот разместить своё объявление";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "profile__action-button";
        button.textContent = "Добавить объявление";

        button.addEventListener("click", () => {
            if (this.controller.user) {
                if (this.controller.isProfileComplete()) {
                    this.controller.navigate("/create-ad");
                } else {
                    this.controller.showProfileCompletionModal();
                }
            } else {
                this.controller.navigate("/login");
            }
        });

        block.appendChild(title);
        block.appendChild(text);
        block.appendChild(button);

        return block;
    }
    
    private createPaidPromotionBlock(): HTMLElement {
        const block = document.createElement("div");
        block.className = "profile__block";

        const title = document.createElement("h1");
        title.className = "profile__title";
        title.textContent = "Платное продвижение";

        const text = document.createElement("span");
        text.className = "profile__text";
        text.textContent = "Стандартная публикация — это как кричать в толпе. Чтобы вас услышали, нужно быть на сцене. Услуга «Продвижение на Homa» — уникальная возможность  выделиться в поиске и попасть в популярные объявления.";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "profile__action-button";
        button.textContent = "Выбрать объявление";

        button.addEventListener("click", () => {
            if (this.controller.user) {
                if (this.controller.isProfileComplete()) {
                    this.controller.navigate("/profile/myoffers");
                } else {
                    this.controller.showProfileCompletionModal();
                }
            } else {
                this.controller.navigate("/login");
            }
        });

        block.appendChild(title);
        block.appendChild(text);
        block.appendChild(button);

        return block;
    }

    private async createMyAdsBlock(): Promise<HTMLElement> {
        const block = document.createElement("div");
        block.className = "profile__block";

        const title = document.createElement("h1");
        title.className = "profile__title";
        
        if (!this.controller?.user) {
            title.textContent = "Мои объявления";
        } else {
            title.textContent = `Мои объявления (${this.myOffers.length})`;
        }

        block.appendChild(title);

        if (!this.controller?.user) {
            const authRequiredDiv = document.createElement("div");
            authRequiredDiv.className = "profile__empty";
            authRequiredDiv.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 18px; font-weight: 500; margin-bottom: 10px;">Войдите в аккаунт, чтобы просматривать свои объявления</div>
                    <button class="profile__action-button" style="margin-top: 10px;">Войти</button>
                </div>
            `;
            
            const loginButton = authRequiredDiv.querySelector('.profile__action-button');
            if (loginButton) {
                loginButton.addEventListener('click', () => {
                    this.controller.navigate("/login");
                });
            }
            
            block.appendChild(authRequiredDiv);
        } else if (this.myOffers.length === 0) {
            const ad = this.createAd(
                MediaService.getAvatarUrl("default_offer.jpg"),
                "У вас пока нет объявлений",
                "Создайте первое объявление, чтобы оно появилось здесь"
            );
            block.appendChild(ad);
        } else {
            const recentOffers = this.myOffers.slice(0, 3);
            for (const offer of recentOffers) {
                try {
                    const ad = this.createOfferAd(offer);
                    block.appendChild(ad);
                } catch (error) {
                }
            }
        }

        const link = document.createElement("button");
        link.type = "button";
        link.className = "profile__link";
        link.textContent = "Все мои объявления";

        link.addEventListener("click", () => {
            if (this.controller.user) {
                this.controller.navigate("/profile/myoffers");
            } else {
                this.controller.navigate("/login");
            }
        });

        block.appendChild(link);

        return block;
    }

    private async createFavoritesBlock(): Promise<HTMLElement> {
        const block = document.createElement("div");
        block.className = "profile__block";

        const headerRow = document.createElement("div");
        headerRow.className = "profile__block-header";
        
        const title = document.createElement("h1");
        title.className = "profile__title";
        title.textContent = `Избранное (${this.favoritesCount})`;

        headerRow.appendChild(title);
        block.appendChild(headerRow);

        if (this.favoritesLoading) {
            const loadingDiv = document.createElement("div");
            loadingDiv.className = "profile__loading";
            loadingDiv.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div class="spinner"></div>
                    <div style="margin-top: 10px;">Загрузка избранных...</div>
                </div>
            `;
            block.appendChild(loadingDiv);
            return block;
        }

        if (!this.controller?.user) {
            const authRequiredDiv = document.createElement("div");
            authRequiredDiv.className = "profile__empty";
            authRequiredDiv.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 18px; font-weight: 500; margin-bottom: 10px;">Войдите в аккаунт, чтобы просматривать избранное</div>
                    <button class="profile__action-button" style="margin-top: 10px;">Войти</button>
                </div>
            `;
            
            const loginButton = authRequiredDiv.querySelector('.profile__action-button');
            if (loginButton) {
                loginButton.addEventListener('click', () => {
                    this.controller.navigate("/login");
                });
            }
            
            block.appendChild(authRequiredDiv);
        } else if (this.favoritesCount === 0) {
            const ad = this.createAd(
                MediaService.getAvatarUrl("default_offer.jpg"),
                "В избранном пока пусто",
                "Добавляйте объявления в избранное, чтобы они появились здесь"
            );
            block.appendChild(ad);
        } else {
            this.favoritesLoading = true;
            try {
                const response = await API.get(`${API_CONFIG.ENDPOINTS.OFFERS.LIKED}?limit=3&page=1`);
                
                if (response.ok && response.data && response.data.Offers) {
                    const favoriteOffers = this.mapServerOffers(response.data.Offers.slice(0, 3));
                    
                    for (const offer of favoriteOffers) {
                        try {
                            const ad = this.createAdWithoutLikeButton(offer);
                            block.appendChild(ad);
                        } catch (error) {
                        }
                    }
                }
            } catch (error) {
                const errorDiv = document.createElement("div");
                errorDiv.className = "profile__error";
                errorDiv.textContent = "Не удалось загрузить избранные объявления";
                block.appendChild(errorDiv);
            } finally {
                this.favoritesLoading = false;
            }
        }

        const link = document.createElement("button");
        link.type = "button";
        link.className = "profile__link";
        link.textContent = "Все избранные";

        link.addEventListener("click", () => {
            if (this.controller.user) {
                this.controller.navigate("/profile/favorites");
            } else {
                this.controller.navigate("/login");
            }
        });

        block.appendChild(link);

        return block;
    }

    private createOfferAd(offerData: OfferData): HTMLElement {
        return this.createAdWithData(offerData);
    }

    private createAdWithoutLikeButton(offerData: OfferData): HTMLElement {
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

        const title = document.createElement("h1");
        title.className = "profile__ad-title";

        const typeText = offerData.offer_type === 'sale' ? 'Продажа' : 'Аренда';
        const propertyText = this.getPropertyTypeText(offerData.property_type);
        const price = this.formatPrice(offerData.price);

        title.textContent = `${typeText} ${offerData.rooms}-комн. ${propertyText}, ${price}`;

        const text = document.createElement("span");
        text.className = "profile__ad-text";
        text.textContent = offerData.address || 'Адрес не указан';

        info.appendChild(title);
        info.appendChild(text);

        ad.appendChild(img);
        ad.appendChild(info);

        ad.addEventListener('click', () => {
            this.controller.navigate(`/offers/${offerData.id}`);
        });

        return ad;
    }

    private createAdWithData(offerData: OfferData): HTMLElement {
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

        const title = document.createElement("h1");
        title.className = "profile__ad-title";

        const typeText = offerData.offer_type === 'sale' ? 'Продажа' : 'Аренда';
        const propertyText = this.getPropertyTypeText(offerData.property_type);
        const price = this.formatPrice(offerData.price);

        title.textContent = `${typeText} ${offerData.rooms}-комн. ${propertyText}, ${price}`;

        const text = document.createElement("span");
        text.className = "profile__ad-text";
        text.textContent = offerData.address || 'Адрес не указан';

        info.appendChild(title);
        info.appendChild(text);

        ad.appendChild(img);
        ad.appendChild(info);

        ad.addEventListener('click', () => {
            this.controller.navigate(`/offers/${offerData.id}`);
        });

        return ad;
    }

    private createAd(imgSrc: string, titleText: string, description: string): HTMLElement {
        const ad = document.createElement("div");
        ad.className = "profile__ad";

        const img = document.createElement("img");
        img.className = "profile__ad-image";
        img.src = imgSrc;
        img.alt = "Объявление";
        img.onerror = () => {
            img.src = MediaService.getAvatarUrl("default_offer.jpg");
        };

        const info = document.createElement("div");
        info.className = "profile__ad-info";

        const title = document.createElement("h1");
        title.className = "profile__ad-title";
        title.textContent = titleText;

        const text = document.createElement("span");
        text.className = "profile__ad-text";
        text.textContent = description;

        info.appendChild(title);
        info.appendChild(text);

        ad.appendChild(img);
        ad.appendChild(info);

        return ad;
    }

    private getPropertyTypeText(propertyType: string): string {
        const types: { [key: string]: string } = {
            'flat': 'кв.',
            'house': 'дом',
            'apartment': 'апартаменты',
            'studio': 'студия'
        };
        return types[propertyType] || 'недвижимость';
    }

    private formatPrice(price: number): string {
        if (!price || price === 0) return 'цена не указана';
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }

    private mapServerOffers(serverOffers: any[]): OfferData[] {
        return serverOffers.map(serverOffer => ({
            id: serverOffer.ID || serverOffer.id || '',
            offer_type: serverOffer.OfferType || serverOffer.offer_type || 'rent',
            property_type: serverOffer.PropertyType || serverOffer.property_type || 'flat',
            rooms: serverOffer.Rooms || serverOffer.rooms || 1,
            price: serverOffer.Price || serverOffer.price || 0,
            address: serverOffer.Address || serverOffer.address || '',
            images: serverOffer.Images || serverOffer.images || [],
            image_url: serverOffer.ImageURL || serverOffer.image_url || '',
            status: serverOffer.Status || serverOffer.status || 'active',
            description: serverOffer.Description || serverOffer.description || '',
            area: serverOffer.Area || serverOffer.area || 0
        }));
    }

    cleanup(): void {
        window.removeEventListener('favoritesUpdated', () => {});
        window.removeEventListener('favoritesCountUpdated', () => {});
        window.removeEventListener('authChanged', () => {});
        
        if (this.favoritesRefreshInterval) {
            clearInterval(this.favoritesRefreshInterval);
            this.favoritesRefreshInterval = null;
        }
        
        if (this.contentElement) {
            this.contentElement.innerHTML = '';
        }
        this.contentElement = null;
    }
}