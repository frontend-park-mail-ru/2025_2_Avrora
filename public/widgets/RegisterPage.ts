import { API } from '../utils/API.js';
import { validEmail, validPassword } from '../utils/auth.js';
import { Input } from '../components/Authorization/Input/Input.ts';
import { API_CONFIG } from "../config.js";

export class RegisterPage {
    private parent: HTMLElement;
    private state: any;
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
        (Handlebars as any).registerHelper('eq', function (a: any, b: any) {
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
        this.parent.appendChild(container.firstElementChild!);

        this.initializeComponents();
        this.setEventListeners();
    }

    private initializeComponents(): void {
        this.form = this.parent.querySelector('.auth-form');
        const emailContainer = this.parent.querySelector('[data-input-name="email"]')!;
        const passwordContainer = this.parent.querySelector('[data-input-name="password"]')!;
        const repasswordContainer = this.parent.querySelector('[data-input-name="repassword"]')!;

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

    private setEventListeners(): void {
        if (this.form) {
            this.form.addEventListener('submit', this.submitSignup.bind(this));
        }
        Object.values(this.inputs).forEach(input => {
            this.addEventListener(input.getInputElement(), 'focus', this.handleInputFocus(input));
            this.addEventListener(input.getInputElement(), 'input', this.handleInputChange(input));
        });
    }

    private async submitSignup(e: Event): Promise<void> {
        e.preventDefault();
        this.clearValidationErrors();
        const emailStr = this.inputs.email.getValue();
        const passStr = this.inputs.password.getValue();
        let hasErrors = false;
        if (!this.inputs.email.validate()) hasErrors = true;
        if (!this.inputs.password.validate()) hasErrors = true;
        if (!this.inputs.repassword.validate()) hasErrors = true;
        if (hasErrors) {
            this.setButtonErrorState(true);
            return;
        }

        this.setButtonLoading(true);
        try {
            const registerResult = await API.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
                email: emailStr,
                password: passStr
            });

            if (registerResult.ok) {
                const loginResult = await API.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
                    email: emailStr,
                    password: passStr
                });

                if (loginResult.ok && loginResult.data?.token) {
                    const decoded = this.decodeJWT(loginResult.data.token);
                    const userId = decoded?.user_id || decoded?.userID || decoded?.id || decoded?.userId;
                    if (!userId) {
                        throw new Error('Не удалось получить ID пользователя из токена');
                    }

                    const user = {
                        id: userId,
                        email: loginResult.data.email || emailStr,
                        avatar: '../../images/user.png',
                        firstName: '',
                        lastName: '',
                        phone: ''
                    };
                    await this.app.setUser(user, loginResult.data.token);
                    this.showFormError("Регистрация и вход выполнены успешно!");
                    if (this.errorElement) this.errorElement.style.color = 'green';
                } else {
                    this.showFormError("Регистрация успешна! Теперь вы можете войти в систему.");
                    if (this.errorElement) this.errorElement.style.color = 'green';
                    setTimeout(() => this.app.router.navigate("/login"), 2000);
                }
            } else {
                let errorMessage = "Ошибка регистрации";
                if (registerResult.data?.error) {
                    if (registerResult.data.error.includes("уже существует")) {
                        errorMessage = "Пользователь с таким email уже существует";
                    } else {
                        errorMessage = registerResult.data.error;
                    }
                } else if (registerResult.error) {
                    errorMessage = registerResult.error;
                }
                this.showFormError(errorMessage);
                this.setButtonErrorState(true);
                this.clearAllVisualStates();
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showFormError((error as Error).message || "Ошибка сети. Проверьте подключение и попробуйте позже.");
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
            this.button.textContent = 'Регистрация...';
            this.button.classList.add('auth-button--loading');
        } else {
            this.button.disabled = false;
            this.button.textContent = 'Зарегистрироваться';
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
            if (input === this.inputs.password && this.inputs.repassword.getValue()) {
                this.inputs.repassword.validate();
            }
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