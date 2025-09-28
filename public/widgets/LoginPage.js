import { API } from '../utils/API.js';
import { validEmail } from '../utils/auth.js';
import { ErrorMessage } from '../components/Alerts/ErrorMessage.js';
import { API_CONFIG } from "../config.js";

/**
 * Страница входа в систему
 * @class
 */
export class LoginPage {
    /**
     * Создает экземпляр LoginPage
     * @constructor
     * @param {HTMLElement} parent - Родительский элемент для рендеринга
     * @param {Object} state - Состояние приложения
     * @param {Object} app - Экземпляр главного приложения
     */
    constructor(parent, state, app) {
        this.state = state;
        this.parent = parent;
        this.app = app;
        this.eventListeners = [];
    }

    /**
     * Рендерит страницу входа
     */
    render() {
        const template = Handlebars.templates["Login.hbs"];
        this.parent.innerHTML = template({
            inputs: [
                { placeholder: "Email", type: "email", name: "email" },
                { placeholder: "Пароль", type: "password", name: "password" }
            ]
        });

        this.errorMessage = new ErrorMessage(this.parent.querySelector("#warn_login"));

        this.setEventListeners();
    }

    /**
     * Получает DOM элементы формы
     * @returns {Object} Объект с DOM элементами
     */
    getElements() {
        return {
            email: this.parent.querySelector("input[name=email]"),
            password: this.parent.querySelector("input[name=password]"),
            form: this.parent.querySelector("form")
        };
    }

    /**
     * Обрабатывает отправку формы входа
     * @async
     * @param {Event} e - Событие отправки формы
     */
    async submitLogin(e) {
        e.preventDefault();
        const { email, password } = this.getElements();
        const emailStr = email.value.trim();
        const passStr = password.value.trim();

        if (!emailStr || !validEmail(emailStr)) {
            email.classList.add("warning");
            this.errorMessage.show("Введите корректный Email");
            return;
        }
        if (!passStr) {
            password.classList.add("warning");
            this.errorMessage.show("Введите пароль");
            return;
        }

        try {
            const result = await API.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, { email: emailStr, password: passStr });
            if (result.ok) {
                this.app.setUser(result.data.user, result.data.token);
            } else {
                this.errorMessage.show(result.error || "Неверный email или пароль");
            }
        } catch {
            this.errorMessage.show("Ошибка сети. Попробуйте позже.");
        }
    }

    /**
     * Устанавливает обработчики событий
     */
    setEventListeners() {
        const { form, email, password } = this.getElements();
        if (form) this.addEventListener(form, "submit", this.submitLogin.bind(this));
        [email, password].forEach(el => {
            this.addEventListener(el, "focus", () => {
                el.classList.remove("warning");
                this.errorMessage.clear();
            });
        });
    }

    /**
     * Добавляет обработчик события с отслеживанием
     * @param {HTMLElement} element - DOM элемент
     * @param {string} event - Тип события
     * @param {Function} handler - Обработчик события
     */
    addEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    /**
     * Очищает ресурсы страницы
     */
    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) =>
            element.removeEventListener(event, handler)
        );
        this.eventListeners = [];
    }
}
