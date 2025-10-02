/**
 * Класс для управления кнопками с различными состояниями
 * @class
 */
export class Button {
    /**
     * Создает экземпляр кнопки
     * @param {string} text - Текст кнопки
     * @param {string} type - Тип кнопки (submit, button, reset)
     */
    constructor(text, type = 'submit') {
        this.element = document.createElement('button');
        this.element.type = type;
        this.element.textContent = text;
        this.originalText = text;
    }

    /**
     * Устанавливает состояние загрузки кнопки
     * @param {boolean} isLoading - Флаг состояния загрузки
     * @returns {Button} Возвращает экземпляр для цепочки вызовов
     */
    setLoading(isLoading) {
        if (isLoading) {
            this.element.disabled = true;
            this.element.textContent = 'Загрузка...';
        } else {
            this.element.disabled = false;
            this.element.textContent = this.originalText;
        }
        return this;
    }

    /**
     * Устанавливает состояние ошибки кнопки
     * @param {boolean} hasError - Флаг состояния ошибки
     * @returns {Button} Возвращает экземпляр для цепочки вызовов
     */
    setErrorState(hasError) {
        if (hasError) {
            this.element.disabled = true;
        } else {
            this.element.disabled = false;
        }
        return this;
    }

    /**
     * Устанавливает состояние disabled кнопки
     * @param {boolean} disabled - Флаг состояния disabled
     * @returns {Button} Возвращает экземпляр для цепочки вызовов
     */
    setDisabled(disabled) {
        this.element.disabled = disabled;
        return this;
    }

    /**
     * Добавляет обработчик события клика
     * @param {Function} handler - Функция-обработчик клика
     * @returns {Button} Возвращает экземпляр для цепочки вызовов
     */
    onClick(handler) {
        this.element.addEventListener('click', handler);
        return this;
    }

    /**
     * Устанавливает текст кнопки
     * @param {string} text - Новый текст кнопки
     * @returns {Button} Возвращает экземпляр для цепочки вызовов
     */
    setText(text) {
        this.element.textContent = text;
        return this;
    }

    /**
     * Возвращает DOM-элемент кнопки
     * @returns {HTMLButtonElement} DOM-элемент кнопки
     */
    getElement() {
        return this.element;
    }

    /**
     * Возвращает текущий текст кнопки
     * @returns {string} Текст кнопки
     */
    getText() {
        return this.element.textContent;
    }
}