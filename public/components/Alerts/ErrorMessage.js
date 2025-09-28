/**
 * Класс для управления отображением сообщений об ошибках
 * @class
 */
export class ErrorMessage {
    /**
     * Создает экземпляр ErrorMessage
     * @constructor
     * @param {HTMLElement} element - DOM элемент для отображения сообщений об ошибках
     */
    constructor(element) {
        this.element = element;
    }

    /**
     * Показывает сообщение об ошибке
     * @param {string} message - Текст сообщения об ошибке
     */
    show(message) {
        if (this.element) {
            this.element.textContent = message;
            this.element.classList.add("active");
        }
    }

    /**
     * Очищает сообщение об ошибке и скрывает элемент
     */
    clear() {
        if (this.element) {
            this.element.textContent = "";
            this.element.classList.remove("active");
        }
    }
}
