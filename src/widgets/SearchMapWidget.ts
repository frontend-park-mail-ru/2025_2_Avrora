import { SearchWidget } from "./SearchWidget.js";
import { YandexMapSearchService } from "../utils/YandexMapSearchService.ts";
import { OffersListCard } from "../components/OffersList/OffersListCard/OffersListCard.ts";

export class SearchMapWidget {
    private parent: HTMLElement;
    private controller: any;
    private eventListeners: Array<{element: Element, event: string, handler: EventListenerOrEventListenerObject}>;
    private isLoading: boolean;
    private currentParams: Record<string, string>;
    private allOffers: any[];
    private selectedAddress: string | null;
    private selectedOffers: any[];
    private offersListContainer: HTMLElement | null;
    private sidebar: HTMLElement | null;

    constructor(parent: HTMLElement, controller: any) {
        this.parent = parent;
        this.controller = controller;
        this.eventListeners = [];
        this.isLoading = false;
        this.currentParams = {};
        this.allOffers = [];
        this.selectedAddress = null;
        this.selectedOffers = [];
        this.offersListContainer = null;
        this.sidebar = null;
    }

    async renderWithParams(params: { searchParams?: Record<string, string> }): Promise<void> {
        try {
            this.isLoading = true;
            this.renderLoading();

            const searchParams = params.searchParams || this.getSearchParamsFromURL();
            this.currentParams = searchParams;

            const { offers } = await this.controller.loadFilteredOffers(this.currentParams);
            this.allOffers = offers;

            await this.renderContent(offers);
        } catch (error) {
            this.renderError("Не удалось загрузить карту");
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

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-widget-container';
        this.parent.appendChild(searchContainer);

        const searchWidget = new SearchWidget(searchContainer, {
            onSearch: (params: Record<string, string>) => this.handleSearch(params),
            onShowMap: (params: Record<string, string>) => this.handleShowMap(params),
            navigate: (path: string) => this.controller.navigate(path)
        });
        await searchWidget.render();

        const mapContainer = document.createElement('div');
        mapContainer.className = 'search-map';

        const mapContent = document.createElement('div');
        mapContent.className = 'search-map__container';

        this.sidebar = document.createElement('div');
        this.sidebar.className = 'search-map__sidebar';

        const sidebarHeader = document.createElement('div');
        sidebarHeader.className = 'sidebar-header';

        const title = document.createElement('h3');
        title.className = 'sidebar-header__title';
        title.textContent = 'Выберите метку на карте';

        const closeButton = document.createElement('button');
        closeButton.className = 'sidebar-header__close';
        closeButton.innerHTML = '&times;';
        closeButton.title = 'Закрыть';
        closeButton.addEventListener('click', () => {
            this.hideSidebar();
        });

        sidebarHeader.appendChild(title);
        sidebarHeader.appendChild(closeButton);
        this.sidebar.appendChild(sidebarHeader);

        this.offersListContainer = document.createElement('div');
        this.offersListContainer.className = 'offers-list';

        this.renderInitialState();

        this.sidebar.appendChild(this.offersListContainer);

        const mapElement = document.createElement('div');
        mapElement.className = 'search-map__map';

        const mapCanvas = document.createElement('div');
        mapCanvas.id = 'yandex-search-map';
        mapCanvas.style.cssText = `
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        `;

        mapElement.appendChild(mapCanvas);
        mapContent.appendChild(this.sidebar);
        mapContent.appendChild(mapElement);
        mapContainer.appendChild(mapContent);
        this.parent.appendChild(mapContainer);

        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            if (offers.length > 0) {
                await YandexMapSearchService.initMap(
                    'yandex-search-map',
                    offers,
                    this.currentParams,
                    (address: string, offers: any[]) => {
                        this.onMarkerClick(address, offers);
                    }
                );
            } else {
                this.showNoOffersMessage(mapCanvas);
            }
        } catch (error) {
            this.showMapError(mapCanvas);
        }
    }

    private renderInitialState(): void {
        if (!this.offersListContainer) return;

        this.offersListContainer.innerHTML = '';

        const initialState = document.createElement('div');
        initialState.className = 'initial-state-message';
        initialState.innerHTML = `
            <div class="initial-state-message__icon">🗺️</div>
            <h3 class="initial-state-message__title">Выберите метку на карте</h3>
            <p class="initial-state-message__description">
                Нажмите на любую метку на карте, чтобы просмотреть объявления по этому адресу
            </p>
        `;

        this.offersListContainer.appendChild(initialState);
    }

    private onMarkerClick(address: string, offers: any[]): void {
        this.selectedAddress = address;
        this.selectedOffers = offers;
        this.showSidebar();
        this.renderOffersList(offers);
        this.updateSidebarHeader();
    }

    private showSidebar(): void {
        if (this.sidebar) {
            this.sidebar.classList.add('search-map__sidebar--visible');
        }
    }

    private hideSidebar(): void {
        if (this.sidebar) {
            this.sidebar.classList.remove('search-map__sidebar--visible');
        }
        this.selectedAddress = null;
        this.selectedOffers = [];
        this.renderInitialState();
        this.updateSidebarHeader();
    }

