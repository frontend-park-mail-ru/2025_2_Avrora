import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import { OffersListCard } from "../components/OffersList/OffersListCard/OffersListCard.ts";
import { SearchWidget } from "./SearchWidget.ts";

interface SearchParams {
    location?: string;
    offer_type?: string;
    property_type?: string;
    min_price?: string;
    max_price?: string;
    min_area?: string;
    max_area?: string;
    [key: string]: any;
}

interface OfferData {
    id?: string | number;
    ID?: string | number;
    title?: string;
    Title?: string;
    description?: string;
    Description?: string;
    price?: number;
    Price?: number;
    area?: number;
    Area?: number;
    rooms?: number;
    Rooms?: number;
    address?: string;
    Address?: string;
    offer_type?: string;
    OfferType?: string;
    property_type?: string;
    PropertyType?: string;
    images?: string[];
    image_url?: string;
    ImageURL?: string;
    metro?: string;
    Metro?: string;
    floor?: number;
    Floor?: number;
    total_floors?: number;
    TotalFloors?: number;
    complex_name?: string;
    ComplexName?: string;
    [key: string]: any;
}

interface MetaData {
    total?: number;
    [key: string]: any;
}

interface OffersResponse {
    offers: OfferData[];
    meta: MetaData;
}

interface EventListener {
    element: EventTarget;
    event: string;
    handler: EventListenerOrEventListenerObject;
}

export class SearchOffersWidget {
    private parent: HTMLElement;
    private state: any;
    private app: any;
    private eventListeners: EventListener[];
    private isLoading: boolean;
    private offerCards: any[];
    private meta: MetaData | null;
    private currentParams: SearchParams;
    private allOffers: OfferData[];
    private lastSearchParams: SearchParams | null;

