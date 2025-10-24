import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import { OfferCard } from "../components/Offer/OfferCard/OfferCard.js";
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

    async loadOffers() {
        const result = await API.get(API_CONFIG.ENDPOINTS.OFFERS.OFFERS);
        if (result.ok && result.data && Array.isArray(result.data.offers)) {
            this.meta = result.data.meta || { page: 1, total: 0, limit: 20 };
            return result.data.offers;
        }
        return [];
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
        offersContainer.className = 'search-offers';

        const title = document.createElement('h1');
        title.className = 'search-offers__title';
        title.textContent = `Найдено ${offers.length} объявлений`;
        offersContainer.appendChild(title);

        const offersGrid = document.createElement('div');
        offersGrid.className = 'search-offers__container';

        this.offerCards = offers.map(offer => {
            const formattedOffer = this.formatOffer(offer);
            return new OfferCard(formattedOffer, this.state, this.app);
        });

        this.offerCards.forEach(offerCard => {
            const cardElement = offerCard.render();
            offersGrid.appendChild(cardElement);
        });

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
            likeClass: isLiked ? "liked" : "",
            likeIcon: isLiked ? "../../images/active__like.png" : "../../images/like.png",
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