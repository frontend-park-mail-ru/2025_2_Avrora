/**
 * Класс маршрутизатора для управления навигацией и отображением страниц в приложении
 * @class
 */
export class Router {
    /**
     * Создает экземпляр Router
     * @param {Object} app - Главный объект приложения
     * @param {Object} app.currentPage - Текущая активная страница
     * @param {Object} app.header - Компонент заголовка приложения
     * @param {Function} app.setHeaderEventListeners - Метод для установки обработчиков событий заголовка
     */
    constructor(app) {
        /**
         * Главный объект приложения
         * @type {Object}
         */
        this.app = app;
        
        /**
         * Объект с зарегистрированными маршрутами
         * @type {Object}
         */
        this.routes = {};
    }

    /**
     * Регистрирует маршрут и связанную с ним страницу
     * @param {string} path - Путь маршрута
     * @param {Object} page - Объект страницы с методом render
     */
    register(path, page) {
        this.routes[path] = page;
    }

    /**
     * Запускает маршрутизатор, устанавливает обработчики событий и загружает начальный маршрут
     */
    start() {
        window.addEventListener("popstate", () => {
            this.loadRoute(location.pathname);
        });

        this.loadRoute(location.pathname);
    }

    /**
     * Выполняет навигацию по указанному пути
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
     * @param {string} path - Путь маршрута для загрузки
     */
    loadRoute(path) {
        if (path === "/logout") {
            return;
        }
        
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
