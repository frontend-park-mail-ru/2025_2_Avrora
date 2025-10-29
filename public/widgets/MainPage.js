import { SearchWidget } from "./SearchWidget.js";
import { OffersListWidget } from "./OffersListWidget.js";
import { ComplexesListWidget } from "./ComplexesListWidget.js";
import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";

export class MainPage {
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.firstOffers = [];
        this.secondOffers = [];
        this.complexes = [];
    }

    async render() {
        this.parent.innerHTML = "";

        const searchContainer = document.createElement("div");
        searchContainer.className = 'search';
        this.parent.appendChild(searchContainer);

        const searchWidget = new SearchWidget(searchContainer, {
            navigate: (path) => this.app.router.navigate(path)
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

    async loadData() {
        const offersResult = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, {
            limit: 8
        });
        if (offersResult.ok) {
            const allOffers = offersResult.data.offers;
            this.firstOffers = allOffers.slice(0, 4);
            this.secondOffers = allOffers.slice(4, 8);
        }

        const complexesResult = await API.get(API_CONFIG.ENDPOINTS.COMPLEXES.LIST, {
            isMainPage: true,
            limit: 5
        });
        if (complexesResult.ok) {
            this.complexes = complexesResult.data.complexes;
        }
    }

    createPageStructure() {
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
            complexesWidget.render();
        }

        if (this.secondOffers.length > 0) {
            const secondOffersContainer = document.createElement("div");
            secondOffersContainer.className = 'offers offers--no-title';
            this.parent.appendChild(secondOffersContainer);

            const secondOffersWidget = new OffersListWidget(secondOffersContainer, this.state, this.app);
            secondOffersWidget.renderWithOffers(this.secondOffers, false);
        }
    }

    renderError() {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'main-page__error';
        errorDiv.innerHTML = `
            <h2>Произошла ошибка</h2>
            <p>Не удалось загрузить данные. Пожалуйста, попробуйте позже.</p>
            <button class="main-page__retry-btn">Попробовать снова</button>
        `;

        const retryBtn = errorDiv.querySelector('.main-page__retry-btn');
        retryBtn.addEventListener('click', () => this.render());

        this.parent.appendChild(errorDiv);
    }

    cleanup() {
        this.parent.innerHTML = '';
    }
}