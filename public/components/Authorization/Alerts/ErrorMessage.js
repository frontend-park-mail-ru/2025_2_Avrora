/**
 * Класс для управления отображением сообщений об ошибках
 * @class
 */
export class ErrorMessage {
    /**
     * Создает экземпляр сообщения об ошибке
     * @param {HTMLElement} element - DOM-элемент для отображения сообщения
     */
    constructor(element) {
        this.element = element;
    }

    /**
     * Показывает сообщение об ошибке
     * @param {string} message - Текст сообщения об ошибке
     * @returns {ErrorMessage} Возвращает экземпляр для цепочки вызовов
     */
    show(message) {
        if (this.element) {
            this.element.textContent = message;
            this.element.classList.add("active");
        }
        return this;
    }

    /**
     * Скрывает и очищает сообщение об ошибке
     * @returns {ErrorMessage} Возвращает экземпляр для цепочки вызовов
     */
    clear() {
        if (this.element) {
            this.element.textContent = "";
            this.element.classList.remove("active");
        }
        return this;
    }

    /**
     * Устанавливает новый DOM-элемент для отображения ошибок
     * @param {HTMLElement} element - Новый DOM-элемент
     * @returns {ErrorMessage} Возвращает экземпляр для цепочки вызовов
     */
    setElement(element) {
        this.element = element;
        return this;
    }

    /**
     * Возвращает DOM-элемент сообщения об ошибке
     * @returns {HTMLElement} DOM-элемент сообщения
     */
    getElement() {
        return this.element;
    }

    /**
     * Проверяет, активно ли в данный момент сообщение об ошибке
     * @returns {boolean} true если сообщение активно, false в противном случае
     */
    isActive() {
        return this.element && this.element.classList.contains("active");
    }
}