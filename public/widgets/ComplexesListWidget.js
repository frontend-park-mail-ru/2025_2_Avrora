import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import ComplexesListCard from "../components/ComplexesList/ComplexesListCard/ComplexesListCard.js";

export class ComplexesListWidget {
    constructor(parent, state, app, options = {}) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.template = null;
        this.eventListeners = [];
        this.complexCards = [];
        this.limit = options.limit || 8;
        this.showPagination = options.showPagination || false;
        this.isMainPage = options.isMainPage || false;
    }

    async loadTemplate() {
        if (this.template) return this.template;
        try {
            this.template = Handlebars.templates['ComplexesList.hbs'];
            return this.template;
        } catch (error) {
            console.error('Failed to load template:', error);
            throw new Error('Template loading failed');
        }
    }

    async render() {
        try {
            this.renderLoading();
            const complexes = await this.loadComplexes();
            await this.renderContent(complexes);
        } catch (error) {
            console.error("Error rendering complexes list:", error);
            this.renderError("Не удалось загрузить список ЖК");
        }
    }

    async renderWithComplexes(complexes) {
        try {
            this.renderLoading();
            await this.renderContent(complexes);
        } catch (error) {
            console.error("Error rendering complexes list:", error);
            this.renderError("Не удалось отобразить список ЖК");
        }
    }

    async loadComplexes() {
        const result = await API.get(API_CONFIG.ENDPOINTS.COMPLEXES.LIST, {
            limit: this.limit,
            isMainPage: this.isMainPage
        });

        // Обрабатываем разные форматы ответа от бэкенда
        if (result.ok && result.data) {
            const responseData = result.data || result;

            // Поддерживаем разные форматы ответа
            let complexes = [];
            if (Array.isArray(responseData.Complexes)) {
                complexes = responseData.Complexes;
            } else if (Array.isArray(responseData.complexes)) {
                complexes = responseData.complexes;
            } else if (Array.isArray(responseData.data)) {
                complexes = responseData.data;
            }

            return complexes;
        }
        throw new Error(result.error || "Ошибка загрузки списка ЖК");
    }

    async renderContent(complexes) {
        this.cleanup();

        if (!complexes || complexes.length === 0) {
            this.renderEmptyState();
            return;
        }

        const template = await this.loadTemplate();
        const formattedComplexes = complexes.map(complex => this.formatComplex(complex));
        const html = template({ complexes: formattedComplexes });

        this.parent.innerHTML = html;

        this.container = this.parent.querySelector('.complexes-list__container');

        this.initializeComplexCards(formattedComplexes);
    }

    formatComplex(apiData) {
        // Обрабатываем разные форматы полей от бэкенда
        const complexId = apiData.id || apiData.ID;
        const name = apiData.name || apiData.Name || apiData.title || "Название не указано";
        const address = apiData.address || apiData.Address || "Адрес не указан";
        const metro = apiData.metro || apiData.Metro || "Метро не указано";
        const imageUrl = apiData.image_url || apiData.ImageURL || apiData.imageUrl;
        const startingPrice = apiData.starting_price || apiData.StartingPrice;

        return {
            id: complexId,
            title: name,
            status: "Строится", // Статус по умолчанию, так как бэкенд его не возвращает
            metro: metro,
            address: address,
            imageUrl: imageUrl,
            startingPrice: startingPrice ? this.formatPrice(startingPrice) : "Цена не указана"
        };
    }

    initializeComplexCards(complexes) {
        const complexElements = this.parent.querySelectorAll('.complexes-list__item');

        this.complexCards = Array.from(complexElements).map((element, index) => {
            const complexData = complexes[index];
            const card = new ComplexesListCard(element, complexData, {
                navigate: (path) => {
                    if (this.app?.router?.navigate) {
                        this.app.router.navigate(path);
                    } else {
                        window.history.pushState({}, "", path);
                        window.dispatchEvent(new PopStateEvent("popstate"));
                    }
                }
            });

            card.render();
            return card;
        });
    }

    formatPrice(price) {
        if (!price) return '0';
        return new Intl.NumberFormat('ru-RU').format(price);
    }

    renderLoading() {
        this.cleanup();
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "complexes-list__loading";
        loadingDiv.textContent = "Загрузка списка ЖК...";
        this.parent.appendChild(loadingDiv);
    }

    renderError(message) {
        this.cleanup();
        const errorDiv = document.createElement("div");
        errorDiv.className = "complexes-list__error";

        const errorText = document.createElement("p");
        errorText.textContent = message;
        errorDiv.appendChild(errorText);

        const retryButton = document.createElement("button");
        retryButton.textContent = "Попробовать снова";
        retryButton.className = "complexes-list__retry-btn";
        retryButton.addEventListener("click", () => this.render());
        errorDiv.appendChild(retryButton);

        this.parent.appendChild(errorDiv);
    }

    renderEmptyState() {
        this.cleanup();
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "complexes-list__empty";

        const emptyText = document.createElement("p");
        emptyText.textContent = "Жилые комплексы не найдены";
        emptyDiv.appendChild(emptyText);

        this.parent.appendChild(emptyDiv);
    }

    addEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    removeEventListeners() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }

    cleanup() {
        this.removeEventListeners();
        
        if (this.complexCards) {
            this.complexCards.forEach(card => {
                if (card.destroy) card.destroy();
            });
            this.complexCards = [];
        }
        
        this.parent.innerHTML = "";
    }
}