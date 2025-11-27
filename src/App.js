import './js/polyfills.js';
import { UserModel } from './models/UserModel.js';
import { AppStateModel } from './models/AppStateModel.js';
import { AppController } from './controllers/AppController.js';
import { ModalView } from './views/ModalView.js';
import { MainPage } from './widgets/MainPage.ts';
import { LoginPage } from './widgets/LoginPage.ts';
import { RegisterPage } from './widgets/RegisterPage.ts';
import { ProfileWidget } from './widgets/ProfileWidget.ts';
import { ComplexesListWidget } from './widgets/ComplexesListWidget.ts';
import { ComplexWidget } from './widgets/ComplexWidget.ts';
import { OfferCreateWidget } from './widgets/OfferCreateWidget.ts';
import { OfferWidget } from './widgets/OfferWidget.ts';
import { SearchOffersWidget } from './widgets/SearchOffersWidget.ts';
import { SearchMapWidget } from './widgets/SearchMapWidget.ts';
import { OffersListWidget } from './widgets/OffersListWidget.ts';
import { Header } from './components/Header/Header/Header.ts';
import { API } from './utils/API.js';
import { Router } from './router.js';
import { API_CONFIG } from "./config.js";
import Handlebars from 'handlebars';
import { templates } from './templates/compiled/templates.js';

function initializeHandlebarsHelpers() {
    Handlebars.templates = templates;
    window.Handlebars = Handlebars;

    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });

    Handlebars.registerHelper('if', function(conditional, options) {
        if (conditional) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('pluralize', function (count, one, two, many) {
        const n = Math.abs(count) % 100;
        const n1 = n % 10;
        if (n1 === 1 && n !== 11) {
            return one;
        } else if (n1 >= 2 && n1 <= 4 && (n < 10 || n > 20)) {
            return two;
        } else {
            return many;
        }
    });
}

class App {
    constructor() {
        this.userModel = new UserModel();
        this.appStateModel = new AppStateModel();

        this.modalView = new ModalView();

        this.controller = new AppController(
            {
                userModel: this.userModel,
                appStateModel: this.appStateModel
            },
            {
                modalView: this.modalView,
                header: null
            }
        );

        this.init();
    }

    async init() {
        initializeHandlebarsHelpers();

        this.createDOMStructure();
        this.initializeComponents();

        if (this.userModel.user && this.userModel.user.id) {
            try {
                await this.controller.loadUserProfile(this.userModel.user.id);
            } catch (error) {
            }
        }

        this.setupRouter();
        this.initializeServiceWorker();
    }

    createDOMStructure() {
        const root = document.getElementById('root');
        if (!root) throw new Error('Root element not found');

        this.headerElement = document.createElement('div');
        this.headerElement.className = "header";
        root.appendChild(this.headerElement);

        this.mainElement = document.createElement('main');
        root.appendChild(this.mainElement);
    }

    initializeComponents() {
        this.header = new Header(this.headerElement, this.controller);
        this.controller.view.header = this.header;

        this.controller.registerPage('main', new MainPage(this.mainElement, this.controller));
        this.controller.registerPage('login', new LoginPage(this.mainElement, this.controller));
        this.controller.registerPage('register', new RegisterPage(this.mainElement, this.controller));
        this.controller.registerPage('profileSummary', new ProfileWidget(this.mainElement, this.controller, { view: "summary" }));
        this.controller.registerPage('profileEdit', new ProfileWidget(this.mainElement, this.controller, { view: "profile" }));
        this.controller.registerPage('profileSafety', new ProfileWidget(this.mainElement, this.controller, { view: "safety" }));
        this.controller.registerPage('profileMyAds', new ProfileWidget(this.mainElement, this.controller, { view: "myads" }));
        this.controller.registerPage('complexesList', new ComplexesListWidget(this.mainElement, this.controller));
        this.controller.registerPage('complexesDetail', new ComplexWidget(this.mainElement, this.controller));
        this.controller.registerPage('createAd', new OfferCreateWidget(this.mainElement, this.controller));
        this.controller.registerPage('offersList', new OffersListWidget(this.mainElement, this.controller));
        this.controller.registerPage('offerDetail', new OfferWidget(this.mainElement, this.controller));
        this.controller.registerPage('searchAds', new SearchOffersWidget(this.mainElement, this.controller));
        this.controller.registerPage('searchMap', new SearchMapWidget(this.mainElement, this.controller));
        this.controller.registerPage('editOffer', new OfferCreateWidget(this.mainElement, this.controller, { isEditing: true }));
    }

    setupRouter() {
        this.router = new Router(this.controller);
        this.controller.setRouter(this.router);

        this.router.register("/", this.controller.getPage('main'));
        this.router.register("/login", this.controller.getPage('login'));
        this.router.register("/register", this.controller.getPage('register'));
        this.router.register("/profile", this.controller.getPage('profileSummary'));
        this.router.register("/profile/edit", this.controller.getPage('profileEdit'));
        this.router.register("/profile/security", this.controller.getPage('profileSafety'));
        this.router.register("/profile/myoffers", this.controller.getPage('profileMyAds'));
        this.router.register("/complexes", this.controller.getPage('complexesList'));
        this.router.register("/complexes/:id", this.controller.getPage('complexesDetail'));
        this.router.register('/create-ad', this.controller.getPage('createAd'));
        this.router.register('/create-ad/step-1', this.controller.getPage('createAd'));
        this.router.register('/create-ad/step-2', this.controller.getPage('createAd'));
        this.router.register('/create-ad/step-3', this.controller.getPage('createAd'));
        this.router.register('/create-ad/step-4', this.controller.getPage('createAd'));
        this.router.register('/create-ad/step-5', this.controller.getPage('createAd'));
        this.router.register("/offers", this.controller.getPage('offersList'));
        this.router.register("/offers/:id", this.controller.getPage('offerDetail'));
        this.router.register("/search-ads", this.controller.getPage('searchAds'));
        this.router.register("/search-map", this.controller.getPage('searchMap'));
        this.router.register("/edit-offer/:id", this.controller.getPage('editOffer'));
        this.router.register("/edit-offer/:id/step-1", this.controller.getPage('editOffer'));
        this.router.register("/edit-offer/:id/step-2", this.controller.getPage('editOffer'));
        this.router.register("/edit-offer/:id/step-3", this.controller.getPage('editOffer'));
        this.router.register("/edit-offer/:id/step-4", this.controller.getPage('editOffer'));
        this.router.register("/edit-offer/:id/step-5", this.controller.getPage('editOffer'));

        this.router.start();
    }

    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none'
                });

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                });

                if (registration.active) {
                    registration.active.postMessage('CLEAR_DYNAMIC_CACHE');
                }

                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    window.location.reload();
                });

            } catch (err) {
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});