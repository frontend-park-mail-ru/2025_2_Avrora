import { ErrorMessage } from '../Alerts/ErrorMessage.js';

export class Input {
    constructor(type, placeholder, name, maxLength = 100) {
        this.container = document.createElement('div');
        this.container.className = 'form__block';
        
        this.element = document.createElement('input');
        this.element.type = type;
        this.element.placeholder = placeholder;
        this.element.name = name;
        this.element.maxLength = maxLength;
        
        this.errorElement = document.createElement('div');
        this.errorElement.className = 'error__text';
        this.errorElement.id = `error__${name}`;
        
        this.errorMessage = new ErrorMessage(this.errorElement);
        
        this.isValid = null;
        this.validationRules = [];
        
        if (type === 'password') {
            this.eyeIcon = document.createElement('img');
            this.eyeIcon.className = 'password__toggle';
            this.eyeIcon.src = '../../images/view.png';
            this.eyeIcon.alt = 'Показать пароль';
            this.eyeIcon.addEventListener('click', this.togglePasswordVisibility.bind(this));
            
            this.inputContainer = document.createElement('div');
            this.inputContainer.className = 'form__password';
            this.inputContainer.appendChild(this.element);
            this.inputContainer.appendChild(this.eyeIcon);
            
            this.container.appendChild(this.inputContainer);
        } else {
            this.container.appendChild(this.element);
        }
        
        this.container.appendChild(this.errorElement);
        
        this.element.addEventListener('blur', this.validate.bind(this));
    }

    togglePasswordVisibility() {
        if (this.element.type === 'password') {
            this.element.type = 'text';
            this.eyeIcon.src = '../../images/active__view.png';
            this.eyeIcon.alt = 'Скрыть пароль';
        } else {
            this.element.type = 'password';
            this.eyeIcon.src = '../../images/view.png';
            this.eyeIcon.alt = 'Показать пароль';
        }
    }

    getValue() {
        return this.element.value.trim();
    }

    setValue(value) {
        this.element.value = value;
        return this;
    }

    addValidationRule(rule) {
        this.validationRules.push(rule);
        return this;
    }

    validate() {
        const value = this.getValue();
        
        if (this.validationRules.length === 0) {
            return true;
        }

        for (const rule of this.validationRules) {
            const error = rule(value);
            if (error) {
                this.showError(error);
                return false;
            }
        }

        this.markAsValid();
        return true;
    }

    onFocus(handler) {
        this.element.addEventListener('focus', handler);
        return this;
    }

    onInput(handler) {
        this.element.addEventListener('input', handler);
        return this;
    }

    showError(message) {
        this.element.classList.add('error__input');
        this.element.classList.remove('right__input');
        this.errorMessage.show(message);
        this.isValid = false;
        return this;
    }

    clearError() {
        this.element.classList.remove('error__input');
        this.element.classList.remove('right__input');
        this.errorMessage.clear();
        this.isValid = null;
        return this;
    }

    markAsValid() {
        this.element.classList.remove('error__input');
        this.element.classList.add('right__input');
        this.errorMessage.clear();
        this.isValid = true;
        return this;
    }

    markAsInvalid() {
        this.element.classList.remove('error__input');
        this.element.classList.remove('right__input');
        this.isValid = false;
        return this;
    }

    setDisabled(disabled) {
        this.element.disabled = disabled;
        return this;
    }

    getElement() {
        return this.container;
    }

    getInputElement() {
        return this.element;
    }

    getName() {
        return this.element.name;
    }
}