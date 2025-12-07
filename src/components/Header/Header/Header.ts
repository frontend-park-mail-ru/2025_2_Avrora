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
    private controller: any; 
    private eventListeners: { element: Element; event: string; handler: EventListenerOrEventListenerObject }[];
    private template: ((data: TemplateData) => string) | null;
    private container: HTMLElement | null;
    private profileUpdateListener: (event: Event) => void;
    private uiUpdateListener: (event: Event) => void;
    private isRendering: boolean;

    constructor(parent: HTMLElement, controller: any) {
        this.parent = parent;
        this.controller = controller;
        this.eventListeners = [];
        this.template = null;
        this.container = null;
        this.isRendering = false;
        this.profileUpdateListener = this.handleProfileUpdate.bind(this);
        this.uiUpdateListener = this.handleUIUpdate.bind(this);

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        window.addEventListener('profileUpdated', this.profileUpdateListener);
        window.addEventListener('uiUpdate', this.uiUpdateListener);
    }

    private handleProfileUpdate(): void {
        this.render().catch(error => {

        });
    }
    
    private handleUIUpdate(): void {
        this.render().catch(error => {

        });
    }

    async render(): Promise<void> {
        if (this.isRendering) {
            return;
        }
        
        this.isRendering = true;

        this.cleanup();
        
        try {
            const template = await this.loadTemplate();
            const isLoginPage = window.location.pathname === '/login';
            const isRegisterPage = window.location.pathname === '/register';

            const user = this.controller.user;
            let userAvatar = "../../images/default_avatar.jpg";

            if (user) {
                userAvatar = user.AvatarURL ||
                            user.avatar ||
                            user.photo_url ||
                            user.avatarUrl ||
                            "../../images/default_avatar.jpg";
            }

            const templateData: TemplateData = {
                isAuthenticated: this.controller.isAuthenticated,
                user: {
                    avatar: userAvatar
                },
                isLoginPage,
                isRegisterPage
            };

            if (typeof template !== 'function') {
                throw new Error('Header template is not a valid function');
            }

            const html = template(templateData);
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;
            this.container = tempContainer.firstElementChild as HTMLElement;

            this.parent.innerHTML = '';
            this.parent.appendChild(this.container);
            this.attachEventListeners();
        } catch (error) {
            throw error;
        } finally {
            this.isRendering = false;
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
            if (this.container.parentNode === this.parent) {
                this.parent.removeChild(this.container);
            }
            this.container = null;
        }
    }

    destroy(): void {
        window.removeEventListener('profileUpdated', this.profileUpdateListener);
        window.removeEventListener('uiUpdate', this.uiUpdateListener);
        this.cleanup();
    }
}