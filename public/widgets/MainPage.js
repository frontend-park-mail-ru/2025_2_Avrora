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
        // Загрузка предложений с сервера с лимитом
        const offersResult = await API.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, {
            limit: 8
        });

        if (offersResult.ok) {
            const responseData = offersResult.data || offersResult;

            let allOffers = [];
            if (Array.isArray(responseData.Offers)) {
                allOffers = responseData.Offers;
            } else if (Array.isArray(responseData.offers)) {
                allOffers = responseData.offers;
            } else if (Array.isArray(responseData.data)) {
                allOffers = responseData.data;
            } else if (responseData.Offers && Array.isArray(responseData.Offers)) {
                allOffers = responseData.Offers;
            }

            console.log('Loaded offers:', allOffers);

            // Безопасное разделение на части
            this.firstOffers = allOffers.slice(0, 4) || [];
            this.secondOffers = allOffers.slice(4, 8) || [];
        } else {
            console.warn('Failed to load offers:', offersResult.error);
            this.firstOffers = [];
            this.secondOffers = [];
        }

        // Загрузка комплексов
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
                console.warn('Failed to load complexes:', complexesResult.error);
                this.complexes = [];
            }
        } catch (complexError) {
            console.error('Error loading complexes:', complexError);
            this.complexes = [];
        }
    }

    createPageStructure() {
        // Создаем контейнеры только если есть данные
        if (this.firstOffers && this.firstOffers.length > 0) {
            const firstOffersContainer = document.createElement("div");
            firstOffersContainer.className = 'offers';
            this.parent.appendChild(firstOffersContainer);

            const firstOffersWidget = new OffersListWidget(firstOffersContainer, this.state, this.app);
            firstOffersWidget.renderWithOffers(this.firstOffers);
        } else {
            console.log('No first offers to display');
        }

        if (this.complexes && this.complexes.length > 0) {
            const complexesContainer = document.createElement("div");
            complexesContainer.className = 'complexes-list';
            this.parent.appendChild(complexesContainer);

            const complexesWidget = new ComplexesListWidget(complexesContainer, this.state, this.app, {
                limit: 5,
                showPagination: false,
                isMainPage: true
            });
            complexesWidget.renderWithComplexes(this.complexes);
        } else {
            console.log('No complexes to display');
        }

        if (this.secondOffers && this.secondOffers.length > 0) {
            const secondOffersContainer = document.createElement("div");
            secondOffersContainer.className = 'offers offers--no-title';
            this.parent.appendChild(secondOffersContainer);

            const secondOffersWidget = new OffersListWidget(secondOffersContainer, this.state, this.app);
            secondOffersWidget.renderWithOffers(this.secondOffers, false);
        } else {
            console.log('No second offers to display');
        }

        // Если вообще нет данных, показываем сообщение
        if ((!this.firstOffers || this.firstOffers.length === 0) &&
            (!this.secondOffers || this.secondOffers.length === 0) &&
            (!this.complexes || this.complexes.length === 0)) {
            this.renderNoData();
        }
    }

    renderNoData() {
        const noDataDiv = document.createElement('div');
        noDataDiv.className = 'main-page__no-data';
        noDataDiv.innerHTML = `
            <h2>Нет данных для отображения</h2>
            <p>К сожалению, в данный момент нет доступных предложений или жилых комплексов.</p>
        `;
        this.parent.appendChild(noDataDiv);
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