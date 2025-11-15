import { OffersListCard } from "../components/OffersList/OffersListCard/OffersListCard.ts";

export class OffersListWidget {
    private parent: HTMLElement;
    private controller: any;
    private eventListeners: Array<{element: Element, event: string, handler: EventListenerOrEventListenerObject}>;
    private isLoading: boolean;
    private offerCards: any[];
    private meta: any;
    private currentPage: number;

    constructor(parent: HTMLElement, controller: any) {
        this.parent = parent;
        this.controller = controller;
        this.eventListeners = [];
        this.isLoading = false;
        this.offerCards = [];
        this.meta = null;
        this.currentPage = 1;
    }

    async render(): Promise<void> {
        try {
            this.isLoading = true;
            this.renderLoading();

            const { offers, meta } = await this.controller.loadOffers({ 
                limit: 8, 
                offset: (this.currentPage - 1) * 8 
            });
            this.meta = meta;

            await this.renderContent(offers);
        } catch (error) {
            console.error("Error rendering offers:", error);
            this.renderError("Не удалось загрузить объявления");
        } finally {
            this.isLoading = false;
        }
    }

    async renderWithParams(params: { searchParams?: Record<string, string> }): Promise<void> {
        try {
            this.isLoading = true;
            this.renderLoading();

            const searchParams = params.searchParams || {};
            const { offers, meta } = await this.controller.loadFilteredOffers({
                ...searchParams,
                limit: 8,
                offset: (this.currentPage - 1) * 8
            });
            this.meta = meta;

            await this.renderContent(offers);
        } catch (error) {
            console.error("Error rendering offers with params:", error);
            this.renderError("Не удалось загрузить объявления");
        } finally {
            this.isLoading = false;
        }
    }

    async renderWithOffers(offers: any[], showTitle: boolean = true): Promise<void> {
        this.cleanup();
        await this.renderContent(offers, showTitle);
    }

    private async renderContent(offers: any[], showTitle: boolean = true): Promise<void> {
        this.cleanup();

        const offersContainer = document.createElement('div');
        offersContainer.className = 'offers';

        if (showTitle) {
            const title = document.createElement('h1');
            title.className = 'offers__title';
            title.textContent = 'Актуальные объявления';
            offersContainer.appendChild(title);
        }

        if (!offers || offers.length === 0) {
            this.renderEmptyState(offersContainer);
        } else {
            this.renderOffersList(offers, offersContainer);
        }

        this.parent.appendChild(offersContainer);
    }

    private renderOffersList(offers: any[], container: HTMLElement): void {
        const offersGrid = document.createElement('div');
        offersGrid.className = 'offers__container';

        this.offerCards = offers.map(offer => {
            const formattedOffer = this.formatOffer(offer);
            const cardContainer = document.createElement('div');
            cardContainer.className = 'offer-card-container';
            return new OffersListCard(cardContainer, formattedOffer, this.controller);
        });

        this.offerCards.forEach(card => {
            try {
                const cardElement = card.render();
                if (cardElement && cardElement.nodeType === Node.ELEMENT_NODE) {
                    offersGrid.appendChild(cardElement);
                }
            } catch (error) {
                console.error('Error rendering offer card:', error);
            }
        });

        container.appendChild(offersGrid);

        if (this.meta && this.meta.total_pages > 1) {
            this.renderPagination(container);
        }
    }

    private formatOffer(apiData: any): any {
        const isLiked = this.controller.isOfferLiked(apiData.ID || apiData.id);
        const images = this.controller.getOfferImages(apiData);

        return {
            id: apiData.ID || apiData.id,
            title: apiData.Title || apiData.title || "Без названия",
            description: apiData.Description || apiData.description || "",
            price: apiData.Price || apiData.price || 0,
            area: apiData.Area || apiData.area || 0,
            rooms: apiData.Rooms || apiData.rooms || 0,
            address: apiData.Address || apiData.address || "Адрес не указан",
            offer_type: apiData.OfferType || apiData.offer_type,
            property_type: apiData.PropertyType || apiData.property_type,
            images: images,
            isLiked: isLiked,
            metro: apiData.Metro || apiData.metro || "Метро не указано",
            floor: apiData.Floor || apiData.floor,
            total_floors: apiData.TotalFloors || apiData.total_floors,
            complex_name: apiData.ComplexName || apiData.complex_name || ""
        };
    }

    private renderPagination(container: HTMLElement): void {
        const pagination = document.createElement('div');
        pagination.className = 'offers__pagination';

        for (let i = 1; i <= this.meta.total_pages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'offers__pagination-button';
            if (i === this.currentPage) {
                pageButton.classList.add('offers__pagination-button--active');
            }
            pageButton.textContent = i.toString();
            pageButton.addEventListener('click', () => {
                this.currentPage = i;
                this.render();
            });
            pagination.appendChild(pageButton);
        }

        container.appendChild(pagination);
    }

    private renderLoading(): void {
        this.cleanup();
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "offers__loading";
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Загрузка объявлений...</p>
        `;
        this.parent.appendChild(loadingDiv);
    }

    private renderError(message: string): void {
        this.cleanup();
        const errorDiv = document.createElement("div");
        errorDiv.className = "offers__error";

        const errorText = document.createElement("p");
        errorText.textContent = message;
        errorDiv.appendChild(errorText);

        const retryButton = document.createElement("button");
        retryButton.className = "offers__retry-btn";
        retryButton.textContent = "Попробовать снова";
        retryButton.addEventListener("click", () => this.render());
        errorDiv.appendChild(retryButton);

        this.parent.appendChild(errorDiv);
    }

    private renderEmptyState(container: HTMLElement): void {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "offers__empty";

        const emptyIcon = document.createElement("div");
        emptyIcon.className = "empty-icon";
        emptyIcon.innerHTML = "🏠";
        emptyDiv.appendChild(emptyIcon);

        const emptyText = document.createElement("p");
        emptyText.className = "empty-text";
        emptyText.textContent = "В данный момент нет доступных объявлений.";
        emptyDiv.appendChild(emptyText);

        container.appendChild(emptyDiv);
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

        this.parent.innerHTML = "";
    }
}