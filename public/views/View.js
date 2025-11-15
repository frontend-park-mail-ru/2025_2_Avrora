export class View {
    constructor(element, state, controller) {
        this.element = element;
        this.state = state;
        this.controller = controller;
    }

    render(template, data = {}) {
        if (Handlebars.templates[template]) {
            this.element.innerHTML = Handlebars.templates[template]({
                ...data,
                user: this.state.userModel.user
            });
        } else {
            console.error(`Template ${template} not found`);
        }
    }

    cleanup() {
        // Базовая реализация очистки
        this.element.innerHTML = '';
    }

    show() {
        this.element.style.display = 'block';
    }

    hide() {
        this.element.style.display = 'none';
    }
}