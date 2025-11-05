export class Button {
    constructor({
        text = '',
        type = 'button',
        onClick = null,
        className = 'button'
    } = {}) {
        this.text = text;
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

        if (this.onClick) {
            this.element.addEventListener('click', this.onClick);
        }
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