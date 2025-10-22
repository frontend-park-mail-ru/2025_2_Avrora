import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import { OffersListCard } from "../components/OffersList/OffersListCard/OffersListCard.js";

export class OffersListWidget {
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.eventListeners = [];
        this.isLoading = false;
        this.offerCards = [];
        this.template = null;
    }

    async loadTemplate() {
        if (this.template) return this.template;

        try {      
            Handlebars.registerHelper('formatPrice', function(price) {
                if (!price) return "Цена не указана";
                return new Intl.NumberFormat('ru-RU').format(price);
            });

            this.template = Handlebars.templates["OffersList.hbs"];
            return this.template;
        } catch (error) {
            console.error('Failed to load template:', error);
            throw new Error('Template loading failed');
        }
    }

    async render() {
        try {
            this.isLoading = true;
            this.renderLoading();

            const offers = await this.loadOffers();
            await this.renderContent(offers);
        } catch (error) {
            console.error("Error rendering offers:", error);
            this.renderError("Не удалось загрузить объявления");
        } finally {
            this.isLoading = false;
        }
    }

    async loadOffers() {
        const result = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST);
        if (result.ok && result.data && Array.isArray(result.data.offers)) {
            return result.data.offers;
        }
        throw new Error(result.error || "Ошибка загрузки объявлений");
    }

    async renderContent(offers) {
        this.cleanup();

        if (!offers || offers.length === 0) {
            this.renderEmptyState();
            return;
        }

        const template = await this.loadTemplate();
        
        const formattedOffers = offers.map(offer => this.formatOffer(offer));
        const html = template({ offers: formattedOffers });
        
        const container = document.createElement('div');
        container.innerHTML = html;
        this.parent.appendChild(container.firstElementChild);

        this.initializeOfferCards(offers);
    }

    formatOffer(apiData) {
        const isLiked = this.state.user?.likedOffers?.includes(apiData.id) || false;

        return {
            id: apiData.id,
            title: apiData.title,
            price: apiData.price,
            area: apiData.area,
            rooms: apiData.rooms,
            address: apiData.address,
            metro: apiData.metro || "Метро не указано",
            images: Array.isArray(apiData.images) ? apiData.images : [],
            multipleImages: Array.isArray(apiData.images) && apiData.images.length > 1,
            likeClass: isLiked ? "liked" : "",
            likeIcon: isLiked ? "../../images/active__like.png" : "../../images/like.png"
        };
    }

    initializeOfferCards(offers) {
        const offerElements = this.parent.querySelectorAll('.offer-card');
        
        this.offerCards = Array.from(offerElements).map((element, index) => {
            const offerData = offers[index];
            return new OffersListCard(element, offerData, this.state, this.app);
        });
    }

    renderLoading() {
        this.cleanup();
        
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "offers__loading";
        loadingDiv.textContent = "Загрузка объявлений...";
        this.parent.appendChild(loadingDiv);
    }

    renderError(message) {
        this.cleanup();

        const offersContainer = document.createElement('div');
        offersContainer.className = 'offers';

        const title = document.createElement('h1');
        title.className = 'offers__title';
        title.textContent = 'Популярные объявления';
        offersContainer.appendChild(title);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'offers__error';

        const errorText = document.createElement('p');
        errorText.textContent = message;
        errorDiv.appendChild(errorText);

        const retryButton = document.createElement('button');
        retryButton.className = 'offers__retry-btn';
        retryButton.textContent = 'Попробовать снова';
        retryButton.addEventListener('click', () => this.render());
        errorDiv.appendChild(retryButton);

        offersContainer.appendChild(errorDiv);
        this.parent.appendChild(offersContainer);
    }

    renderEmptyState() {
        this.cleanup();

        const offersContainer = document.createElement('div');
        offersContainer.className = 'offers';

        const title = document.createElement('h1');
        title.className = 'offers__title';
        title.textContent = 'Популярные объявления';
        offersContainer.appendChild(title);

        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'offers__empty';

        const emptyText = document.createElement('p');
        emptyText.textContent = 'Нет доступных объявлений';
        emptyDiv.appendChild(emptyText);

        offersContainer.appendChild(emptyDiv);
        this.parent.appendChild(offersContainer);
    }

    cleanup() {
        this.removeEventListeners();
        
        if (this.offerCards) {
            this.offerCards.forEach(card => {
                if (card.cleanup) card.cleanup();
            });
            this.offerCards = [];
        }
        
        this.parent.innerHTML = '';
    }

    removeEventListeners() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
}