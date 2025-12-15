import { MediaService } from '../../../utils/MediaService.ts';
import { Modal } from '../../../components/OfferCreate/Modal/Modal.ts';
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
    title?: string;
    likes_count?: number;
    likesCount?: number;
    isLiked?: boolean;
    created_at?: string;
    updated_at?: string;
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
    LikesCount?: number;
    likes_count?: number;
    IsLiked?: boolean;
    isLiked?: boolean;
    CreatedAt?: string;
    created_at?: string;
    UpdatedAt?: string;
    updated_at?: string;
}

interface OffersInFeedResponse {
    Meta: {
        Total: number;
        Offset: number;
    };
    Offers: ServerOfferData[];
}

export class Favorites {
    private controller: any;
    private offers: OfferData[];
    private isLoading: boolean;
    private contentElement: HTMLElement | null;
    private isRendering: boolean;
    private parent: HTMLElement | null;
    private totalCount: number;
    private currentPage: number;
    private itemsPerPage: number;
    private retryCount: number;
    private maxRetries: number;

    constructor(controller: any, parent?: HTMLElement) {
        this.controller = controller;
        this.parent = (parent && parent.nodeType === Node.ELEMENT_NODE) ? parent : null;
        this.offers = [];
        this.isLoading = false;
        this.contentElement = null;
        this.isRendering = false;
        this.totalCount = 0;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        window.addEventListener('favoritesUpdated', () => {
            this.refreshFavorites();
        });

        window.addEventListener('authChanged', () => {
            if (this.controller?.user) {
                this.refreshFavorites();
            } else {
                this.offers = [];
                this.totalCount = 0;
                this.updateUI();
            }
        });
    }

