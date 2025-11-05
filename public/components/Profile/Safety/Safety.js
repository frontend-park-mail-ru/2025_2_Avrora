// [file name]: Safety.js
import { ProfileService } from '../../../utils/ProfileService.js';
import { Modal } from '../../OfferCreate/Modal/Modal.js';
import { showFieldErrors, clearFieldError, validPassword } from '../../../utils/auth.js';
import { MediaService } from '../../../utils/MediaService.js';

export class Safety {
  constructor(state, app) {
    this.state = state;
    this.app = app;
    this.isLoading = false;
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
      { label: "Текущий пароль", placeholder: "Введите текущий пароль", field: "old_password" },
      { label: "Новый пароль", placeholder: "Введите новый пароль", field: "new_password" },
      { label: "Подтвердите пароль", placeholder: "Повторите новый пароль", field: "confirm_password" }
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
      input.dataset.field = field.field;

      // Добавляем обработчики валидации
      input.addEventListener('blur', () => {
        this.validatePasswordField(input);
      });

      input.addEventListener('input', () => {
        clearFieldError(input);
        // Если меняем подтверждение пароля, валидируем соответствие
        if (field.field === 'confirm_password') {
          const newPasswordInput = document.querySelector('[data-field="new_password"]');
          if (newPasswordInput && newPasswordInput.value) {
            this.validatePasswordField(input);
          }
        }
      });

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

    // Создаем элемент для иконки
    const eyeIconImg = document.createElement("img");
    eyeIconImg.src = '../../images/view.png';
    eyeIconImg.alt = "Показать пароль";
    eyeIconImg.className = "profile__password-toggle-icon";
    eyeIcon.appendChild(eyeIconImg);

    eyeIcon.addEventListener("click", () => {
      if (input.type === "password") {
        input.type = "text";
        eyeIcon.classList.add("profile__password-toggle--visible");
        eyeIcon.setAttribute("aria-label", "Скрыть пароль");
        eyeIconImg.src = '../../images/active__view.png';
      } else {
        input.type = "password";
        eyeIcon.classList.remove("profile__password-toggle--visible");
        eyeIcon.setAttribute("aria-label", "Показать пароль");
        eyeIconImg.src = '../../images/view.png';
      }
    });

    return eyeIcon;
  }

  validatePasswordField(input) {
    const fieldName = input.dataset.field;
    const value = input.value;

    let errors = [];

    switch (fieldName) {
      case 'old_password':
        if (!value) {
          errors.push("Текущий пароль обязателен");
        }
        break;
      case 'new_password':
        const passwordErrors = validPassword(value);
        errors = passwordErrors;
        break;
      case 'confirm_password':
        const newPasswordInput = document.querySelector('[data-field="new_password"]');
        if (!value) {
          errors.push("Подтверждение пароля обязательно");
        } else if (newPasswordInput && value !== newPasswordInput.value) {
          errors.push("Пароли не совпадают");
        }
        break;
    }

    showFieldErrors(input, errors);
    return errors.length === 0;
  }

  createUpdateButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "profile__save-button";
    button.textContent = "Обновить пароль";

    button.addEventListener("click", async () => {
      await this.handlePasswordChange();
    });

    return button;
  }

  async handlePasswordChange() {
    try {
      // Валидируем все поля перед отправкой
      const inputs = document.querySelectorAll('.profile__field-input[data-field]');
      let allValid = true;

      inputs.forEach(input => {
        const isValid = this.validatePasswordField(input);
        if (!isValid) {
          allValid = false;
        }
      });

      if (!allValid) {
        throw new Error("Пожалуйста, исправьте ошибки в форме");
      }

      this.showLoading(true);

      const passwordData = {};
      inputs.forEach(input => {
        passwordData[input.dataset.field] = input.value;
      });

      const backendPasswordData = {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      };

      const validation = ProfileService.validatePassword(passwordData);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).flat();
        throw new Error(errorMessages.join(', '));
      }

      await ProfileService.changePassword(backendPasswordData);

      this.showLoading(false);

      Modal.show({
        title: 'Успех',
        message: 'Пароль успешно изменен!',
        type: 'info',
        onConfirm: () => {
          inputs.forEach(input => {
            input.value = '';
            clearFieldError(input);
          });
        }
      });

    } catch (error) {
      this.showLoading(false);
      console.error('Error changing password:', error);
      Modal.show({
        title: 'Ошибка',
        message: error.message || 'Не удалось изменить пароль',
        type: 'error'
      });
    }
  }

  showLoading(show) {
    this.isLoading = show;
    const updateButton = document.querySelector('.profile__save-button');
    if (updateButton) {
      updateButton.disabled = show;
      updateButton.textContent = show ? 'Обновление...' : 'Обновить пароль';
    }
  }

  cleanup() {
  }
}