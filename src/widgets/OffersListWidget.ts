export class OffersListWidget {
    private parent: HTMLElement;
    private controller: any;
    private eventListeners: Array<{element: HTMLElement, event: string, handler: EventListenerOrEventListenerObject}>;
    private isLoading: boolean;
    private offerCards: any[];
    private currentPage: number;
    private totalPages: number;
    private limit: number;
    private allOffers: any[];

    constructor(parent: HTMLElement, controller: any) {
        this.parent = parent;
        this.controller = controller;
        this.eventListeners = [];
        this.isLoading = false;
        this.offerCards = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.limit = 8;
        this.allOffers = [];
    }

    async render(): Promise<void> {
        try {
            this.isLoading = true;
            this.renderLoading();

            const result = await this.controller.loadOffers({
                page: this.currentPage,
                limit: this.limit
            });
            await this.renderContent(result.offers, result.meta);
        } catch (error) {
            this.renderError("Не удалось загрузить объявления");
        } finally {
            this.isLoading = false;
        }
    }

    async renderWithOffers(offers: any[], showTitle: boolean = true): Promise<void> {
        try {
            this.isLoading = true;
            this.renderLoading();

            this.allOffers = offers || [];
            this.totalPages = Math.ceil((offers?.length || 0) / this.limit);

            const paginatedOffers = this.getPaginatedOffers();
            await this.renderContent(paginatedOffers, { total_pages: this.totalPages }, showTitle);
        } catch (error) {
            this.renderError("Не удалось отобразить объявления");
        } finally {
            this.isLoading = false;
        }
    }

    getPaginatedOffers(): any[] {
        const startIndex = (this.currentPage - 1) * this.limit;
        const endIndex = startIndex + this.limit;
        return (this.allOffers || []).slice(startIndex, endIndex);
    }

    async renderContent(offers: any[], meta: any = null, showTitle: boolean = true): Promise<void> {
        this.cleanup();

        if (!offers || offers.length === 0) {
            this.renderEmptyState(showTitle);
            return;
        }

        const offersContainer = document.createElement('div');
        offersContainer.className = 'offers';

        if (showTitle) {
            const title = document.createElement('h1');
            title.className = 'offers__title';
            title.textContent = 'Популярные объявления';
            offersContainer.appendChild(title);
        }

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'offers__container';
        offersContainer.appendChild(cardsContainer);

        this.parent.appendChild(offersContainer);

        const formattedOffers = offers.map(offer => this.formatOffer(offer));
        await this.initializeOfferCards(cardsContainer, formattedOffers);

        if (meta && meta.total_pages && meta.total_pages > 1) {
            this.renderPagination(meta);
        }
    }

    formatOffer(apiData: any): any {
        const isLiked = this.controller.isOfferLiked(apiData.id || apiData.ID);
        const images = this.controller.getOfferImages(apiData);

        const offerId = apiData.id || apiData.ID;
        const price = apiData.price || apiData.Price || 0;
        const address = apiData.address || apiData.Address || "Адрес не указан";

        return {
            id: offerId,
            title: apiData.title || "Без названия",
            price: price,
            area: apiData.area || apiData.Area || 0,
            rooms: apiData.rooms || apiData.Rooms || 0,
            address: address,
            metro: apiData.metro || apiData.Metro || "Метро не указано",
            images: images,
            multipleImages: images.length > 1,
            likeClass: isLiked ? "liked" : "",
            likeIcon: isLiked ? "../../images/active__like.png" : "../../images/like.png",
            formattedPrice: this.formatPrice(price),
            likesCount: apiData.likes_count || apiData.likesCount || 0, // Добавляем получение счетчика
            isLiked: isLiked
        };
    }

    async initializeOfferCards(container: HTMLElement, offers: any[]): Promise<void> {
        this.offerCards = [];

        for (const offerData of offers) {
            if (!offerData || !offerData.id) continue;

            const cardContainer = document.createElement('div');
            cardContainer.className = 'offer-card-container';
            container.appendChild(cardContainer);

            const OffersListCard = await this.getOffersListCardClass();
            const card = new OffersListCard(
                cardContainer, 
                offerData, 
                { user: this.controller.model?.userModel?.user }, 
                { router: this.controller.router }
            );
            
            this.offerCards.push(card);
            card.render();
        }
    }

    async getOffersListCardClass(): Promise<any> {
        try {
            const module = await import("../components/OffersList/OffersListCard/OffersListCard.ts");
            return module.OffersListCard;
        } catch (error) {
            return class SimpleCard {
                constructor(parent: HTMLElement, data: any, state: any, app: any) {
                    this.parent = parent;
                    this.data = data;
                }
                
                render() {
                    this.parent.innerHTML = `
                        <div class="offer-card" data-offer-id="${this.data.id}">
                            <div class="offer-card__gallery">
                                <img src="${this.data.images[0] || '../images/default_offer.jpg'}" alt="Фото объявления">
                            </div>
                            <span class="offer-card__price">${this.data.formattedPrice} ₽</span>
                            <span class="offer-card__description">${this.data.rooms}-комн. · ${this.data.area}м²</span>
                            <span class="offer-card__address">${this.data.address}</span>
                        </div>
                    `;
                }
                
                cleanup() {
                    this.parent.innerHTML = '';
                }
            };
        }
    }

    renderPagination(meta: any): void {
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
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        this.offerCards.forEach(card => {
            if (card && card.cleanup) card.cleanup();
        });
        this.offerCards = [];

        this.parent.innerHTML = '';
    }
}
