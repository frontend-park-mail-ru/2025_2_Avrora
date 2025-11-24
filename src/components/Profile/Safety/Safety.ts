// Safety.ts
import { ProfileService } from '../../../utils/ProfileService.ts';
import { Modal } from '../../OfferCreate/Modal/Modal.ts';
import { showFieldErrors, clearFieldError, validPassword } from '../../../utils/Validator.ts';
import { MediaService } from '../../../utils/MediaService.ts';

interface ModalConfig {
    title: string;
    message: string;
    type?: string;
    onConfirm?: () => void;
}

export class Safety {
    private controller: any;
    private isLoading: boolean;

    constructor(controller: any) {
        this.controller = controller;
        this.isLoading = false;
    }

    render(): HTMLElement {
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

    private createPasswordFields(): HTMLElement[] {
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

            input.addEventListener('blur', () => {
                this.validatePasswordField(input);
            });

            input.addEventListener('input', () => {
                clearFieldError(input);
                if (field.field === 'confirm_password') {
                    const newPasswordInput = document.querySelector('[data-field="new_password"]') as HTMLInputElement;
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

    private createEyeIcon(input: HTMLInputElement): HTMLButtonElement {
        const eyeIcon = document.createElement("button");
        eyeIcon.type = "button";
        eyeIcon.className = "profile__password-toggle";
        eyeIcon.setAttribute("aria-label", "Показать пароль");

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

    private validatePasswordField(input: HTMLInputElement): boolean {
        const fieldName = input.dataset.field;
        const value = input.value;

        let errors: string[] = [];

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
                const newPasswordInput = document.querySelector('[data-field="new_password"]') as HTMLInputElement;
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

    private createUpdateButton(): HTMLButtonElement {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "profile__save-button";
        button.textContent = "Обновить пароль";

        button.addEventListener("click", async () => {
            await this.handlePasswordChange();
        });

        return button;
    }

    private async handlePasswordChange(): Promise<void> {
        try {
            const inputs = document.querySelectorAll('.profile__field-input[data-field]');
            let allValid = true;

            inputs.forEach(input => {
                const isValid = this.validatePasswordField(input as HTMLInputElement);
                if (!isValid) {
                    allValid = false;
                }
            });

            if (!allValid) {
                throw new Error("Пожалуйста, исправьте ошибки в форме");
            }

            this.showLoading(true);

            const passwordData: { [key: string]: string } = {};
            inputs.forEach(input => {
                passwordData[(input as HTMLInputElement).dataset.field!] = (input as HTMLInputElement).value;
            });

            const backendPasswordData = {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            };

            const validation = ProfileService.validatePassword(passwordData as any);
            if (!validation.isValid) {
                const errorMessages = Object.values(validation.errors).flat();
                throw new Error(errorMessages.join(', '));
            }

            await ProfileService.changePassword(backendPasswordData);

            this.showLoading(false);

            // Очищаем поля после успешного обновления
            inputs.forEach(input => {
                (input as HTMLInputElement).value = '';
                clearFieldError(input as HTMLInputElement);
            });

            Modal.show({
                title: 'Успех',
                message: 'Пароль успешно изменен!',
                type: 'info'
            });

        } catch (error) {
            this.showLoading(false);
            console.error('Error changing password:', error);
            Modal.show({
                title: 'Ошибка',
                message: (error as Error).message || 'Не удалось изменить пароль',
                type: 'error'
            });
        }
    }

    private showLoading(show: boolean): void {
        this.isLoading = show;
        const updateButton = document.querySelector('.profile__save-button') as HTMLButtonElement;
        if (updateButton) {
            updateButton.disabled = show;
            updateButton.textContent = show ? 'Обновление...' : 'Обновить пароль';
        }
    }

    cleanup(): void {

    }
}