import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import ComplexesListCard from "../components/ComplexesList/ComplexesListCard/ComplexesListCard.ts";

interface ComplexData {
    id?: number;
    ID?: number;
    name?: string;
    Name?: string;
    title?: string;
    address?: string;
    Address?: string;
    metro?: string;
    Metro?: string;
    image_url?: string;
    ImageURL?: string;
    imageUrl?: string;
    starting_price?: number;
    StartingPrice?: number;
}

interface ComplexesListWidgetOptions {
    limit?: number;
    showPagination?: boolean;
    isMainPage?: boolean;
}

interface ComplexCardData {
    id: number;
    title: string;
    status: string;
    metro: string;
    address: string;
    imageUrl: string;
    startingPrice: string;
}

interface EventListener {
    element: EventTarget;
    event: string;
    handler: EventListenerOrEventListenerObject;
}

export class ComplexesListWidget {
    parent: HTMLElement;
    controller: any;
    template: HandlebarsTemplateDelegate | null;
    eventListeners: EventListener[];
    complexCards: ComplexesListCard[];
    limit: number;
    showPagination: boolean;
    isMainPage: boolean;
    container: HTMLElement | null;

    constructor(parent: HTMLElement, controller: any, options: ComplexesListWidgetOptions = {}) {
        this.parent = parent;
        this.controller = controller;
        this.template = null;
        this.eventListeners = [];
        this.complexCards = [];
        this.limit = options.limit || 8;
        this.showPagination = options.showPagination || false;
        this.isMainPage = options.isMainPage || false;
        this.container = null;
    }

    async loadTemplate(): Promise<HandlebarsTemplateDelegate> {
        if (this.template) return this.template;
        try {
            this.template = Handlebars.templates['ComplexesList.hbs'];
            return this.template;
        } catch (error) {
            console.error('Failed to load template:', error);
            throw new Error('Template loading failed');
        }
    }

    async render(): Promise<void> {
        try {
            this.renderLoading();
            const complexes = await this.loadComplexes();
            await this.renderContent(complexes);
        } catch (error) {
            console.error("Error rendering complexes list:", error);
            this.renderError("Не удалось загрузить список ЖК");
        }
    }

    async renderWithComplexes(complexes: ComplexData[]): Promise<void> {
        try {
            this.renderLoading();
            await this.renderContent(complexes);
        } catch (error) {
            console.error("Error rendering complexes list:", error);
            this.renderError("Не удалось отобразить список ЖК");
        }
    }

    async loadComplexes(): Promise<ComplexData[]> {
        const result = await API.get(API_CONFIG.ENDPOINTS.COMPLEXES.LIST, {
            limit: this.limit,
            isMainPage: this.isMainPage
        });

        if (result.ok && result.data) {
            const responseData = result.data || result;

            let complexes: ComplexData[] = [];
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

    async renderContent(complexes: ComplexData[]): Promise<void> {
        this.cleanup();

        if (!complexes || complexes.length === 0) {
            this.renderEmptyState();
            return;
        }

        const template = await this.loadTemplate();
        const formattedComplexes: ComplexCardData[] = complexes.map(complex => this.formatComplex(complex));
        const html = template({ complexes: formattedComplexes });

        this.parent.innerHTML = html;

        this.container = this.parent.querySelector('.complexes-list__container');

        this.initializeComplexCards(formattedComplexes);
    }

    formatComplex(apiData: ComplexData): ComplexCardData {
        const complexId = apiData.id || apiData.ID;
        const name = apiData.name || apiData.Name || apiData.title || "Название не указано";
        const address = apiData.address || apiData.Address || "Адрес не указан";
        const metro = apiData.metro || apiData.Metro || "Метро не указано";
        const imageUrl = apiData.image_url || apiData.ImageURL || apiData.imageUrl;
        const startingPrice = apiData.starting_price || apiData.StartingPrice;

        return {
            id: complexId,
            title: name,
            status: "Строится",
            metro: metro,
            address: address,
            imageUrl: imageUrl,
            startingPrice: startingPrice ? this.formatPrice(startingPrice) : "Цена не указана"
        };
    }

    initializeComplexCards(complexes: ComplexCardData[]): void {
        const complexElements = this.parent.querySelectorAll('.complexes-list__item');

        this.complexCards = Array.from(complexElements).map((element, index) => {
            const complexData = complexes[index];
            const card = new ComplexesListCard(element as HTMLElement, complexData, {
                navigate: (path: string) => {
                    this.controller.navigate(path);
                }
            });

            // Убрали вызов card.render() здесь, так как он уже вызывается в конструкторе
            // и вызов здесь приведет к двойному рендеру
            return card;
        });
    }

    formatPrice(price: number): string {
        if (!price) return '0';
        return new Intl.NumberFormat('ru-RU').format(price);
    }

    renderLoading(): void {
        this.cleanup();
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "complexes-list__loading";
        loadingDiv.textContent = "Загрузка списка ЖК...";
        this.parent.appendChild(loadingDiv);
    }

    renderError(message: string): void {
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

    renderEmptyState(): void {
        this.cleanup();
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "complexes-list__empty";

        const emptyText = document.createElement("p");
        emptyText.textContent = "Жилые комплексы не найдены";
        emptyDiv.appendChild(emptyText);

        this.parent.appendChild(emptyDiv);
    }

    addEventListener(element: EventTarget, event: string, handler: EventListenerOrEventListenerObject): void {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    removeEventListeners(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }

    cleanup(): void {
        this.removeEventListeners();

        if (this.complexCards) {
            this.complexCards.forEach(card => {
                if ((card as any).destroy) (card as any).destroy();
            });
            this.complexCards = [];
        }
        
        this.parent.innerHTML = "";
    }
}