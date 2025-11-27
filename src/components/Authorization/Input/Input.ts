type ValidationRule = (value: string) => string | null;

export class Input {
    private container: HTMLDivElement;
    private element: HTMLInputElement;
    private errorElement: HTMLDivElement;
    private inputContainer: HTMLDivElement | null;
    private eyeIcon: HTMLButtonElement | null;
    private isValid: boolean | null;
    private validationRules: ValidationRule[];
    private wasValidated: boolean;

    constructor(type: string, placeholder: string, name: string, maxLength: number = 100) {
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
        this.inputContainer = null;
        this.eyeIcon = null;

        if (type === 'password') {
            this.createPasswordToggle();
        } else {
            this.container.appendChild(this.element);
        }

        this.container.appendChild(this.errorElement);
    }

    private createPasswordToggle(): void {
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

    private togglePasswordVisibility(): void {
        if (this.element.type === 'password') {
            this.element.type = 'text';
        } else {
            this.element.type = 'password';
        }
        this.updateToggleIcon();
    }

    private updateToggleIcon(): void {
        if (this.eyeIcon) {
            const isVisible = this.element.type === 'text';
            this.eyeIcon.classList.toggle('auth-input__toggle--visible', isVisible);
            this.eyeIcon.setAttribute('aria-label', isVisible ? 'Скрыть пароль' : 'Показать пароль');
        }
    }

    getValue(): string {
        return this.element.value.trim();
    }

    setValue(value: string): this {
        this.element.value = value;
        return this;
    }

    addValidationRule(rule: ValidationRule): this {
        this.validationRules.push(rule);
        return this;
    }

    validate(): boolean {
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

    checkValidity(): boolean {
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

    updateVisualState(): this {
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

    resetValidation(): this {
        this.wasValidated = false;
        this.clearVisualState();
        return this;
    }

    clearVisualState(): this {
        this.element.classList.remove('auth-input__field--error');
        this.element.classList.remove('auth-input__field--valid');
        this.errorElement.textContent = '';
        this.isValid = null;
        return this;
    }

    onFocus(handler: (event: FocusEvent) => void): this {
        this.element.addEventListener('focus', handler);
        return this;
    }

    onInput(handler: (event: Event) => void): this {
        this.element.addEventListener('input', handler);
        return this;
    }

    onBlur(handler: (event: FocusEvent) => void): this {
        this.element.addEventListener('blur', handler);
        return this;
    }

    showError(message: string): this {
        this.element.classList.add('auth-input__field--error');
        this.element.classList.remove('auth-input__field--valid');
        this.errorElement.textContent = message;
        this.isValid = false;
        return this;
    }

    clearError(): this {
        this.errorElement.textContent = '';
        return this;
    }

    markAsValid(): this {
        this.element.classList.remove('auth-input__field--error');
        this.element.classList.add('auth-input__field--valid');
        this.errorElement.textContent = '';
        this.isValid = true;
        return this;
    }

    markAsInvalid(): this {
        this.element.classList.add('auth-input__field--error');
        this.element.classList.remove('auth-input__field--valid');
        this.isValid = false;
        return this;
    }

    setDisabled(disabled: boolean): this {
        this.element.disabled = disabled;
        return this;
    }

    getElement(): HTMLDivElement {
        return this.container;
    }

    getInputElement(): HTMLInputElement {
        return this.element;
    }

    getName(): string {
        return this.element.name;
    }
}