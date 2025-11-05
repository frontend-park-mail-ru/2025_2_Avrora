import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import { SearchWidget } from "./SearchWidget.ts";

interface SearchParams {
    location?: string;
    offer_type?: string;
    property_type?: string;
    min_price?: string;
    max_price?: string;
    min_area?: string;
    max_area?: string;
    [key: string]: any;
}

interface OffersResponse {
    offers: any[];
}

export class SearchMapWidget {
    private parent: HTMLElement;
    private state: any;
    private app: any;
    private eventListeners: Array<{ element: EventTarget; event: string; handler: EventListenerOrEventListenerObject }>;
    private isLoading: boolean;
    private currentParams: SearchParams;
    private allOffers: any[];

    constructor(parent: HTMLElement, state: any, app: any) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.eventListeners = [];
        this.isLoading = false;
        this.currentParams = {};
        this.allOffers = [];
    }

    async render(): Promise<void> {
        await this.renderWithParams({});
    }

    async renderWithParams(params: { searchParams?: SearchParams } = {}): Promise<void> {
        try {
            this.isLoading = true;
            this.renderLoading();

            const searchParams = params.searchParams || this.getSearchParamsFromURL();
            this.currentParams = searchParams;

            console.log('SearchMapWidget rendering with params:', this.currentParams);

            const { offers } = await this.loadFilteredOffers(this.currentParams);
            this.allOffers = offers;

            this.renderContent(offers);
        } catch (error) {
            console.error("Error rendering map:", error);
            this.renderError("Не удалось загрузить карту");
        } finally {
            this.isLoading = false;
        }
    }

    private async loadFilteredOffers(filters: SearchParams = {}): Promise<OffersResponse> {
        try {
            const apiParams: Record<string, any> = {
                limit: 100,
                offset: 0
            };

            if (filters.location) {
                apiParams.address = filters.location;
            }
            if (filters.offer_type) {
                apiParams.offer_type = filters.offer_type;
            }
            if (filters.property_type) {
                apiParams.property_type = filters.property_type;
            }
            if (filters.min_price) {
                apiParams.price_min = parseInt(filters.min_price);
            }
            if (filters.max_price) {
                apiParams.price_max = parseInt(filters.max_price);
            }
            if (filters.min_area) {
                apiParams.area_min = parseFloat(filters.min_area);
            }
            if (filters.max_area) {
                apiParams.area_max = parseFloat(filters.max_area);
            }

            apiParams._t = Date.now();

            const result = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, apiParams);

            if (!result.ok) {
                throw new Error(result.error || `HTTP ${result.status}`);
            }

            const responseData = result.data || result;
            let offers: any[] = [];

            if (responseData.Offers && Array.isArray(responseData.Offers)) {
                offers = responseData.Offers;
            } else if (responseData.offers && Array.isArray(responseData.offers)) {
                offers = responseData.offers;
            } else if (responseData.data && Array.isArray(responseData.data)) {
                offers = responseData.data;
            } else if (Array.isArray(responseData)) {
                offers = responseData;
            }

            return { offers };
        } catch (error) {
            console.error('Error loading filtered offers for map:', error);
            return { offers: [] };
        }
    }

    private getSearchParamsFromURL(): SearchParams {
        const urlParams = new URLSearchParams(window.location.search);
        const params: SearchParams = {};

        if (urlParams.has('location')) params.location = urlParams.get('location')!;
        if (urlParams.has('offer_type')) params.offer_type = urlParams.get('offer_type')!;
        if (urlParams.has('property_type')) params.property_type = urlParams.get('property_type')!;
        if (urlParams.has('min_price')) params.min_price = urlParams.get('min_price')!;
        if (urlParams.has('max_price')) params.max_price = urlParams.get('max_price')!;
        if (urlParams.has('min_area')) params.min_area = urlParams.get('min_area')!;
        if (urlParams.has('max_area')) params.max_area = urlParams.get('max_area')!;

        return params;
    }

    private renderContent(offers: any[]): void {
        this.cleanup();

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-widget-container';
        this.parent.appendChild(searchContainer);

        const searchWidget = new SearchWidget(searchContainer, {
            onSearch: (params: SearchParams) => this.handleSearch(params),
            onShowMap: (params: SearchParams) => this.handleShowMap(params),
            navigate: (path: string) => this.navigate(path)
        });
        searchWidget.render();

        const mapContainer = document.createElement('div');
        mapContainer.className = 'search-map';

        const mapHeader = document.createElement('div');
        mapHeader.className = 'search-map__header';

        const resultsInfo = document.createElement('div');
        resultsInfo.className = 'search-map__info';

        mapHeader.appendChild(resultsInfo);
        mapContainer.appendChild(mapHeader);

        const mapContent = document.createElement('div');
        mapContent.className = 'search-map__container';

        const mapPlaceholder = this.createMapPlaceholder(offers);
        mapContent.appendChild(mapPlaceholder);

        mapContainer.appendChild(mapContent);
        this.parent.appendChild(mapContainer);
    }

    private createMapPlaceholder(offers: any[]): HTMLElement {
        const placeholder = document.createElement('div');
        placeholder.className = 'search-map__placeholder';

        placeholder.innerHTML = `
            <div class="map-placeholder">
                <div class="map-placeholder__icon">🗺️</div>
                <h3 class="map-placeholder__title">Карта находится в разработке</h3>
                <p class="map-placeholder__description">
                    Функционал карты будет доступен в ближайшее время.<br>
                    Пока что вы можете просмотреть объявления в виде списка.
                </p>
                <div class="map-placeholder__actions">
                    <button class="map-placeholder__btn map-placeholder__btn--primary">Перейти к списку</button>
                    <button class="map-placeholder__btn map-placeholder__btn--secondary">Сбросить фильтры</button>
                </div>
            </div>
        `;

        const goToListButton = placeholder.querySelector('.map-placeholder__btn--primary') as HTMLButtonElement;
        const resetButton = placeholder.querySelector('.map-placeholder__btn--secondary') as HTMLButtonElement;

        goToListButton.addEventListener('click', () => {
            const searchParams = new URLSearchParams(window.location.search);
            this.navigate(`/search-ads?${searchParams.toString()}`);
        });

        resetButton.addEventListener('click', () => {
            this.navigate('/search-map');
        });

        return placeholder;
    }

    private handleSearch(params: SearchParams): void {
        const url = this.buildUrl("/search-ads", params);
        this.navigate(url);
    }

    private handleShowMap(params: SearchParams): void {
        const url = this.buildUrl("/search-map", params);
        this.navigate(url);
    }

    private buildUrl(basePath: string, params: SearchParams = {}): string {
        const url = new URL(basePath, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value != null && value !== "" && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        return url.pathname + url.search;
    }

    private navigate(path: string): void {
        console.log('Navigating to:', path);
        if (this.app?.router?.navigate) {
            this.app.router.navigate(path);
        } else {
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    }

    private renderLoading(): void {
        this.cleanup();
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "search-results__loading";
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Загрузка карты...</p>
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
        retryButton.addEventListener("click", () => this.render());
        errorDiv.appendChild(retryButton);

        this.parent.appendChild(errorDiv);
    }

    cleanup(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.parent.innerHTML = "";
    }
}