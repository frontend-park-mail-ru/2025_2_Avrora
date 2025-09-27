export class Router {
    constructor(app) {
        this.app = app;
        this.routes = {};
    }

    register(path, page) {
        this.routes[path] = page;
    }

    start() {
        window.addEventListener("popstate", () => {
            this.loadRoute(location.pathname);
        });

        this.loadRoute(location.pathname);
    }

    navigate(path) {
        if (location.pathname !== path) {
            history.pushState({}, "", path);
        }
        this.loadRoute(path);
    }

    loadRoute(path) {
        const page = this.routes[path] || this.routes["/"];
        if (this.app.currentPage?.cleanup) {
            this.app.currentPage.cleanup();
        }
        this.app.currentPage = page;
        page.render();
        this.app.header?.render();
        this.app.setHeaderEventListeners();
    }
}
