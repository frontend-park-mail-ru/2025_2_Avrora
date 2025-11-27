import { API } from '../utils/API.js';
import { validEmail } from '../utils/Validator.ts';
import { Input } from '../components/Authorization/Input/Input.ts';
import { API_CONFIG } from "../config.js";

interface JWTDecoded {
    user_id?: string;
    userID?: string;
    id?: string;
    userId?: string;
    [key: string]: any;
}

interface EventListener {
    element: HTMLElement;
    event: string;
    handler: (event: Event) => void;
}

interface InputConfig {
    placeholder: string;
    type: string;
    name: string;
}

interface TemplateData {
    title: string;
    buttonText: string;
    inputs: InputConfig[];
}

export class LoginPage {
    private parent: HTMLElement;
    private controller: any;
    private inputs: { [key: string]: Input };
    private eventListeners: EventListener[];
    private form: HTMLFormElement | null;
    private errorElement: HTMLElement | null;
    private button: HTMLButtonElement | null;

    constructor(parent: HTMLElement, controller: any) {
        this.parent = parent;
        this.controller = controller;
        this.inputs = {};
        this.eventListeners = [];
        this.form = null;
        this.errorElement = null;
        this.button = null;
    }

    async render(): Promise<void> {
        this.cleanup();

        const template = window.Handlebars.templates['Authorization.hbs'];

        window.Handlebars.registerHelper('eq', function(a: any, b: any): boolean {
            return a === b;
        });

        const html = template({
            title: 'Вход',
            buttonText: 'Войти',
            inputs: [
                { placeholder: "Email", type: "email", name: "email" },
                { placeholder: "Пароль", type: "password", name: "password" }
            ]
        } as TemplateData);

        const container = document.createElement('div');
        container.innerHTML = html;

        if (container.firstElementChild) {
            this.parent.appendChild(container.firstElementChild);
        }

        this.initializeComponents();
        this.setEventListeners();
    }

    private initializeComponents(): void {
        const form = this.parent.querySelector('.auth-form') as HTMLFormElement;
        this.form = form;

        const emailContainer = this.parent.querySelector('[data-input-name="email"]');
        const passwordContainer = this.parent.querySelector('[data-input-name="password"]');

        this.inputs.email = new Input('email', 'Email', 'email')
            .addValidationRule((value: string) => {
                if (!value) return "Введите Email";
                if (!validEmail(value)) return "Введите корректный Email";
                return null;
            });

        this.inputs.password = new Input('password', 'Пароль', 'password')
            .addValidationRule((value: string) => {
                if (!value) return "Введите пароль";
                return null;
            });

        if (emailContainer) {
            emailContainer.replaceWith(this.inputs.email.getElement());
        }
        if (passwordContainer) {
            passwordContainer.replaceWith(this.inputs.password.getElement());
        }

        this.errorElement = this.parent.querySelector('.auth-form__error');
        this.button = this.parent.querySelector('.auth-button') as HTMLButtonElement;
    }

    private setEventListeners(): void {
        if (this.form) {
            this.form.addEventListener('submit', this.submitLogin.bind(this));
        }

        Object.values(this.inputs).forEach(input => {
            this.addEventListener(input.getInputElement(), 'focus', this.handleInputFocus(input));
            this.addEventListener(input.getInputElement(), 'input', this.handleInputChange(input));
        });
    }

    private async submitLogin(e: Event): Promise<void> {
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
                const decoded = this.decodeJWT(result.data.token);

                const userId = decoded?.user_id || decoded?.userID;

                if (!userId) {
                    throw new Error('Не удалось получить ID пользователя из токена. Доступные поля: ' + JSON.stringify(decoded));
                }

                const user = {
                    id: userId.toString(),
                    email: emailStr,
                    avatar: '../../images/user.png',
                    firstName: '',
                    lastName: '',
                    phone: ''
                };

                await this.controller.setUser(user, result.data.token);

                this.showFormError("Вход выполнен успешно!");
                if (this.errorElement) {
                    this.errorElement.style.color = 'green';
                }

            } else {
                const errorMessage = result.error || "Ошибка авторизации";
                this.showFormError(errorMessage);
                this.setButtonErrorState(true);
                this.clearAllVisualStates();
            }
        } catch (error) {
            this.showFormError((error as Error).message || "Ошибка сети. Попробуйте позже.");
            this.setButtonErrorState(true);
            this.clearAllVisualStates();
        } finally {
            this.setButtonLoading(false);
        }
    }

    private decodeJWT(token: string): JWTDecoded | null {
        try {
            if (!token) return null;
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    }

    private clearValidationErrors(): void {
        Object.values(this.inputs).forEach(input => {
            input.clearError();
            input.resetValidation();
        });

        this.clearFormError();
        this.setButtonErrorState(false);
    }

    private clearAllVisualStates(): void {
        Object.values(this.inputs).forEach(input => {
            input.clearVisualState();
        });
    }

    private showFormError(message: string): void {
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.classList.add('auth-form__error--visible');
            this.errorElement.style.color = '';
        }
    }

    private clearFormError(): void {
        if (this.errorElement) {
            this.errorElement.textContent = '';
            this.errorElement.classList.remove('auth-form__error--visible');
            this.errorElement.style.color = '';
        }
    }

    private setButtonLoading(isLoading: boolean): void {
        if (!this.button) return;

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

    private setButtonErrorState(hasError: boolean): void {
        if (!this.button) return;

        if (hasError) {
            this.button.disabled = true;
            this.button.classList.add('auth-button--error');
        } else {
            this.button.disabled = false;
            this.button.classList.remove('auth-button--error');
        }
    }

    private handleInputFocus(input: Input): (event: Event) => void {
        return () => {
            input.clearError();
            this.clearFormError();
            this.setButtonErrorState(false);
        };
    }

    private handleInputChange(input: Input): (event: Event) => void {
        return () => {
            input.clearVisualState();
            this.setButtonErrorState(false);
        };
    }

    private addEventListener(element: HTMLElement, event: string, handler: (event: Event) => void): void {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    cleanup(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        this.parent.innerHTML = '';
    }
}