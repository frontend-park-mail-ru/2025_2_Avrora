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
    private contentElement: HTMLElement | null;

    constructor(controller: any, parentWidget?: any) {
        this.controller = controller;
        this.parentWidget = parentWidget;
        this.currentAvatarUrl = null;
        this.isLoading = false;
        this.profileData = null;
        this.originalEmail = '';
        this.contentElement = null;

        this.initializeCurrentAvatar();
    }

    private initializeCurrentAvatar(): void {
        if (this.controller.user) {
            const user = this.controller.user;
            let avatarUrl = user.AvatarURL ||
                           user.avatar ||
                           user.photo_url ||
                           user.avatarUrl ||
                           null;
            
            if (avatarUrl) {
                this.currentAvatarUrl = MediaService.getAvatarUrl(avatarUrl);
            }
        }
    }

    async render(): Promise<HTMLElement> {
        if (this.contentElement) {
            this.cleanup();
        }
        
        const content = document.createElement("div");
        content.className = "profile__content";
        this.contentElement = content;

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

            if (this.currentAvatarUrl) {
                this.profileData.photo_url = this.currentAvatarUrl;
            } else if (this.profileData.photo_url) {
                this.currentAvatarUrl = MediaService.getAvatarUrl(this.profileData.photo_url);
            } else {
                this.currentAvatarUrl = MediaService.getAvatarUrl("default_avatar.jpg");
                this.profileData.photo_url = this.currentAvatarUrl;
            }

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

    async updateData(): Promise<void> {
        if (!this.contentElement) {
            return;
        }

        const oldAvatarUrl = this.currentAvatarUrl;

        try {
            this.profileData = await ProfileService.getProfile();
            this.originalEmail = this.profileData.email;

            if (oldAvatarUrl && !oldAvatarUrl.includes('default_avatar.jpg')) {
                this.currentAvatarUrl = oldAvatarUrl;
                this.profileData.photo_url = oldAvatarUrl;
            } else if (this.profileData.photo_url) {
                this.currentAvatarUrl = MediaService.getAvatarUrl(this.profileData.photo_url);
            } else {
                this.currentAvatarUrl = MediaService.getAvatarUrl("default_avatar.jpg");
                this.profileData.photo_url = this.currentAvatarUrl;
            }

            this.contentElement.innerHTML = '';

            const block = document.createElement("div");
            block.className = "profile__block";

            const userSection = await this.createUserSection();
            const dataSection = this.createDataSection();

            block.appendChild(userSection);
            block.appendChild(dataSection);

            this.contentElement.appendChild(block);

        } catch (error) {
            const errorSection = this.createErrorSection((error as Error).message);
            this.contentElement.appendChild(errorSection);
        }
    }

    private async createUserSection(): Promise<HTMLElement> {
        const userSection = document.createElement("div");
        userSection.className = "profile__user-section";

        const avatar = document.createElement("img");
        avatar.className = "profile__avatar";

        let avatarUrl = this.currentAvatarUrl ||
                       MediaService.getAvatarUrl("default_avatar.jpg");

        if (this.profileData?.photo_url) {
            avatarUrl = MediaService.getAvatarUrl(this.profileData.photo_url);
        }

        avatar.src = avatarUrl;
        avatar.alt = "Аватар";
        avatar.id = "profile-avatar";
        avatar.onerror = () => {
            avatar.src = MediaService.getAvatarUrl("default_avatar.jpg");
        };

        const name = document.createElement("span");
        name.className = "profile__user-name";

        let fullName = "Пользователь";
        const user = this.controller.user;

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

                    const uploadResult = await MediaService.uploadImage(file);
                    const avatarUrl = uploadResult.url;

                    this.updateCurrentAvatar(avatarUrl);

                    this.currentAvatarUrl = avatarUrl;

                    if (this.controller.user) {
                        const updatedUser = {
                            ...this.controller.user,
                            avatar: avatarUrl,
                            photo_url: avatarUrl,
                            AvatarURL: avatarUrl
                        };
                        this.controller.updateUser(updatedUser);
                    }

                    if (this.controller.view && this.controller.view.header) {
                        await this.controller.view.header.render();
                    }

                    if (this.parentWidget && typeof this.parentWidget.updateSidebar === 'function') {
                        await this.parentWidget.updateSidebar();
                    }

                    this.showLoading(false);

                    Modal.show({
                        title: 'Успех',
                        message: 'Аватар успешно загружен! Нажмите "Сохранить изменения", чтобы сохранить его в профиле.',
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
            { label: "Телефон", key: "phone", placeholder: "+7 (___) ___-__-__", type: "tel" },
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

            if (key === 'phone') {
                this.applyPhoneMask(input);
            }

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
                        input.value = this.formatPhoneValue(this.profileData.phone || "");
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
                        input.value = this.formatPhoneValue(userData.phone || "");
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

    private applyPhoneMask(input: HTMLInputElement): void {
        input.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            let value = target.value.replace(/\D/g, '');

            if (value.startsWith('7') || value.startsWith('8')) {
                value = value.substring(1);
            }

            value = value.substring(0, 10);

            let formattedValue = '+7 (';

            if (value.length > 0) {
                formattedValue += value.substring(0, 3);
            }

            if (value.length >= 3) {
                formattedValue += ') ';
            }

            if (value.length > 3) {
                formattedValue += value.substring(3, 6);
            }

            if (value.length >= 6) {
                formattedValue += '-';
            }

            if (value.length > 6) {
                formattedValue += value.substring(6, 8);
            }

            if (value.length >= 8) {
                formattedValue += '-';
            }

            if (value.length > 8) {
                formattedValue += value.substring(8, 10);
            }

            target.value = formattedValue;
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                const target = e.target as HTMLInputElement;
                const value = target.value;

                if (value.length === 7 || value.length === 11 || value.length === 14) {
                    e.preventDefault();
                    target.value = value.slice(0, -1);
                }
            }
        });

        input.addEventListener('focus', () => {
            if (!input.value) {
                input.value = '+7 (';
            }
        });
    }

    private formatPhoneValue(phone: string): string {
        if (!phone) return '';

        let digits = phone.replace(/\D/g, '');

        if (digits.startsWith('7') || digits.startsWith('8')) {
            digits = digits.substring(1);
        }

        digits = digits.substring(0, 10);

        let formatted = '+7 (';

        if (digits.length > 0) {
            formatted += digits.substring(0, 3);
        }

        if (digits.length >= 3) {
            formatted += ') ';
        }

        if (digits.length > 3) {
            formatted += digits.substring(3, 6);
        }

        if (digits.length >= 6) {
            formatted += '-';
        }

        if (digits.length > 6) {
            formatted += digits.substring(6, 8);
        }

        if (digits.length >= 8) {
            formatted += '-';
        }

        if (digits.length > 8) {
            formatted += digits.substring(8, 10);
        }

        return formatted;
    }

    private validateField(input: HTMLInputElement): boolean {
        const fieldName = input.dataset.field;
        let value = input.value.trim();

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
                const phoneValue = value.replace(/\D/g, '');
                if (phoneValue.startsWith('7') || phoneValue.startsWith('8')) {
                    value = phoneValue.substring(1);
                }
                const phoneErrors = validPhone(phoneValue);
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

            const phoneInput = document.querySelector('input[data-field="phone"]') as HTMLInputElement;
            let phoneValue = phoneInput?.value.trim() || "";
            phoneValue = phoneValue.replace(/\D/g, '');
            if (phoneValue.startsWith('7') || phoneValue.startsWith('8')) {
                phoneValue = phoneValue.substring(1);
            }

            const profileData = {
                first_name: (inputs[0] as HTMLInputElement)?.value.trim() || "",
                last_name: (inputs[1] as HTMLInputElement)?.value.trim() || "",
                phone: phoneValue,
                email: (inputs[3] as HTMLInputElement)?.value.trim() || "",
                photo_url: this.currentAvatarUrl || this.profileData?.photo_url || this.controller.user?.avatar
            };

            if (profileData.photo_url && profileData.photo_url.includes('/images/')) {
                const urlParts = profileData.photo_url.split('/images/');
                profileData.photo_url = urlParts.length > 1 ? urlParts[1] : profileData.photo_url;
            }

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
                avatar: this.currentAvatarUrl || profileData.photo_url,
                photo_url: this.currentAvatarUrl || profileData.photo_url,
                AvatarURL: this.currentAvatarUrl || profileData.photo_url
            };

            this.controller.updateUser(updatedUser);

            this.profileData = await ProfileService.getProfile();

            if (this.profileData.photo_url) {
                this.currentAvatarUrl = MediaService.getAvatarUrl(this.profileData.photo_url);
            }

            this.showLoading(false);

            this.updateCurrentAvatar(this.currentAvatarUrl || profileData.photo_url);

            await this.controller.refreshProfileAndUI();

            if (this.parentWidget && typeof this.parentWidget.updateSidebar === 'function') {
                await this.parentWidget.updateSidebar();
            }

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

    private updateCurrentAvatar(avatarUrl: string): void {
        this.currentAvatarUrl = MediaService.getAvatarUrl(avatarUrl);

        const avatarImg = document.getElementById("profile-avatar") as HTMLImageElement;
        if (avatarImg && avatarUrl) {
            avatarImg.src = this.currentAvatarUrl;
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
        retryButton.addEventListener("click", async () => {
            await this.updateData();
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
        const inputs = document.querySelectorAll('.profile__field-input');
        inputs.forEach(input => {
            input.removeEventListener('blur', () => {});
            input.removeEventListener('input', () => {});
        });
        
        const fileInput = document.getElementById('avatar-upload-input');
        if (fileInput) {
            fileInput.removeEventListener('change', () => {});
        }

        if (this.contentElement) {
            this.contentElement.innerHTML = '';
            this.contentElement = null;
        }
    }
}