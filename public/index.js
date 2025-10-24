import { MainPage } from './widgets/MainPage.js';
import { LoginPage } from './widgets/LoginPage.js';
import { RegisterPage } from './widgets/RegisterPage.js';
import { ProfileWidget } from './widgets/ProfileWidget.js';
import { ComplexesListWidget } from './widgets/ComplexesListWidget.js';
import { ComplexWidget } from './widgets/ComplexWidget.js';
import { OfferCreateWidget } from './widgets/OfferCreateWidget.js';
import { OfferWidget } from './widgets/OfferWidget.js';
import { SearchOffersWidget } from './widgets/SearchOffersWidget.js';
import { SearchMapWidget } from './widgets/SearchMapWidget.js';
import { Header } from './components/Header/Header/Header.js';
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
        let userData = null;
        try {
            const storedUserData = localStorage.getItem('userData');
            if (storedUserData && storedUserData !== "undefined") {
                userData = JSON.parse(storedUserData);
            }
        } catch (error) {
            console.error("Failed to parse userData from localStorage:", error);
            localStorage.removeItem('userData');
            userData = null;
        }

        this.state = {
            user: userData,
            offers: []
        };

        this.pages = {};
        this.currentPage = null;

        this.init();
    }

    init() {
        initializeHandlebarsHelpers();

        this.createDOMStructure();
        this.initializeComponents();

        this.router = new Router(this);
        this.router.register("/", this.pages.main);
        this.router.register("/login", this.pages.login);
        this.router.register("/register", this.pages.register);
        this.router.register("/profile", this.pages.profileSummary);
        this.router.register("/profile/edit", this.pages.profileEdit);
        this.router.register("/profile/security", this.pages.profileSafety);
        this.router.register("/profile/myoffers", this.pages.profileMyAds);
        this.router.register("/complexes", this.pages.complexesList);
        this.router.register("/complexes/:id", this.pages.complexesDetail);
        this.router.register('/create-ad', this.pages.createAdStep1);
        this.router.register('/create-ad/step-1', this.pages.createAdStep1);
        this.router.register('/create-ad/step-2', this.pages.createAdStep2);
        this.router.register('/create-ad/step-3', this.pages.createAdStep3);
        this.router.register('/create-ad/step-4', this.pages.createAdStep4);
        this.router.register('/create-ad/step-5', this.pages.createAdStep5);
        this.router.register("/offers", this.pages.offersList);
        this.router.register("/offers/:id", this.pages.offerDetail);
        this.router.register("/search-ads", this.pages.searchAds);
        this.router.register("/search-map", this.pages.searchMap);

        this.router.start();
    }

    createDOMStructure() {
        const root = document.getElementById('root');
        if (!root) throw new Error('Root element not found');

        this.headerElement = document.createElement('header');
        root.appendChild(this.headerElement);

        this.mainElement = document.createElement('main');
        root.appendChild(this.mainElement);
    }

    initializeComponents() {
        this.pages.main = new MainPage(this.mainElement, this.state, this);
        this.pages.login = new LoginPage(this.mainElement, this.state, this);
        this.pages.register = new RegisterPage(this.mainElement, this.state, this);
        this.pages.profileSummary = new ProfileWidget(this.mainElement, this.state, this, { view: "summary" });
        this.pages.profileEdit = new ProfileWidget(this.mainElement, this.state, this, { view: "profile" });
        this.pages.profileSafety = new ProfileWidget(this.mainElement, this.state, this, { view: "safety" });
        this.pages.profileMyAds = new ProfileWidget(this.mainElement, this.state, this, { view: "myads" });
        this.pages.complexesList = new ComplexesListWidget(this.mainElement, this.state, this);
        this.pages.complexesDetail = new ComplexWidget(this.mainElement, this.state, this);
        this.pages.createAdStep1 = new OfferCreateWidget(this.mainElement, this.state, this, { step: 1 });
        this.pages.createAdStep2 = new OfferCreateWidget(this.mainElement, this.state, this, { step: 2 });
        this.pages.createAdStep3 = new OfferCreateWidget(this.mainElement, this.state, this, { step: 3 });
        this.pages.createAdStep4 = new OfferCreateWidget(this.mainElement, this.state, this, { step: 4 });
        this.pages.createAdStep5 = new OfferCreateWidget(this.mainElement, this.state, this, { step: 5 });
        this.pages.offersList = new SearchOffersWidget(this.mainElement, this.state, this);
        this.pages.offerDetail = new OfferWidget(this.mainElement, this.state, this);
        this.pages.searchAds = new SearchOffersWidget(this.mainElement, this.state, this);
        this.pages.searchMap = new SearchMapWidget(this.mainElement, this.state, this);

        this.header = new Header(this.headerElement, this.state, this);
    }

    setUser(user, token) {
        this.state.user = user;
        if (user && typeof user === 'object') {
            localStorage.setItem('userData', JSON.stringify(user));
        }
        if (token) {
            localStorage.setItem('authToken', token);
        }
        this.header?.render();
        this.router.navigate("/");
    }

    async logout() {
        try {
            await API.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {});
        } catch (err) {
            console.warn("Logout request failed:", err);
        } finally {
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            this.state.user = null;
            this.state.offers = [];
            this.header?.render();
            history.replaceState({}, "", "/");
            this.router.loadRoute("/");
        }
    }

    isProfileComplete() {
        const user = this.state.user;
        if (!user) return false;

        const requiredFields = ['firstName', 'lastName', 'phone', 'email'];
        for (const field of requiredFields) {
            if (!user[field] || user[field].trim() === '') {
                return false;
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
            return false;
        }

        const phoneDigits = user.phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            return false;
        }

        if (!user.avatar || user.avatar === '../images/user.png') {
            return false;
        }

        return true;
    }

    showProfileCompletionModal() {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal__header';

        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Заполните профиль, чтобы создать объявление';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal__close';
        closeBtn.innerHTML = '&times;';

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);

        const modalBody = document.createElement('div');
        modalBody.className = 'modal__body';

        const modalText = document.createElement('p');
        modalText.textContent = 'Для создания объявления необходимо полностью заполнить профиль: имя, фамилия, телефон, email и аватар.';

        modalBody.appendChild(modalText);

        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal__footer';

        const profileBtn = document.createElement('button');
        profileBtn.className = 'modal__btn modal__btn--confirm';
        profileBtn.textContent = 'Перейти в профиль';

        modalFooter.appendChild(profileBtn);

        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        modal.appendChild(modalFooter);
        modalOverlay.appendChild(modal);

        const closeModal = () => modalOverlay.remove();

        closeBtn.addEventListener('click', closeModal);
        profileBtn.addEventListener('click', () => {
            closeModal();
            this.router.navigate("/profile/edit");
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        document.body.appendChild(modalOverlay);
    }

    navigateToCreateAd() {
        if (this.state.user) {
            if (this.isProfileComplete()) {
                this.router.navigate("/create-ad");
            } else {
                this.showProfileCompletionModal();
            }
        } else {
            this.router.navigate("/login");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});