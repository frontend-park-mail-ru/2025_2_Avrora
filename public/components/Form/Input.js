export class Input {
    constructor(parent, { type = "text", name, placeholder, errorMessage = "" }) {
        this.parent = parent;
        this.type = type;
        this.name = name;
        this.placeholder = placeholder;
        this.errorMessage = errorMessage;
    }

    render() {
        this.parent.innerHTML += `
            <div class="form__group">
                <input type="${this.type}" name="${this.name}" placeholder="${this.placeholder}" />
                <div class="warning" id="warn_${this.name}">${this.errorMessage}</div>
            </div>
        `;
    }
}
