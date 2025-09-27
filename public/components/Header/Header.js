export class Header {
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;
    }

    render() {
        const template = Handlebars.templates["Header.hbs"];
        this.parent.innerHTML = template({
            isAuthenticated: !!this.state.user,
            user: this.state.user
        });
    }
}