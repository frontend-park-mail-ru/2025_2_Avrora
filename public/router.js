export class Router {
    
    constructor(app) {
        this.app = app;
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
        window.addEventListener("popstate", (event) => {
            console.log('PopState event:', event.state, 'Current URL:', window.location.href);
            this.loadRoute(window.location.pathname + window.location.search);
        });

        // Обработка начальной загрузки
        this.loadRoute(window.location.pathname + window.location.search);
    }

    navigate(path) {
        const fullPath = path;
        console.log('Router navigating to:', fullPath, 'Current path:', this.currentPath);
        
        if (this.currentPath !== fullPath) {
            history.pushState({}, "", fullPath);
            this.loadRoute(fullPath);
        }
    }

    async loadRoute(fullPath) {
        console.log('Router loading route:', fullPath);
        
        if (fullPath === "/logout") {
            return;
        }

        // Извлекаем путь и параметры
        const [path, search] = fullPath.split('?');
        const urlParams = new URLSearchParams(search);

        console.log('Parsed - Path:', path, 'Params:', Object.fromEntries(urlParams));

        // Проверка авторизации для защищенных маршрутов
        if (this.protectedRoutes.some(route => {
            if (route.includes(':')) {
                const routePattern = new RegExp('^' + route.replace(/:\w+/g, '[^/]+') + '$');
                return routePattern.test(path);
            }
            return route === path;
        }) && !this.app.state.user) {
            console.log('Redirecting to login - protected route');
            this.navigate("/login");
            return;
        }

        // Проверка заполненности профиля для маршрутов создания/редактирования объявлений
        if ((path.startsWith('/create-ad') || path.startsWith('/edit-offer')) &&
            this.app.state.user && !this.app.isProfileComplete()) {
            console.log('Profile not complete, showing modal');
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
            console.log('Route not found, defaulting to home');
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
            console.log('Cleaning up current page');
            this.app.currentPage.cleanup();
        }

        this.app.currentPage = matchedRoute;
        this.currentPath = fullPath;

        if (!this.initialHeaderRendered) {
            console.log('Rendering header for first time');
            this.app.header?.render();
            this.initialHeaderRendered = true;
        }

        // Передаем параметры URL в виджеты
        const allParams = {
            ...routeParams,
            searchParams: Object.fromEntries(urlParams)
        };

        console.log('Calling render with params:', allParams);

        if (matchedRoute.renderWithParams) {
            matchedRoute.renderWithParams(allParams);
        } else {
            matchedRoute.render();
        }
    }
}