import { API } from '../utils/API.js';
import { validEmail } from '../utils/auth.js';
import { Input } from '../components/Authorization/Input/Input.js';
import { API_CONFIG } from "../config.js";

export class LoginPage {
    constructor(parent, state, app) {
        this.state = state;
        this.parent = parent;
        this.app = app;
        this.inputs = {};
        this.eventListeners = [];
    }

    async render() {
        this.cleanup();

        const template = Handlebars.templates['Authorization.hbs'];

        Handlebars.registerHelper('eq', function(a, b) {
            return a === b;
        });

        const html = template({
            title: 'Вход',
            buttonText: 'Войти',
            inputs: [
                { placeholder: "Email", type: "email", name: "email" },
                { placeholder: "Пароль", type: "password", name: "password" }
            ]
        });

        const container = document.createElement('div');
        container.innerHTML = html;
        this.parent.appendChild(container.firstElementChild);

        this.initializeComponents();
        this.setEventListeners();
    }

    initializeComponents() {
        const form = this.parent.querySelector('.auth-form');
        this.form = form;

        const emailContainer = this.parent.querySelector('[data-input-name="email"]');
        const passwordContainer = this.parent.querySelector('[data-input-name="password"]');

        this.inputs.email = new Input('email', 'Email', 'email')
            .addValidationRule((value) => {
                if (!value) return "Введите Email";
                if (!validEmail(value)) return "Введите корректный Email";
                return null;
            });

        this.inputs.password = new Input('password', 'Пароль', 'password')
            .addValidationRule((value) => {
                if (!value) return "Введите пароль";
                return null;
            });

        emailContainer.replaceWith(this.inputs.email.getElement());
        passwordContainer.replaceWith(this.inputs.password.getElement());

        this.errorElement = this.parent.querySelector('.auth-form__error');
        this.button = this.parent.querySelector('.auth-button');
    }

    setEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.submitLogin.bind(this));
        }

        Object.values(this.inputs).forEach(input => {
            this.addEventListener(input.getInputElement(), 'focus', this.handleInputFocus(input));
            this.addEventListener(input.getInputElement(), 'input', this.handleInputChange(input));
        });
    }

    async submitLogin(e) {
        e.preventDefault();

        this.clearValidationErrors();

        const emailStr = this.inputs.email.getValue();
        const passStr = this.inputs.password.getValue();

        let hasErrors = false;

        if (!this.inputs.email.validate()) {
            hasErrors = true;
        }

        if (!this.inputs.password.validate()) {
            hasErrors = true;
        }

        if (hasErrors) {
            this.setButtonErrorState(true);
            return;
        }

        this.setButtonLoading(true);

        try {
            const result = await API.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
                email: emailStr,
                password: passStr
            });

            if (result.ok) {
                // Декодируем JWT токен чтобы получить ID пользователя
                const decoded = this.decodeJWT(result.data.token);

                // Ищем user_id в разных возможных полях токена
                const userId = decoded?.user_id || decoded?.userID || decoded?.id || decoded?.userId;

                if (!userId) {
                    console.error('JWT payload:', decoded);
                    throw new Error('Не удалось получить ID пользователя из токена. Доступные поля: ' + JSON.stringify(decoded));
                }

                console.log('Login successful, user ID:', userId);

                // Создаем базовый объект пользователя с ID
                const user = {
                    id: userId,
                    email: emailStr,
                    avatar: '../../images/user.png', // временный аватар
                    firstName: '',
                    lastName: '',
                    phone: ''
                };

                // Устанавливаем пользователя в приложение (это вызовет загрузку профиля)
                await this.app.setUser(user, result.data.token);

                // Показываем успешное сообщение
                this.showFormError("Вход выполнен успешно!");
                this.errorElement.style.color = 'green';

            } else {
                const errorMessage = result.error || "Ошибка авторизации";
                this.showFormError(errorMessage);
                this.setButtonErrorState(true);
                this.clearAllVisualStates();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showFormError(error.message || "Ошибка сети. Попробуйте позже.");
            this.setButtonErrorState(true);
            this.clearAllVisualStates();
        } finally {
            this.setButtonLoading(false);
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

    clearValidationErrors() {
        Object.values(this.inputs).forEach(input => {
            input.clearError();
            input.resetValidation();
        });

        this.clearFormError();
        this.setButtonErrorState(false);
    }

    clearAllVisualStates() {
        Object.values(this.inputs).forEach(input => {
            input.clearVisualState();
        });
    }

    showFormError(message) {
        this.errorElement.textContent = message;
        this.errorElement.classList.add('auth-form__error--visible');
        // Сбрасываем цвет на стандартный
        this.errorElement.style.color = '';
    }

    clearFormError() {
        this.errorElement.textContent = '';
        this.errorElement.classList.remove('auth-form__error--visible');
        this.errorElement.style.color = '';
    }

    setButtonLoading(isLoading) {
        if (isLoading) {
            this.button.disabled = true;
            this.button.textContent = 'Загрузка...';
            this.button.classList.add('auth-button--loading');
        } else {
            this.button.disabled = false;
            this.button.textContent = 'Войти';
            this.button.classList.remove('auth-button--loading');
        }
    }

    setButtonErrorState(hasError) {
        if (hasError) {
            this.button.disabled = true;
            this.button.classList.add('auth-button--error');
        } else {
            this.button.disabled = false;
            this.button.classList.remove('auth-button--error');
        }
    }

    handleInputFocus(input) {
        return () => {
            input.clearError();
            this.clearFormError();
            this.setButtonErrorState(false);
        };
    }

    handleInputChange(input) {
        return () => {
            input.clearVisualState();
            this.setButtonErrorState(false);
        };
    }

    addEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        this.parent.innerHTML = '';
    }
}