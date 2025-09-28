import { ErrorMessage } from '../Alerts/ErrorMessage.js';

/**
 * Класс для управления полями ввода с валидацией и визуальной обратной связью
 * @class
 */
export class Input {
    /**
     * Создает экземпляр поля ввода
     * @param {string} type - Тип поля ввода (text, email, password и т.д.)
     * @param {string} placeholder - Подсказка в поле ввода
     * @param {string} name - Имя поля ввода
     * @param {number} maxLength - Максимальная длина вводимого текста
     */
    constructor(type, placeholder, name, maxLength = 100) {
        this.container = document.createElement('div');
        this.container.className = 'form__block';
        
        this.element = document.createElement('input');
        this.element.type = type;
        this.element.placeholder = placeholder;
        this.element.name = name;
        this.element.maxLength = maxLength;
        
        this.errorElement = document.createElement('div');
        this.errorElement.className = 'error__text';
        this.errorElement.id = `error__${name}`;
        
        this.errorMessage = new ErrorMessage(this.errorElement);
        
        this.isValid = null;
        this.validationRules = [];
        this.wasValidated = false;
        
        if (type === 'password') {
            this.eyeIcon = document.createElement('img');
            this.eyeIcon.className = 'password__toggle';
            this.eyeIcon.src = '../../images/view.png';
            this.eyeIcon.alt = 'Показать пароль';
            this.eyeIcon.addEventListener('click', this.togglePasswordVisibility.bind(this));
            
            this.inputContainer = document.createElement('div');
            this.inputContainer.className = 'form__password';
            this.inputContainer.appendChild(this.element);
            this.inputContainer.appendChild(this.eyeIcon);
            
            this.container.appendChild(this.inputContainer);
        } else {
            this.container.appendChild(this.element);
        }
        
        this.container.appendChild(this.errorElement);
    }

    /**
     * Переключает видимость пароля
     */
    togglePasswordVisibility() {
        if (this.element.type === 'password') {
            this.element.type = 'text';
            this.eyeIcon.src = '../../images/active__view.png';
            this.eyeIcon.alt = 'Скрыть пароль';
        } else {
            this.element.type = 'password';
            this.eyeIcon.src = '../../images/view.png';
            this.eyeIcon.alt = 'Показать пароль';
        }
    }

    /**
     * Возвращает значение поля ввода
     * @returns {string} Значение поля
     */
    getValue() {
        return this.element.value.trim();
    }

    /**
     * Устанавливает значение поля ввода
     * @param {string} value - Новое значение
     * @returns {Input} Возвращает экземпляр для цепочки вызовов
     */
    setValue(value) {
        this.element.value = value;
        return this;
    }

    /**
     * Добавляет правило валидации
     * @param {Function} rule - Функция валидации, возвращающая сообщение об ошибке или null
     * @returns {Input} Возвращает экземпляр для цепочки вызовов
     */
    addValidationRule(rule) {
        this.validationRules.push(rule);
        return this;
    }

    /**
     * Выполняет валидацию поля ввода (для отправки формы)
     * @returns {boolean} true если поле валидно, false в противном случае
     */
    validate() {
        const value = this.getValue();
        
        if (this.validationRules.length === 0) {
            return true;
        }

        this.wasValidated = true;

        for (const rule of this.validationRules) {
            const error = rule(value);
            if (error) {
                this.showError(error);
                return false;
            }
        }

        this.markAsValid();
        return true;
    }

    /**
     * Проверяет валидность без отображения ошибок (для динамической проверки)
     * @returns {boolean} true если поле валидно, false в противном случае
     */
    checkValidity() {
        const value = this.getValue();
        
        if (this.validationRules.length === 0) {
            return true;
        }

        for (const rule of this.validationRules) {
            const error = rule(value);
            if (error) {
                return false;
            }
        }

        return true;
    }

    /**
     * Обновляет визуальное состояние на основе текущей валидности
     * @returns {Input} Возвращает экземпляр для цепочки вызовов
     */
    updateVisualState() {
        if (!this.wasValidated) {
            return this;
        }

        const value = this.getValue();
        
        if (!value) {
            this.clearVisualState();
            return this;
        }

        const isValid = this.checkValidity();
        
        if (isValid) {
            this.markAsValid();
        } else {
            this.markAsInvalid();
        }
        
        return this;
    }

    /**
     * Сбрасывает флаг валидации
     * @returns {Input} Возвращает экземпляр для цепочки вызовов
     */
    resetValidation() {
        this.wasValidated = false;
        this.clearVisualState();
        return this;
    }

    /**
     * Очищает визуальное состояние
     * @returns {Input} Возвращает экземпляр для цепочки вызовов
     */
    clearVisualState() {
        this.element.classList.remove('error__input');
        this.element.classList.remove('right__input');
        this.errorMessage.clear();
        this.isValid = null;
        return this;
    }

    /**
     * Добавляет обработчик события фокуса
     * @param {Function} handler - Функция-обработчик
     * @returns {Input} Возвращает экземпляр для цепочки вызовов
     */
    onFocus(handler) {
        this.element.addEventListener('focus', handler);
        return this;
    }

    /**
     * Добавляет обработчик события ввода
     * @param {Function} handler - Функция-обработчик
     * @returns {Input} Возвращает экземпляр для цепочки вызовов
     */
    onInput(handler) {
        this.element.addEventListener('input', handler);
        return this;
    }

    /**
     * Добавляет обработчик события потери фокуса
     * @param {Function} handler - Функция-обработчик
     * @returns {Input} Возвращает экземпляр для цепочки вызовов
     */
    onBlur(handler) {
        this.element.addEventListener('blur', handler);
        return this;
    }

    /**
     * Показывает сообщение об ошибке
     * @param {string} message - Текст сообщения об ошибке
     * @returns {Input} Возвращает экземпляр для цепочки вызовов
     */
    showError(message) {
        this.element.classList.add('error__input');
        this.element.classList.remove('right__input');
        this.errorMessage.show(message);
        this.isValid = false;
        return this;
    }

    /**
     * Очищает сообщение об ошибке
     * @returns {Input} Возвращает экземпляр для цепочки вызовов
     */
    clearError() {
        this.errorMessage.clear();
        return this;
    }

    /**
     * Отмечает поле как валидное
     * @returns {Input} Возвращает экземпляр для цепочки вызовов
     */
    markAsValid() {
        this.element.classList.remove('error__input');
        this.element.classList.add('right__input');
        this.errorMessage.clear();
        this.isValid = true;
        return this;
    }

    /**
     * Отмечает поле как невалидное (без сообщения об ошибке)
     * @returns {Input} Возвращает экземпляр для цепочки вызовов
     */
    markAsInvalid() {
        this.element.classList.add('error__input');
        this.element.classList.remove('right__input');
        this.isValid = false;
        return this;
    }

    /**
     * Устанавливает состояние disabled поля
     * @param {boolean} disabled - Флаг состояния disabled
     * @returns {Input} Возвращает экземпляр для цепочки вызовов
     */
    setDisabled(disabled) {
        this.element.disabled = disabled;
        return this;
    }

    /**
     * Возвращает DOM-элемент контейнера поля ввода
     * @returns {HTMLElement} DOM-элемент контейнера
     */
    getElement() {
        return this.container;
    }

    /**
     * Возвращает DOM-элемент поля ввода
     * @returns {HTMLInputElement} DOM-элемент input
     */
    getInputElement() {
        return this.element;
    }

    /**
     * Возвращает имя поля ввода
     * @returns {string} Имя поля
     */
    getName() {
        return this.element.name;
    }
}
