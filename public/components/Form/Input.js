/**
 * Класс для создания полей ввода
 * @class
 */
export class Input {
    /**
     * Создает экземпляр Input
     * @constructor
     * @param {HTMLElement} parent - Родительский элемент для вставки поля ввода
     * @param {Object} options - Опции поля ввода
     * @param {string} [options.type="text"] - Тип поля ввода
     * @param {string} options.name - Имя поля ввода
     * @param {string} options.placeholder - Плейсхолдер поля ввода
     * @param {string} [options.errorMessage=""] - Сообщение об ошибке
     */
    constructor(parent, { type = "text", name, placeholder, errorMessage = "" }) {
        this.parent = parent;
        this.type = type;
        this.name = name;
        this.placeholder = placeholder;
        this.errorMessage = errorMessage;
    }

    /**
     * Рендерит поле ввода в родительский элемент
     */
    render() {
        this.parent.innerHTML += `
            <div class="form__group">
                <input type="${this.type}" name="${this.name}" placeholder="${this.placeholder}" />
                <div class="warning" id="warn_${this.name}">${this.errorMessage}</div>
            </div>
        `;
    }
}
