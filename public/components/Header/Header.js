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
        
        const isLoginPage = this.app.currentPage === this.app.pages.login;
        const isRegisterPage = this.app.currentPage === this.app.pages.register;
        
        const template = Handlebars.templates["Header.hbs"];
        menuDiv.innerHTML = template({
            isAuthenticated: !!this.state.user,
            user: this.state.user,
            isLoginPage: isLoginPage,
            isRegisterPage: isRegisterPage
        });
        
        this.parent.appendChild(logoDiv);
        this.parent.appendChild(menuDiv);
        
        this.setEventListeners();
    }

    /**
     * Устанавливает обработчики событий для кнопок меню
     */
    setEventListeners() {
        const loginButton = this.parent.querySelector('.menu__button.login');
        if (loginButton && !loginButton.disabled) {
            const handler = (e) => {
                e.preventDefault();
                this.app.router.navigate("/login");
            };
            loginButton.addEventListener('click', handler);
        }

        const registerButton = this.parent.querySelector('.menu__button.register');
        if (registerButton && !registerButton.disabled) {
            const handler = (e) => {
                e.preventDefault();
                this.app.router.navigate("/register");
            };
            registerButton.addEventListener('click', handler);
        }

        const logoutButton = this.parent.querySelector('.logout');
        if (logoutButton) {
            const handler = (e) => {
                e.preventDefault();
                this.app.logout();
            };
            logoutButton.addEventListener('click', handler);
        }
    }
}