export class Button {
    constructor({
        text = '',
        disabled = false,
        type = 'button',
        onClick = null,
        className = 'button'
    } = {}) {
        this.text = text;
        this.disabled = disabled;
        this.type = type;
        this.onClick = typeof onClick === 'function' ? onClick : null;
        this.className = className;

        this.createElement();
    }

    createElement() {
        this.element = document.createElement('button');
        this.element.type = this.type;
        this.element.className = this.className;
        this.element.textContent = this.text;
        this.element.disabled = this.disabled;

        if (this.onClick) {
            this.element.addEventListener('click', this.onClick);
        }
    }

    setDisabled(disabled) {
        this.disabled = Boolean(disabled);
        this.element.disabled = this.disabled;
    }

    setText(text) {
        this.text = text;
        this.element.textContent = text;
    }

    mount(parent) {
        if (parent && this.element) {
            parent.appendChild(this.element);
        }
    }

    destroy() {
        if (this.element) {
            if (this.onClick) {
                this.element.removeEventListener('click', this.onClick);
            }
            this.element.remove();
        }
    }
}