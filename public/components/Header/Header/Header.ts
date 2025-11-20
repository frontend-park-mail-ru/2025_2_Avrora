interface App {
    router: {
        navigate(path: string): void;
    };
    logout(): void;
    navigateToCreateAd(): void;
}

interface User {
    AvatarURL?: string;
    avatar?: string;
    photo_url?: string;
    avatarUrl?: string;
}

interface State {
    user: User | null;
}

interface TemplateData {
    isAuthenticated: boolean;
    user: {
        avatar: string;
    };
    isLoginPage: boolean;
    isRegisterPage: boolean;
}

export class Header {
    private parent: HTMLElement;
    private state: State;
    private app: App;
    private eventListeners: { element: Element; event: string; handler: EventListenerOrEventListenerObject }[];
    private template: ((data: TemplateData) => string) | null;
    private container: HTMLElement | null;

    constructor(parent: HTMLElement, state: State, app: App) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.eventListeners = [];
        this.template = null;
        this.container = null;
    }

    async render(): Promise<void> {
        this.cleanup();

        const template = await this.loadTemplate();
        const isLoginPage = window.location.pathname === '/login';
        const isRegisterPage = window.location.pathname === '/register';

        const user = this.state.user;
        let userAvatar = "../../images/user.png";

        if (user) {
            userAvatar = user.AvatarURL ||
                        user.avatar ||
                        user.photo_url ||
                        user.avatarUrl ||
                        "../../images/user.png";
        }

        const templateData: TemplateData = {
            isAuthenticated: !!this.state.user,
            user: {
                avatar: userAvatar
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

        this.container = tempContainer.firstElementChild as HTMLElement;
        this.parent.appendChild(this.container);
        this.attachEventListeners();
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
                this.app.router.navigate("/login");
            });
        }

        const registerButton = this.container.querySelector('.header__menu-btn--register');
        if (registerButton) {
            this.addEventListener(registerButton, 'click', (e: Event) => {
                e.preventDefault();
                this.app.router.navigate("/register");
            });
        }

        const logoutButton = this.container.querySelector('.header__menu-btn--logout');
        if (logoutButton) {
            this.addEventListener(logoutButton, 'click', (e: Event) => {
                e.preventDefault();
                this.app.logout();
            });
        }

        const profileButton = this.container.querySelector('.header__menu-btn--user');
        if (profileButton) {
            this.addEventListener(profileButton, 'click', (e: Event) => {
                e.preventDefault();
                this.app.router.navigate("/profile");
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
                this.app.navigateToCreateAd();
            });
        }

        const logoLink = this.container.querySelector('.header__logo-link');
        if (logoLink) {
            this.addEventListener(logoLink, 'click', (e: Event) => {
                e.preventDefault();
                this.app.router.navigate("/");
            });
        }
    }

    private handleLikeClick(): void {
        if (this.state.user) {
            this.app.router.navigate("/profile");
        } else {
            this.app.router.navigate("/login");
        }
    }

    private addEventListener(
        element: Element,
        event: string,
        handler: EventListenerOrEventListenerObject
    ): void {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
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
    }
}