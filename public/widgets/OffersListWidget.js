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
        this.currentPage = 1;
        this.totalPages = 1;
        this.limit = 8;
        this.allOffers = [];
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

            const result = await this.loadOffers();
            await this.renderContent(result.offers, result.meta);
        } catch (error) {
            console.error("Error rendering offers:", error);
            this.renderError("Не удалось загрузить объявления");
        } finally {
            this.isLoading = false;
        }
    }

    async renderWithOffers(offers, showTitle = true) {
        try {
            this.isLoading = true;
            this.renderLoading();

            this.allOffers = offers;
            this.totalPages = Math.ceil(offers.length / this.limit);

            const paginatedOffers = this.getPaginatedOffers();
            await this.renderContent(paginatedOffers, { total_pages: this.totalPages }, showTitle);
        } catch (error) {
            console.error("Error rendering offers:", error);
            this.renderError("Не удалось отобразить объявления");
        } finally {
            this.isLoading = false;
        }
    }

    getPaginatedOffers() {
        const startIndex = (this.currentPage - 1) * this.limit;
        const endIndex = startIndex + this.limit;
        return this.allOffers.slice(startIndex, endIndex);
    }

    async loadOffers() {
        const result = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, {
            page: this.currentPage,
            limit: this.limit
        });
        if (result.ok && result.data && Array.isArray(result.data.offers)) {
            return {
                offers: result.data.offers,
                meta: result.data.meta
            };
        }
        throw new Error(result.error || "Ошибка загрузки объявлений");
    }

    async renderContent(offers, meta = null, showTitle = true) {
        this.cleanup();

        if (!offers || offers.length === 0) {
            this.renderEmptyState(showTitle);
            return;
        }

        const template = await this.loadTemplate();
        
        const formattedOffers = offers.map(offer => this.formatOffer(offer));
        const html = template({ 
            offers: formattedOffers,
            showTitle: showTitle 
        });
        
        const container = document.createElement('div');
        container.innerHTML = html;
        this.parent.appendChild(container.firstElementChild);

        this.initializeOfferCards(formattedOffers);

        if (meta && meta.total_pages > 1) {
            this.renderPagination(meta);
        }
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
            likeIcon: isLiked ? "../../images/active__like.png" : "../../images/like.png",
            formattedPrice: this.formatPrice(apiData.price)
        };
    }

    initializeOfferCards(offers) {
        const offerElements = this.parent.querySelectorAll('.offer-card');
        
        this.offerCards = Array.from(offerElements).map((element, index) => {
            const offerData = offers[index];
            const card = new OffersListCard(element, offerData, this.state, this.app);
            card.render();
            return card;
        });
    }

    renderPagination(meta) {
        if (!meta || meta.total_pages <= 1) return;

        this.totalPages = meta.total_pages;

        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'offers__pagination';

        const prevButton = document.createElement('button');
        prevButton.className = 'pagination__btn pagination__btn--prev';
        prevButton.textContent = 'Назад';
        prevButton.disabled = this.currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderWithOffers(this.allOffers, false);
            }
        });

        const pagesContainer = document.createElement('div');
        pagesContainer.className = 'pagination__pages';

        for (let i = 1; i <= this.totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `pagination__page ${i === this.currentPage ? 'pagination__page--active' : ''}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                this.currentPage = i;
                this.renderWithOffers(this.allOffers, false);
            });
            pagesContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement('button');
        nextButton.className = 'pagination__btn pagination__btn--next';
        nextButton.textContent = 'Вперед';
        nextButton.disabled = this.currentPage === this.totalPages;
        nextButton.addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.renderWithOffers(this.allOffers, false);
            }
        });

        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(pagesContainer);
        paginationContainer.appendChild(nextButton);

        this.parent.appendChild(paginationContainer);
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

    renderEmptyState(showTitle = true) {
        this.cleanup();

        const offersContainer = document.createElement('div');
        offersContainer.className = 'offers';

        if (showTitle) {
            const title = document.createElement('h1');
            title.className = 'offers__title';
            title.textContent = 'Популярные объявления';
            offersContainer.appendChild(title);
        }

        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'offers__empty';

        const emptyText = document.createElement('p');
        emptyText.textContent = 'Нет доступных объявлений';
        emptyDiv.appendChild(emptyText);

        offersContainer.appendChild(emptyDiv);
        this.parent.appendChild(offersContainer);
    }

    formatPrice(price) {
        if (!price) return '0';
        return new Intl.NumberFormat('ru-RU').format(price);
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