import { SearchWidget } from "./SearchWidget.js";
import { OffersListWidget } from "./OffersListWidget.js";
import { ComplexesListWidget } from "./ComplexesListWidget.js";

export class MainPage {
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;
    }

    async render() {
        this.parent.innerHTML = "";

        const searchContainer = document.createElement("div");
        searchContainer.className = 'search';
        
        const offersContainer = document.createElement("div");
        offersContainer.className = 'offers';
        
        const complexesContainer = document.createElement("div");
        complexesContainer.className = 'complexes-list';

        this.parent.appendChild(searchContainer);
        this.parent.appendChild(offersContainer);
        this.parent.appendChild(complexesContainer);

        const searchWidget = new SearchWidget(searchContainer, {
            navigate: (path) => this.app.router.navigate(path)
        });
        const offersWidget = new OffersListWidget(offersContainer, this.state, this.app);
        const complexesWidget = new ComplexesListWidget(complexesContainer, this.state, this.app);

        await searchWidget.render();
        await offersWidget.render();
        await complexesWidget.render();
    }

    cleanup() {
        this.parent.innerHTML = '';
    }
}