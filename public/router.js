/**
 * Роутер для управления навигацией в SPA приложении
 * @class
 */
export class Router {
    /**
     * Создает экземпляр Router
     * @constructor
     * @param {Object} app - Главный экземпляр приложения
     */
    constructor(app) {
        this.app = app;
        this.routes = {};
    }

    /**
     * Регистрирует маршрут
     * @param {string} path - Путь маршрута
     * @param {Object} page - Экземпляр страницы
     */
    register(path, page) {
        this.routes[path] = page;
    }

    /**
     * Запускает роутер и начинает отслеживать изменения URL
     */
    start() {
        window.addEventListener("popstate", () => {
            this.loadRoute(location.pathname);
        });

        this.loadRoute(location.pathname);
    }

    /**
     * Навигация по указанному пути
     * @param {string} path - Путь для навигации
     */
    navigate(path) {
        if (location.pathname !== path) {
            history.pushState({}, "", path);
        }
        this.loadRoute(path);
    }

    /**
     * Загружает и отображает страницу для указанного маршрута
     * @param {string} path - Путь маршрута
     */
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
