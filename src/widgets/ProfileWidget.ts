import { Summary } from '../components/Profile/Summary/Summary.ts';
import { Profile } from '../components/Profile/Profile/Profile.ts';
import { Safety } from '../components/Profile/Safety/Safety.ts';
import { MyAdvertisements } from '../components/Profile/MyAdvertisements/MyAdvertisements.ts';
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
    private myOffersCount: number;
    private isRendering: boolean;
    private isUpdating: boolean;
    private profileUpdateListener: (event: Event) => void;
    private uiUpdateListener: (event: Event) => void;

    constructor(parent: HTMLElement, controller: any, options: ProfileWidgetOptions = {}) {
        this.parent = parent;
        this.controller = controller;
        this.view = options.view || "summary";
        this.eventListeners = [];
        this.root = null;
        this.currentComponent = null;
        this.myOffersCount = 0;
        this.isRendering = false;
        this.isUpdating = false;
        
        this.profileUpdateListener = this.handleProfileUpdate.bind(this);
        this.uiUpdateListener = this.handleUIUpdate.bind(this);
        
        this.setupEventListeners();
    }
    
    private setupEventListeners(): void {
        window.addEventListener('profileUpdated', this.profileUpdateListener);
        window.addEventListener('uiUpdate', this.uiUpdateListener);
    }
    
    private handleProfileUpdate(event: Event): void {
        console.log('ProfileWidget: получено обновление профиля');
        this.forceUpdate();
    }
    
    private handleUIUpdate(event: Event): void {
        console.log('ProfileWidget: получено обновление UI');
        this.updateSidebar().catch(console.error);
    }

    // Метод для принудительного обновления всех данных
    async forceUpdate(): Promise<void> {
        if (this.isUpdating) {
            console.log('Обновление уже выполняется, пропускаем');
            return;
        }
        
        this.isUpdating = true;
        
        try {
            console.log('ProfileWidget: принудительное обновление всех данных');
            
            // Обновляем счетчик объявлений
            await this.updateMyOffersCount();
            
            // Обновляем сайдбар
            await this.updateSidebar();
            
            // Если текущий компонент поддерживает обновление, обновляем его
            if (this.currentComponent && typeof this.currentComponent.updateData === 'function') {
                await this.currentComponent.updateData();
            }
            
            console.log('ProfileWidget: обновление завершено');
        } catch (error) {
            console.error('Ошибка при принудительном обновлении:', error);
        } finally {
            this.isUpdating = false;
        }
    }

    private resolveViewFromLocation(): string {
        const path = window.location.pathname;
        if (path.startsWith("/profile/security")) return "safety";
        if (path.startsWith("/profile/edit")) return "profile";
        if (path.startsWith("/profile/myoffers")) return "myads";
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

        this.root = document.createElement("div");
        this.root.className = "profile";

        const sidebar = this.createSidebar();
        this.root.appendChild(sidebar);

        // Полностью очищаем родительский контейнер
        this.parent.innerHTML = '';
        this.parent.appendChild(this.root);

        await this.renderActiveView();
        
        this.isRendering = false;
    }

    private async renderActiveView(): Promise<void> {
        if (!this.root) return;

        // Очищаем предыдущий контент (кроме сайдбара)
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
            case "summary":
            default:
                component = new Summary(this.controller);
                break;
        }

        this.currentComponent = component;

        try {
            const componentElement = await component.render();
            if (componentElement && componentElement.nodeType) {
                this.root.appendChild(componentElement);
            } else {
                this.renderError("Ошибка при загрузке компонента");
            }
        } catch (error) {
            console.error('Ошибка при рендеринге компонента:', error);
            this.renderError("Не удалось загрузить компонент");
        }
    }

    // Очищаем только контент, оставляя сайдбар
    private cleanupContent(): void {
        if (!this.root) return;

        // Находим все элементы кроме сайдбара
        const contentElements = Array.from(this.root.children).filter(
            child => !child.classList.contains('profile__sidebar')
        );

        // Удаляем их
        contentElements.forEach(element => {
            this.root?.removeChild(element);
        });

        // Также очищаем текущий компонент
        if (this.currentComponent && typeof this.currentComponent.cleanup === 'function') {
            this.currentComponent.cleanup();
        }
        this.currentComponent = null;
    }

    // Метод для обновления данных профиля
    async updateProfileData(): Promise<void> {
        await this.forceUpdate();
    }

    // Метод для обновления сайдбара в реальном времени
    async updateSidebar(): Promise<void> {
        if (!this.root) return;

        const oldSidebar = this.root.querySelector('.profile__sidebar');
        if (oldSidebar) {
            const newSidebar = this.createSidebar();
            this.root.replaceChild(newSidebar, oldSidebar);
        }
    }

    private async updateMyOffersCount(): Promise<void> {
        try {
            const offers = await ProfileService.getMyOffers();
            this.myOffersCount = offers.length;
        } catch (error) {
            console.error('Ошибка при загрузке счетчика объявлений:', error);
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
        // Удаляем слушатели событий
        window.removeEventListener('profileUpdated', this.profileUpdateListener);
        window.removeEventListener('uiUpdate', this.uiUpdateListener);
        
        // Очищаем текущий компонент
        if (this.currentComponent && typeof this.currentComponent.cleanup === 'function') {
            this.currentComponent.cleanup();
        }

        // Очищаем все слушатели событий
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        // Полная очистка родительского элемента
        if (this.parent) {
            this.parent.innerHTML = "";
        }
        
        this.root = null;
        this.currentComponent = null;
    }
}