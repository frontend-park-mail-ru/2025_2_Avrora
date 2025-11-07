import './js/polyfills.js';
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
import { Header } from './components/Header/Header/Header.ts';
import { API } from './utils/API.js';
import { Router } from './router.js';
import { API_CONFIG } from "./config.js";
import Handlebars from 'handlebars';
import { templates } from './templates/compiled/templates.js';


const isDevelopment = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     process.env.NODE_ENV === 'development';

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

    async init() {
        initializeHandlebarsHelpers();

        this.createDOMStructure();
        this.initializeComponents();

        if (this.state.user && this.state.user.id) {
            try {
                await this.loadUserProfile(this.state.user.id);
            } catch (error) {
                console.error('Failed to load user profile on init:', error);
            }
        }

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

        this.router.register('/create-ad', this.pages.createAd);
        this.router.register('/create-ad/step-1', this.pages.createAd);
        this.router.register('/create-ad/step-2', this.pages.createAd);
        this.router.register('/create-ad/step-3', this.pages.createAd);
        this.router.register('/create-ad/step-4', this.pages.createAd);
        this.router.register('/create-ad/step-5', this.pages.createAd);

        this.router.register("/offers", this.pages.offersList);
        this.router.register("/offers/:id", this.pages.offerDetail);
        this.router.register("/search-ads", this.pages.searchAds);
        this.router.register("/search-map", this.pages.searchMap);

        this.router.register("/edit-offer/:id", this.pages.editOffer);
        this.router.register("/edit-offer/:id/step-1", this.pages.editOffer);
        this.router.register("/edit-offer/:id/step-2", this.pages.editOffer);
        this.router.register("/edit-offer/:id/step-3", this.pages.editOffer);
        this.router.register("/edit-offer/:id/step-4", this.pages.editOffer);
        this.router.register("/edit-offer/:id/step-5", this.pages.editOffer);

        this.router.start();

        this.initializeServiceWorker();
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

        this.pages.createAd = new OfferCreateWidget(this.mainElement, this.state, this);

        this.pages.offersList = new SearchOffersWidget(this.mainElement, this.state, this);
        this.pages.offerDetail = new OfferWidget(this.mainElement, this.state, this);
        this.pages.searchAds = new SearchOffersWidget(this.mainElement, this.state, this);
        this.pages.searchMap = new SearchMapWidget(this.mainElement, this.state, this);

        this.pages.editOffer = new OfferCreateWidget(this.mainElement, this.state, this, { isEditing: true });

        this.header = new Header(this.headerElement, this.state, this);
    }

    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                if (isDevelopment) {
                    console.log('Development mode - unregistering existing service workers');

                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const registration of registrations) {
                        await registration.unregister();
                        console.log('ServiceWorker unregistered:', registration.scope);
                    }
                    return;
                }

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

    async setUser(user, token) {

        if (!user.id && token) {
            try {
                const decoded = this.decodeJWT(token);
                if (decoded && decoded.user_id) {
                    user.id = decoded.user_id;
                }
            } catch (error) {
                console.error('Error decoding JWT to get user ID:', error);
            }
        }

        this.state.user = {
            ...user,
            id: user.id,
            firstName: user.FirstName || user.firstName || user.first_name || '',
            lastName: user.LastName || user.lastName || user.last_name || '',
            email: user.Email || user.email || '',
            phone: user.Phone || user.phone || '',
            avatar: user.AvatarURL || user.avatar || user.avatar_url || user.photo_url || '../../images/user.png'
        };

        if (this.state.user && typeof this.state.user === 'object') {
            localStorage.setItem('userData', JSON.stringify(this.state.user));
        }
        if (token) {
            localStorage.setItem('authToken', token);
        }

        if (user.id) {
            try {
                await this.loadUserProfile(user.id);
            } catch (error) {
                console.error('Failed to load user profile:', error);
            }
        }

        if (this.header) {
            this.header.render();
        }

        if (this.currentPage && this.currentPage.cleanup) {
            this.currentPage.cleanup();
        }
        if (this.currentPage && this.currentPage.render) {
            this.currentPage.render();
        }

        this.router.navigate("/");
    }

    async checkOfferOwnership(offerId) {
        if (!this.state.user) return false;

        try {
            const response = await API.get(`${API_CONFIG.ENDPOINTS.OFFERS.BY_ID}${offerId}`);

            if (response.ok && response.data) {
                const offer = response.data;
                const currentUserId = this.state.user.id || this.state.user.ID;
                const offerUserId = offer.user_id || offer.UserID || offer.creator_id || offer.CreatorID;

                return currentUserId === offerUserId;
            }
            return false;
        } catch (error) {
            console.error('Error checking offer ownership:', error);
            return false;
        }
    }

    async canManageOffers() {
        if (!this.state.user) {
            this.router.navigate("/login");
            return false;
        }

        if (!this.isProfileComplete()) {
            this.showProfileCompletionModal();
            return false;
        }

        return true;
    }

    isOfferOwner(offer) {
        if (!this.state.user || !offer) return false;

        const currentUserId = this.state.user.id || this.state.user.ID;
        const offerUserId = offer.user_id || offer.UserID || offer.creator_id || offer.CreatorID;

        return currentUserId === offerUserId;
    }

    async loadUserProfile(userId) {
        try {
            const response = await API.get(`${API_CONFIG.ENDPOINTS.PROFILE.GET}${userId}`);

            if (response.ok && response.data) {
                const profileData = response.data;
                const currentUser = this.state.user || {};

                this.state.user = {
                    ...currentUser,
                    ...profileData,
                    id: userId,
                    firstName: profileData.FirstName || currentUser.firstName,
                    lastName: profileData.LastName || currentUser.lastName,
                    email: profileData.Email || currentUser.email,
                    phone: profileData.Phone || currentUser.phone,
                    avatar: profileData.AvatarURL || currentUser.avatar
                };

                localStorage.setItem('userData', JSON.stringify(this.state.user));

                if (this.header) {
                    this.header.render();
                }
            } else {
                console.warn('Failed to load user profile:', response.error);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    decodeJWT(token) {
        try {
            if (!token) return null;
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
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

            if (this.header) {
                this.header.render();
            }

            if (this.currentPage && this.currentPage.cleanup) {
                this.currentPage.cleanup();
            }
            if (this.currentPage && this.currentPage.render) {
                this.currentPage.render();
            }

            history.replaceState({}, "", "/");
            this.router.loadRoute("/");
        }
    }

    isProfileComplete() {
        const user = this.state.user;
        if (!user) return false;

        const firstName = user.FirstName || user.firstName || user.first_name || '';
        const lastName = user.LastName || user.lastName || user.last_name || '';
        const phone = user.Phone || user.phone || '';
        const email = user.Email || user.email || '';
        const avatar = user.AvatarURL || user.avatar || user.avatar_url || user.photo_url || '';

        const requiredFields = ['firstName', 'lastName', 'phone', 'email'];
        const fieldValues = { firstName, lastName, phone, email };

        for (const field of requiredFields) {
            const value = fieldValues[field];
            if (!value || value.trim() === '') {
                return false;
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            return false;
        }

        if (!avatar || avatar === '../images/user.png' || avatar === '../../images/user.png') {
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
            const isComplete = this.isProfileComplete();

            if (isComplete) {
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