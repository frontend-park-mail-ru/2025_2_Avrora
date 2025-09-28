/**
 * Класс для управления формами с цепочкой вызовов
 * @class
 */
export class Form {
    /**
     * Создает экземпляр формы
     * @param {string} className - CSS класс для формы
     */
    constructor(className) {
        this.element = document.createElement('form');
        this.element.className = className;
        this.element.noValidate = true;
    }

    /**
     * Добавляет дочерний элемент в форму
     * @param {HTMLElement|Object} child - DOM-элемент или объект с методом getElement()
     * @returns {Form} Возвращает экземпляр для цепочки вызовов
     */
    addChild(child) {
        if (child instanceof HTMLElement) {
            this.element.appendChild(child);
        } else if (child && child.getElement) {
            this.element.appendChild(child.getElement());
        }
        return this;
    }

    /**
     * Устанавливает обработчик события отправки формы
     * @param {Function} handler - Функция-обработчик события submit
     * @returns {Form} Возвращает экземпляр для цепочки вызовов
     */
    onSubmit(handler) {
        this.element.addEventListener('submit', handler);
        return this;
    }

    /**
     * Сбрасывает значения формы
     * @returns {Form} Возвращает экземпляр для цепочки вызовов
     */
    reset() {
        this.element.reset();
        return this;
    }

    /**
     * Возвращает DOM-элемент формы
     * @returns {HTMLFormElement} DOM-элемент формы
     */
    getElement() {
        return this.element;
    }
}