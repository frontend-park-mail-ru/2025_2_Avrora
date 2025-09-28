export class ErrorMessage {
    constructor(element) {
        this.element = element;
    }

    show(message) {
        if (this.element) {
            this.element.textContent = message;
            this.element.classList.add("active");
        }
        return this;
    }

    clear() {
        if (this.element) {
            this.element.textContent = "";
            this.element.classList.remove("active");
        }
        return this;
    }

    setElement(element) {
        this.element = element;
        return this;
    }

    getElement() {
        return this.element;
    }

    isActive() {
        return this.element && this.element.classList.contains("active");
    }
}