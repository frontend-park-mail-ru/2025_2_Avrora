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

        this.header = null;
        this.router = null;
        this.initialHeaderRendered = false;
        this.favoritesUpdateInterval = null;

        this.init();
    }

    async init() {
        initializeHandlebarsHelpers();

        this.createDOMStructure();
        this.initializeComponents();

        this.setupGlobalEventListeners();

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
        this.controller.registerPage('profileFavorites', new ProfileWidget(this.mainElement, this.controller, { view: "favorites" }));
        this.controller.registerPage('complexesList', new ComplexesListWidget(this.mainElement, this.controller));
        this.controller.registerPage('complexesDetail', new ComplexWidget(this.mainElement, this.controller));
        this.controller.registerPage('createAd', new OfferCreateWidget(this.mainElement, this.controller));
        this.controller.registerPage('offersList', new OffersListWidget(this.mainElement, this.controller));
        this.controller.registerPage('offerDetail', new OfferWidget(this.mainElement, this.controller));
        this.controller.registerPage('searchAds', new SearchOffersWidget(this.mainElement, this.controller));
        this.controller.registerPage('searchMap', new SearchMapWidget(this.mainElement, this.controller));
        this.controller.registerPage('editOffer', new OfferCreateWidget(this.mainElement, this.controller, { isEditing: true }));
    }

    setupGlobalEventListeners() {
        window.addEventListener('profileUpdated', (event) => {
            if (this.header) {
                this.header.render().catch(error => {
                });
            }
            
            this.refreshProfileDependentPages();
        });

        window.addEventListener('favoritesUpdated', async (event) => {
            await this.updateFavoritesComponents();
        });

        window.addEventListener('favoritesCountUpdated', (event) => {
            this.updateFavoritesCounters(event.detail.count);
        });

        window.addEventListener('authChanged', async (event) => {
            this.controller.updateUI();
            
            if (!event.detail.isAuthenticated) {
                this.updateFavoritesCounters(0);
                this.stopFavoritesAutoRefresh();
            } else {
                try {
                    await this.controller.refreshFavoritesCount();
                    this.startFavoritesAutoRefresh();
                } catch (error) {
                }
            }
        });

        window.addEventListener('offersCountUpdated', () => {
            this.refreshOffersDependentPages();
        });

        window.addEventListener('uiUpdate', () => {
            this.refreshCurrentPage();
        });

        window.addEventListener('offline', () => {
            this.showNetworkError('Нет подключения к интернету');
        });

        window.addEventListener('online', () => {
            this.hideNetworkError();
            this.refreshCurrentPage();
        });
    }

    async updateFavoritesComponents() {
        try {
            const favoritesPage = this.controller.getPage('profileFavorites');
            if (favoritesPage && typeof favoritesPage.refresh === 'function') {
                await favoritesPage.refresh();
            } else if (favoritesPage && typeof favoritesPage.updateData === 'function') {
                await favoritesPage.updateData();
            }

            const summaryPage = this.controller.getPage('profileSummary');
            if (summaryPage && typeof summaryPage.updateData === 'function') {
                await summaryPage.updateData();
            }
        } catch (error) {
        }
    }

    updateFavoritesCounters(count) {
        const pagesWithFavorites = ['profileSummary', 'profileFavorites'];
        pagesWithFavorites.forEach(pageName => {
            const page = this.controller.getPage(pageName);
            if (page && typeof page.updateFavoritesBlock === 'function') {
                page.updateFavoritesBlock(count);
            }
        });
    }

    startFavoritesAutoRefresh() {
        this.stopFavoritesAutoRefresh();
        
        this.favoritesUpdateInterval = window.setInterval(async () => {
            if (this.controller.isAuthenticated) {
                try {
                    await this.controller.refreshFavoritesCount();
                } catch (error) {
                }
            }
        }, 30000);
    }

    stopFavoritesAutoRefresh() {
        if (this.favoritesUpdateInterval) {
            clearInterval(this.favoritesUpdateInterval);
            this.favoritesUpdateInterval = null;
        }
    }

    refreshProfileDependentPages() {
        const profilePages = ['profileSummary', 'profileEdit', 'profileSafety', 'profileMyAds', 'profileFavorites'];
        profilePages.forEach(pageName => {
            const page = this.controller.getPage(pageName);
            if (page && typeof page.updateData === 'function') {
                page.updateData().catch(error => {
                });
            }
        });
    }

    refreshOffersDependentPages() {
        const offersPages = ['main', 'offersList', 'searchAds', 'searchMap'];
        offersPages.forEach(pageName => {
            const page = this.controller.getPage(pageName);
            if (page && typeof page.updateData === 'function') {
                page.updateData().catch(error => {
                });
            }
        });
    }

    refreshCurrentPage() {
        const currentPage = this.controller.model.appStateModel.currentPage;
        if (currentPage && typeof currentPage.render === 'function') {
            currentPage.render().catch(error => {
            });
        }
    }

    showNetworkError(message) {
        const existingError = document.querySelector('.network-error');
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'network-error';
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background-color: #ff3b30;
                color: white;
                padding: 10px 20px;
                text-align: center;
                z-index: 10000;
                font-weight: 500;
            ">
                ${message}
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }

    hideNetworkError() {
        const errorDiv = document.querySelector('.network-error');
        if (errorDiv) {
            errorDiv.remove();
        }
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
        this.router.register("/profile/favorites", this.controller.getPage('profileFavorites'));
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
                window.addEventListener('load', async () => {
                    try {
                        const registration = await navigator.serviceWorker.register('/sw.js', {
                            scope: '/',
                            updateViaCache: 'none'
                        });
                        
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    this.showServiceWorkerUpdateNotification(registration);
                                }
                            });
                        });
                    } catch (error) {
                    }
                });
            } catch (err) {
            }
        }
    }

    showServiceWorkerUpdateNotification(registration) {
        const notification = document.createElement('div');
        notification.className = 'sw-update-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                max-width: 300px;
            ">
                <div style="font-weight: 500; margin-bottom: 10px;">Доступно обновление</div>
                <div style="color: #666; margin-bottom: 15px; font-size: 14px;">
                    Новая версия приложения готова к использованию
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="sw-update-btn" style="
                        background-color: #1FBB72;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        flex: 1;
                    ">Обновить</button>
                    <button class="sw-cancel-btn" style="
                        background-color: #f5f5f5;
                        color: #666;
                        border: 1px solid #ddd;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Позже</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        notification.querySelector('.sw-update-btn').addEventListener('click', () => {
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            notification.remove();
            location.reload();
        });
        
        notification.querySelector('.sw-cancel-btn').addEventListener('click', () => {
            notification.remove();
        });
    }

    cleanup() {
        this.stopFavoritesAutoRefresh();
        
        window.removeEventListener('profileUpdated', () => {});
        window.removeEventListener('favoritesUpdated', () => {});
        window.removeEventListener('favoritesCountUpdated', () => {});
        window.removeEventListener('authChanged', () => {});
        window.removeEventListener('offersCountUpdated', () => {});
        window.removeEventListener('uiUpdate', () => {});
        window.removeEventListener('offline', () => {});
        window.removeEventListener('online', () => {});
        
        if (this.controller.cleanup) {
            this.controller.cleanup();
        }
        
        if (this.header && this.header.cleanup) {
            this.header.cleanup();
        }
    }
}

let app;

document.addEventListener('DOMContentLoaded', () => {
    try {
        app = new App();
    } catch (error) {
        document.getElementById('root').innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: white;
                z-index: 10000;
                padding: 20px;
                text-align: center;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">😞</div>
                <div style="font-size: 18px; font-weight: 500; margin-bottom: 10px;">Ошибка загрузки приложения</div>
                <div style="color: #666; margin-bottom: 20px; max-width: 400px;">
                    Произошла ошибка при загрузке приложения. Пожалуйста, попробуйте перезагрузить страницу.
                </div>
                <button onclick="location.reload()" style="
                    background-color: #1FBB72;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    Перезагрузить страницу
                </button>
            </div>
        `;
    }
});