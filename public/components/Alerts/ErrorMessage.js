export class ErrorMessage {
    constructor(element) {
        this.element = element;
    }

    show(message) {
        if (this.element) {
            this.element.textContent = message;
            this.element.classList.add("active");
        }
    }

    clear() {
        if (this.element) {
            this.element.textContent = "";
            this.element.classList.remove("active");
        }
    }
}
