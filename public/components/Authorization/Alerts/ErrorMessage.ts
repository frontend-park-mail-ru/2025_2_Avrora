export class ErrorMessage {
    element: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    show(message: string): this {
        if (this.element) {
            this.element.textContent = message;
            this.element.classList.add("error-message--active");
        }
        return this;
    }

    clear(): this {
        if (this.element) {
            this.element.textContent = "";
            this.element.classList.remove("error-message--active");
        }
        return this;
    }

    setElement(element: HTMLElement): this {
        this.element = element;
        return this;
    }

    getElement(): HTMLElement {
        return this.element;
    }

    isActive(): boolean {
        return this.element && this.element.classList.contains("error-message--active");
    }
}