export class Header {
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.eventListeners = [];
        this.template = null;
        this.container = null;
    }

    async render() {
        this.cleanup();

        const template = await this.loadTemplate();
        const isLoginPage = window.location.pathname === '/login';
        const isRegisterPage = window.location.pathname === '/register';

        const templateData = {
            isAuthenticated: !!this.state.user,
            user: {
                avatar: this.state.user?.avatar || '../images/user.png'
            },
            isLoginPage,
            isRegisterPage
        };

        if (typeof template !== 'function') {
            console.error('Template is not a function:', template);
            throw new Error('Header template is not a valid function');
        }

        const html = template(templateData);
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;

        this.container = tempContainer.firstElementChild;
        this.parent.appendChild(this.container);
        this.attachEventListeners();
    }

    async loadTemplate() {
        if (this.template) return this.template;

        try {
            this.template = Handlebars.templates['Header'] || Handlebars.templates['Header.hbs'];

            if (!this.template) {
                console.warn('Available templates:', Object.keys(Handlebars.templates || {}));
                throw new Error('Header template not found in compiled templates');
            }

            if (typeof this.template !== 'function') {
                throw new Error('Header template is not a function');
            }

            return this.template;
        } catch (error) {
            console.error('Failed to load header template:', error);
            throw new Error('Header template loading failed');
        }
    }

    attachEventListeners() {
        if (!this.container) return;

        const loginButton = this.container.querySelector('.header__menu-btn--login');
        if (loginButton) {
            this.addEventListener(loginButton, 'click', (e) => {
                e.preventDefault();
                this.app.router.navigate("/login");
            });
        }

        const registerButton = this.container.querySelector('.header__menu-btn--register');
        if (registerButton) {
            this.addEventListener(registerButton, 'click', (e) => {
                e.preventDefault();
                this.app.router.navigate("/register");
            });
        }

        const logoutButton = this.container.querySelector('.header__menu-btn--logout');
        if (logoutButton) {
            this.addEventListener(logoutButton, 'click', (e) => {
                e.preventDefault();
                this.app.logout();
            });
        }

        const profileButton = this.container.querySelector('.header__menu-btn--user');
        if (profileButton) {
            this.addEventListener(profileButton, 'click', (e) => {
                e.preventDefault();
                this.app.router.navigate("/profile");
            });
        }

        const likeButton = this.container.querySelector('.header__menu-btn--like');
        if (likeButton) {
            this.addEventListener(likeButton, 'click', (e) => {
                e.preventDefault();
                this.handleLikeClick();
            });
        }

        const addObjectButton = this.container.querySelector('.header__menu-btn--add-object');
        if (addObjectButton) {
            this.addEventListener(addObjectButton, 'click', (e) => {
                e.preventDefault();
                this.handleAddObjectClick();
            });
        }

        const logoLink = this.container.querySelector('.header__logo-link');
        if (logoLink) {
            this.addEventListener(logoLink, 'click', (e) => {
                e.preventDefault();
                this.app.router.navigate("/");
            });
        }
    }

    handleLikeClick() {
        if (this.state.user) {
            this.app.router.navigate("/profile");
        } else {
            this.app.router.navigate("/login");
        }
    }

    handleAddObjectClick() {
        if (this.state.user) {
            if (this.app.isProfileComplete()) {
                this.app.router.navigate("/create-ad");
            } else {
                this.app.showProfileCompletionModal();
            }
        } else {
            this.app.router.navigate("/login");
        }
    }

    addEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}