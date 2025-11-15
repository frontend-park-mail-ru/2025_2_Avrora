import { SearchWidget } from "./SearchWidget.js";

export class SearchMapWidget {
    private parent: HTMLElement;
    private controller: any;
    private eventListeners: Array<{element: Element, event: string, handler: EventListenerOrEventListenerObject}>;
    private isLoading: boolean;
    private currentParams: Record<string, string>;
    private allOffers: any[];

    constructor(parent: HTMLElement, controller: any) {
        this.parent = parent;
        this.controller = controller;
        this.eventListeners = [];
        this.isLoading = false;
        this.currentParams = {};
        this.allOffers = [];
    }

    async renderWithParams(params: { searchParams?: Record<string, string> }): Promise<void> {
        try {
            this.isLoading = true;
            this.renderLoading();

            const searchParams = params.searchParams || this.getSearchParamsFromURL();
            this.currentParams = searchParams;

            const { offers } = await this.controller.loadFilteredOffers(this.currentParams);
            this.allOffers = offers;

            this.renderContent(offers);
        } catch (error) {
            console.error("Error rendering map:", error);
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

    private renderContent(offers: any[]): void {
        this.cleanup();

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-widget-container';
        this.parent.appendChild(searchContainer);

        const searchWidget = new SearchWidget(searchContainer, {
            onSearch: (params: Record<string, string>) => this.handleSearch(params),
            onShowMap: (params: Record<string, string>) => this.handleShowMap(params),
            navigate: (path: string) => this.controller.navigate(path)
        });
        searchWidget.render();

        const mapContainer = document.createElement('div');
        mapContainer.className = 'search-map';

        const mapHeader = document.createElement('div');
        mapHeader.className = 'search-map__header';

        const resultsInfo = document.createElement('div');
        resultsInfo.className = 'search-map__info';

        const hasFilters = Object.keys(this.currentParams).length > 0;
        const totalCount = offers.length;

        if (hasFilters) {
            resultsInfo.textContent = `Найдено ${totalCount} объявлений по вашему запросу`;
        } else {
            resultsInfo.textContent = `Все объявления на карте (${totalCount})`;
        }

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

        const totalCount = offers.length;

        placeholder.innerHTML = `
            <div class="map-placeholder">
                <div class="map-placeholder__icon">🗺️</div>
                <h3 class="map-placeholder__title">Карта находится в разработке</h3>
                <p class="map-placeholder__description">
                    Функционал карты будет доступен в ближайшее время.<br>
                    Пока что вы можете просмотреть ${totalCount} объявлений в виде списка.
                </p>
                <div class="map-placeholder__actions">
                    <button class="map-placeholder__btn map-placeholder__btn--primary">Перейти к списку</button>
                    <button class="map-placeholder__btn map-placeholder__btn--secondary">Сбросить фильтры</button>
                </div>
            </div>
        `;

        const goToListButton = placeholder.querySelector('.map-placeholder__btn--primary');
        const resetButton = placeholder.querySelector('.map-placeholder__btn--secondary');

        goToListButton!.addEventListener('click', () => {
            const searchParams = new URLSearchParams(window.location.search);
            this.controller.navigate(`/search-ads?${searchParams.toString()}`);
        });

        resetButton!.addEventListener('click', () => {
            this.controller.navigate('/search-map');
        });

        return placeholder;
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
    }
}