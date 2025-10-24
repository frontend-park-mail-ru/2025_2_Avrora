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

    this.renderActiveView();
  }

  renderActiveView() {
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

    this.root.appendChild(component.render());
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
    avatar.src = this.state.user?.avatar || "../images/user.png";
    avatar.alt = "Аватар";

    const name = document.createElement("span");
    name.className = "profile__sidebar-name";
    name.textContent = this.state.user?.name || "Иван Иванов";

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
      { key: "myads", text: "Мои объявления (4)", path: "/profile/myoffers" },
      { key: "fav", text: "Избранное (2)", path: "/profile" },
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
    if (this.parent) this.parent.innerHTML = "";
    this.root = null;
  }
}