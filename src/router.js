export class Router {
    
    constructor(controller) {
        this.controller = controller;
        this.routes = {};
        this.currentPath = '';

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
            this.loadRoute(window.location.pathname + window.location.search);
        });

        this.loadRoute(window.location.pathname + window.location.search);
    }

    navigate(path) {
        const fullPath = path;
        
        if (this.currentPath !== fullPath) {
            history.pushState({}, "", fullPath);
            this.loadRoute(fullPath);
        }
    }

    async loadRoute(fullPath) {
        
        if (fullPath === "/logout") {
            await this.controller.logout();
            return;
        }

        const [path, search] = fullPath.split('?');
        const urlParams = new URLSearchParams(search);

        // Проверка защищенных маршрутов
        if (this.protectedRoutes.some(route => {
            if (route.includes(':')) {
                const routePattern = new RegExp('^' + route.replace(/:\w+/g, '[^/]+') + '$');
                return routePattern.test(path);
            }
            return route === path;
        }) && !this.controller.isAuthenticated) {
            this.navigate("/login");
            return;
        }

        // Проверка полноты профиля для создания/редактирования офферов
        if ((path.startsWith('/create-ad') || path.startsWith('/edit-offer')) &&
            this.controller.isAuthenticated && !this.controller.isProfileComplete()) {
            this.controller.showProfileCompletionModal();
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

        // Проверка владения оффером для редактирования
        if (path.startsWith('/edit-offer/') && routeParams.id) {
            const isOwner = await this.controller.checkOfferOwnership(routeParams.id);
            if (!isOwner) {
                this.navigate("/");
                return;
            }
        }

        const currentPage = this.controller.model.appStateModel.currentPage;
        if (currentPage?.cleanup) {
            currentPage.cleanup();
        }

        this.controller.setCurrentPage(matchedRoute);
        this.currentPath = fullPath;

        if (!this.initialHeaderRendered) {
            if (this.controller.view.header) {
                this.controller.view.header.render();
            }
            this.initialHeaderRendered = true;
        }

        const allParams = {
            ...routeParams,
            searchParams: Object.fromEntries(urlParams)
        };

        if (matchedRoute.renderWithParams) {
            matchedRoute.renderWithParams(allParams);
        } else {
            matchedRoute.render();
        }
    }
}