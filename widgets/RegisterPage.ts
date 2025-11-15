import { API } from '../utils/API.js';
import { validEmail, validPassword } from '../utils/Validator.ts';
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

interface APIResponse {
    ok: boolean;
    data?: any;
    error?: string;
}

export class RegisterPage {
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
            title: 'Регистрация',
            buttonText: 'Зарегистрироваться',
            inputs: [
                { placeholder: "Email", type: "email", name: "email" },
                { placeholder: "Пароль", type: "password", name: "password" },
                { placeholder: "Повторите пароль", type: "password", name: "repassword" }
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
        const repasswordContainer = this.parent.querySelector('[data-input-name="repassword"]');

        this.inputs.email = new Input('email', 'Email', 'email')
            .addValidationRule((value: string) => {
                if (!value) return "Введите Email";
                if (!validEmail(value)) return "Введите корректный Email";
                return null;
            });

        this.inputs.password = new Input('password', 'Пароль', 'password')
            .addValidationRule((value: string) => {
                const errors = validPassword(value);
                if (errors.length > 0) return errors[0];
                return null;
            });

        this.inputs.repassword = new Input('password', 'Повторите пароль', 'repassword')
            .addValidationRule((value: string) => {
                const password = this.inputs.password?.getValue();
                if (!value) return "Повторите пароль";
                if (value !== password) return "Пароли не совпадают";
                return null;
            });

        if (emailContainer) {
            emailContainer.replaceWith(this.inputs.email.getElement());
        }
        if (passwordContainer) {
            passwordContainer.replaceWith(this.inputs.password.getElement());
        }
        if (repasswordContainer) {
            repasswordContainer.replaceWith(this.inputs.repassword.getElement());
        }

        this.errorElement = this.parent.querySelector('.auth-form__error');
        this.button = this.parent.querySelector('.auth-button') as HTMLButtonElement;
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
            const registerResult: APIResponse = await API.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
                email: emailStr,
                password: passStr
            });

            if (registerResult.ok) {
                const loginResult: APIResponse = await API.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
                    email: emailStr,
                    password: passStr
                });

                if (loginResult.ok && loginResult.data && loginResult.data.token) {
                    const decoded = this.decodeJWT(loginResult.data.token);

                    const userId = decoded?.user_id || decoded?.userID;

                    if (!userId) {
                        throw new Error('Не удалось получить ID пользователя из токена. Доступные поля: ' + JSON.stringify(decoded));
                    }

                    const user = {
                        id: userId.toString(),
                        email: loginResult.data.email || emailStr,
                        avatar: '../../images/user.png',
                        firstName: '',
                        lastName: '',
                        phone: ''
                    };

                    await this.controller.setUser(user, loginResult.data.token);

                    this.showFormError("Регистрация и вход выполнены успешно!");
                    if (this.errorElement) {
                        this.errorElement.style.color = 'green';
                    }

                } else {
                    this.showFormError("Регистрация успешна! Теперь вы можете войти в систему.");
                    if (this.errorElement) {
                        this.errorElement.style.color = 'green';
                    }
                    this.setButtonErrorState(false);
                    this.clearAllVisualStates();

                    setTimeout(() => {
                        this.controller.navigate("/login");
                    }, 2000);
                }
            } else {
                let errorMessage = "Ошибка регистрации";

                if (registerResult.data) {
                    if (registerResult.data.error) {
                        if (registerResult.data.error.includes("уже существует") ||
                            registerResult.data.error.includes("already exists")) {
                            errorMessage = "Пользователь с таким email уже существует";
                        } else if (registerResult.data.error.includes("неправильный формат") ||
                                 registerResult.data.error.includes("invalid format")) {
                            errorMessage = "Некорректный формат email";
                        } else {
                            errorMessage = registerResult.data.error;
                        }
                    } else if (registerResult.data.message) {
                        errorMessage = registerResult.data.message;
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

            if (input === this.inputs.password && this.inputs.repassword.getValue()) {
                this.inputs.repassword.validate();
            }
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