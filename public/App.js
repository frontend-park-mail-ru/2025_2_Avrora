import './js/polyfills.js';
import { UserModel } from './models/UserModel.js';
import { AppStateModel } from './models/AppStateModel.js';
import { AppController } from './controllers/AppController.js';
import { ModalView } from './views/ModalView.js';

// Импорт виджетов
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
import { Footer } from './components/Footer/Footer/Footer.ts';

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
}

class App {
    constructor() {
        // Инициализация моделей
        this.userModel = new UserModel();
        this.appStateModel = new AppStateModel();
        
        // Инициализация представлений
        this.modalView = new ModalView();
        
        // Инициализация контроллера
        this.controller = new AppController(
            {
                userModel: this.userModel,
                appStateModel: this.appStateModel
            },
            {
                modalView: this.modalView,
                header: null,
                footer: null // будет установлен позже
            }
        );

        this.init();
    }

    async init() {
        initializeHandlebarsHelpers();

        this.createDOMStructure();
        this.initializeComponents();

        // Загрузка профиля пользователя при инициализации
        if (this.userModel.user && this.userModel.user.id) {
            try {
                await this.controller.loadUserProfile(this.userModel.user.id);
            } catch (error) {
                console.error('Failed to load user profile on init:', error);
            }
        }

        this.setupRouter();
        this.initializeServiceWorker();
    }

    createDOMStructure() {
        const root = document.getElementById('root');
        if (!root) throw new Error('Root element not found');

        // Создаем основную структуру приложения
        const appElement = document.createElement('div');
        appElement.id = 'app';
        root.appendChild(appElement);
    }

    initializeComponents() {
        // Инициализация header с передачей контроллера
        this.header = new Header(document.createElement('header'), this.controller);
        this.controller.view.header = this.header;

        // Инициализация footer с передачей контроллера
        this.footer = new Footer(document.createElement('footer'), this.controller);
        this.controller.view.footer = this.footer;

        // Инициализация страниц и передача контроллера
        this.controller.registerPage('main', new MainPage(document.createElement('div'), this.controller));
        this.controller.registerPage('login', new LoginPage(document.createElement('div'), this.controller));
        this.controller.registerPage('register', new RegisterPage(document.createElement('div'), this.controller));
        this.controller.registerPage('profileSummary', new ProfileWidget(document.createElement('div'), this.controller, { view: "summary" }));
        this.controller.registerPage('profileEdit', new ProfileWidget(document.createElement('div'), this.controller, { view: "profile" }));
        this.controller.registerPage('profileSafety', new ProfileWidget(document.createElement('div'), this.controller, { view: "safety" }));
        this.controller.registerPage('profileMyAds', new ProfileWidget(document.createElement('div'), this.controller, { view: "myads" }));
        this.controller.registerPage('complexesList', new ComplexesListWidget(document.createElement('div'), this.controller));
        this.controller.registerPage('complexesDetail', new ComplexWidget(document.createElement('div'), this.controller));
        this.controller.registerPage('createAd', new OfferCreateWidget(document.createElement('div'), this.controller));
        this.controller.registerPage('offersList', new OffersListWidget(document.createElement('div'), this.controller));
        this.controller.registerPage('offerDetail', new OfferWidget(document.createElement('div'), this.controller));
        this.controller.registerPage('searchAds', new SearchOffersWidget(document.createElement('div'), this.controller));
        this.controller.registerPage('searchMap', new SearchMapWidget(document.createElement('div'), this.controller));
        this.controller.registerPage('editOffer', new OfferCreateWidget(document.createElement('div'), this.controller, { isEditing: true }));
    }

    setupRouter() {
        this.router = new Router(this.controller);
        this.controller.setRouter(this.router);

        // Регистрация маршрутов
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
                console.log('Production mode - registering service worker');
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none'
                });

                console.log('ServiceWorker registered successfully:', registration.scope);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('ServiceWorker update found!', newWorker);

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New ServiceWorker ready to activate');
                        }
                    });
                });

                if (registration.active) {
                    registration.active.postMessage('CLEAR_DYNAMIC_CACHE');
                }

                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('ServiceWorker controller changed');
                    if (navigator.serviceWorker.controller) {
                        navigator.serviceWorker.controller.postMessage('CLEAR_DYNAMIC_CACHE');
                    }
                });

                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);

            } catch (err) {
                console.error('Service worker registration failed', err);
            }
        } else {
            console.log('Service workers are not supported');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});