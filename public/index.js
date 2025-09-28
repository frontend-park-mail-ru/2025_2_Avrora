import { MainPage } from './widgets/MainPage.js';
import { LoginPage } from './widgets/LoginPage.js';
import { RegisterPage } from './widgets/RegisterPage.js';
import { Header } from './components/Header/Header.js';
import { API } from './utils/API.js';
import { Router } from './router.js';
import { API_CONFIG } from "./config.js";

/**
 * Главный класс приложения Homa
 * @class
 */
class App {
    /**
     * Создает экземпляр приложения
     * @constructor
     */
    constructor() {
        /**
         * Состояние приложения
         * @type {Object}
         * @property {Object|null} user - Данные пользователя
         * @property {Array} boards - Список объявлений
         */
        this.state = {
            user: JSON.parse(localStorage.getItem('userData') || 'null'),
            boards: []
        };

        /**
         * Зарегистрированные страницы приложения
         * @type {Object}
         */
        this.pages = {};

        /**
         * Текущая активная страница
         * @type {Object|null}
         */
        this.currentPage = null;

        this.init();
    }

    /**
     * Инициализирует приложение
     */
    init() {
        this.createDOMStructure();
        this.initializeComponents();

        this.router = new Router(this);
        this.router.register("/", this.pages.main);
        this.router.register("/login", this.pages.login);
        this.router.register("/register", this.pages.register);

        this.router.start();

        if (this.state.user) {
            this.loadBoards();
        }
    }

    /**
     * Создает базовую DOM структуру приложения
     * @throws {Error} Если корневой элемент не найден
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
     * Инициализирует компоненты приложения
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
     * Устанавливает обработчики событий для header
     */
    setHeaderEventListeners() {
        const logoLink = this.headerElement.querySelector(".logo__link");
        const loginBtn = this.headerElement.querySelector(".login");
        const registerBtn = this.headerElement.querySelector(".register");
        const logoutBtn = this.headerElement.querySelector(".logout");

        logoLink && (logoLink.onclick = (e) => { e.preventDefault(); this.router.navigate("/"); });
        loginBtn && (loginBtn.onclick = (e) => { e.preventDefault(); this.router.navigate("/login"); });
        registerBtn && (registerBtn.onclick = (e) => { e.preventDefault(); this.router.navigate("/register"); });
        logoutBtn && (logoutBtn.onclick = (e) => { e.preventDefault(); this.logout(); });
    }

    /**
     * Устанавливает данные пользователя после авторизации
     * @param {Object} user - Данные пользователя
     * @param {string} token - JWT токен
     */
    setUser(user, token) {
        this.state.user = user;
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('authToken', token);
        this.header?.render();
        this.router.navigate("/");
        this.loadBoards();
    }

    /**
     * Выполняет выход пользователя из системы
     * @async
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
            this.router.navigate("/");
        }
    }
    
    /**
     * Загружает список объявлений с сервера
     * @async
     */
    async loadBoards() {
        const result = await API.get(API_CONFIG.ENDPOINTS.BOARDS.OFFERS);
        if (result.ok) {
            this.state.boards = result.data.boards || [];
        }
    }
}

/**
 * Инициализирует приложение после загрузки DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
