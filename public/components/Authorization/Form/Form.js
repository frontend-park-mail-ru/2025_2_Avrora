export class Form {
    constructor(className) {
        this.element = document.createElement('form');
        this.element.className = className;
        this.element.noValidate = true;
    }

    addChild(child) {
        if (child instanceof HTMLElement) {
            this.element.appendChild(child);
        } else if (child && child.getElement) {
            this.element.appendChild(child.getElement());
        }
        return this;
    }

    onSubmit(handler) {
        this.element.addEventListener('submit', handler);
        return this;
    }

    reset() {
        this.element.reset();
    }

    getElement() {
        return this.element;
    }
}