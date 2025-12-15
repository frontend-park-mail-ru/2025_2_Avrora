import { Summary } from '../components/Profile/Summary/Summary.ts';
import { Profile } from '../components/Profile/Profile/Profile.ts';
import { Safety } from '../components/Profile/Safety/Safety.ts';
import { MyAdvertisements } from '../components/Profile/MyAdvertisements/MyAdvertisements.ts';
import { Favorites } from '../components/Profile/Favorites/Favorites.ts';
import { ProfileService } from '../utils/ProfileService.ts';

interface User {
    id?: string;
    email?: string;
    avatar?: string;
    photo_url?: string;
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    name?: string;
    AvatarURL?: string;
    avatarUrl?: string;
}

interface Component {
    render: () => Promise<HTMLElement> | HTMLElement;
    cleanup?: () => void;
    updateData?: () => Promise<void>;
}

interface EventListener {
    element: HTMLElement;
    event: string;
    handler: (event: Event) => void;
}

interface ProfileWidgetOptions {
    view?: string;
}

export class ProfileWidget {
    private parent: HTMLElement;
    private controller: any;
    private view: string;
    private eventListeners: EventListener[];
    private root: HTMLElement | null;
    private currentComponent: Component | null;
    private currentComponentElement: HTMLElement | null;
    private myOffersCount: number;
    private favoritesCount: number;
    private isRendering: boolean;
    private isUpdating: boolean;
    private profileUpdateListener: (event: Event) => void;
    private uiUpdateListener: (event: Event) => void;
    private favoritesUpdateListener: (event: Event) => void;

    constructor(parent: HTMLElement, controller: any, options: ProfileWidgetOptions = {}) {
        this.parent = parent;
        this.controller = controller;
        this.view = options.view || "summary";
        this.eventListeners = [];
        this.root = null;
        this.currentComponent = null;
        this.currentComponentElement = null;
        this.myOffersCount = 0;
        this.favoritesCount = 0;
        this.isRendering = false;
        this.isUpdating = false;
        
        this.profileUpdateListener = this.handleProfileUpdate.bind(this);
        this.uiUpdateListener = this.handleUIUpdate.bind(this);
        this.favoritesUpdateListener = this.handleFavoritesUpdate.bind(this);
        
        this.setupEventListeners();
    }
    
    private setupEventListeners(): void {
        window.addEventListener('profileUpdated', this.profileUpdateListener);
        window.addEventListener('uiUpdate', this.uiUpdateListener);
        window.addEventListener('favoritesUpdated', this.favoritesUpdateListener);
        window.addEventListener('favoritesCountUpdated', this.handleFavoritesCountUpdated.bind(this));
    }
    
    private handleProfileUpdate(event: Event): void {
        this.forceUpdate();
    }
    
    private handleUIUpdate(event: Event): void {
        this.updateSidebar();
    }
    
    private handleFavoritesUpdate(event: Event): void {
        this.updateFavoritesCount();
        this.updateSidebar();
    }

    private handleFavoritesCountUpdated(event: CustomEvent): void {
        this.favoritesCount = event.detail.count;
        this.updateSidebar();
    }

    async forceUpdate(): Promise<void> {
        if (this.isUpdating) {
            return;
        }
        
        this.isUpdating = true;
        
        try {
            await this.updateMyOffersCount();
            await this.updateFavoritesCount();
            await this.updateSidebar();

            if (this.currentComponent && typeof this.currentComponent.updateData === 'function') {
                await this.currentComponent.updateData();
            }

        } catch (error) {
        } finally {
            this.isUpdating = false;
        }
    }

    private async updateFavoritesCount(): Promise<void> {
        try {
            if (this.controller.user) {
                this.favoritesCount = await this.controller.refreshFavoritesCount();
            } else {
                this.favoritesCount = 0;
            }
        } catch (error) {
            this.favoritesCount = 0;
        }
    }

    private resolveViewFromLocation(): string {
        const path = window.location.pathname;
        if (path.startsWith("/profile/security")) return "safety";
        if (path.startsWith("/profile/edit")) return "profile";
        if (path.startsWith("/profile/myoffers")) return "myads";
        if (path.startsWith("/profile/favorites")) return "favorites";
        return "summary";
    }

    async render(): Promise<void> {
        if (this.isRendering) {
            return;
        }
        
        this.isRendering = true;
        this.cleanup();

        this.view = this.resolveViewFromLocation();

        await this.updateMyOffersCount();
        await this.updateFavoritesCount();

        this.root = document.createElement("div");
        this.root.className = "profile";

        const sidebar = this.createSidebar();
        this.root.appendChild(sidebar);

        this.parent.innerHTML = '';
        this.parent.appendChild(this.root);

        await this.renderActiveView();
        
        this.isRendering = false;
    }

    private async renderActiveView(): Promise<void> {
        if (!this.root) return;

        this.cleanupContent();

        let component: Component;
        switch (this.view) {
            case "profile":
                component = new Profile(this.controller, this);
                break;
            case "safety":
                component = new Safety(this.controller);
                break;
            case "myads":
                component = new MyAdvertisements(this.controller, this);
                break;
            case "favorites":
                component = new Favorites(this.controller);
                break;
            case "summary":
            default:
                component = new Summary(this.controller);
                break;
        }

        this.currentComponent = component;

        try {
            const componentElement = await component.render();
            
            if (componentElement && componentElement.nodeType === Node.ELEMENT_NODE) {
                this.currentComponentElement = componentElement;
                this.root.appendChild(componentElement);
            } else {
                this.renderError("Ошибка при загрузке компонента");
            }
        } catch (error) {
            this.renderError("Не удалось загрузить компонент");
        }
    }

