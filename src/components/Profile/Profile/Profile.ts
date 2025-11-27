import { ProfileService } from '../../../utils/ProfileService.ts';
import { MediaService } from '../../../utils/MediaService.ts';
import { Modal } from '../../OfferCreate/Modal/Modal.ts';
import { showFieldErrors, clearFieldError, validName, validEmail, validPhone, validImageFile } from '../../../utils/Validator.ts';

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

interface ProfileData {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    photo_url: string;
    role: string;
}

interface ModalConfig {
    title: string;
    message: string;
    type?: string;
    onConfirm?: () => void;
}

export class Profile {
    private controller: any;
    private currentAvatarUrl: string | null;
    private isLoading: boolean;
    private profileData: ProfileData | null;
    private originalEmail: string;
    private parentWidget: any;

    constructor(controller: any, parentWidget?: any) {
        this.controller = controller;
        this.parentWidget = parentWidget;
        this.currentAvatarUrl = null;
        this.isLoading = false;
        this.profileData = null;
        this.originalEmail = '';
    }

    async render(): Promise<HTMLElement> {
        const content = document.createElement("div");
        content.className = "profile__content";

        const block = document.createElement("div");
        block.className = "profile__block";

        if (this.isLoading) {
            block.appendChild(this.createLoading());
            content.appendChild(block);
            return content;
        }

        try {
            this.profileData = await ProfileService.getProfile();
            this.originalEmail = this.profileData.email;

            const userSection = await this.createUserSection();
            const dataSection = this.createDataSection();

            block.appendChild(userSection);
            block.appendChild(dataSection);
        } catch (error) {
            block.appendChild(this.createErrorSection((error as Error).message));
        }

        content.appendChild(block);
        return content;
    }

    private async createUserSection(): Promise<HTMLElement> {
        const userSection = document.createElement("div");
        userSection.className = "profile__user-section";

        try {
            const avatar = document.createElement("img");
            avatar.className = "profile__avatar";

            const user = this.controller.user;
            let avatarUrl = "../../../images/user.png";

            if (user) {
                avatarUrl = user.AvatarURL ||
                           user.avatar ||
                           user.photo_url ||
                           user.avatarUrl ||
                           "../../../images/user.png";
            }

            avatar.src = avatarUrl.startsWith('http') ? avatarUrl : MediaService.getImageUrl(avatarUrl);
            avatar.alt = "Аватар";
            avatar.id = "profile-avatar";
            avatar.onerror = () => {
                avatar.src = "../../../images/user.png";
            };

            const name = document.createElement("span");
            name.className = "profile__user-name";

            let fullName = "Пользователь";
            if (user) {
                if (user.FirstName && user.LastName) {
                    fullName = `${user.FirstName} ${user.LastName}`;
                } else if (user.firstName && user.lastName) {
                    fullName = `${user.firstName} ${user.lastName}`;
                } else if (user.first_name && user.last_name) {
                    fullName = `${user.first_name} ${user.last_name}`;
                } else if (user.name) {
                    fullName = user.name;
                } else if (user.email) {
                    fullName = user.email.split('@')[0];
                }
            }

            name.textContent = fullName;

            userSection.appendChild(avatar);
            userSection.appendChild(name);

            this.currentAvatarUrl = avatarUrl;

        } catch (error) {
            const avatar = document.createElement("img");
            avatar.className = "profile__avatar";
            const user = this.controller.user;
            let avatarUrl = "../../../images/user.png";

            if (user) {
                avatarUrl = user.AvatarURL || user.avatar || "../../../images/user.png";
            }

            avatar.src = avatarUrl.startsWith('http') ? avatarUrl : MediaService.getImageUrl(avatarUrl);
            avatar.alt = "Аватар";
            avatar.id = "profile-avatar";
            avatar.onerror = () => {
                avatar.src = "../../../images/user.png";
            };

            const name = document.createElement("span");
            name.className = "profile__user-name";
            let fullName = "Пользователь";
            if (user) {
                if (user.FirstName && user.LastName) {
                    fullName = `${user.FirstName} ${user.LastName}`;
                } else if (user.firstName && user.lastName) {
                    fullName = `${user.firstName} ${user.lastName}`;
                } else if (user.name) {
                    fullName = user.name;
                }
            }
            name.textContent = fullName;

            userSection.appendChild(avatar);
            userSection.appendChild(name);
        }

        return userSection;
    }

