export class Router {
    
    constructor(app) {
        this.app = app;
        this.routes = {};

        this.protectedRoutes = [
            "/profile",
            "/profile/edit",
            "/profile/security",
            "/profile/myoffers",
            "/create-ad",
            "/create-ad/step-1",
            "/create-ad/step-2",
            "/create-ad/step-3",
            "/create-ad/step-4",
            "/create-ad/step-5",
            "/edit-offer/:id",
            "/edit-offer/:id/step-1",
            "/edit-offer/:id/step-2",
            "/edit-offer/:id/step-3",
            "/edit-offer/:id/step-4",
            "/edit-offer/:id/step-5",
        ];
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

    async loadRoute(path) {
        if (path === "/logout") {
            return;
        }

        // Проверка авторизации для защищенных маршрутов
        if (this.protectedRoutes.includes(path) && !this.app.state.user) {
            this.navigate("/login");
            return;
        }

        // Проверка заполненности профиля для маршрутов создания/редактирования объявлений
        if ((path.startsWith('/create-ad') || path.startsWith('/edit-offer')) &&
            this.app.state.user && !this.app.isProfileComplete()) {
            this.app.showProfileCompletionModal();
            return;
        }

        let matchedRoute = this.routes[path];
        let routeParams = {};

        if (!matchedRoute) {
            const routeKeys = Object.keys(this.routes);
            for (const route of routeKeys) {
                if (route.includes(':')) {
                    const routePattern = new RegExp('^' + route.replace(/:\w+/g, '([^/]+)') + '$');
                    const match = path.match(routePattern);

                    if (match) {
                        const paramNames = route.match(/:\w+/g)?.map(name => name.slice(1)) || [];
                        routeParams = {};
                        paramNames.forEach((name, index) => {
                            routeParams[name] = match[index + 1];
                        });
                        matchedRoute = this.routes[route];
                        break;
                    }
                }
            }
        }

        if (!matchedRoute) {
            matchedRoute = this.routes["/"];
        }

        // Проверка владения объявлением для маршрутов редактирования
        if (path.startsWith('/edit-offer/') && routeParams.id) {
            const isOwner = await this.app.checkOfferOwnership(routeParams.id);
            if (!isOwner) {
                console.warn('Attempt to edit foreign offer');
                this.navigate("/");
                return;
            }
        }

        if (this.app.currentPage?.cleanup) {
            this.app.currentPage.cleanup();
        }

        this.app.currentPage = matchedRoute;

        if (!this.initialHeaderRendered) {
            this.app.header?.render();
            this.initialHeaderRendered = true;
        }

        if (matchedRoute.renderWithParams) {
            matchedRoute.renderWithParams(routeParams);
        } else {
            matchedRoute.render();
        }
    }
}