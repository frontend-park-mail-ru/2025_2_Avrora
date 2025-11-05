export class Form {
    element: HTMLFormElement;
    eventListeners: Array<{ event: string; handler: (event: Event) => void }>;

    constructor(className: string) {
        this.element = document.createElement('form');
        this.element.className = className;
        this.element.noValidate = true;
        this.eventListeners = [];
    }

    addChild(child: HTMLElement | { getElement(): HTMLElement }): this {
        if (child instanceof HTMLElement) {
            this.element.appendChild(child);
        } else if (child && child.getElement) {
            this.element.appendChild(child.getElement());
        }
        return this;
    }

    onSubmit(handler: (event: Event) => void): this {
        const wrappedHandler = (e: Event) => {
            e.preventDefault();
            handler(e);
        };
        this.element.addEventListener('submit', wrappedHandler);
        this.eventListeners.push({ event: 'submit', handler: wrappedHandler });
        return this;
    }

    reset(): this {
        this.element.reset();
        return this;
    }

    getElement(): HTMLFormElement {
        return this.element;
    }

    cleanup(): void {
        this.eventListeners.forEach(({ event, handler }) => {
            this.element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
}