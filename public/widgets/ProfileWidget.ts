import { Summary } from '../components/Profile/Summary/Summary.ts';
import { Profile } from '../components/Profile/Profile/Profile.ts';
import { Safety } from '../components/Profile/Safety/Safety.ts';
import { MyAdvertisements } from '../components/Profile/MyAdvertisements/MyAdvertisements.ts';


interface AppState {
    [key: string]: any;
    user?: User;
}

interface App {
    state: AppState;
    router: {
        navigate: (path: string) => void;
    };
    logout?: () => Promise<void>;
}

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
    private state: AppState;
    private app: App;
    private view: string;
    private eventListeners: EventListener[];
    private root: HTMLElement | null;
    private currentComponent: Component | null;

    constructor(parent: HTMLElement, state: AppState, app: App, options: ProfileWidgetOptions = {}) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.view = options.view || "summary";
        this.eventListeners = [];
        this.root = null;
        this.currentComponent = null;
    }

    private resolveViewFromLocation(): string {
        const path = window.location.pathname;
        if (path.startsWith("/profile/security")) return "safety";
        if (path.startsWith("/profile/edit")) return "profile";
        if (path.startsWith("/profile/myoffers")) return "myads";
        return "summary";
    }

    async render(): Promise<void> {
        this.cleanup();

        this.view = this.resolveViewFromLocation();

        this.root = document.createElement("div");
        this.root.className = "profile";

        const sidebar = this.createSidebar();
        this.root.appendChild(sidebar);

        this.parent.appendChild(this.root);

        await this.renderActiveView();
    }

    private async renderActiveView(): Promise<void> {
        if (!this.root) return;

        while (this.root.childNodes.length > 1) {
            this.root.removeChild(this.root.lastChild);
        }

        let component: Component;
        switch (this.view) {
            case "profile":
                component = new Profile(this.state, this.app);
                break;
            case "safety":
                component = new Safety(this.state, this.app);
                break;
            case "myads":
                component = new MyAdvertisements(this.state, this.app);
                break;
            case "summary":
            default:
                component = new Summary(this.state, this.app);
                break;
        }

        this.currentComponent = component;

        try {
            const componentElement = await component.render();
            if (componentElement && componentElement.nodeType) {
                this.root.appendChild(componentElement);
            } else {
                console.error('Component render did not return a valid DOM node:', componentElement);
                this.renderError("Ошибка при загрузке компонента");
            }
        } catch (error) {
            console.error('Error rendering profile component:', error);
            this.renderError("Не удалось загрузить компонент");
        }
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

        const user = this.app.state.user;
        let userAvatar = "../../images/user.png";
        let userName = "Пользователь";

        if (user) {
            userAvatar = user.AvatarURL ||
                       user.avatar ||
                       user.photo_url ||
                       user.avatarUrl ||
                       "../../images/user.png";

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
            avatar.src = "../../images/user.png";
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
            { key: "myads", text: "Мои объявления", path: "/profile/myoffers" },
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
            if (this.app?.router?.navigate && path) {
                this.app.router.navigate(path);
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
            if (this.app?.logout) await this.app.logout();
        });

        block.appendChild(exitButton);
        return block;
    }

    private addEventListener(element: HTMLElement, event: string, handler: (event: Event) => void): void {
        if (!element) return;
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    private removeEventListeners(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }

    cleanup(): void {
        this.removeEventListeners();

        if (this.currentComponent && typeof this.currentComponent.cleanup === 'function') {
            this.currentComponent.cleanup();
        }

        if (this.parent) this.parent.innerHTML = "";
        this.root = null;
        this.currentComponent = null;
    }
}