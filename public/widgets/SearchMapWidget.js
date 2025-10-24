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
    }

    async render() {
        try {
            this.isLoading = true;
            this.renderLoading();

            const offers = this.state.offers && this.state.offers.length > 0
                ? this.state.offers
                : await this.loadOffers();

            this.renderContent(offers);
        } catch (error) {
            console.error("Error rendering map:", error);
            this.renderError("Не удалось загрузить карту");
        } finally {
            this.isLoading = false;
        }
    }

    async loadOffers() {
        const result = await API.get(API_CONFIG.ENDPOINTS.OFFERS.OFFERS);
        if (result.ok && result.data && Array.isArray(result.data.offers)) {
            return result.data.offers;
        }
        return [];
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
        mapContainer.innerHTML = '<div class="search-map__container"></div>';
        this.parent.appendChild(mapContainer);
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
            if (value != null && value !== "") {
                url.searchParams.set(key, value);
            }
        });
        return url.pathname + url.search;
    }

    navigate(path) {
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
        loadingDiv.className = "search-offers__loading";
        loadingDiv.textContent = "Загрузка карты...";
        this.parent.appendChild(loadingDiv);
    }

    renderError(message) {
        this.cleanup();
        const errorDiv = document.createElement("div");
        errorDiv.className = "search-offers__error";

        const errorText = document.createElement("p");
        errorText.textContent = message;
        errorDiv.appendChild(errorText);

        const retryButton = document.createElement("button");
        retryButton.className = "search-offers__retry-btn";
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