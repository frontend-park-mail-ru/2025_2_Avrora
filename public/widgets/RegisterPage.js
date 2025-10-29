import { API } from '../utils/API.js';
import { validEmail, validPassword } from '../utils/auth.js';
import { Input } from '../components/Authorization/Input/Input.js';
import { API_CONFIG } from "../config.js";

export class RegisterPage {
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
            title: 'Регистрация',
            buttonText: 'Зарегистрироваться',
            inputs: [
                { placeholder: "Email", type: "email", name: "email" },
                { placeholder: "Пароль", type: "password", name: "password" },
                { placeholder: "Повторите пароль", type: "password", name: "repassword" }
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
        const repasswordContainer = this.parent.querySelector('[data-input-name="repassword"]');

        this.inputs.email = new Input('email', 'Email', 'email')
            .addValidationRule((value) => {
                if (!value) return "Введите Email";
                if (!validEmail(value)) return "Введите корректный Email";
                return null;
            });

        this.inputs.password = new Input('password', 'Пароль', 'password')
            .addValidationRule((value) => {
                const errors = validPassword(value);
                if (errors.length > 0) return errors[0];
                return null;
            });

        this.inputs.repassword = new Input('password', 'Повторите пароль', 'repassword')
            .addValidationRule((value) => {
                const password = this.inputs.password?.getValue();
                if (!value) return "Повторите пароль";
                if (value !== password) return "Пароли не совпадают";
                return null;
            });

        emailContainer.replaceWith(this.inputs.email.getElement());
        passwordContainer.replaceWith(this.inputs.password.getElement());
        repasswordContainer.replaceWith(this.inputs.repassword.getElement());

        this.errorElement = this.parent.querySelector('.auth-form__error');
        this.button = this.parent.querySelector('.auth-button');
    }

    setEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.submitSignup.bind(this));
        }

        Object.values(this.inputs).forEach(input => {
            this.addEventListener(input.getInputElement(), 'focus', this.handleInputFocus(input));
            this.addEventListener(input.getInputElement(), 'input', this.handleInputChange(input));
        });
    }

    async submitSignup(e) {
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

        if (!this.inputs.repassword.validate()) {
            hasErrors = true;
        }

        if (hasErrors) {
            this.setButtonErrorState(true);
            return;
        }

        this.setButtonLoading(true);

        try {
            const result = await API.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, { 
                email: emailStr, 
                password: passStr 
            });
            
            if (result.ok) {
                this.app.setUser(result.data.user, result.data.token);
            } else {
                const errorMessage = result.error || "Ошибка регистрации";
                this.showFormError(errorMessage);
                this.setButtonErrorState(true);
                this.clearAllVisualStates();
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showFormError("Ошибка сети. Попробуйте позже.");
            this.setButtonErrorState(true);
            this.clearAllVisualStates();
        } finally {
            this.setButtonLoading(false);
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
    }

    clearFormError() {
        this.errorElement.textContent = '';
        this.errorElement.classList.remove('auth-form__error--visible');
    }

    setButtonLoading(isLoading) {
        if (isLoading) {
            this.button.disabled = true;
            this.button.textContent = 'Загрузка...';
            this.button.classList.add('auth-button--loading');
        } else {
            this.button.disabled = false;
            this.button.textContent = 'Зарегистрироваться';
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