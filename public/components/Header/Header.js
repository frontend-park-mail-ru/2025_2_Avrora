/**
 * Класс для рендеринга заголовка приложения
 * @class
 */
export class Header {
    /**
     * Создает экземпляр Header
     * @constructor
     * @param {HTMLElement} parent - Родительский элемент для вставки заголовка
     * @param {Object} state - Состояние приложения
     * @param {Object} app - Экземпляр главного приложения
     */
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;
    }

    /**
     * Рендерит заголовок с использованием Handlebars шаблона
     */
    render() {
        const template = Handlebars.templates["Header.hbs"];
        this.parent.innerHTML = template({
            isAuthenticated: !!this.state.user,
            user: this.state.user
        });
    }
}