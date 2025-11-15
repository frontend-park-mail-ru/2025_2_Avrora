export class AppStateModel {
    constructor() {
        this.offers = [];
        this.currentPage = null;
        this.pages = {};
    }

    setOffers(offers) {
        this.offers = offers;
    }

    setCurrentPage(page) {
        this.currentPage = page;
    }

    registerPage(name, pageInstance) {
        this.pages[name] = pageInstance;
    }

    getPage(name) {
        return this.pages[name];
    }
}