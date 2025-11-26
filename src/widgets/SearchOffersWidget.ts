import { OffersListCard } from "../components/OffersList/OffersListCard/OffersListCard.ts";
import { SearchWidget } from "./SearchWidget.ts";

export class SearchOffersWidget {
    private parent: HTMLElement;
    private controller: any;
    private eventListeners: Array<{element: Element, event: string, handler: EventListenerOrEventListenerObject}>;
    private isLoading: boolean;
    private offerCards: any[];
    private meta: any;
    private currentParams: Record<string, string>;
    private allOffers: any[];

    constructor(parent: HTMLElement, controller: any) {
        this.parent = parent;
        this.controller = controller;
        this.eventListeners = [];
        this.isLoading = false;
        this.offerCards = [];
        this.meta = null;
        this.currentParams = {};
        this.allOffers = [];
    }

    async renderWithParams(params: { searchParams?: Record<string, string> }): Promise<void> {
        try {
            this.isLoading = true;
            this.renderLoading();

            const searchParams = params.searchParams || this.getSearchParamsFromURL();
            this.currentParams = searchParams;

            console.log('Loading offers with params:', this.currentParams);

            const { offers, meta } = await this.controller.loadFilteredOffers(this.currentParams);
            this.allOffers = offers || [];
            this.meta = meta;

            console.log('Loaded offers:', this.allOffers.length);

            await this.renderContent(this.allOffers);
        } catch (error) {
            console.error("Error rendering offers:", error);
            this.renderError("Не удалось загрузить объявления");
        } finally {
            this.isLoading = false;
        }
    }

    private getSearchParamsFromURL(): Record<string, string> {
        const urlParams = new URLSearchParams(window.location.search);
        const params: Record<string, string> = {};

        if (urlParams.has('location')) params.location = urlParams.get('location')!;
        if (urlParams.has('offer_type')) params.offer_type = urlParams.get('offer_type')!;
        if (urlParams.has('property_type')) params.property_type = urlParams.get('property_type')!;
        if (urlParams.has('min_price')) params.min_price = urlParams.get('min_price')!;
        if (urlParams.has('max_price')) params.max_price = urlParams.get('max_price')!;
        if (urlParams.has('min_area')) params.min_area = urlParams.get('min_area')!;
        if (urlParams.has('max_area')) params.max_area = urlParams.get('max_area')!;

        return params;
    }

    private async renderContent(offers: any[]): Promise<void> {
        this.cleanup();

        // Рендерим виджет поиска
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-widget-container';
        this.parent.appendChild(searchContainer);

        try {
            const searchWidget = new SearchWidget(searchContainer, {
                onSearch: (params: Record<string, string>) => this.handleSearch(params),
                onShowMap: (params: Record<string, string>) => this.handleShowMap(params),
                navigate: (path: string) => this.controller.navigate(path)
            });
            await searchWidget.render();
        } catch (error) {
            console.error('Error rendering search widget:', error);
        }

        // Рендерим результаты
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';

        if (!offers || offers.length === 0) {
            this.renderEmptyState(resultsContainer);
        } else {
            await this.renderOffersList(offers, resultsContainer);
        }

        this.parent.appendChild(resultsContainer);
    }

    private async renderOffersList(offers: any[], container: HTMLElement): Promise<void> {
        const offersContainer = document.createElement('div');
        offersContainer.className = 'offers';

        // Заголовок
        const title = document.createElement('h1');
        title.className = 'offers__title';

        const hasFilters = Object.keys(this.currentParams).length > 0;
        const totalCount = offers.length;

        if (hasFilters) {
            title.textContent = `Найдено ${totalCount} объявлений по вашему запросу`;
        } else {
            title.textContent = `Все объявления (${totalCount})`;
        }

        offersContainer.appendChild(title);

        // Активные фильтры
        if (hasFilters) {
            this.renderActiveFilters(offersContainer);
        }

        // Контейнер для карточек
        const offersGrid = document.createElement('div');
        offersGrid.className = 'offers__container';
        offersContainer.appendChild(offersGrid);

        // Асинхронно рендерим карточки
        this.offerCards = [];

        for (const offer of offers) {
            if (!offer) continue;

            try {
                const formattedOffer = this.formatOffer(offer);
                const cardContainer = document.createElement('div');
                cardContainer.className = 'offer-card-container';
                offersGrid.appendChild(cardContainer);

                console.log('Creating card for offer:', formattedOffer.id);

                const card = new OffersListCard(
                    cardContainer,
                    formattedOffer,
                    { user: this.controller.model?.userModel?.user },
                    { router: this.controller.router }
                );

                this.offerCards.push(card);
                await card.render();

            } catch (error) {
                console.error('Error rendering offer card:', error, offer);
                // Создаем fallback карточку при ошибке
                this.createFallbackCard(offersGrid, offer);
            }
        }

        container.appendChild(offersContainer);
    }

