/**
 * Класс для рендеринга основной секции приложения
 * @class
 */
export class Section {
    /**
     * Создает экземпляр Section
     * @constructor
     * @param {HTMLElement} parent - Родительский элемент для вставки секции
     */
    constructor(parent) {
        this.parent = parent;
    }

    /**
     * Рендерит секцию с использованием Handlebars шаблона
     */
    render() {
        const template = Handlebars.templates["Section.hbs"];
        this.parent.innerHTML = template();
    }
}