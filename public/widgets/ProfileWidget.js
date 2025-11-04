import { Summary } from '../components/Profile/Summary/Summary.js';
import { Profile } from '../components/Profile/Profile/Profile.js';
import { Safety } from '../components/Profile/Safety/Safety.js';
import { MyAdvertisements } from '../components/Profile/MyAdvertisements/MyAdvertisements.js';

export class ProfileWidget {
  constructor(parent, state, app, options = {}) {
    this.parent = parent;
    this.state = state;
    this.app = app;
    this.view = options.view || "summary";
    this.eventListeners = [];
    this.root = null;
    this.currentComponent = null;
  }

  resolveViewFromLocation() {
    const path = window.location.pathname;
    if (path.startsWith("/profile/security")) return "safety";
    if (path.startsWith("/profile/edit")) return "profile";
    if (path.startsWith("/profile/myoffers")) return "myads";
    return "summary";
  }

  async render() {
    this.cleanup();

    this.view = this.resolveViewFromLocation();

    this.root = document.createElement("div");
    this.root.className = "profile";

    const sidebar = this.createSidebar();
    this.root.appendChild(sidebar);

    this.parent.appendChild(this.root);

    await this.renderActiveView();
  }

  async renderActiveView() {
    if (!this.root) return;

    while (this.root.childNodes.length > 1) {
      this.root.removeChild(this.root.lastChild);
    }

    let component;
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

  renderError(message) {
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

  createSidebar() {
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

createUserBlock() {
  const block = document.createElement("div");
  block.className = "profile__sidebar-block";

  const userSection = document.createElement("div");
  userSection.className = "profile__sidebar-user";

  const avatar = document.createElement("img");
  avatar.className = "profile__sidebar-avatar";

  // Используем актуальные данные пользователя
  const userAvatar = this.app.state.user?.avatar ||
                    this.app.state.user?.photo_url ||
                    this.app.state.user?.AvatarURL ||
                    "../../images/user.png";
  avatar.src = userAvatar;
  avatar.alt = "Аватар";
  avatar.onerror = () => {
    avatar.src = "../../images/user.png";
  };

  const name = document.createElement("span");
  name.className = "profile__sidebar-name";

  // Используем реальное имя пользователя из app.state
  let userName = "Пользователь";
  const user = this.app.state.user;
  if (user) {
    if (user.firstName && user.lastName) {
      userName = `${user.firstName} ${user.lastName}`;
    } else if (user.first_name && user.last_name) {
      userName = `${user.first_name} ${user.last_name}`;
    } else if (user.FirstName && user.LastName) {
      userName = `${user.FirstName} ${user.LastName}`;
    } else if (user.name) {
      userName = user.name;
    }
  }

  name.textContent = userName;

  userSection.appendChild(avatar);
  userSection.appendChild(name);
  block.appendChild(userSection);

  return block;
}

  createNavBlock() {
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

  createNavButton(item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "profile__sidebar-link";

    if (this.view === item.key) {
      button.classList.add("profile__sidebar-link--active");
    }

    button.textContent = item.text;
    button.dataset.path = item.path;

    button.addEventListener("click", (e) => {
      const path = e.currentTarget.dataset.path;
      if (this.app?.router?.navigate) {
        this.app.router.navigate(path);
      }
    });

    return button;
  }

  createExitBlock() {
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

  addEventListener(element, event, handler) {
    if (!element) return;
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  removeEventListeners() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  cleanup() {
    this.removeEventListeners();

    if (this.currentComponent && typeof this.currentComponent.cleanup === 'function') {
      this.currentComponent.cleanup();
    }

    if (this.parent) this.parent.innerHTML = "";
    this.root = null;
    this.currentComponent = null;
  }
}