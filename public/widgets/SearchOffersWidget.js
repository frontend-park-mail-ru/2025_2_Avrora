import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import { OffersListCard } from "../components/OffersList/OffersListCard/OffersListCard.js";
import { SearchWidget } from "./SearchWidget.js";

export class SearchOffersWidget {
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.eventListeners = [];
        this.isLoading = false;
        this.offerCards = [];
        this.meta = null;
    }

    async render() {
        try {
            this.isLoading = true;
            this.renderLoading();

            const offers = this.state.offers && this.state.offers.length > 0
                ? this.state.offers
                : await this.loadOffers();

            await this.renderContent(offers);
        } catch (error) {
            console.error("Error rendering offers:", error);
            this.renderError("Не удалось загрузить объявления");
        } finally {
            this.isLoading = false;
        }
    }

    async loadOffers(params = {}) {
        const searchParams = params || this.getSearchParamsFromURL();

        const result = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, searchParams);
        if (result.ok && result.data && Array.isArray(result.data.offers)) {
            this.meta = result.data.meta || { page: 1, total: 0, limit: 20 };
            return result.data.offers;
        }
        return [];
    }

    getSearchParamsFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            const params = {};

            if (urlParams.has('query')) params.location = urlParams.get('query');
            if (urlParams.has('deal')) params.offer_type = urlParams.get('deal');
            if (urlParams.has('type')) params.property_type = urlParams.get('type');
            if (urlParams.has('price_from')) params.min_price = urlParams.get('price_from');
            if (urlParams.has('price_to')) params.max_price = urlParams.get('price_to');
            if (urlParams.has('area_from')) params.min_area = urlParams.get('area_from');
            if (urlParams.has('area_to')) params.max_area = urlParams.get('area_to');

            return params;
    }

    async renderContent(offers) {
        this.cleanup();

        if (!offers || offers.length === 0) {
            this.renderEmptyState();
            return;
        }

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-widget-container';
        this.parent.appendChild(searchContainer);

        const searchWidget = new SearchWidget(searchContainer, {
            onSearch: (params) => this.handleSearch(params),
            onShowMap: (params) => this.handleShowMap(params),
            navigate: (path) => this.navigate(path)
        });
        searchWidget.render();

        const offersContainer = document.createElement('div');
        offersContainer.className = 'offers';

        const title = document.createElement('h1');
        title.className = 'offers__title';

        const totalCount = this.meta ? this.meta.total : offers.length;
        title.textContent = `Найдено ${totalCount} объявлений`;
        offersContainer.appendChild(title);

        const offersGrid = document.createElement('div');
        offersGrid.className = 'offers__container';

        this.offerCards = offers.map(offer => {
            const formattedOffer = this.formatOffer(offer);
            const cardContainer = document.createElement('div');
            return new OffersListCard(cardContainer, formattedOffer, this.state, this.app);
        });

        for (const offerCard of this.offerCards) {
            try {
                const cardElement = await offerCard.render();
                if (cardElement && cardElement.nodeType === Node.ELEMENT_NODE) {
                    offersGrid.appendChild(cardElement);
                }
            } catch (error) {
                console.error('Error rendering offer card:', error);
            }
        }

        offersContainer.appendChild(offersGrid);
        this.parent.appendChild(offersContainer);
    }

    formatOffer(offer) {
        const isLiked = this.state.user?.likedOffers?.includes(offer.id) || false;

        return {
            id: offer.id,
            title: offer.title || "Без названия",
            description: offer.description || "",
            price: offer.price,
            area: offer.area,
            rooms: offer.rooms == null ? 1 : offer.rooms,
            address: offer.address || "Адрес не указан",
            offer_type: offer.offer_type,
            images: offer.images,
            isLiked: isLiked,
            metro: "Метро не указано"
        };
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
        loadingDiv.textContent = "Загрузка объявлений...";
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

    renderEmptyState() {
        this.cleanup();
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "search-offers__empty";

        const emptyText = document.createElement("p");
        emptyText.textContent = "Нет доступных объявлений";
        emptyDiv.appendChild(emptyText);

        this.parent.appendChild(emptyDiv);
    }

    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        this.offerCards.forEach(card => {
            if (card.cleanup) card.cleanup();
        });
        this.offerCards = [];

        this.parent.innerHTML = "";
    }
}