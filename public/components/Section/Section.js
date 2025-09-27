export class Section {
    constructor(parent) {
        this.parent = parent;
    }

    render() {
        const template = Handlebars.templates["Section.hbs"];
        this.parent.innerHTML = template();
    }
}