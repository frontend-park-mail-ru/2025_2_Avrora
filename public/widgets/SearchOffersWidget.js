// SearchOffersWidget.js
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
        this.currentParams = {};
        this.allOffers = []; // Сохраняем все загруженные предложения
    }

    async render() {
        try {
            this.isLoading = true;
            this.renderLoading();

            // Получаем параметры из URL
            this.currentParams = this.getSearchParamsFromURL();
            console.log('Current search params:', this.currentParams);

            // Загружаем все предложения
            const allOffers = await this.loadAllOffers();
            this.allOffers = allOffers;

            // Фильтруем предложения на клиенте
            const filteredOffers = this.filterOffers(allOffers, this.currentParams);
            await this.renderContent(filteredOffers);
        } catch (error) {
            console.error("Error rendering offers:", error);
            this.renderError("Не удалось загрузить объявления");
        } finally {
            this.isLoading = false;
        }
    }

    async loadAllOffers() {
        try {
            console.log('Loading all offers...');

            const result = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST);

            if (!result.ok) {
                throw new Error(result.error || `HTTP ${result.status}`);
            }

            console.log('API response:', result);

            // Обрабатываем разные форматы ответа от бэкенда
            const responseData = result.data || result;

            let offers = [];
            let meta = {};

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

            console.log('Loaded offers:', offers.length);
            this.meta = meta;

            return offers;
        } catch (error) {
            console.error('Error loading offers:', error);
            throw new Error(`Не удалось загрузить объявления: ${error.message}`);
        }
    }

    filterOffers(offers, filters) {
        if (!filters || Object.keys(filters).length === 0) {
            return offers;
        }

        console.log('Filtering offers with filters:', filters);

        return offers.filter(offer => {
            // Фильтр по типу сделки
            if (filters.offer_type && offer.OfferType !== filters.offer_type) {
                return false;
            }

            // Фильтр по типу недвижимости
            if (filters.property_type && offer.PropertyType !== filters.property_type) {
                return false;
            }

            // Фильтр по местоположению (адресу)
            if (filters.location) {
                const searchLocation = filters.location.toLowerCase();
                const offerAddress = (offer.Address || '').toLowerCase();
                if (!offerAddress.includes(searchLocation)) {
                    return false;
                }
            }

            // Фильтр по цене
            if (filters.min_price && offer.Price < parseInt(filters.min_price)) {
                return false;
            }
            if (filters.max_price && offer.Price > parseInt(filters.max_price)) {
                return false;
            }

            // Фильтр по площади
            if (filters.min_area && offer.Area < parseFloat(filters.min_area)) {
                return false;
            }
            if (filters.max_area && offer.Area > parseFloat(filters.max_area)) {
                return false;
            }

            return true;
        });
    }

    getSearchParamsFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};

        // Базовые параметры поиска
        if (urlParams.has('location')) params.location = urlParams.get('location');
        if (urlParams.has('offer_type')) params.offer_type = urlParams.get('offer_type');
        if (urlParams.has('property_type')) params.property_type = urlParams.get('property_type');

        // Числовые параметры
        if (urlParams.has('min_price')) params.min_price = urlParams.get('min_price');
        if (urlParams.has('max_price')) params.max_price = urlParams.get('max_price');
        if (urlParams.has('min_area')) params.min_area = urlParams.get('min_area');
        if (urlParams.has('max_area')) params.max_area = urlParams.get('max_area');

        return params;
    }

    async renderContent(offers) {
        this.cleanup();

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-widget-container';
        this.parent.appendChild(searchContainer);

        // Рендерим виджет поиска
        const searchWidget = new SearchWidget(searchContainer, {
            onSearch: (params) => this.handleSearch(params),
            onShowMap: (params) => this.handleShowMap(params),
            navigate: (path) => this.navigate(path)
        });
        await searchWidget.render();

        // Рендерим результаты
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';

        if (!offers || offers.length === 0) {
            this.renderEmptyState(resultsContainer);
        } else {
            this.renderOffersList(offers, resultsContainer);
        }

        this.parent.appendChild(resultsContainer);
    }

    renderOffersList(offers, container) {
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

        // Показываем активные фильтры
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

        // Рендерим карточки
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

    renderActiveFilters(container) {
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

        // Кнопка сброса всех фильтров
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

    getFilterDisplayName(key, value) {
        const displayNames = {
            'location': `Местоположение: ${value}`,
            'offer_type': `Тип сделки: ${value === 'sale' ? 'Продажа' : 'Аренда'}`,
            'property_type': `Тип недвижимости: ${value === 'apartment' ? 'Квартира' : 'Дом'}`,
            'min_price': `Цена от: ${this.formatPrice(value)} ₽`,
            'max_price': `Цена до: ${this.formatPrice(value)} ₽`,
            'min_area': `Площадь от: ${value} м²`,
            'max_area': `Площадь до: ${value} м²`
        };

        return displayNames[key] || `${key}: ${value}`;
    }

    removeFilter(key) {
        const newParams = { ...this.currentParams };
        delete newParams[key];

        const url = this.buildUrl('/search-ads', newParams);
        this.navigate(url);
    }

    formatOffer(apiData) {
        const isLiked = this.state.user?.likedOffers?.includes(apiData.ID || apiData.id) || false;

        // Обрабатываем разные форматы изображений
        let images = [];
        const imageUrl = apiData.ImageURL || apiData.image_url;

        if (imageUrl) {
            // Если это полный URL, используем как есть, иначе формируем полный URL
            if (imageUrl.startsWith('http')) {
                images = [imageUrl];
            } else if (imageUrl) {
                images = [`${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.IMAGE.GET}${imageUrl}`];
            }
        }

        // Если нет изображений, используем заглушку
        if (images.length === 0) {
            images = ['../images/default_offer.jpg'];
        }

        // Обрабатываем разные форматы данных
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
            total_floors: apiData.TotalFloors || apiData.total_floors
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

        // Очищаем существующие параметры
        url.search = '';

        // Добавляем только непустые параметры
        Object.entries(params).forEach(([key, value]) => {
            if (value != null && value !== "" && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });

        return url.pathname + url.search;
    }

    navigate(path) {
        console.log('Navigating to:', path);
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
        loadingDiv.className = "search-results__loading";
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Загрузка объявлений...</p>
        `;
        this.parent.appendChild(loadingDiv);

        this.addSearchStyles();
    }

    renderError(message) {
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

        this.addSearchStyles();
    }

    renderEmptyState(container) {
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

        this.addSearchStyles();
    }

    addSearchStyles() {
        if (document.querySelector('#search-results-styles')) return;

        const styles = `
            .search-results__loading {
                text-align: center;
                padding: 60px 20px;
                color: #666;
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .search-results__error {
                text-align: center;
                padding: 40px 20px;
                color: #dc3545;
            }

            .search-results__retry-btn {
                background: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 15px;
            }

            .search-results__empty {
                text-align: center;
                padding: 60px 20px;
                color: #666;
            }

            .empty-icon {
                font-size: 48px;
                margin-bottom: 20px;
                opacity: 0.5;
            }

            .empty-text {
                font-size: 18px;
                margin-bottom: 20px;
            }

            .search-results__reset-btn {
                background: #6c757d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
            }

            .active-filters {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
                border: 1px solid #e9ecef;
            }

            .active-filters__title {
                font-weight: 600;
                margin-bottom: 12px;
                color: #495057;
            }

            .active-filters__list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 12px;
            }

            .active-filters__item {
                display: flex;
                align-items: center;
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 20px;
                padding: 6px 12px;
                font-size: 14px;
            }

            .active-filters__text {
                margin-right: 8px;
            }

            .active-filters__remove {
                background: none;
                border: none;
                color: #6c757d;
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
                padding: 0;
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .active-filters__remove:hover {
                color: #dc3545;
            }

            .active-filters__clear-all {
                background: #dc3545;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
            }

            .active-filters__clear-all:hover {
                background: #c82333;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'search-results-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    formatPrice(price) {
        if (!price) return '0';
        return new Intl.NumberFormat('ru-RU').format(price);
    }

    cleanup() {
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