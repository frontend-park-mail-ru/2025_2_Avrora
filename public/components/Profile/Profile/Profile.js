import { ProfileService } from '../../../utils/ProfileService.js';
import { Modal } from '../../OfferCreate/Modal/Modal.js';

export class Profile {
    constructor(state, app) {
        this.state = state;
        this.app = app;
        this.currentAvatarUrl = null;
        this.isLoading = false;
    }

    async render() {
        const content = document.createElement("div");
        content.className = "profile__content";

        const block = document.createElement("div");
        block.className = "profile__block";

        if (this.isLoading) {
            block.appendChild(this.createLoading());
            content.appendChild(block);
            return content;
        }

        const userSection = await this.createUserSection();
        const dataSection = this.createDataSection();

        block.appendChild(userSection);
        block.appendChild(dataSection);
        content.appendChild(block);

        return content;
    }

    async createUserSection() {
        const userSection = document.createElement("div");
        userSection.className = "profile__user-section";

        try {
            const profileData = await ProfileService.getProfile();

            const avatar = document.createElement("img");
            avatar.className = "profile__avatar";
            avatar.src = profileData.photo_url || "../../../images/user.png";
            avatar.alt = "Аватар";
            avatar.id = "profile-avatar";

            const name = document.createElement("span");
            name.className = "profile__user-name";
            const fullName = `${profileData.first_name} ${profileData.last_name}`;
            name.textContent = fullName;

            userSection.appendChild(avatar);
            userSection.appendChild(name);

            this.currentAvatarUrl = profileData.photo_url;

        } catch (error) {
            console.error('Error loading profile:', error);
            const avatar = document.createElement("img");
            avatar.className = "profile__avatar";
            avatar.src = this.state.user?.avatar || "../../../images/user.png";
            avatar.alt = "Аватар";
            avatar.id = "profile-avatar";

            const name = document.createElement("span");
            name.className = "profile__user-name";
            const fullName = this.state.user?.name || "Иван Иванов";
            name.textContent = fullName;

            userSection.appendChild(avatar);
            userSection.appendChild(name);
        }

        return userSection;
    }

    createDataSection() {
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

    createFileInput() {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.style.display = "none";
        fileInput.id = "avatar-upload-input";

        fileInput.addEventListener("change", async (e) => {
            const file = e.target.files?.[0];
            if (file) {
                try {
                    this.showLoading(true);

                    const { MediaService } = await import('../../../utils/MediaService.js');
                    MediaService.validateImage(file);

                    const avatarUrl = await ProfileService.uploadAvatar(file);

                    const img = document.getElementById("profile-avatar");
                    if (img) {
                        img.src = avatarUrl;
                        this.currentAvatarUrl = avatarUrl;
                    }

                    this.showLoading(false);
                    Modal.show({
                        title: 'Успех',
                        message: 'Аватар успешно загружен',
                        type: 'info'
                    });

                } catch (error) {
                    this.showLoading(false);
                    console.error('Error uploading avatar:', error);
                    Modal.show({
                        title: 'Ошибка',
                        message: error.message || 'Не удалось загрузить аватар',
                        type: 'error'
                    });
                }
            }
        });

        return fileInput;
    }

    createImageButton(fileInput) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "profile__image-button";
        button.textContent = "Добавить фото";

        button.addEventListener("click", () => {
            fileInput.click();
        });

        return button;
    }

    createInputFields() {
        const fields = [
            { label: "Имя", key: "first_name", placeholder: "Введите имя" },
            { label: "Фамилия", key: "last_name", placeholder: "Введите фамилию" },
            { label: "Телефон", key: "phone", placeholder: "Введите телефон" },
            { label: "Email", key: "email", placeholder: "Введите email" }
        ];

        return fields.map(({ label, key, placeholder }) => {
            const fieldContainer = document.createElement("div");
            fieldContainer.className = "profile__field";

            const labelElement = document.createElement("span");
            labelElement.className = "profile__field-label";
            labelElement.textContent = label;

            const input = document.createElement("input");
            input.className = "profile__field-input";
            input.type = "text";
            input.placeholder = placeholder;
            input.dataset.field = key;

            const userData = this.state.user || {};
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

            fieldContainer.appendChild(labelElement);
            fieldContainer.appendChild(input);

            return fieldContainer;
        });
    }

    createSaveButton() {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "profile__save-button";
        button.textContent = "Сохранить изменения";

        button.addEventListener("click", async () => {
            await this.handleSave();
        });

        return button;
    }

    async handleSave() {
        try {
            this.showLoading(true);

            const inputs = document.querySelectorAll('.profile__field-input');
            const profileData = {
                first_name: inputs[0]?.value.trim() || "",
                last_name: inputs[1]?.value.trim() || "",
                phone: inputs[2]?.value.trim() || "",
                email: inputs[3]?.value.trim() || "",
                photo_url: this.currentAvatarUrl || this.state.user?.avatar
            };

            const validation = ProfileService.validateProfile(profileData);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            const result = await ProfileService.updateProfile(profileData);

            const updatedUser = {
                ...this.state.user,
                id: this.state.user?.id || 1,
                firstName: profileData.first_name,
                lastName: profileData.last_name,
                email: profileData.email,
                phone: profileData.phone,
                name: `${profileData.first_name} ${profileData.last_name}`,
                avatar: profileData.photo_url
            };

            this.state.user = updatedUser;
            localStorage.setItem("userData", JSON.stringify(updatedUser));

            this.showLoading(false);

            Modal.show({
                title: 'Успех',
                message: result.message || 'Профиль успешно сохранен!',
                type: 'info',
                onConfirm: () => {
                    this.app.header?.render();
                    if (this.app.currentPage && typeof this.app.currentPage.render === 'function') {
                        this.app.currentPage.render();
                    }
                }
            });

        } catch (error) {
            this.showLoading(false);
            console.error('Error saving profile:', error);
            Modal.show({
                title: 'Ошибка',
                message: error.message || 'Не удалось сохранить профиль',
                type: 'error'
            });
        }
    }

    createLoading() {
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "profile__loading";
        loadingDiv.textContent = "Загрузка...";
        return loadingDiv;
    }

    showLoading(show) {
        this.isLoading = show;
        const saveButton = document.querySelector('.profile__save-button');
        if (saveButton) {
            saveButton.disabled = show;
            saveButton.textContent = show ? 'Сохранение...' : 'Сохранить изменения';
        }
    }
}