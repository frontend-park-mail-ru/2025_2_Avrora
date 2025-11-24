interface TemplateData {
    isAuthenticated: boolean;
    user: {
        avatar: string;
    };
    isLoginPage: boolean;
    isRegisterPage: boolean;
    showAddButton: boolean;
}

export class Header {
    private parent: HTMLElement;
    private controller: any;
    private eventListeners: { element: Element; event: string; handler: EventListenerOrEventListenerObject }[];
    private template: ((data: TemplateData) => string) | null;
    private container: HTMLElement | null;
    private logoContainer: HTMLElement | null = null;
    private buttonsContainer: HTMLElement | null = null;

    constructor(parent: HTMLElement, controller: any) {
        this.parent = parent;
        this.controller = controller;
        this.eventListeners = [];
        this.template = null;
        this.container = null;
    }

    async render(): Promise<void> {
        this.cleanup();
        const template = await this.loadTemplate();
        const isLoginPage = window.location.pathname === '/login';
        const isRegisterPage = window.location.pathname === '/register';

        const user = this.controller.user;
        let userAvatar = "../../images/user.png";

        if (user) {
            userAvatar = user.AvatarURL ||
                        user.avatar ||
                        user.photo_url ||
                        user.avatarUrl ||
                        "../../images/user.png";
        }

        const isAuthenticated = this.controller.isAuthenticated;
        const showAddButton = isAuthenticated && !isLoginPage && !isRegisterPage;

        const templateData: TemplateData = {
            isAuthenticated,
            user: { avatar: userAvatar },
            isLoginPage,
            isRegisterPage,
            showAddButton
        };

        if (typeof template !== 'function') {
            console.error('Template is not a function:', template);
            throw new Error('Header template is not a valid function');
        }

        const html = template(templateData);
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        this.container = tempContainer.firstElementChild as HTMLElement;
        if (!this.container) {
            throw new Error('Header container element not created');
        }

        this.parent.appendChild(this.container);

        this.restructureMobileLayout();

        this.attachEventListeners();
    }

    private restructureMobileLayout(): void {
        if (!this.container) return;

        this.logoContainer = document.createElement('div');
        this.logoContainer.className = 'header__logo-container';

        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.className = 'header__buttons-container';

        const logoLink = this.container.querySelector('.header__logo-link');
        if (logoLink) {
            this.logoContainer.appendChild(logoLink);
        }

        const addButton = this.container.querySelector('.header__menu-btn--add-object');
        const userButton = this.container.querySelector('.header__menu-btn--user');
        const loginButton = this.container.querySelector('.header__menu-btn--login');
        const registerButton = this.container.querySelector('.header__menu-btn--register');

        [addButton, userButton, loginButton, registerButton]
            .filter(el => el !== null)
            .forEach(el => this.buttonsContainer!.appendChild(el));

        const oldMenu = this.container.querySelector('.header__menu');
        if (oldMenu) {
            oldMenu.replaceWith(this.logoContainer, this.buttonsContainer);
        } else {
            this.container.appendChild(this.logoContainer);
            this.container.appendChild(this.buttonsContainer);
        }
    }

    private async loadTemplate(): Promise<(data: TemplateData) => string> {
        if (this.template) return this.template;
        try {
            const templates = (window as any).Handlebars.templates;
            this.template = templates['Header'] || templates['Header.hbs'];
            if (!this.template) {
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

    private attachEventListeners(): void {
        if (!this.container) return;

        const loginButton = this.container.querySelector('.header__menu-btn--login');
        if (loginButton) {
            this.addEventListener(loginButton, 'click', (e: Event) => {
                e.preventDefault();
                this.controller.navigate("/login");
            });
        }

        const registerButton = this.container.querySelector('.header__menu-btn--register');
        if (registerButton) {
            this.addEventListener(registerButton, 'click', (e: Event) => {
                e.preventDefault();
                this.controller.navigate("/register");
            });
        }

        const logoutButton = this.container.querySelector('.header__menu-btn--logout');
        if (logoutButton) {
            this.addEventListener(logoutButton, 'click', (e: Event) => {
                e.preventDefault();
                this.controller.logout();
            });
        }

        const profileButton = this.container.querySelector('.header__menu-btn--user');
        if (profileButton) {
            this.addEventListener(profileButton, 'click', (e: Event) => {
                e.preventDefault();
                this.controller.navigate("/profile");
            });
        }

        const likeButton = this.container.querySelector('.header__menu-btn--like');
        if (likeButton) {
            this.addEventListener(likeButton, 'click', (e: Event) => {
                e.preventDefault();
                this.handleLikeClick();
            });
        }

        const addObjectButton = this.container.querySelector('.header__menu-btn--add-object');
        if (addObjectButton) {
            this.addEventListener(addObjectButton, 'click', (e: Event) => {
                e.preventDefault();
                this.controller.navigateToCreateAd();
            });
        }

        const logoLink = this.container.querySelector('.header__logo-link');
        if (logoLink) {
            this.addEventListener(logoLink, 'click', (e: Event) => {
                e.preventDefault();
                this.controller.navigate("/");
            });
        }
    }

    private handleLikeClick(): void {
        if (this.controller.isAuthenticated) {
            this.controller.navigate("/profile");
        } else {
            this.controller.navigate("/login");
        }
    }

    private addEventListener(
        element: Element,
        event: string,
        handler: EventListenerOrEventListenerObject
    ): void {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    private cleanup(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        if (this.container) {
            this.container.remove();
            this.container = null;
        }

        this.logoContainer = null;
        this.buttonsContainer = null;
    }
}