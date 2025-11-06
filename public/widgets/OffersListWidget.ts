import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import { OffersListCard } from "../components/OffersList/OffersListCard/OffersListCard.ts";

interface OffersListState {
    user?: {
        likedOffers?: number[];
    };
}

interface AppRouter {
    navigate: (path: string) => void;
}

interface App {
    router?: AppRouter;
}

interface APIResponse {
    ok: boolean;
    data?: any;
    error?: string;
    status?: number;
}

interface EventListener {
    element: HTMLElement;
    event: string;
    handler: EventListenerOrEventListenerObject;
}

interface OfferMeta {
    total_pages?: number;
    total?: number;
    Meta?: any;
    meta?: any;
}

interface OfferData {
    id?: number;
    ID?: number;
    images?: string[];
    image_url?: string;
    ImageURL?: string;
    price?: number;
    Price?: number;
    address?: string;
    Address?: string;
    metro?: string;
    Metro?: string;
    title?: string;
    area?: number;
    Area?: number;
    rooms?: number;
    Rooms?: number;
}

export class OffersListWidget {
    parent: HTMLElement;
    state: OffersListState;
    app: App | null;
    eventListeners: EventListener[];
    isLoading: boolean;
    offerCards: OffersListCard[];
    template: any;
    currentPage: number;
    totalPages: number;
    limit: number;
    allOffers: OfferData[];

    constructor(parent: HTMLElement, state: OffersListState, app: App | null) {
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

    async loadTemplate(): Promise<any> {
        if (this.template) return this.template;

        try {
            Handlebars.registerHelper('formatPrice', function(price: number) {
                if (!price) return "Цена не указана";
                return new Intl.NumberFormat('ru-RU').format(price);
            });

            this.template = (Handlebars as any).templates["OffersList.hbs"];
            return this.template;
        } catch (error) {
            console.error('Failed to load template:', error);
            throw new Error('Template loading failed');
        }
    }

    async render(): Promise<void> {
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

    async renderWithOffers(offers: OfferData[], showTitle: boolean = true): Promise<void> {
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

    getPaginatedOffers(): OfferData[] {
        const startIndex = (this.currentPage - 1) * this.limit;
        const endIndex = startIndex + this.limit;
        return (this.allOffers || []).slice(startIndex, endIndex);
    }

    async loadOffers(params: any = {}): Promise<{offers: OfferData[], meta: OfferMeta}> {
        try {
            const result: APIResponse = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, {
                page: this.currentPage,
                limit: this.limit,
                ...params
            });

            if (!result.ok) {
                throw new Error(result.error || `HTTP ${result.status}`);
            }

            const responseData = result.data || result;

            let offers: OfferData[] = [];
            let meta: OfferMeta = {};

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

            return {
                offers: offers,
                meta: {
                    total_pages: Math.ceil((meta.Total || meta.total || offers.length) / this.limit) || 1,
                    total: meta.Total || meta.total || offers.length
                }
            };
        } catch (error) {
            console.error('Error loading offers:', error);
            throw new Error(`Не удалось загрузить объявления: ${(error as Error).message}`);
        }
    }

    async renderContent(offers: OfferData[], meta: OfferMeta | null = null, showTitle: boolean = true): Promise<void> {
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
        this.parent.appendChild(container.firstElementChild as HTMLElement);

        await this.initializeOfferCards(formattedOffers);

        if (meta && meta.total_pages && meta.total_pages > 1) {
            this.renderPagination(meta);
        }
    }

    formatOffer(apiData: OfferData): any {
        const isLiked = this.state.user?.likedOffers?.includes(apiData.id || apiData.ID!) || false;

        let images: string[] = [];
        if (Array.isArray(apiData.images)) {
            images = apiData.images;
        } else if (apiData.image_url) {
            images = [apiData.image_url];
        } else if ((apiData as any).imageURLs) {
            images = (apiData as any).imageURLs;
        } else if (apiData.ImageURL) {
            images = [apiData.ImageURL];
        }

        const offerId = apiData.id || apiData.ID;
        const price = apiData.price || apiData.Price || 0;
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

    async initializeOfferCards(offers: any[]): Promise<void> {
        const offerElements = this.parent.querySelectorAll('.offer-card');

        this.offerCards = Array.from(offerElements).map((element, index) => {
            const offerData = offers[index];

            if (!offerData || !offerData.id) {
                console.warn('Invalid offer data at index:', index, offerData);
                return null;
            }

            const card = new OffersListCard(element as HTMLElement, offerData, this.state, this.app);
            return card;
        }).filter(card => card !== null) as OffersListCard[];

        for (const card of this.offerCards) {
            if (card && card.render) {
                await card.render();
            }
        }
    }

    renderPagination(meta: OfferMeta): void {
        if (!meta || !meta.total_pages || meta.total_pages <= 1) return;

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

    renderLoading(): void {
        this.cleanup();

        const loadingDiv = document.createElement("div");
        loadingDiv.className = "offers__loading";
        loadingDiv.textContent = "Загрузка объявлений...";
        this.parent.appendChild(loadingDiv);
    }

    renderError(message: string): void {
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

    renderEmptyState(showTitle: boolean = true): void {
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

    formatPrice(price: number): string {
        if (!price) return '0';
        return new Intl.NumberFormat('ru-RU').format(price);
    }

    cleanup(): void {
        this.removeEventListeners();

        if (this.offerCards) {
            this.offerCards.forEach(card => {
                if (card && card.cleanup) card.cleanup();
            });
            this.offerCards = [];
        }

        this.parent.innerHTML = '';
    }

    removeEventListeners(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
}