    constructor(parent: HTMLElement, state: any, app: any) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.eventListeners = [];
        this.isLoading = false;
        this.offerCards = [];
        this.meta = null;
        this.currentParams = {};
        this.allOffers = [];
        this.lastSearchParams = null;
    }

    async render(): Promise<void> {
        await this.renderWithParams({});
    }

    async renderWithParams(params: { searchParams?: SearchParams } = {}): Promise<void> {
        try {
            this.isLoading = true;
            this.renderLoading();

            const searchParams = params.searchParams || this.getSearchParamsFromURL();
            this.currentParams = searchParams;

            console.log('SearchOffersWidget rendering with params:', this.currentParams);

            const { offers, meta } = await this.loadFilteredOffers(this.currentParams);
            this.allOffers = offers;
            this.meta = meta;

            await this.renderContent(offers);
        } catch (error) {
            console.error("Error rendering offers:", error);
            this.renderError("Не удалось загрузить объявления");
        } finally {
            this.isLoading = false;
        }
    }

    private async loadFilteredOffers(filters: SearchParams = {}): Promise<OffersResponse> {
        try {
            console.log('Loading filtered offers with params:', filters);

            const apiParams: Record<string, any> = {
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

            apiParams._t = Date.now();

            const result = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, apiParams);

            if (!result.ok) {
                throw new Error(result.error || `HTTP ${result.status}`);
            }

            console.log('API filtered response:', result);

            const responseData = result.data || result;

            let offers: OfferData[] = [];
            let meta: MetaData = {};

            if (responseData.Offers && Array.isArray(responseData.Offers)) {
                offers = responseData.Offers;
                meta = responseData.Meta || {};
            } else if (responseData.offers && Array.isArray(responseData.offers)) {
                offers = responseData.offers;
                meta = responseData.meta || {};
            } else if (responseData.data && Array.isArray(responseData.data)) {
                offers = responseData.data;
                meta = responseData.meta || {};
            } else if (Array.isArray(responseData)) {
                offers = responseData;
                meta = { total: responseData.length };
            }

            console.log('Loaded filtered offers:', offers.length);
            return { offers, meta };
        } catch (error) {
            console.error('Error loading filtered offers:', error);
            throw new Error(`Не удалось загрузить объявления: ${(error as Error).message}`);
        }
    }

    private getSearchParamsFromURL(): SearchParams {
        const urlParams = new URLSearchParams(window.location.search);
        const params: SearchParams = {};

        if (urlParams.has('location')) params.location = urlParams.get('location')!;
        if (urlParams.has('offer_type')) params.offer_type = urlParams.get('offer_type')!;
        if (urlParams.has('property_type')) params.property_type = urlParams.get('property_type')!;
        if (urlParams.has('min_price')) params.min_price = urlParams.get('min_price')!;
        if (urlParams.has('max_price')) params.max_price = urlParams.get('max_price')!;
        if (urlParams.has('min_area')) params.min_area = urlParams.get('min_area')!;
        if (urlParams.has('max_area')) params.max_area = urlParams.get('max_area')!;

        return params;
    }

    private async renderContent(offers: OfferData[]): Promise<void> {
        this.cleanup();

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-widget-container';
        this.parent.appendChild(searchContainer);

        const searchWidget = new SearchWidget(searchContainer, {
            onSearch: (params: SearchParams) => this.handleSearch(params),
            onShowMap: (params: SearchParams) => this.handleShowMap(params),
            navigate: (path: string) => this.navigate(path)
        });
        await searchWidget.render();

        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';

        if (!offers || offers.length === 0) {
            this.renderEmptyState(resultsContainer);
        } else {
            this.renderOffersList(offers, resultsContainer);
        }

        this.parent.appendChild(resultsContainer);
    }

    private renderOffersList(offers: OfferData[], container: HTMLElement): void {
        const offersContainer = document.createElement('div');
        offersContainer.className = 'offers';

        const title = document.createElement('h1');
        title.className = 'offers__title';

        const hasFilters = Object.keys(this.currentParams).length > 0;
        const totalCount = offers.length;

        if (hasFilters) {
            title.textContent = `Найдено ${totalCount} объявлений по вашему запросу`;
        } else {
            title.textContent = `Все объявления (${totalCount})`;
        }

        offersContainer.appendChild(title);

        if (hasFilters) {
            this.renderActiveFilters(offersContainer);
        }

        const offersGrid = document.createElement('div');
        offersGrid.className = 'offers__container';

        this.offerCards = offers.map(offer => {
            const formattedOffer = this.formatOffer(offer);
            const cardContainer = document.createElement('div');
            cardContainer.className = 'offer-card-container';
            return new OffersListCard(cardContainer, formattedOffer, this.state, this.app);
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

        offersContainer.appendChild(offersGrid);
        container.appendChild(offersContainer);
    }

    private renderActiveFilters(container: HTMLElement): void {
        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'active-filters';

        const filtersTitle = document.createElement('div');
        filtersTitle.className = 'active-filters__title';
        filtersTitle.textContent = 'Активные фильтры:';
        filtersContainer.appendChild(filtersTitle);

        const filtersList = document.createElement('div');
        filtersList.className = 'active-filters__list';

        Object.entries(this.currentParams).forEach(([key, value]) => {
            if (value && value !== '') {
                const filterItem = document.createElement('div');
                filterItem.className = 'active-filters__item';

                const filterText = document.createElement('span');
                filterText.className = 'active-filters__text';
                filterText.textContent = this.getFilterDisplayName(key, value);

                const removeButton = document.createElement('button');
                removeButton.className = 'active-filters__remove';
                removeButton.innerHTML = '&times;';
                removeButton.title = 'Удалить фильтр';
                removeButton.addEventListener('click', () => {
                    this.removeFilter(key);
                });

                filterItem.appendChild(filterText);
                filterItem.appendChild(removeButton);
                filtersList.appendChild(filterItem);
            }
        });

        const clearAllButton = document.createElement('button');
        clearAllButton.className = 'active-filters__clear-all';
        clearAllButton.textContent = 'Сбросить все фильтры';
        clearAllButton.addEventListener('click', () => {
            this.navigate('/search-ads');
        });

        filtersContainer.appendChild(filtersList);
        filtersContainer.appendChild(clearAllButton);
        container.appendChild(filtersContainer);
    }

    private getFilterDisplayName(key: string, value: string): string {
        const displayNames: Record<string, string> = {
            'location': `Местоположение: ${value}`,
            'offer_type': `Тип сделки: ${value === 'sale' ? 'Продажа' : 'Аренда'}`,
            'property_type': `Тип недвижимости: ${this.getPropertyTypeDisplay(value)}`,
            'min_price': `Цена от: ${this.formatPrice(parseInt(value))} ₽`,
            'max_price': `Цена до: ${this.formatPrice(parseInt(value))} ₽`,
            'min_area': `Площадь от: ${value} м²`,
            'max_area': `Площадь до: ${value} м²`
        };

        return displayNames[key] || `${key}: ${value}`;
    }

    private getPropertyTypeDisplay(value: string): string {
        const types: Record<string, string> = {
            'apartment': 'Квартира',
            'house': 'Дом',
            'commercial': 'Коммерческая',
            'land': 'Земельный участок'
        };
        return types[value] || value;
    }

    private removeFilter(key: string): void {
        const newParams = { ...this.currentParams };
        delete newParams[key];

        const url = this.buildUrl('/search-ads', newParams);
        this.navigate(url);
    }

    private formatOffer(apiData: OfferData): any {
        const isLiked = this.state.user?.likedOffers?.includes(apiData.ID || apiData.id) || false;

        let images: string[] = [];
        const imageUrl = apiData.ImageURL || apiData.image_url;

        if (imageUrl) {
            if (imageUrl.startsWith('http')) {
                images = [imageUrl];
            } else if (imageUrl) {
                images = [`${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE.GET}${imageUrl}`];
            }
        }

        if (images.length === 0) {
            images = ['../images/default_offer.jpg'];
        }

        return {
            id: apiData.ID || apiData.id,
            title: apiData.Title || "Без названия",
            description: apiData.Description || "",
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

    private handleSearch(params: SearchParams): void {
        const url = this.buildUrl("/search-ads", params);
        this.navigate(url);
    }

    private handleShowMap(params: SearchParams): void {
        const url = this.buildUrl("/search-map", params);
        this.navigate(url);
    }

    private buildUrl(basePath: string, params: SearchParams = {}): string {
        const url = new URL(basePath, window.location.origin);

        url.search = '';

        Object.entries(params).forEach(([key, value]) => {
            if (value != null && value !== "" && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });

        return url.pathname + url.search;
    }

    private navigate(path: string): void {
        console.log('Navigating to:', path);
        if (this.app?.router?.navigate) {
            this.app.router.navigate(path);
        } else {
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
        }
    }

    private renderLoading(): void {
        this.cleanup();
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "search-results__loading";
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Загрузка объявлений...</p>
        `;
        this.parent.appendChild(loadingDiv);
    }

    private renderError(message: string): void {
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

    private renderEmptyState(container: HTMLElement): void {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "search-results__empty";

        const emptyIcon = document.createElement("div");
        emptyIcon.className = "empty-icon";
        emptyIcon.innerHTML = "🔍";
        emptyDiv.appendChild(emptyIcon);

        const emptyText = document.createElement("p");
        emptyText.className = "empty-text";

        const hasFilters = Object.keys(this.currentParams).length > 0;
        if (hasFilters) {
            emptyText.textContent = "По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска.";
        } else {
            emptyText.textContent = "В данный момент нет доступных объявлений.";
        }

        emptyDiv.appendChild(emptyText);

        if (hasFilters) {
            const resetButton = document.createElement("button");
            resetButton.className = "search-results__reset-btn";
            resetButton.textContent = "Сбросить фильтры";
            resetButton.addEventListener("click", () => {
                this.navigate("/search-ads");
            });
            emptyDiv.appendChild(resetButton);
        }

        container.appendChild(emptyDiv);
    }

    private formatPrice(price: number): string {
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

        this.parent.innerHTML = "";
    }
}