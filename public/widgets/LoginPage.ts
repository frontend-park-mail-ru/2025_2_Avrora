import { API } from '../utils/API.js';
import { validEmail } from '../utils/auth.js';
import { Input } from '../components/Authorization/Input/Input.ts';
import { API_CONFIG } from "../config.js";

export class LoginPage {
    private state: any;
    private parent: HTMLElement;
    private app: any;
    private inputs: Record<string, Input> = {};
    private eventListeners: Array<{ element: EventTarget; event: string; handler: EventListener }> = [];
    private form: HTMLFormElement | null = null;
    private errorElement: HTMLElement | null = null;
    private button: HTMLButtonElement | null = null;

    constructor(parent: HTMLElement, state: any, app: any) {
        this.parent = parent;
        this.state = state;
        this.app = app;
    }

    async render(): Promise<void> {
        this.cleanup();
        const template = (Handlebars as any).templates['Authorization.hbs'];
        (Handlebars as any).registerHelper('eq', function(a: any, b: any) {
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
        this.parent.appendChild(container.firstElementChild!);
        this.initializeComponents();
        this.setEventListeners();
    }

    private initializeComponents(): void {
        this.form = this.parent.querySelector('.auth-form');
        const emailContainer = this.parent.querySelector('[data-input-name="email"]')!;
        const passwordContainer = this.parent.querySelector('[data-input-name="password"]')!;
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
        if (!this.inputs.email.validate()) hasErrors = true;
        if (!this.inputs.password.validate()) hasErrors = true;
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
                const userId = decoded?.user_id || decoded?.userID || decoded?.id || decoded?.userId;
                if (!userId) throw new Error('Не удалось получить ID пользователя из токена');
                const user = {
                    id: userId,
                    email: emailStr,
                    avatar: '../../images/user.png',
                    firstName: '',
                    lastName: '',
                    phone: ''
                };
                await this.app.setUser(user, result.data.token);
                this.showFormError("Вход выполнен успешно!");
                if (this.errorElement) this.errorElement.style.color = 'green';
            } else {
                this.showFormError(result.error || "Ошибка авторизации");
                this.setButtonErrorState(true);
                this.clearAllVisualStates();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showFormError((error as Error).message || "Ошибка сети. Попробуйте позже.");
            this.setButtonErrorState(true);
            this.clearAllVisualStates();
        } finally {
            this.setButtonLoading(false);
        }
    }

    private decodeJWT(token: string): any {
        try {
            if (!token) return null;
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
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

    private handleInputFocus(input: Input): () => void {
        return () => {
            input.clearError();
            this.clearFormError();
            this.setButtonErrorState(false);
        };
    }

    private handleInputChange(input: Input): () => void {
        return () => {
            input.clearVisualState();
            this.setButtonErrorState(false);
        };
    }

    private addEventListener(element: EventTarget, event: string, handler: EventListener): void {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    cleanup(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.parent.innerHTML = '';
    }
}