    private cleanupContent(): void {
        if (!this.root) return;

        if (this.currentComponentElement && this.currentComponentElement.parentNode) {
            this.currentComponentElement.parentNode.removeChild(this.currentComponentElement);
            this.currentComponentElement = null;
        }

        if (this.currentComponent && typeof this.currentComponent.cleanup === 'function') {
            this.currentComponent.cleanup();
        }
        this.currentComponent = null;
    }

    async updateProfileData(): Promise<void> {
        await this.forceUpdate();
    }

    async updateSidebar(): Promise<void> {
        if (!this.root) return;

        const oldSidebar = this.root.querySelector('.profile__sidebar');
        if (oldSidebar && oldSidebar.parentNode) {
            const newSidebar = this.createSidebar();
            oldSidebar.parentNode.replaceChild(newSidebar, oldSidebar);
        }
    }

    private async updateMyOffersCount(): Promise<void> {
        try {
            if (this.controller.user) {
                const offers = await ProfileService.getMyOffers();
                this.myOffersCount = offers.length;
            } else {
                this.myOffersCount = 0;
            }
        } catch (error) {
            this.myOffersCount = 0;
        }
    }

    private createSidebar(): HTMLElement {
        const sidebar = document.createElement("div");
        sidebar.className = "profile__sidebar";

        const userBlock = this.createUserBlock();
        const navBlock = this.createNavBlock();
        const exitBlock = this.createExitBlock();

        sidebar.appendChild(userBlock);
        sidebar.appendChild(navBlock);
        sidebar.appendChild(exitBlock);

        return sidebar;
    }

    private createUserBlock(): HTMLElement {
        const block = document.createElement("div");
        block.className = "profile__sidebar-block";

        const userSection = document.createElement("div");
        userSection.className = "profile__sidebar-user";

        const avatar = document.createElement("img");
        avatar.className = "profile__sidebar-avatar";

        const user = this.controller.user;
        let userAvatar = "../../images/default_avatar.jpg";
        let userName = "Пользователь";

        if (user) {
            userAvatar = user.AvatarURL ||
                       user.avatar ||
                       user.photo_url ||
                       user.avatarUrl ||
                       "../../images/default_avatar.jpg";

            if (user.FirstName && user.LastName) {
                userName = `${user.FirstName} ${user.LastName}`;
            } else if (user.firstName && user.lastName) {
                userName = `${user.firstName} ${user.lastName}`;
            } else if (user.first_name && user.last_name) {
                userName = `${user.first_name} ${user.last_name}`;
            } else if (user.name) {
                userName = user.name;
            } else if (user.email) {
                userName = user.email.split('@')[0];
            }
        }

        avatar.src = userAvatar;
        avatar.alt = "Аватар";
        avatar.onerror = () => {
            avatar.src = "../../images/default_avatar.jpg";
        };

        const name = document.createElement("span");
        name.className = "profile__sidebar-name";
        name.textContent = userName;

        userSection.appendChild(avatar);
        userSection.appendChild(name);
        block.appendChild(userSection);

        return block;
    }

    private createNavBlock(): HTMLElement {
        const block = document.createElement("div");
        block.className = "profile__sidebar-block";

        const navItems = [
            { key: "summary", text: "Сводка", path: "/profile" },
            { key: "profile", text: "Профиль", path: "/profile/edit" },
            { key: "myads", text: `Мои объявления (${this.myOffersCount})`, path: "/profile/myoffers" },
            { key: "favorites", text: `Избранное (${this.favoritesCount})`, path: "/profile/favorites" },
            { key: "safety", text: "Безопасность", path: "/profile/security" }
        ];

        navItems.forEach(item => {
            const navButton = this.createNavButton(item);
            block.appendChild(navButton);
        });

        return block;
    }

    private createNavButton(item: { key: string; text: string; path: string }): HTMLButtonElement {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "profile__sidebar-link";

        if (this.view === item.key) {
            button.classList.add("profile__sidebar-link--active");
        }

        button.textContent = item.text;
        button.dataset.path = item.path;

        button.addEventListener("click", (e) => {
            const path = (e.currentTarget as HTMLButtonElement).dataset.path;
            if (path) {
                this.controller.navigate(path);
            }
        });

        return button;
    }

    private createExitBlock(): HTMLElement {
        const block = document.createElement("div");
        block.className = "profile__sidebar-block";

        const exitButton = document.createElement("button");
        exitButton.type = "button";
        exitButton.className = "profile__sidebar-link";
        exitButton.textContent = "Выйти";

        exitButton.addEventListener("click", async () => {
            await this.controller.logout();
        });

        block.appendChild(exitButton);
        return block;
    }

    private renderError(message: string): void {
        if (!this.root) return;

        const errorDiv = document.createElement("div");
        errorDiv.className = "profile__error";

        const errorText = document.createElement("p");
        errorText.textContent = message;
        errorDiv.appendChild(errorText);

        const retryButton = document.createElement("button");
        retryButton.className = "profile__retry-button";
        retryButton.textContent = "Попробовать снова";
        retryButton.addEventListener("click", () => {
            this.renderActiveView();
        });
        errorDiv.appendChild(retryButton);

        this.root.appendChild(errorDiv);
    }

    cleanup(): void {
        window.removeEventListener('profileUpdated', this.profileUpdateListener);
        window.removeEventListener('uiUpdate', this.uiUpdateListener);
        window.removeEventListener('favoritesUpdated', this.favoritesUpdateListener);
        window.removeEventListener('favoritesCountUpdated', this.handleFavoritesCountUpdated.bind(this));

        if (this.currentComponent && typeof this.currentComponent.cleanup === 'function') {
            this.currentComponent.cleanup();
        }

        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        if (this.parent) {
            this.parent.innerHTML = "";
        }
        
        this.root = null;
        this.currentComponent = null;
        this.currentComponentElement = null;
    }
}