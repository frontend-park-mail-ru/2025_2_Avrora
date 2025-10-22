export class Form {
    constructor(className) {
        this.element = document.createElement('form');
        this.element.className = className;
        this.element.noValidate = true;
        this.eventListeners = [];
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
        const wrappedHandler = (e) => {
            e.preventDefault();
            handler(e);
        };
        this.element.addEventListener('submit', wrappedHandler);
        this.eventListeners.push({ event: 'submit', handler: wrappedHandler });
        return this;
    }

    reset() {
        this.element.reset();
        return this;
    }

    getElement() {
        return this.element;
    }

    cleanup() {
        this.eventListeners.forEach(({ event, handler }) => {
            this.element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
}