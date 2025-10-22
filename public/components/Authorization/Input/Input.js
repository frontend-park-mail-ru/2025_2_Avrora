export class Input {
    constructor(type, placeholder, name, maxLength = 100) {
        this.container = document.createElement('div');
        this.container.className = 'auth-input';
        
        this.element = document.createElement('input');
        this.element.type = type;
        this.element.placeholder = placeholder;
        this.element.name = name;
        this.element.maxLength = maxLength;
        this.element.className = 'auth-input__field';
        
        this.errorElement = document.createElement('div');
        this.errorElement.className = 'auth-input__error';
        
        this.isValid = null;
        this.validationRules = [];
        this.wasValidated = false;
        
        if (type === 'password') {
            this.createPasswordToggle();
        } else {
            this.container.appendChild(this.element);
        }
        
        this.container.appendChild(this.errorElement);
    }

    createPasswordToggle() {
        this.inputContainer = document.createElement('div');
        this.inputContainer.className = 'auth-input__password-container';
        
        this.eyeIcon = document.createElement('button');
        this.eyeIcon.type = 'button';
        this.eyeIcon.className = 'auth-input__toggle';
        this.eyeIcon.setAttribute('aria-label', 'Показать пароль');
        this.eyeIcon.addEventListener('click', this.togglePasswordVisibility.bind(this));
        
        this.inputContainer.appendChild(this.element);
        this.inputContainer.appendChild(this.eyeIcon);
        this.container.appendChild(this.inputContainer);
        
        this.updateToggleIcon();
    }

    togglePasswordVisibility() {
        if (this.element.type === 'password') {
            this.element.type = 'text';
        } else {
            this.element.type = 'password';
        }
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        if (this.eyeIcon) {
            const isVisible = this.element.type === 'text';
            this.eyeIcon.classList.toggle('auth-input__toggle--visible', isVisible);
            this.eyeIcon.setAttribute('aria-label', isVisible ? 'Скрыть пароль' : 'Показать пароль');
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

        this.wasValidated = true;

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

    checkValidity() {
        const value = this.getValue();
        
        if (this.validationRules.length === 0) {
            return true;
        }

        for (const rule of this.validationRules) {
            const error = rule(value);
            if (error) {
                return false;
            }
        }

        return true;
    }

    updateVisualState() {
        if (!this.wasValidated) {
            return this;
        }

        const value = this.getValue();
        
        if (!value) {
            this.clearVisualState();
            return this;
        }

        const isValid = this.checkValidity();
        
        if (isValid) {
            this.markAsValid();
        } else {
            this.markAsInvalid();
        }
        
        return this;
    }

    resetValidation() {
        this.wasValidated = false;
        this.clearVisualState();
        return this;
    }

    clearVisualState() {
        this.element.classList.remove('auth-input__field--error');
        this.element.classList.remove('auth-input__field--valid');
        this.errorElement.textContent = '';
        this.isValid = null;
        return this;
    }

    onFocus(handler) {
        this.element.addEventListener('focus', handler);
        return this;
    }

    onInput(handler) {
        this.element.addEventListener('input', handler);
        return this;
    }

    onBlur(handler) {
        this.element.addEventListener('blur', handler);
        return this;
    }

    showError(message) {
        this.element.classList.add('auth-input__field--error');
        this.element.classList.remove('auth-input__field--valid');
        this.errorElement.textContent = message;
        this.isValid = false;
        return this;
    }

    clearError() {
        this.errorElement.textContent = '';
        return this;
    }

    markAsValid() {
        this.element.classList.remove('auth-input__field--error');
        this.element.classList.add('auth-input__field--valid');
        this.errorElement.textContent = '';
        this.isValid = true;
        return this;
    }

    markAsInvalid() {
        this.element.classList.add('auth-input__field--error');
        this.element.classList.remove('auth-input__field--valid');
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