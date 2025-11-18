interface TemplateData {
    isAuthenticated: boolean;
    user: {
        avatar: string;
    };
    isLoginPage: boolean;
    isRegisterPage: boolean;
}

export class Header {
    private container: HTMLElement;
    private controller: any;
    private isMenuOpen: boolean = false;

    constructor(container: HTMLElement, controller: any) {
        this.container = container;
        this.controller = controller;
        this.render();
        this.attachEventListeners();
    }

    render(): void {
        const template = (Handlebars as any).templates['Header.hbs'];

        const user = this.controller.model.userModel.user;
        const isAuthenticated = !!user;

        const templateData = {
            user,
            isAuthenticated,
            menuIcon: '☰' 
        };

        const html = template(templateData);
        this.container.innerHTML = html;

        if (window.innerWidth <= 768) {
            this.container.classList.add('header--mobile');
        }
    }

    private attachEventListeners(): void {
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                this.container.classList.add('header--mobile');
            } else {
                this.container.classList.remove('header--mobile');
                this.closeMobileMenu(); 
            }
        });

        const menuBtn = this.container.querySelector('.header__menu-btn--mobile');
        if (menuBtn) {
            menuBtn.addEventListener('click', (e: Event) => {
                e.preventDefault();
                this.toggleMobileMenu();
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
                this.controller.navigate("/profile/myfavorites");
            });
        }

        const registerButton = this.container.querySelector('.header__menu-btn--register');
        if (registerButton) {
            this.addEventListener(registerButton, 'click', (e: Event) => {
                e.preventDefault();
                this.controller.navigate("/register");
            });
        }

        const loginButton = this.container.querySelector('.header__menu-btn--login');
        if (loginButton) {
            this.addEventListener(loginButton, 'click', (e: Event) => {
                e.preventDefault();
                this.controller.navigate("/login");
            });
        }
    }

    private toggleMobileMenu(): void {
        this.isMenuOpen = !this.isMenuOpen;
        const menu = this.container.querySelector('.header__menu');
        if (menu) {
            menu.style.display = this.isMenuOpen ? 'flex' : 'none';
        }
    }

    private closeMobileMenu(): void {
        this.isMenuOpen = false;
        const menu = this.container.querySelector('.header__menu');
        if (menu) {
            menu.style.display = 'none';
        }
    }

    private addEventListener(element: HTMLElement, event: string, handler: EventListenerOrEventListenerObject): void {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    cleanup(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.container.innerHTML = '';
    }
}