    private updateSidebarHeader(): void {
        const title = this.parent.querySelector('.sidebar-header__title') as HTMLElement;

        if (!title) return;

        if (this.selectedAddress && this.selectedOffers) {
            const count = this.selectedOffers.length;

            let wordForm = 'объявлений';
            if (count % 10 === 1 && count % 100 !== 11) {
                wordForm = 'объявление';
            } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
                wordForm = 'объявления';
            }

            title.textContent = `${count} ${wordForm}`;
        } else {
            title.textContent = 'Выберите метку на карте';
        }
    }

    private renderOffersList(offers: any[]): void {
        if (!this.offersListContainer) return;

        this.offersListContainer.innerHTML = '';

        if (!offers || offers.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'offers-list__empty';
            emptyState.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
                <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 500;">
                    По этому адресу объявлений не найдено
                </p>
                <p style="margin: 0; font-size: 14px; color: #999;">
                    Попробуйте выбрать другой адрес
                </p>
            `;
            this.offersListContainer.appendChild(emptyState);
            return;
        }

        offers.forEach(offer => {
            const formattedOffer = this.formatOffer(offer);
            const listItem = document.createElement('div');
            listItem.className = 'offers-list__item';

            const cardContainer = document.createElement('div');
            cardContainer.style.padding = '16px';
            cardContainer.style.borderBottom = '1px solid #e0e0e0';

            const card = new OffersListCard(cardContainer, formattedOffer, this.controller);
            try {
                const cardElement = card.render();
                if (cardElement) {
                    listItem.appendChild(cardContainer);

                    listItem.addEventListener('click', () => {
                        const offerId = formattedOffer.id;
                        if (offerId) {
                            this.controller.navigate(`/offers/${offerId}`);
                        }
                    });

                    this.offersListContainer.appendChild(listItem);
                }
            } catch (error) {

            }
        });
    }

    private formatOffer(apiData: any): any {
        const isLiked = this.controller.isOfferLiked?.(apiData.ID || apiData.id) || false;

        let images: string[] = [];
        if (Array.isArray(apiData.images)) {
            images = apiData.images;
        } else if (apiData.image_url) {
            images = [apiData.image_url];
        } else if (apiData.ImageURL) {
            images = [apiData.ImageURL];
        }

        if (images.length === 0) {
            images = ['/images/default_offer.jpg'];
        }

        return {
            id: apiData.ID || apiData.id,
            title: apiData.Title || apiData.title || "Без названия",
            description: apiData.Description || apiData.description || "",
            price: apiData.Price || apiData.price || 0,
            area: apiData.Area || apiData.area || 0,
            rooms: apiData.Rooms || apiData.rooms || 0,
            address: apiData.Address || apiData.address || "Адрес не указан",
            metro: apiData.Metro || apiData.metro || "Метро не указано",
            images: images,
            isLiked: isLiked,
            floor: apiData.Floor || apiData.floor,
            total_floors: apiData.TotalFloors || apiData.total_floors
        };
    }

    private showNoOffersMessage(container: HTMLElement): void {
        container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                text-align: center;
                color: #666;
                padding: 40px;
                background: white;
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">🏠</div>
                <h3 style="margin: 0 0 12px 0; color: #333; font-size: 20px; font-weight: 600;">
                    Объявления не найдены
                </h3>
                <p style="margin: 0 0 20px 0; font-size: 16px; color: #999;">
                    Попробуйте изменить параметры поиска
                </p>
                <button class="reset-filters-btn"
                    style="
                        padding: 10px 20px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                    Сбросить фильтры
                </button>
            </div>
        `;

        const resetButton = container.querySelector('.reset-filters-btn') as HTMLButtonElement;
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.controller.navigate('/search-map');
            });
        }
    }

    private showMapError(container: HTMLElement): void {
        container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                text-align: center;
                color: #666;
                padding: 40px;
                background: white;
            ">
                <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
                <h3 style="margin: 0 0 12px 0; color: #dc3545; font-size: 20px; font-weight: 600;">
                    Ошибка загрузки карты
                </h3>
                <p style="margin: 0 0 20px 0; font-size: 16px; color: #999;">
                    Попробуйте обновить страницу
                </p>
                <button class="retry-btn"
                    style="
                        padding: 10px 20px;
                        background: #dc3545;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">
                    Попробовать снова
                </button>
            </div>
        `;

        const retryButton = container.querySelector('.retry-btn') as HTMLButtonElement;
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                this.renderWithParams({ searchParams: this.currentParams });
            });
        }
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
        loadingDiv.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 400px;
            text-align: center;
            background: white;
            border-radius: 8px;
            margin: 20px 0;
        `;
        loadingDiv.innerHTML = `
            <div class="loading-spinner" style="
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 16px;
            "></div>
            <p style="margin: 0; color: #666; font-size: 16px;">Загрузка карты...</p>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        this.parent.appendChild(loadingDiv);
    }

    private renderError(message: string): void {
        this.cleanup();
        const errorDiv = document.createElement("div");
        errorDiv.className = "search-results__error";
        errorDiv.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 400px;
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 8px;
            margin: 20px 0;
        `;

        const errorIcon = document.createElement("div");
        errorIcon.style.cssText = `
            font-size: 48px;
            margin-bottom: 16px;
            color: #dc3545;
        `;
        errorIcon.textContent = "❌";
        errorDiv.appendChild(errorIcon);

        const errorText = document.createElement("p");
        errorText.style.cssText = `
            margin: 0 0 20px 0;
            color: #dc3545;
            font-size: 18px;
            font-weight: 500;
        `;
        errorText.textContent = message;
        errorDiv.appendChild(errorText);

        const retryButton = document.createElement("button");
        retryButton.className = "search-results__retry-btn";
        retryButton.style.cssText = `
            padding: 10px 20px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        `;
        retryButton.textContent = "Попробовать снова";
        retryButton.addEventListener("click", () => this.renderWithParams({}));
        errorDiv.appendChild(retryButton);

        this.parent.appendChild(errorDiv);
    }

    cleanup(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.parent.innerHTML = "";

        YandexMapSearchService.destroyMap();
    }
}