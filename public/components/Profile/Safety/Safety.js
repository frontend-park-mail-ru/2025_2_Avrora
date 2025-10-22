export class Safety {
  constructor(state, app) {
    this.state = state;
    this.app = app;
  }

  render() {
    const content = document.createElement("div");
    content.className = "profile__content";
    
    const block = document.createElement("div");
    block.className = "profile__block";
    
    const title = document.createElement("h1");
    title.className = "profile__title";
    title.textContent = "Безопасность";
    
    const dataSection = document.createElement("div");
    dataSection.className = "profile__data-section";

    const fields = this.createPasswordFields();
    fields.forEach(field => dataSection.appendChild(field));

    const updateBtn = this.createUpdateButton();
    dataSection.appendChild(updateBtn);

    block.appendChild(title);
    block.appendChild(dataSection);
    content.appendChild(block);
    
    return content;
  }

  createPasswordFields() {
    const fields = [
      { label: "Текущий пароль", placeholder: "Введите текущий пароль" },
      { label: "Новый пароль", placeholder: "Введите новый пароль" },
      { label: "Подтвердите пароль", placeholder: "Повторите новый пароль" }
    ];

    return fields.map(field => {
      const fieldContainer = document.createElement("div");
      fieldContainer.className = "profile__field";

      const label = document.createElement("span");
      label.className = "profile__field-label";
      label.textContent = field.label;

      const passwordContainer = document.createElement("div");
      passwordContainer.className = "profile__password-container";

      const input = document.createElement("input");
      input.type = "password";
      input.className = "profile__field-input";
      input.placeholder = field.placeholder;

      const eyeIcon = this.createEyeIcon(input);

      passwordContainer.appendChild(input);
      passwordContainer.appendChild(eyeIcon);
      fieldContainer.appendChild(label);
      fieldContainer.appendChild(passwordContainer);

      return fieldContainer;
    });
  }

  createEyeIcon(input) {
    const eyeIcon = document.createElement("button");
    eyeIcon.type = "button";
    eyeIcon.className = "profile__password-toggle";
    eyeIcon.setAttribute("aria-label", "Показать пароль");

    eyeIcon.addEventListener("click", () => {
      if (input.type === "password") {
        input.type = "text";
        eyeIcon.classList.add("profile__password-toggle--visible");
        eyeIcon.setAttribute("aria-label", "Скрыть пароль");
      } else {
        input.type = "password";
        eyeIcon.classList.remove("profile__password-toggle--visible");
        eyeIcon.setAttribute("aria-label", "Показать пароль");
      }
    });

    return eyeIcon;
  }

  createUpdateButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "profile__save-button";
    button.textContent = "Обновить пароль";
    
    return button;
  }
}