import { SearchWidget } from "./SearchWidget.ts";
import { OffersListWidget } from "./OffersListWidget.ts";
import { ComplexesListWidget } from "./ComplexesListWidget.ts";
import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";

interface Offer {
    id: string;
    [key: string]: any;
}

interface Complex {
    [key: string]: any;
}

export class MainPage {
    private parent: HTMLElement;
    private controller: any;
    private firstOffers: Offer[];
    private secondOffers: Offer[];
    private complexes: Complex[];

    constructor(parent: HTMLElement, controller: any) {
        this.parent = parent;
        this.controller = controller;
        this.firstOffers = [];
        this.secondOffers = [];
        this.complexes = [];
    }

    async render(): Promise<void> {
        this.parent.innerHTML = "";

        const searchContainer = document.createElement("div");
        searchContainer.className = 'search';
        this.parent.appendChild(searchContainer);

        const searchWidget = new SearchWidget(searchContainer, {
            navigate: (path: string) => this.controller.navigate(path)
        });
        await searchWidget.render();

        try {
            await this.loadData();
            this.createPageStructure();

        } catch (error) {
            this.renderError();
        }
    }

    private async loadData(): Promise<void> {
        try {
            const paidResult = await API.get(API_CONFIG.ENDPOINTS.OFFERS.PAID_OFFERS, {
                limit: 4
            });

            let paidOffers: Offer[] = [];
            if (paidResult.ok) {
                const responseData = paidResult.data || paidResult;
                if (Array.isArray(responseData.Offers)) {
                    paidOffers = responseData.Offers;
                } else if (Array.isArray(responseData.offers)) {
                    paidOffers = responseData.offers;
                } else if (Array.isArray(responseData.data)) {
                    paidOffers = responseData.data;
                } else if (responseData.Offers && Array.isArray(responseData.Offers)) {
                    paidOffers = responseData.Offers;
                }
            }

            const offersResult = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, {
                limit: 8
            });

            let allOffers: Offer[] = [];
            if (offersResult.ok) {
                const responseData = offersResult.data || offersResult;
                if (Array.isArray(responseData.Offers)) {
                    allOffers = responseData.Offers;
                } else if (Array.isArray(responseData.offers)) {
                    allOffers = responseData.offers;
                } else if (Array.isArray(responseData.data)) {
                    allOffers = responseData.data;
                } else if (responseData.Offers && Array.isArray(responseData.Offers)) {
                    allOffers = responseData.Offers;
                }
            }

            const paidIds = new Set(paidOffers.map((offer: any) => offer.id || offer.ID));
            const regularOffers = allOffers.filter((offer: any) => !paidIds.has(offer.id || offer.ID));

            const combinedOffers = [...paidOffers, ...regularOffers].slice(0, 8);

            this.firstOffers = combinedOffers.slice(0, 4) || [];
            this.secondOffers = combinedOffers.slice(4, 8) || [];

            try {
                const complexesResult = await API.get(API_CONFIG.ENDPOINTS.COMPLEXES.LIST, {
                    isMainPage: true,
                    limit: 5
                });

                if (complexesResult.ok) {
                    const complexesData = complexesResult.data || complexesResult;
                    if (Array.isArray(complexesData.Complexes)) {
                        this.complexes = complexesData.Complexes;
                    } else if (Array.isArray(complexesData.complexes)) {
                        this.complexes = complexesData.complexes;
                    } else if (Array.isArray(complexesData.data)) {
                        this.complexes = complexesData.data;
                    } else {
                        this.complexes = [];
                    }
                } else {
                    this.complexes = [];
                }
            } catch (complexError) {
                this.complexes = [];
            }
        } catch (error) {
            this.firstOffers = [];
            this.secondOffers = [];
            this.complexes = [];
        }
    }

    private createPageStructure(): void {
        if (this.firstOffers && this.firstOffers.length > 0) {
            const firstOffersContainer = document.createElement("div");
            firstOffersContainer.className = 'offers';
            this.parent.appendChild(firstOffersContainer);

            const firstOffersWidget = new OffersListWidget(firstOffersContainer, this.controller);
            firstOffersWidget.renderWithOffers(this.firstOffers);
        }

        if (this.complexes && this.complexes.length > 0) {
            const complexesContainer = document.createElement("div");
            complexesContainer.className = 'complexes-list';
            this.parent.appendChild(complexesContainer);

            const complexesWidget = new ComplexesListWidget(complexesContainer, this.controller, {
                limit: 5,
                showPagination: false,
                isMainPage: true
            });
            complexesWidget.renderWithComplexes(this.complexes);
        }

        if (this.secondOffers && this.secondOffers.length > 0) {
            const secondOffersContainer = document.createElement("div");
            secondOffersContainer.className = 'offers offers--no-title';
            this.parent.appendChild(secondOffersContainer);

            const secondOffersWidget = new OffersListWidget(secondOffersContainer, this.controller);
            secondOffersWidget.renderWithOffers(this.secondOffers, false);
        }

        if ((!this.firstOffers || this.firstOffers.length === 0) &&
            (!this.secondOffers || this.secondOffers.length === 0) &&
            (!this.complexes || this.complexes.length === 0)) {
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