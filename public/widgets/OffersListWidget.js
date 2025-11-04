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

            this.allOffers = offers || [];
            this.totalPages = Math.ceil((offers?.length || 0) / this.limit);

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
        return (this.allOffers || []).slice(startIndex, endIndex);
    }

    async loadOffers(params = {}) {
        try {
            const result = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, {
                page: this.currentPage,
                limit: this.limit,
                ...params
            });

            if (!result.ok) {
                throw new Error(result.error || `HTTP ${result.status}`);
            }

            // Обрабатываем разные форматы ответа от бэкенда
            const responseData = result.data || result;

            let offers = [];
            let meta = {};

            // Поддерживаем разные форматы ответа
            if (Array.isArray(responseData.Offers)) {
                offers = responseData.Offers;
                meta = responseData.Meta || {};
            } else if (Array.isArray(responseData.offers)) {
                offers = responseData.offers;
                meta = responseData.meta || {};
            } else if (Array.isArray(responseData.data)) {
                offers = responseData.data;
                meta = responseData.meta || {};
            } else if (responseData.Offers && Array.isArray(responseData.Offers)) {
                offers = responseData.Offers;
                meta = responseData.Meta || {};
            }

            console.log('Processed offers data:', { offers, meta });

            return {
                offers: offers,
                meta: {
                    total_pages: Math.ceil((meta.Total || meta.total || offers.length) / this.limit) || 1,
                    total: meta.Total || meta.total || offers.length
                }
            };
        } catch (error) {
            console.error('Error loading offers:', error);
            throw new Error(`Не удалось загрузить объявления: ${error.message}`);
        }
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

        await this.initializeOfferCards(formattedOffers);

        if (meta && meta.total_pages > 1) {
            this.renderPagination(meta);
        }
    }

    formatOffer(apiData) {
        const isLiked = this.state.user?.likedOffers?.includes(apiData.id || apiData.ID) || false;

        // Обрабатываем разные форматы изображений от бэкенда
        let images = [];
        if (Array.isArray(apiData.images)) {
            images = apiData.images;
        } else if (apiData.image_url) {
            images = [apiData.image_url];
        } else if (apiData.imageURLs) {
            images = apiData.imageURLs;
        } else if (apiData.ImageURL) {
            images = [apiData.ImageURL];
        }

        // Обрабатываем разные форматы ID
        const offerId = apiData.id || apiData.ID;

        // Обрабатываем разные форматы цены
        const price = apiData.price || apiData.Price || 0;

        // Обрабатываем разные форматы адреса и метро
        const address = apiData.address || apiData.Address || "Адрес не указан";
        const metro = apiData.metro || apiData.Metro || "Метро не указано";

        return {
            id: offerId,
            title: apiData.title || "Без названия",
            price: price,
            area: apiData.area || apiData.Area || 0,
            rooms: apiData.rooms || apiData.Rooms || 0,
            address: address,
            metro: metro,
            images: images,
            multipleImages: images.length > 1,
            likeClass: isLiked ? "liked" : "",
            likeIcon: isLiked ? "../../images/active__like.png" : "../../images/like.png",
            formattedPrice: this.formatPrice(price)
        };
    }

    async initializeOfferCards(offers) {
        const offerElements = this.parent.querySelectorAll('.offer-card');

        this.offerCards = Array.from(offerElements).map((element, index) => {
            const offerData = offers[index];

            // Валидация обязательных полей
            if (!offerData || !offerData.id) {
                console.warn('Invalid offer data at index:', index, offerData);
                return null;
            }

            const card = new OffersListCard(element, offerData, this.state, this.app);
            return card;
        }).filter(card => card !== null);

        for (const card of this.offerCards) {
            if (card && card.render) {
                await card.render();
            }
        }
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
                if (this.allOffers.length > 0) {
                    this.renderWithOffers(this.allOffers, false);
                } else {
                    this.render();
                }
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
                if (this.allOffers.length > 0) {
                    this.renderWithOffers(this.allOffers, false);
                } else {
                    this.render();
                }
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
                if (this.allOffers.length > 0) {
                    this.renderWithOffers(this.allOffers, false);
                } else {
                    this.render();
                }
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
                if (card && card.cleanup) card.cleanup();
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