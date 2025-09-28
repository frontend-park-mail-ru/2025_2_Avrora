import { MainPage } from './widgets/MainPage.js';
import { LoginPage } from './widgets/LoginPage.js';
import { RegisterPage } from './widgets/RegisterPage.js';
import { Header } from './components/Header/Header.js';
import { API } from './utils/API.js';
import { Router } from './router.js';
import { API_CONFIG } from "./config.js";


class App {
    constructor() {
        // Safely parse localStorage data
        let userData = null;
        try {
            const storedUserData = localStorage.getItem('userData');
            userData = storedUserData ? JSON.parse(storedUserData) : null;
        } catch (error) {
            console.error("Failed to parse userData from localStorage:", error);
            userData = null; // Fallback to null if parsing fails
        }

        this.state = {
            user: userData, // Use parsed or fallback value
            boards: []
        };

        this.pages = {};
        this.currentPage = null;

        this.init();
    }

    init() {
        this.createDOMStructure();
        this.initializeComponents();

        this.router = new Router(this);
        this.router.register("/", this.pages.main);
        this.router.register("/login", this.pages.login);
        this.router.register("/register", this.pages.register);

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

        this.header = new Header(this.headerElement, this.state, this);
        this.header.render();
        this.setHeaderEventListeners();
    }

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

    setUser(user, token) {
        this.state.user = user;
        localStorage.setItem('userData', JSON.stringify(user));
        localStorage.setItem('authToken', token);
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
            this.state.boards = [];
            this.header?.render();
            this.router.navigate("/");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
