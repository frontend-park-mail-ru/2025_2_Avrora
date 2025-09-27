export class Button {
    constructor(parent, { text, id, type = "button" }) {
        this.parent = parent;
        this.text = text;
        this.id = id;
        this.type = type;
    }

    render() {
        this.parent.innerHTML += `
            <button id="${this.id}" type="${this.type}" class="btn">${this.text}</button>
        `;
    }
}