    private createFallbackCard(container: HTMLElement, offer: any): void {
        const formattedOffer = this.formatOffer(offer);
        const cardContainer = document.createElement('div');
        cardContainer.className = 'offer-card-container';

        cardContainer.innerHTML = `
            <div class="offer-card" data-offer-id="${formattedOffer.id}">
                <div class="offer-card__gallery">
                    <img src="${formattedOffer.images[0] || '../images/default_offer.jpg'}"
                         alt="Фото объявления"
                         loading="lazy"
                         class="slider__image slider__image_active">
                    <button class="offer-card__like" data-offer-id="${formattedOffer.id}">
                        <img src="${formattedOffer.likeIcon}"
                             alt="${formattedOffer.isLiked ? 'Убрать из избранного' : 'Добавить в избранное'}">
                        <span class="offer-card__likes-counter ${formattedOffer.isLiked ? 'offer-card__likes-counter--active' : ''}">
                            ${this.formatLikesCount(formattedOffer.likesCount)}
                        </span>
                    </button>
                </div>
                <span class="offer-card__price">${formattedOffer.formattedPrice} ₽</span>
                <span class="offer-card__description">
                    ${formattedOffer.rooms ? `${formattedOffer.rooms}-комн.` : 'Студия'} · ${formattedOffer.area}м²
                </span>
                <span class="offer-card__metro">
                    <img src="../images/metro.png" alt="Метро">
                    ${formattedOffer.metro}
                </span>
                <span class="offer-card__address">${formattedOffer.address}</span>
            </div>
        `;

        // Добавляем обработчик для лайка в fallback карточке
        const likeButton = cardContainer.querySelector('.offer-card__like');
        if (likeButton) {
            likeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.handleFallbackLike(formattedOffer.id, likeButton);
            });
        }

        // Добавляем обработчик для перехода к объявлению
        const cardElement = cardContainer.querySelector('.offer-card');
        if (cardElement) {
            cardElement.addEventListener('click', (e) => {
                if (!(e.target as Element).closest('.offer-card__like')) {
                    const path = `/offers/${formattedOffer.id}`;
                    if (this.controller.router?.navigate) {
                        this.controller.router.navigate(path);
                    } else {
                        window.history.pushState({}, "", path);
                        window.dispatchEvent(new PopStateEvent("popstate"));
                    }
                }
            });
        }

        container.appendChild(cardContainer);
    }

    private async handleFallbackLike(offerId: string, likeButton: Element): Promise<void> {
        if (!this.controller.model?.userModel?.user) {
            this.showAuthModal();
            return;
        }

        try {
            const response = await this.controller.likeOffer(offerId);
            if (response.ok) {
                // Обновляем UI
                const likeIcon = likeButton.querySelector('img');
                const likesCounter = likeButton.querySelector('.offer-card__likes-counter');

                if (likeIcon && likesCounter) {
                    const isLiked = likeIcon.src.includes('active__like.png');
                    const newLikedState = !isLiked;

                    likeIcon.src = newLikedState ? '../../images/active__like.png' : '../../images/like.png';
                    likeIcon.alt = newLikedState ? 'Убрать из избранного' : 'Добавить в избранное';

                    let currentCount = parseInt(likesCounter.textContent || '0');
                    currentCount = newLikedState ? currentCount + 1 : currentCount - 1;
                    likesCounter.textContent = this.formatLikesCount(currentCount);

                    likesCounter.classList.toggle('offer-card__likes-counter--active', newLikedState);
                }
            }
        } catch (error) {
            console.error('Error handling like:', error);
        }
    }

    private showAuthModal(): void {
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
            if (this.controller.router?.navigate) {
                this.controller.router.navigate('/login');
            }
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);
    }

    private formatLikesCount(count: number): string {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    }

    private renderActiveFilters(container: HTMLElement): void {
        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'active-filters';

        const filtersTitle = document.createElement('div');
        filtersTitle.className = 'active-filters__title';
        filtersTitle.textContent = 'Активные фильтры:';
        filtersContainer.appendChild(filtersTitle);

        const filtersList = document.createElement('div');
        filtersList.className = 'active-filters__list';

        Object.entries(this.currentParams).forEach(([key, value]) => {
            if (value && value !== '') {
                const filterItem = document.createElement('div');
                filterItem.className = 'active-filters__item';

                const filterText = document.createElement('span');
                filterText.className = 'active-filters__text';
                filterText.textContent = this.getFilterDisplayName(key, value);

                const removeButton = document.createElement('button');
                removeButton.className = 'active-filters__remove';
                removeButton.innerHTML = '&times;';
                removeButton.title = 'Удалить фильтр';
                removeButton.addEventListener('click', () => {
                    this.removeFilter(key);
                });

                filterItem.appendChild(filterText);
                filterItem.appendChild(removeButton);
                filtersList.appendChild(filterItem);
            }
        });

        const clearAllButton = document.createElement('button');
        clearAllButton.className = 'active-filters__clear-all';
        clearAllButton.textContent = 'Сбросить все фильтры';
        clearAllButton.addEventListener('click', () => {
            this.controller.navigate('/search-ads');
        });

        filtersContainer.appendChild(filtersList);
        filtersContainer.appendChild(clearAllButton);
        container.appendChild(filtersContainer);
    }

    private getFilterDisplayName(key: string, value: string): string {
        const displayNames: Record<string, string> = {
            'location': `Местоположение: ${value}`,
            'offer_type': `Тип сделки: ${value === 'sale' ? 'Продажа' : 'Аренда'}`,
            'property_type': `Тип недвижимости: ${this.getPropertyTypeDisplay(value)}`,
            'min_price': `Цена от: ${this.formatPrice(value)} ₽`,
            'max_price': `Цена до: ${this.formatPrice(value)} ₽`,
            'min_area': `Площадь от: ${value} м²`,
            'max_area': `Площадь до: ${value} м²`
        };

        return displayNames[key] || `${key}: ${value}`;
    }

    private getPropertyTypeDisplay(value: string): string {
        const types: Record<string, string> = {
            'apartment': 'Квартира',
            'house': 'Дом',
            'commercial': 'Коммерческая',
            'land': 'Земельный участок'
        };
        return types[value] || value;
    }

    private removeFilter(key: string): void {
        const newParams = { ...this.currentParams };
        delete newParams[key];

        const url = this.buildUrl('/search-ads', newParams);
        this.controller.navigate(url);
    }

    private formatOffer(apiData: any): any {
        console.log('Formatting offer data:', apiData);

        const isLiked = this.controller.isOfferLiked?.(apiData.ID || apiData.id) || false;
        const images = this.controller.getOfferImages?.(apiData) || [];

        const offerId = apiData.ID || apiData.id;
        const price = apiData.Price || apiData.price || 0;
        const address = apiData.Address || apiData.address || "Адрес не указан";
        const area = apiData.Area || apiData.area || 0;
        const rooms = apiData.Rooms || apiData.rooms || 0;
        const metro = apiData.Metro || apiData.metro || "Метро не указано";
        const likesCount = apiData.likes_count || apiData.likesCount || 0;

        return {
            id: offerId,
            title: apiData.Title || apiData.title || "Без названия",
            price: price,
            area: area,
            rooms: rooms,
            address: address,
            metro: metro,
            images: images,
            multipleImages: images.length > 1,
            likeClass: isLiked ? "liked" : "",
            likeIcon: isLiked ? "../../images/active__like.png" : "../../images/like.png",
            formattedPrice: this.formatPrice(price.toString()),
            likesCount: likesCount,
            isLiked: isLiked,
            formattedLikesCount: this.formatLikesCount(likesCount)
        };
    }

    private handleSearch(params: Record<string, string>): void {
        const url = this.buildUrl("/search-ads", params);
        this.controller.navigate(url);
    }

    private handleShowMap(params: Record<string, string>): void {
        const url = this.buildUrl("/search-map", params);
        this.controller.navigate(url);
    }

    private buildUrl(basePath: string, params: Record<string, string> = {}): string {
        const url = new URL(basePath, window.location.origin);
        url.search = '';
        Object.entries(params).forEach(([key, value]) => {
            if (value != null && value !== "" && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        return url.pathname + url.search;
    }

    private renderLoading(): void {
        this.cleanup();
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "search-results__loading";
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Загрузка объявлений...</p>
        `;
        this.parent.appendChild(loadingDiv);
    }

    private renderError(message: string): void {
        this.cleanup();
        const errorDiv = document.createElement("div");
        errorDiv.className = "search-results__error";

        const errorText = document.createElement("p");
        errorText.textContent = message;
        errorDiv.appendChild(errorText);

        const retryButton = document.createElement("button");
        retryButton.className = "search-results__retry-btn";
        retryButton.textContent = "Попробовать снова";
        retryButton.addEventListener("click", () => this.renderWithParams({}));
        errorDiv.appendChild(retryButton);

        this.parent.appendChild(errorDiv);
    }

    private renderEmptyState(container: HTMLElement): void {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "search-results__empty";

        const emptyIcon = document.createElement("div");
        emptyIcon.className = "empty-icon";
        emptyIcon.innerHTML = "🔍";
        emptyDiv.appendChild(emptyIcon);

        const emptyText = document.createElement("p");
        emptyText.className = "empty-text";

        const hasFilters = Object.keys(this.currentParams).length > 0;
        if (hasFilters) {
            emptyText.textContent = "По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска.";
        } else {
            emptyText.textContent = "В данный момент нет доступных объявлений.";
        }

        emptyDiv.appendChild(emptyText);

        if (hasFilters) {
            const resetButton = document.createElement("button");
            resetButton.className = "search-results__reset-btn";
            resetButton.textContent = "Сбросить фильтры";
            resetButton.addEventListener("click", () => {
                this.controller.navigate("/search-ads");
            });
            emptyDiv.appendChild(resetButton);
        }

        container.appendChild(emptyDiv);
    }

    private formatPrice(price: string): string {
        if (!price) return '0';
        const numPrice = Number(price);
        if (isNaN(numPrice)) return '0';
        return new Intl.NumberFormat('ru-RU').format(numPrice);
    }

    cleanup(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        this.offerCards.forEach(card => {
            if (card && card.cleanup) {
                card.cleanup();
            }
        });
        this.offerCards = [];

        this.parent.innerHTML = "";
    }
}