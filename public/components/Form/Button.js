/**
 * Класс для создания кнопок
 * @class
 */
export class Button {
    /**
     * Создает экземпляр Button
     * @constructor
     * @param {HTMLElement} parent - Родительский элемент для вставки кнопки
     * @param {Object} options - Опции кнопки
     * @param {string} options.text - Текст кнопки
     * @param {string} options.id - ID кнопки
     * @param {string} [options.type="button"] - Тип кнопки (button, submit, reset)
     */
    constructor(parent, { text, id, type = "button" }) {
        this.parent = parent;
        this.text = text;
        this.id = id;
        this.type = type;
    }

    /**
     * Рендерит кнопку в родительский элемент
     */
    render() {
        this.parent.innerHTML += `
            <button id="${this.id}" type="${this.type}" class="btn">${this.text}</button>
        `;
    }
}