    private createDataSection(): HTMLElement {
        const dataSection = document.createElement("div");
        dataSection.className = "profile__data-section";

        const fileInput = this.createFileInput();
        const imageBtn = this.createImageButton(fileInput);

        dataSection.appendChild(imageBtn);
        dataSection.appendChild(fileInput);

        const fields = this.createInputFields();
        fields.forEach(field => dataSection.appendChild(field));

        const saveBtn = this.createSaveButton();
        dataSection.appendChild(saveBtn);

        return dataSection;
    }

    private createFileInput(): HTMLInputElement {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.style.display = "none";
        fileInput.id = "avatar-upload-input";

        fileInput.addEventListener("change", async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                try {
                    this.showLoading(true);

                    const fileErrors = validImageFile(file);
                    if (fileErrors.length > 0) {
                        throw new Error(fileErrors.join(', '));
                    }

                    const avatarUrl = await ProfileService.uploadAvatar(file);

                    const img = document.getElementById("profile-avatar") as HTMLImageElement;
                    if (img) {
                        img.src = avatarUrl;
                        this.currentAvatarUrl = avatarUrl;
                    }

                    if (this.controller.user) {
                        this.controller.updateUser({
                            ...this.controller.user,
                            avatar: avatarUrl,
                            photo_url: avatarUrl
                        });
                    }

                    if (this.parentWidget && typeof this.parentWidget.updateSidebar === 'function') {
                        this.parentWidget.updateSidebar();
                    }

                    this.showLoading(false);
                    Modal.show({
                        title: 'Успех',
                        message: 'Аватар успешно загружен',
                        type: 'info'
                    });

                } catch (error) {
                    this.showLoading(false);
                    Modal.show({
                        title: 'Ошибка',
                        message: (error as Error).message || 'Не удалось загрузить аватар',
                        type: 'error'
                    });
                }
            }
        });

        return fileInput;
    }

    private createImageButton(fileInput: HTMLInputElement): HTMLButtonElement {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "profile__image-button";
        button.textContent = "Добавить фото";

        button.addEventListener("click", () => {
            fileInput.click();
        });

        return button;
    }

    private createInputFields(): HTMLElement[] {
        const fields = [
            { label: "Имя", key: "first_name", placeholder: "Введите имя", type: "text" },
            { label: "Фамилия", key: "last_name", placeholder: "Введите фамилию", type: "text" },
            { label: "Телефон", key: "phone", placeholder: "Введите телефон", type: "tel" },
            { label: "Email", key: "email", placeholder: "Введите email", type: "email" }
        ];

        return fields.map(({ label, key, placeholder, type }) => {
            const fieldContainer = document.createElement("div");
            fieldContainer.className = "profile__field";

            const labelElement = document.createElement("span");
            labelElement.className = "profile__field-label";
            labelElement.textContent = label;

            const input = document.createElement("input");
            input.className = "profile__field-input";
            input.type = type;
            input.placeholder = placeholder;
            input.dataset.field = key;

            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                clearFieldError(input);
            });

            if (this.profileData) {
                switch (key) {
                    case 'first_name':
                        input.value = this.profileData.first_name || "";
                        break;
                    case 'last_name':
                        input.value = this.profileData.last_name || "";
                        break;
                    case 'phone':
                        input.value = this.profileData.phone || "";
                        break;
                    case 'email':
                        input.value = this.profileData.email || "";
                        break;
                }
            } else {
                const userData = this.controller.user || {};
                switch (key) {
                    case 'first_name':
                        input.value = userData.firstName || "";
                        break;
                    case 'last_name':
                        input.value = userData.lastName || "";
                        break;
                    case 'phone':
                        input.value = userData.phone || "";
                        break;
                    case 'email':
                        input.value = userData.email || "";
                        break;
                }
            }

            fieldContainer.appendChild(labelElement);
            fieldContainer.appendChild(input);

            return fieldContainer;
        });
    }

    private validateField(input: HTMLInputElement): boolean {
        const fieldName = input.dataset.field;
        const value = input.value.trim();

        let errors: string[] = [];

        switch (fieldName) {
            case 'first_name':
            case 'last_name':
                const nameErrors = validName(value);
                errors = nameErrors;
                break;
            case 'email':
                if (!value) {
                    errors.push("Email обязателен");
                } else if (!validEmail(value)) {
                    errors.push("Некорректный формат email");
                }
                break;
            case 'phone':
                const phoneErrors = validPhone(value);
                errors = phoneErrors;
                break;
        }

        showFieldErrors(input, errors);
        return errors.length === 0;
    }

    private createSaveButton(): HTMLButtonElement {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "profile__save-button";
        button.textContent = "Сохранить изменения";

        button.addEventListener("click", async () => {
            await this.handleSave();
        });

        return button;
    }

    private async handleSave(): Promise<void> {
        try {
            const inputs = document.querySelectorAll('.profile__field-input');
            let allValid = true;

            inputs.forEach(input => {
                const isValid = this.validateField(input as HTMLInputElement);
                if (!isValid) {
                    allValid = false;
                }
            });

            if (!allValid) {
                throw new Error("Пожалуйста, исправьте ошибки в форме");
            }

            this.showLoading(true);

            const profileData = {
                first_name: (inputs[0] as HTMLInputElement)?.value.trim() || "",
                last_name: (inputs[1] as HTMLInputElement)?.value.trim() || "",
                phone: (inputs[2] as HTMLInputElement)?.value.trim() || "",
                email: (inputs[3] as HTMLInputElement)?.value.trim() || "",
                avatar_url: this.currentAvatarUrl || this.profileData?.photo_url || this.controller.user?.avatar
            };

            const validation = ProfileService.validateProfile(profileData);
            if (!validation.isValid) {
                const errorMessages = Object.values(validation.errors).flat();
                throw new Error(errorMessages.join(', '));
            }

            await ProfileService.updateProfile(profileData);

            if (profileData.email !== this.originalEmail) {
                await ProfileService.updateEmail({ email: profileData.email });
                this.originalEmail = profileData.email;
            }

            const updatedUser = {
                ...this.controller.user,
                id: this.controller.user?.id || ProfileService.getCurrentUserId(),
                firstName: profileData.first_name,
                lastName: profileData.last_name,
                email: profileData.email,
                phone: profileData.phone,
                name: `${profileData.first_name} ${profileData.last_name}`,
                avatar: profileData.avatar_url,
                photo_url: profileData.avatar_url
            };

            this.controller.updateUser(updatedUser);

            this.profileData = {
                ...this.profileData,
                ...profileData
            } as ProfileData;

            this.controller.updateUI();

            if (this.parentWidget && typeof this.parentWidget.updateSidebar === 'function') {
                this.parentWidget.updateSidebar();
            }

            this.showLoading(false);

            Modal.show({
                title: 'Успех',
                message: 'Профиль успешно сохранен!',
                type: 'info'
            });

        } catch (error) {
            this.showLoading(false);

            let errorMessage = (error as Error).message || 'Не удалось сохранить профиль';

            Modal.show({
                title: 'Ошибка',
                message: errorMessage,
                type: 'error'
            });
        }
    }

    private createLoading(): HTMLElement {
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "profile__loading";
        loadingDiv.textContent = "Загрузка...";
        return loadingDiv;
    }

    private createErrorSection(message: string): HTMLElement {
        const errorDiv = document.createElement("div");
        errorDiv.className = "profile__error";

        const errorText = document.createElement("p");
        errorText.textContent = message || "Произошла ошибка при загрузке профиля";
        errorDiv.appendChild(errorText);

        const retryButton = document.createElement("button");
        retryButton.className = "profile__retry-button";
        retryButton.textContent = "Попробовать снова";
        retryButton.addEventListener("click", () => {
            this.render().then(newContent => {
                const currentContent = document.querySelector('.profile__content');
                if (currentContent && currentContent.parentNode) {
                    currentContent.parentNode.replaceChild(newContent, currentContent);
                }
            });
        });
        errorDiv.appendChild(retryButton);

        return errorDiv;
    }

    private showLoading(show: boolean): void {
        this.isLoading = show;
        const saveButton = document.querySelector('.profile__save-button') as HTMLButtonElement;
        if (saveButton) {
            saveButton.disabled = show;
            saveButton.textContent = show ? 'Сохранение...' : 'Сохранить изменения';
        }
    }

    cleanup(): void {

    }
}