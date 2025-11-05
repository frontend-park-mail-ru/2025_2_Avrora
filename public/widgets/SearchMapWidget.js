import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import { SearchWidget } from "./SearchWidget.js";

export class SearchMapWidget {
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.eventListeners = [];
        this.isLoading = false;
        this.currentParams = {};
        this.allOffers = [];
    }

    async render() {
        await this.renderWithParams({});
    }

    async renderWithParams(params) {
        try {
            this.isLoading = true;
            this.renderLoading();

            // Получаем параметры из URL или из переданных параметров
            const searchParams = params.searchParams || this.getSearchParamsFromURL();
            this.currentParams = searchParams;

            console.log('SearchMapWidget rendering with params:', this.currentParams);

            // Загружаем отфильтрованные предложения с сервера
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

    async loadFilteredOffers(filters = {}) {
        try {
            // Формируем параметры для API запроса
            const apiParams = {
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

            // Добавляем timestamp для предотвращения кеширования
            apiParams._t = Date.now();

            const result = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, apiParams);

            if (!result.ok) {
                throw new Error(result.error || `HTTP ${result.status}`);
            }

            const responseData = result.data || result;
            let offers = [];

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

    getSearchParamsFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};

        if (urlParams.has('location')) params.location = urlParams.get('location');
        if (urlParams.has('offer_type')) params.offer_type = urlParams.get('offer_type');
        if (urlParams.has('property_type')) params.property_type = urlParams.get('property_type');
        if (urlParams.has('min_price')) params.min_price = urlParams.get('min_price');
        if (urlParams.has('max_price')) params.max_price = urlParams.get('max_price');
        if (urlParams.has('min_area')) params.min_area = urlParams.get('min_area');
        if (urlParams.has('max_area')) params.max_area = urlParams.get('max_area');

        return params;
    }

    renderContent(offers) {
        this.cleanup();

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-widget-container';
        this.parent.appendChild(searchContainer);

        const searchWidget = new SearchWidget(searchContainer, {
            onSearch: (params) => this.handleSearch(params),
            onShowMap: (params) => this.handleShowMap(params),
            navigate: (path) => this.navigate(path)
        });
        searchWidget.render();

        const mapContainer = document.createElement('div');
        mapContainer.className = 'search-map';

        const mapHeader = document.createElement('div');
        mapHeader.className = 'search-map__header';

        const resultsInfo = document.createElement('div');
        resultsInfo.className = 'search-map__info';

        const hasFilters = Object.keys(this.currentParams).length > 0;

        mapHeader.appendChild(resultsInfo);
        mapContainer.appendChild(mapHeader);

        const mapContent = document.createElement('div');
        mapContent.className = 'search-map__container';

        // Заглушка для карты
        const mapPlaceholder = this.createMapPlaceholder(offers);
        mapContent.appendChild(mapPlaceholder);

        mapContainer.appendChild(mapContent);
        this.parent.appendChild(mapContainer);
    }

    createMapPlaceholder(offers) {
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

        const goToListButton = placeholder.querySelector('.map-placeholder__btn--primary');
        const resetButton = placeholder.querySelector('.map-placeholder__btn--secondary');

        goToListButton.addEventListener('click', () => {
            const searchParams = new URLSearchParams(window.location.search);
            this.navigate(`/search-ads?${searchParams.toString()}`);
        });

        resetButton.addEventListener('click', () => {
            this.navigate('/search-map');
        });

        return placeholder;
    }

    handleSearch(params) {
        const url = this.buildUrl("/search-ads", params);
        this.navigate(url);
    }

    handleShowMap(params) {
        const url = this.buildUrl("/search-map", params);
        this.navigate(url);
    }

    buildUrl(basePath, params = {}) {
        const url = new URL(basePath, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value != null && value !== "" && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        return url.pathname + url.search;
    }

    navigate(path) {
        console.log('Navigating to:', path);
        if (this.app?.router?.navigate) {
            this.app.router.navigate(path);
        } else {
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    }

    renderLoading() {
        this.cleanup();
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "search-results__loading";
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Загрузка карты...</p>
        `;
        this.parent.appendChild(loadingDiv);
    }

    renderError(message) {
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

    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.parent.innerHTML = "";
    }
}