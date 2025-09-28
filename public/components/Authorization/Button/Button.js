export class Button {
    constructor(text, type = 'submit') {
        this.element = document.createElement('button');
        this.element.type = type;
        this.element.textContent = text;
        this.originalText = text;
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.element.disabled = true;
            this.element.textContent = 'Загрузка...';
        } else {
            this.element.disabled = false;
            this.element.textContent = this.originalText;
        }
        return this;
    }

    setErrorState(hasError) {
        if (hasError) {
            this.element.classList.add('error__button');
        } else {
            this.element.classList.remove('error__button');
        }
        return this;
    }

    setDisabled(disabled) {
        this.element.disabled = disabled;
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