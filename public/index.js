import { MainPage } from './widgets/MainPage.js';
import { LoginPage } from './widgets/LoginPage.js';
import { RegisterPage } from './widgets/RegisterPage.js';
import { Header } from './components/Header/Header.js';
import { API } from './utils/API.js';
import { Router } from './router.js';
import { API_CONFIG } from "./config.js";

/**
 * Главный класс приложения, управляющий состоянием, маршрутизацией и компонентами
 * @class
 */
class App {
    /**
     * Создает экземпляр приложения, инициализирует состояние и запускает приложение
     */
    constructor() {
        let userData = null;
        try {
            const storedUserData = localStorage.getItem('userData');
            userData = storedUserData ? JSON.parse(storedUserData) : null;
        } catch (error) {
            console.error("Failed to parse userData from localStorage:", error);
            userData = null;
        }

        /**
         * Состояние приложения
         * @type {Object}
         * @property {Object|null} user - Данные пользователя
         * @property {Array} boards - Список досок
         */
        this.state = {
            user: userData,
            boards: []
        };

        /**
         * Объект с экземплярами страниц приложения
         * @type {Object}
         */
        this.pages = {};

        /**
         * Текущая активная страница
         * @type {Object|null}
         */
        this.currentPage = null;

        /**
         * Хранилище обработчиков событий для последующей очистки
         * @type {Map}
         */
        this.eventHandlers = new Map();

        this.init();
    }

    /**
     * Инициализирует приложение: создает DOM структуру, компоненты и маршрутизатор
     */
    init() {
        this.createDOMStructure();
        this.initializeComponents();

        this.router = new Router(this);
        this.router.register("/", this.pages.main);
        this.router.register("/login", this.pages.login);
        this.router.register("/register", this.pages.register);

        this.router.start();
    }

    /**
     * Создает базовую DOM структуру приложения
     * @throws {Error} Если элемент с id 'root' не найден
     */
    createDOMStructure() {
        const root = document.getElementById('root');
        if (!root) throw new Error('Root element not found');

        this.headerElement = document.createElement('header');
        root.appendChild(this.headerElement);

        this.mainElement = document.createElement('main');
        root.appendChild(this.mainElement);
    }

    /**
     * Инициализирует компоненты приложения: страницы и заголовок
     */
    initializeComponents() {
        this.pages.main = new MainPage(this.mainElement, this.state, this);
        this.pages.login = new LoginPage(this.mainElement, this.state, this);
        this.pages.register = new RegisterPage(this.mainElement, this.state, this);

        this.header = new Header(this.headerElement, this.state, this);
        this.header.render();
        this.setHeaderEventListeners();
    }

    /**
     * Устанавливает обработчики событий для элементов заголовка
     */
    setHeaderEventListeners() {
        this.removeHeaderEventListeners();

        const elements = {
            logoLink: this.headerElement.querySelector(".logo__link"),
            loginBtn: this.headerElement.querySelector(".login"),
            registerBtn: this.headerElement.querySelector(".register"),
            logoutBtn: this.headerElement.querySelector(".logout")
        };

        if (elements.logoLink) {
            const handler = (e) => { 
                e.preventDefault(); 
                this.router.navigate("/"); 
            };
            elements.logoLink.addEventListener('click', handler);
            this.eventHandlers.set('logoLink', { 
                element: elements.logoLink, 
                handler 
            });
        }

        if (elements.loginBtn) {
            const handler = (e) => { 
                e.preventDefault(); 
                this.router.navigate("/login"); 
            };
            elements.loginBtn.addEventListener('click', handler);
            this.eventHandlers.set('loginBtn', { 
                element: elements.loginBtn, 
                handler 
            });
        }

        if (elements.registerBtn) {
            const handler = (e) => { 
                e.preventDefault(); 
                this.router.navigate("/register"); 
            };
            elements.registerBtn.addEventListener('click', handler);
            this.eventHandlers.set('registerBtn', { 
                element: elements.registerBtn, 
                handler 
            });
        }

        if (elements.logoutBtn) {
            const handler = (e) => { 
                e.preventDefault(); 
                this.logout(); 
            };
            elements.logoutBtn.addEventListener('click', handler);
            this.eventHandlers.set('logoutBtn', { 
                element: elements.logoutBtn, 
                handler 
            });
        }
    }

    /**
     * Удаляет обработчики событий для элементов заголовка
     */
    removeHeaderEventListeners() {
        for (const { element, handler } of this.eventHandlers.values()) {
            if (element && handler) {
                element.removeEventListener('click', handler);
            }
        }
        this.eventHandlers.clear();
    }

    /**
     * Устанавливает данные пользователя в состояние приложения и локальное хранилище
     * @param {Object} user - Данные пользователя
     * @param {string} token - JWT токен авторизации
     */
    setUser(user, token) {
        this.state.user = user;
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('authToken', token);
        this.header?.render();
        this.setHeaderEventListeners();
        this.router.navigate("/");
    }

    /**
     * Выполняет выход пользователя из системы
     * Очищает состояние приложения и локальное хранилище
     */
    async logout() {
        try {
            await API.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {});
        } catch (err) {
            console.warn("Logout request failed:", err);
        } finally {
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            this.state.user = null;
            this.state.boards = [];
            this.header?.render();
            this.setHeaderEventListeners();
            history.replaceState({}, "", "/");
            this.router.loadRoute("/");
        }
    }

    /**
     * Очищает ресурсы приложения при уничтожении
     */
    destroy() {
        this.removeHeaderEventListeners();
    }
}

/**
 * Инициализирует приложение после полной загрузки DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    new App();
});