    async render(): Promise<HTMLElement> {
        if (this.isRendering) {
            return this.contentElement || document.createElement("div");
        }
        
        this.isRendering = true;

        if (this.parent) {
            this.contentElement = this.parent;
            this.contentElement.innerHTML = '';
            this.contentElement.className = "profile__content";
        } else {
            this.contentElement = document.createElement("div");
            this.contentElement.className = "profile__content";
        }

        try {
            await this.loadFavoritesFromServer();
            
            const block = document.createElement("div");
            block.className = "profile__block";

            const headerRow = document.createElement("div");
            headerRow.className = "profile__block-header";
            
            const title = document.createElement("h1");
            title.className = "profile__title";
            title.textContent = `Избранное (${this.totalCount})`;

            headerRow.appendChild(title);
            block.appendChild(headerRow);

            if (this.isLoading) {
                const loadingDiv = document.createElement("div");
                loadingDiv.className = "profile__loading";
                loadingDiv.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <div class="spinner"></div>
                        <div style="margin-top: 10px;">Загрузка избранных...</div>
                    </div>
                `;
                block.appendChild(loadingDiv);
                this.contentElement.appendChild(block);
                return this.contentElement;
            }

            if (!this.controller?.user) {
                const authRequiredDiv = document.createElement("div");
                authRequiredDiv.className = "profile__empty";
                authRequiredDiv.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
                        <div style="font-size: 18px; font-weight: 500; margin-bottom: 10px;">Требуется авторизация</div>
                        <div style="color: #666; margin-bottom: 20px;">Войдите в аккаунт, чтобы просматривать избранное</div>
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
                this.contentElement.appendChild(block);
                return this.contentElement;
            }

            if (this.offers.length === 0) {
                const emptyMessage = document.createElement("div");
                emptyMessage.className = "profile__empty";
                emptyMessage.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">❤️</div>
                        <div style="font-size: 18px; font-weight: 500; margin-bottom: 10px;">В избранном пока пусто</div>
                        <div style="color: #666;">Добавляйте объявления в избранное, чтобы они появились здесь</div>
                    </div>
                `;
                block.appendChild(emptyMessage);
            } else {
                if (this.totalCount > this.itemsPerPage) {
                    const pagination = this.createPagination();
                    block.appendChild(pagination);
                }
                
                const offersList = document.createElement("div");
                offersList.className = "profile__offers-list";
                
                for (const offerData of this.offers) {
                    try {
                        const ad = this.createAd(offerData);
                        offersList.appendChild(ad);
                    } catch (error) {
                    }
                }
                
                block.appendChild(offersList);
                
                if (this.totalCount > this.itemsPerPage) {
                    const pagination = this.createPagination();
                    block.appendChild(pagination);
                }
            }

            this.contentElement.appendChild(block);
            
        } catch (error) {
            this.contentElement.innerHTML = `
                <div class="profile__error">
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                        <div style="font-size: 18px; font-weight: 500; margin-bottom: 10px;">Не удалось загрузить избранное</div>
                        <div style="color: #666; margin-bottom: 20px;">Произошла ошибка при загрузке данных</div>
                        <button class="profile__action-button" style="margin-top: 10px;">Попробовать снова</button>
                    </div>
                </div>
            `;
            
            const retryBtn = this.contentElement.querySelector('.profile__action-button');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => this.render());
            }
        }
        
        this.isRendering = false;
        return this.contentElement;
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

        const title = document.createElement("h1");
        title.className = "profile__ad-title";

        const typeText = offerData.offer_type === 'sale' ? 'Продажа' : 'Аренда';
        const propertyText = this.getPropertyTypeText(offerData.property_type);
        const price = this.formatPrice(offerData.price);

        title.textContent = `${typeText} ${offerData.rooms}-комн. ${propertyText}, ${price}`;

        const text = document.createElement("span");
        text.className = "profile__ad-text";
        text.textContent = offerData.address || 'Адрес не указан';

        const actions = document.createElement("div");
        actions.className = "profile__ad-actions";

        const likeButton = this.createLikeButton(offerData);
        actions.appendChild(likeButton);

        info.appendChild(title);
        info.appendChild(text);
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

    private createLikeButton(offerData: OfferData): HTMLElement {
        const likeButton = document.createElement("button");
        likeButton.className = "favorite-like-btn";
        likeButton.setAttribute("data-offer-id", offerData.id);
        likeButton.setAttribute("aria-label", "Удалить из избранного");
        likeButton.title = "Удалить из избранного";

        likeButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            likeButton.classList.add('favorite-like-btn--animating');
            
            setTimeout(async () => {
                await this.handleRemoveFavorite(offerData.id);
                likeButton.classList.remove('favorite-like-btn--animating');
            }, 300);
        });

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "24");
        svg.setAttribute("height", "24");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "#1FBB72");
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z");
        
        svg.appendChild(path);
        likeButton.appendChild(svg);

        const likesCount = offerData.likes_count || offerData.likesCount || 0;
        if (likesCount > 0) {
            const likesCounter = document.createElement("span");
            likesCounter.className = "favorite-like-counter";
            likesCounter.textContent = this.formatLikesCount(likesCount);
            likeButton.appendChild(likesCounter);
        }

        return likeButton;
    }

    private createPagination(): HTMLElement {
        const pagination = document.createElement("div");
        pagination.className = "profile__pagination";
        
        const totalPages = Math.ceil(this.totalCount / this.itemsPerPage);
        
        if (totalPages <= 1) {
            return pagination;
        }
        
        const prevButton = document.createElement("button");
        prevButton.className = "profile__pagination-button";
        prevButton.disabled = this.currentPage === 1;
        prevButton.innerHTML = "&laquo; Предыдущая";
        prevButton.addEventListener('click', async () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                await this.loadFavoritesFromServer();
                await this.updateUI();
            }
        });
        
        const pageInfo = document.createElement("span");
        pageInfo.className = "profile__pagination-info";
        pageInfo.textContent = `Страница ${this.currentPage} из ${totalPages}`;
        
        const nextButton = document.createElement("button");
        nextButton.className = "profile__pagination-button";
        nextButton.disabled = this.currentPage === totalPages;
        nextButton.innerHTML = "Следующая &raquo;";
        nextButton.addEventListener('click', async () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                await this.loadFavoritesFromServer();
                await this.updateUI();
            }
        });
        
        pagination.appendChild(prevButton);
        pagination.appendChild(pageInfo);
        pagination.appendChild(nextButton);
        
        return pagination;
    }

    private formatLikesCount(count: number): string {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
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

    private async handleRemoveFavorite(offerId: string): Promise<void> {
        try {
            if (!this.controller?.user) {
                Modal.show({
                    title: 'Ошибка',
                    message: 'Для работы с избранным необходимо авторизоваться',
                    type: 'error'
                });
                return;
            }

            const confirmed = await Modal.confirm({
                title: 'Удаление из избранного',
                message: 'Вы уверены, что хотите удалить это объявление из избранного?',
                confirmText: 'Удалить',
                cancelText: 'Отмена'
            });

            if (confirmed) {
                this.showLoading();
                
                try {
                    const response = await API.post(`${API_CONFIG.ENDPOINTS.OFFERS.LIKE}${offerId}`, {});
                    if (!response.ok) {
                        throw new Error('Failed to unlike on server');
                    }
                    
                    await this.refreshFavorites();
                    
                    EventDispatcher.dispatchFavoritesUpdated();
                    EventDispatcher.dispatchFavoritesCountUpdated(this.totalCount);
                    
                    Modal.show({
                        title: 'Успех',
                        message: 'Объявление удалено из избранного',
                        type: 'info',
                        duration: 2000
                    });
                    
                } catch (apiError) {
                    Modal.show({
                        title: 'Ошибка',
                        message: 'Не удалось удалить из избранного на сервере',
                        type: 'error'
                    });
                }
            }
        } catch (error) {
            Modal.show({
                title: 'Ошибка',
                message: 'Не удалось удалить из избранного',
                type: 'error'
            });
        }
    }

    private async loadFavoritesFromServer(): Promise<void> {
        if (!this.controller?.user) {
            this.offers = [];
            this.totalCount = 0;
            return;
        }

        this.isLoading = true;
        this.showLoading();
        
        try {
            const response = await API.get(`${API_CONFIG.ENDPOINTS.OFFERS.LIKED}`, {
                page: this.currentPage,
                limit: this.itemsPerPage
            });
            
            if (response.ok && response.data) {
                const serverData = response.data as OffersInFeedResponse;
                this.offers = this.mapServerOffers(serverData.Offers || []);
                this.totalCount = serverData.Meta?.Total || 0;
                this.retryCount = 0;
            } else {
                throw new Error('Failed to load favorites from server');
            }
        } catch (error) {
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
                return this.loadFavoritesFromServer();
            }
            
            this.offers = [];
            this.totalCount = 0;
            
            if (error.message.includes('401') || error.message.includes('403')) {
                this.controller.user = null;
                EventDispatcher.dispatchAuthChanged(false);
            }
            
            throw error;
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    private showLoading(): void {
        if (this.contentElement) {
            const loadingIndicator = this.contentElement.querySelector('.loading-indicator');
            if (!loadingIndicator) {
                const loader = document.createElement('div');
                loader.className = 'loading-indicator';
                loader.innerHTML = '<div class="spinner"></div>';
                this.contentElement.appendChild(loader);
            }
        }
    }

    private hideLoading(): void {
        if (this.contentElement) {
            const loadingIndicator = this.contentElement.querySelector('.loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
        }
    }

    private mapServerOffers(serverOffers: ServerOfferData[]): OfferData[] {
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
            area: serverOffer.Area || serverOffer.area || 0,
            title: serverOffer.Title || serverOffer.title || '',
            likes_count: serverOffer.LikesCount || serverOffer.likes_count || 0,
            isLiked: serverOffer.IsLiked || serverOffer.isLiked || true,
            created_at: serverOffer.CreatedAt || serverOffer.created_at,
            updated_at: serverOffer.UpdatedAt || serverOffer.updated_at
        }));
    }

    private async refreshFavorites(): Promise<void> {
        try {
            this.currentPage = 1;
            await this.loadFavoritesFromServer();
            await this.updateUI();
        } catch (error) {
        }
    }

    private async updateUI(): Promise<void> {
        if (!this.contentElement || this.isRendering) {
            return;
        }

        this.isRendering = true;
        
        try {
            const titleElement = this.contentElement.querySelector('.profile__title');
            if (titleElement) {
                titleElement.textContent = `Избранное (${this.totalCount})`;
            }

            const offersList = this.contentElement.querySelector('.profile__offers-list');
            if (offersList) {
                offersList.innerHTML = '';
                
                for (const offerData of this.offers) {
                    try {
                        const ad = this.createAd(offerData);
                        offersList.appendChild(ad);
                    } catch (error) {
                    }
                }
            }

            const paginationElements = this.contentElement.querySelectorAll('.profile__pagination');
            paginationElements.forEach(el => el.remove());
            
            if (this.totalCount > this.itemsPerPage) {
                const paginationTop = this.createPagination();
                const header = this.contentElement.querySelector('.profile__block-header');
                if (header && header.nextSibling) {
                    header.parentNode?.insertBefore(paginationTop, header.nextSibling);
                }
                
                const paginationBottom = this.createPagination();
                this.contentElement.querySelector('.profile__block')?.appendChild(paginationBottom);
            }

            if (this.offers.length === 0 && this.controller?.user) {
                const emptyMessage = document.createElement("div");
                emptyMessage.className = "profile__empty";
                emptyMessage.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">❤️</div>
                        <div style="font-size: 18px; font-weight: 500; margin-bottom: 10px;">В избранном пока пусто</div>
                        <div style="color: #666;">Добавляйте объявления в избранное, чтобы они появились здесь</div>
                    </div>
                `;
                
                const block = this.contentElement.querySelector('.profile__block');
                const offersListElement = block?.querySelector('.profile__offers-list');
                if (offersListElement) {
                    offersListElement.replaceWith(emptyMessage);
                }
            }
            
        } catch (error) {
        } finally {
            this.isRendering = false;
        }
    }

    get favoritesCount(): number {
        return this.totalCount;
    }

    getFavorites(): OfferData[] {
        return this.offers;
    }

    async refresh(): Promise<void> {
        await this.refreshFavorites();
    }

    cleanup(): void {
        window.removeEventListener('favoritesUpdated', () => {});
        window.removeEventListener('authChanged', () => {});
        if (this.contentElement && !this.parent) {
            this.contentElement.innerHTML = '';
        }
        this.contentElement = null;
    }
}