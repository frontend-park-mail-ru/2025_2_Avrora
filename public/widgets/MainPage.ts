import { SearchWidget } from "./SearchWidget.ts";
import { OffersListWidget } from "./OffersListWidget.ts";
import { ComplexesListWidget } from "./ComplexesListWidget.ts";
import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";

interface OfferData {
    [key: string]: any;
}

interface ComplexData {
    [key: string]: any;
}

export class MainPage {
    private parent: HTMLElement;
    private state: any;
    private app: any;
    private firstOffers: OfferData[] = [];
    private secondOffers: OfferData[] = [];
    private complexes: ComplexData[] = [];

    constructor(parent: HTMLElement, state: any, app: any) {
        this.parent = parent;
        this.state = state;
        this.app = app;
    }

    async render(): Promise<void> {
        this.parent.innerHTML = "";
        const searchContainer = document.createElement("div");
        searchContainer.className = 'search';
        this.parent.appendChild(searchContainer);

        const searchWidget = new SearchWidget(searchContainer, {
            navigate: (path: string) => this.app.router.navigate(path)
        });
        await searchWidget.render();

        try {
            await this.loadData();
            this.createPageStructure();
        } catch (error) {
            console.error("Error loading main page data:", error);
            this.renderError();
        }
    }

    private async loadData(): Promise<void> {
        // Загрузка объявлений
        const offersResult = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, { limit: 8 });
        if (offersResult.ok) {
            const responseData = offersResult.data || offersResult;
            let allOffers: OfferData[] = Array.isArray(responseData.Offers) ? responseData.Offers :
                             Array.isArray(responseData.offers) ? responseData.offers :
                             Array.isArray(responseData.data) ? responseData.data : [];
            this.firstOffers = allOffers.slice(0, 4);
            this.secondOffers = allOffers.slice(4, 8);
        }

        // Загрузка ЖК
        const complexesResult = await API.get(API_CONFIG.ENDPOINTS.COMPLEXES.LIST, {
            isMainPage: true,
            limit: 5
        });
        if (complexesResult.ok) {
            const complexesData = complexesResult.data || complexesResult;
            this.complexes = Array.isArray(complexesData.Complexes) ? complexesData.Complexes :
                              Array.isArray(complexesData.complexes) ? complexesData.complexes :
                              Array.isArray(complexesData.data) ? complexesData.data : [];
        }
    }

    private createPageStructure(): void {
        if (this.firstOffers.length > 0) {
            const firstOffersContainer = document.createElement("div");
            firstOffersContainer.className = 'offers';
            this.parent.appendChild(firstOffersContainer);
            const firstOffersWidget = new OffersListWidget(firstOffersContainer, this.state, this.app);
            firstOffersWidget.renderWithOffers(this.firstOffers);
        }
        if (this.complexes.length > 0) {
            const complexesContainer = document.createElement("div");
            complexesContainer.className = 'complexes-list';
            this.parent.appendChild(complexesContainer);
            const complexesWidget = new ComplexesListWidget(complexesContainer, this.state, this.app, {
                limit: 5,
                showPagination: false,
                isMainPage: true
            });
            complexesWidget.renderWithComplexes(this.complexes);
        }
        if (this.secondOffers.length > 0) {
            const secondOffersContainer = document.createElement("div");
            secondOffersContainer.className = 'offers offers--no-title';
            this.parent.appendChild(secondOffersContainer);
            const secondOffersWidget = new OffersListWidget(secondOffersContainer, this.state, this.app);
            secondOffersWidget.renderWithOffers(this.secondOffers, false);
        }
        if (this.firstOffers.length === 0 && this.secondOffers.length === 0 && this.complexes.length === 0) {
            this.renderNoData();
        }
    }

    private renderNoData(): void {
        const noDataDiv = document.createElement('div');
        noDataDiv.className = 'main-page__no-data';
        noDataDiv.innerHTML = `
            <h2>Нет данных для отображения</h2>
            <p>К сожалению, в данный момент нет доступных предложений или жилых комплексов.</p>
        `;
        this.parent.appendChild(noDataDiv);
    }

    private renderError(): void {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'main-page__error';
        errorDiv.innerHTML = `
            <h2>Произошла ошибка</h2>
            <p>Не удалось загрузить данные. Пожалуйста, попробуйте позже.</p>
            <button class="main-page__retry-btn">Попробовать снова</button>
        `;
        const retryBtn = errorDiv.querySelector('.main-page__retry-btn') as HTMLButtonElement;
        retryBtn.addEventListener('click', () => this.render());
        this.parent.appendChild(errorDiv);
    }

    cleanup(): void {
        this.parent.innerHTML = '';
    }
}