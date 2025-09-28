/**
 * Класс секции с заголовком и кнопками действий
 * @class
 */
export class Section {
    /**
     * Создает экземпляр секции
     * @param {HTMLElement} parent - Родительский элемент для рендеринга
     */
    constructor(parent) {
        this.parent = parent;
    }

    /**
     * Рендерит секцию с заголовком и группой кнопок
     */
    render() {
        const title = document.createElement('h1');
        title.textContent = 'Твой следующий адрес начинается здесь';
        
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'section__group';
        
        const button1 = document.createElement('button');
        button1.type = 'button';
        button1.className = 'section__button';
        button1.textContent = 'Показать на карте';
        
        const button2 = document.createElement('button');
        button2.type = 'button';
        button2.className = 'section__button';
        button2.textContent = 'Показать объявления';
        
        buttonGroup.appendChild(button1);
        buttonGroup.appendChild(button2);
        
        this.parent.innerHTML = '';
        this.parent.appendChild(title);
        this.parent.appendChild(buttonGroup);
    }
}