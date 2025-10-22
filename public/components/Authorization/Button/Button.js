export class Button {
    constructor(text, type = 'submit') {
        this.element = document.createElement('button');
        this.element.type = type;
        this.element.className = 'auth-button';
        this.element.textContent = text;
        this.originalText = text;
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.element.disabled = true;
            this.element.textContent = 'Загрузка...';
            this.element.classList.add('auth-button--loading');
        } else {
            this.element.disabled = false;
            this.element.textContent = this.originalText;
            this.element.classList.remove('auth-button--loading');
        }
        return this;
    }

    setErrorState(hasError) {
        if (hasError) {
            this.element.disabled = true;
            this.element.classList.add('auth-button--error');
        } else {
            this.element.disabled = false;
            this.element.classList.remove('auth-button--error');
        }
        return this;
    }

    setDisabled(disabled) {
        this.element.disabled = disabled;
        if (disabled) {
            this.element.classList.add('auth-button--disabled');
        } else {
            this.element.classList.remove('auth-button--disabled');
        }
        return this;
    }

    onClick(handler) {
        this.element.addEventListener('click', handler);
        return this;
    }

    setText(text) {
        this.element.textContent = text;
        return this;
    }

    getElement() {
        return this.element;
    }

    getText() {
        return this.element.textContent;
    }
}