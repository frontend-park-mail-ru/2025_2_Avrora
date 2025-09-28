/**
 * Класс заголовка приложения с логотипом и меню пользователя
 * @class
 */
export class Header {
    /**
     * Создает экземпляр заголовка
     * @param {HTMLElement} parent - Родительский элемент для рендеринга
     * @param {Object} state - Состояние приложения
     * @param {App} app - Экземпляр главного приложения
     */
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;
    }

    /**
     * Рендерит заголовок с логотипом и меню пользователя
     * Меню отображается в зависимости от состояния аутентификации пользователя
     */
    render() {
        this.parent.innerHTML = '';
        
        const logoDiv = document.createElement('div');
        logoDiv.className = 'logo';
        
        const logoLink = document.createElement('a');
        logoLink.href = '/';
        logoLink.className = 'logo__link';
        
        const logoImage = document.createElement('img');
        logoImage.src = '../../images/logo.png';
        logoImage.className = 'logo__image';
        logoImage.alt = 'Логотип';
        
        const logoTitle = document.createElement('span');
        logoTitle.className = 'logo__title';
        logoTitle.textContent = 'Homa';
        
        logoLink.appendChild(logoImage);
        logoLink.appendChild(logoTitle);
        logoDiv.appendChild(logoLink);
        
        const menuDiv = document.createElement('div');
        menuDiv.className = 'menu';
        
        const template = Handlebars.templates["Header.hbs"];
        menuDiv.innerHTML = template({
            isAuthenticated: !!this.state.user,
            user: this.state.user
        });
        
        this.parent.appendChild(logoDiv);
        this.parent.appendChild(menuDiv);
    }
}