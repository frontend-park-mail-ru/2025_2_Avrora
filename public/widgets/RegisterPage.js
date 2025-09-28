import { API } from '../utils/API.js';
import { validEmail, validPassword } from '../utils/auth.js';
import { ErrorMessage } from '../components/Authorization/Alerts/ErrorMessage.js';
import { Form } from '../components/Authorization/Form/Form.js';
import { Input } from '../components/Authorization/Input/Input.js';
import { Button } from '../components/Authorization/Button/Button.js';
import { API_CONFIG } from "../config.js";

/**
 * Класс страницы регистрации пользователя
 * @class
 */
export class RegisterPage {
    /**
     * Создает экземпляр страницы регистрации
     * @param {HTMLElement} parent - Родительский элемент для рендеринга
     * @param {Object} state - Состояние приложения
     * @param {App} app - Экземпляр главного приложения
     */
    constructor(parent, state, app) {
        this.state = state;
        this.parent = parent;
        this.app = app;
    }

    /**
     * Рендерит страницу регистрации
     */
    render() {
        this.parent.innerHTML = '';
        
        this.form = new Form('form');
        this.form.onSubmit(this.submitSignup.bind(this));
        
        const logo = document.createElement('img');
        logo.className = 'form__logo';
        logo.src = '../../images/logo.png';
        logo.alt = 'Логотип';
        
        const title = document.createElement('h1');
        title.className = 'form__title';
        title.textContent = 'Регистрация';
        
        const inputsContainer = document.createElement('div');
        inputsContainer.className = 'form__container';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'form__block';
        
        const mainErrorElement = document.createElement('div');
        mainErrorElement.className = 'error__text';
        mainErrorElement.id = 'error__register';
        this.errorMessage = new ErrorMessage(mainErrorElement);
        
        this.button = new Button('Зарегистрироваться');
        
        this.form
            .addChild(logo)
            .addChild(title)
            .addChild(inputsContainer)
            .addChild(buttonContainer);
        
        buttonContainer.appendChild(this.errorMessage.element);
        buttonContainer.appendChild(this.button.getElement());

        const template = Handlebars.templates["Authorization.hbs"];
        const inputsConfig = [
            { placeholder: "Email", type: "email", name: "email" },
            { placeholder: "Пароль", type: "password", name: "password" },
            { placeholder: "Повторите пароль", type: "password", name: "repassword" }
        ];
        
        inputsContainer.innerHTML = template({ inputs: inputsConfig });
        
        this.inputs = {};
        inputsConfig.forEach(config => {
            const inputElement = inputsContainer.querySelector(`input[name="${config.name}"]`);
            if (inputElement) {
                const inputContainer = inputElement.parentElement;
                this.inputs[config.name] = new Input(
                    config.type,
                    config.placeholder,
                    config.name
                );

                if (config.name === 'email') {
                    this.inputs[config.name].addValidationRule((value) => {
                        if (!value) return "Введите Email";
                        if (!validEmail(value)) return "Введите корректный Email";
                        return null;
                    });
                } else if (config.name === 'password') {
                    this.inputs[config.name].addValidationRule((value) => {
                        const errors = validPassword(value);
                        if (errors.length > 0) return errors[0];
                        return null;
                    });
                } else if (config.name === 'repassword') {
                    this.inputs[config.name].addValidationRule((value) => {
                        const password = this.inputs.password?.getValue();
                        if (!value) return "Повторите пароль";
                        if (value !== password) return "Пароли не совпадают";
                        return null;
                    });
                }

                inputContainer.replaceWith(this.inputs[config.name].getElement());
            }
        });

        this.parent.appendChild(this.form.getElement());
        
        this.setEventListeners();
    }

    /**
     * Обрабатывает отправку формы регистрации
     * @param {Event} e - Событие отправки формы
     */
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
            this.button.setErrorState(true);
            return;
        }

        this.button.setLoading(true);

        try {
            const result = await API.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, { 
                email: emailStr, 
                password: passStr 
            });
            
            if (result.ok) {
                this.app.setUser(result.data.user, result.data.token);
            } else {
                const errorMessage = result.data?.error;
                this.errorMessage.show(errorMessage);
                this.button.setErrorState(true);
                this.clearAllVisualStates();
            }
        } catch (error) {
            console.error('Register error:', error);
            this.errorMessage.show("Ошибка сети. Попробуйте позже.");
            this.button.setErrorState(true);
            this.clearAllVisualStates();
        } finally {
            this.button.setLoading(false);
        }
    }

    /**
     * Очищает ошибки валидации на форме
     */
    clearValidationErrors() {
        Object.values(this.inputs).forEach(input => {
            input.clearError();
            input.resetValidation();
        });
        
        this.errorMessage.clear();
        this.button.setErrorState(false);
    }

    /**
     * Очищает все визуальные состояния полей (убирает right__input и error__input)
     */
    clearAllVisualStates() {
        Object.values(this.inputs).forEach(input => {
            input.clearVisualState();
        });
    }

    /**
     * Создает обработчик события фокуса на поле ввода
     * @param {Input} input - Экземпляр поля ввода
     * @returns {Function} Функция-обработчик
     */
    handleInputFocus(input) {
        return () => {
            input.clearError();
            this.errorMessage.clear();
            this.button.setErrorState(false);
        };
    }

    /**
     * Создает обработчик события ввода в поле
     * @param {Input} input - Экземпляр поля ввода
     * @returns {Function} Функция-обработчик
     */
    handleInputChange(input) {
        return () => {
            input.clearVisualState();
            this.button.setErrorState(false);
        };
    }

    /**
     * Устанавливает обработчики событий для полей ввода
     */
    setEventListeners() {
        Object.values(this.inputs).forEach(input => {
            input.onFocus(this.handleInputFocus(input));
            input.onInput(this.handleInputChange(input));
        });
    }

    /**
     * Очищает страницу при переходе на другую
     */
    cleanup() {
        this.parent.innerHTML = '';
    }
}
