// Profile.js - с добавленной валидацией
import { ProfileService } from '../../../utils/ProfileService.js';
import { MediaService } from '../../../utils/MediaService.js';
import { Modal } from '../../OfferCreate/Modal/Modal.js';
import { validEmail, validName, validPhone } from '../../../utils/auth.js';

export class Profile {
    constructor(state, app) {
        this.state = state;
        this.app = app;
        this.currentAvatarUrl = null;
        this.isLoading = false;
        this.profileData = null;
        this.originalEmail = '';
        this.inputs = {};
        this.eventListeners = [];
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

        try {
            // Загружаем данные профиля
            this.profileData = await ProfileService.getProfile();
            this.originalEmail = this.profileData.email;

            const userSection = await this.createUserSection();
            const dataSection = this.createDataSection();

            block.appendChild(userSection);
            block.appendChild(dataSection);
        } catch (error) {
            console.error('Error rendering profile:', error);
            block.appendChild(this.createErrorSection(error.message));
        }

        content.appendChild(block);
        return content;
    }

    async createUserSection() {
        const userSection = document.createElement("div");
        userSection.className = "profile__user-section";

        try {
            const avatar = document.createElement("img");
            avatar.className = "profile__avatar";

            // Используем актуальные данные пользователя - В ПЕРВУЮ ОЧЕРЕДЬ AvatarURL
            const user = this.app.state.user;
            let avatarUrl = "../../../images/user.png";

            if (user) {
                avatarUrl = user.AvatarURL ||
                           user.avatar ||
                           user.photo_url ||
                           user.avatarUrl ||
                           "../../../images/user.png";
            }

            console.log('Profile user data:', user);
            console.log('Profile avatar URL:', avatarUrl);

            // Используем MediaService для получения правильного URL аватара
            avatar.src = avatarUrl.startsWith('http') ? avatarUrl : MediaService.getImageUrl(avatarUrl);
            avatar.alt = "Аватар";
            avatar.id = "profile-avatar";
            avatar.onerror = () => {
                console.log('Profile avatar failed to load, using fallback');
                avatar.src = "../../../images/user.png";
            };

            const name = document.createElement("span");
            name.className = "profile__user-name";

            let fullName = "Пользователь";
            if (user) {
                // Используем поля с заглавной буквы в первую очередь
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
            console.error('Error creating user section:', error);
            // Fallback на данные из state
            const avatar = document.createElement("img");
            avatar.className = "profile__avatar";
            const user = this.state.user;
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

                    // Валидация файла
                    if (file.size > 10 * 1024 * 1024) {
                        throw new Error("Размер файла не должен превышать 10MB");
                    }

                    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                    if (!validTypes.includes(file.type)) {
                        throw new Error("Недопустимый формат изображения");
                    }

                    const avatarUrl = await ProfileService.uploadAvatar(file);

                    // Обновляем аватар в UI
                    const img = document.getElementById("profile-avatar");
                    if (img) {
                        img.src = avatarUrl;
                        this.currentAvatarUrl = avatarUrl;
                    }

                    // Обновляем состояние пользователя
                    if (this.state.user) {
                        this.state.user.avatar = avatarUrl;
                        this.state.user.photo_url = avatarUrl;
                        localStorage.setItem("userData", JSON.stringify(this.state.user));
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
            { label: "Имя", key: "first_name", placeholder: "Введите имя", type: "text", validator: validName },
            { label: "Фамилия", key: "last_name", placeholder: "Введите фамилию", type: "text", validator: validName },
            { label: "Телефон", key: "phone", placeholder: "Введите телефон", type: "text", validator: validPhone },
            { label: "Email", key: "email", placeholder: "Введите email", type: "email", validator: validEmail }
        ];

        return fields.map(({ label, key, placeholder, type, validator }) => {
            const fieldContainer = document.createElement("div");
            fieldContainer.className = "profile__field";

            const labelElement = document.createElement("span");
            labelElement.className = "profile__field-label";
            labelElement.textContent = label;

            const inputContainer = document.createElement("div");
            inputContainer.className = "profile__input-container";

            const input = document.createElement("input");
            input.className = "profile__field-input";
            input.type = type;
            input.placeholder = placeholder;
            input.dataset.field = key;

            // Заполняем данные из загруженного профиля или из state
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
                // Fallback на данные из state
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
            }

            // Добавляем обработчики валидации
            this.setupInputValidation(input, validator);

            const errorElement = document.createElement("div");
            errorElement.className = "profile__field-error";

            inputContainer.appendChild(input);
            inputContainer.appendChild(errorElement);

            fieldContainer.appendChild(labelElement);
            fieldContainer.appendChild(inputContainer);

            // Сохраняем ссылку на input для доступа извне
            this.inputs[key] = { input, errorElement, validator };

            return fieldContainer;
        });
    }

    setupInputValidation(input, validator) {
        if (!validator) return;

        let hasInteracted = false;

        const validate = () => {
            const value = input.value.trim();
            const error = validator(value);

            const errorElement = input.parentElement.querySelector('.profile__field-error');
            if (error) {
                input.classList.add('profile__field-input--error');
                input.classList.remove('profile__field-input--valid');
                if (errorElement) {
                    errorElement.textContent = error;
                    errorElement.classList.add('profile__field-error--visible');
                }
                return false;
            } else {
                input.classList.remove('profile__field-input--error');
                input.classList.add('profile__field-input--valid');
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.classList.remove('profile__field-error--visible');
                }
                return true;
            }
        };

        // Валидация при потере фокуса
        input.addEventListener('blur', () => {
            hasInteracted = true;
            validate();
        });

        // Валидация при вводе (только после первого взаимодействия)
        input.addEventListener('input', () => {
            if (hasInteracted) {
                validate();
            }
        });

        // Валидация при отправке формы
        this.addEventListener(input, 'validation', validate);
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
            // Валидация всех полей перед отправкой
            let isValid = true;
            Object.values(this.inputs).forEach(({ input, validator }) => {
                if (validator) {
                    const fieldValid = this.validateField(input, validator);
                    if (!fieldValid) {
                        isValid = false;
                    }
                }
            });

            if (!isValid) {
                throw new Error("Пожалуйста, исправьте ошибки в форме");
            }

            this.showLoading(true);

            const profileData = {
                first_name: this.inputs.first_name.input.value.trim() || "",
                last_name: this.inputs.last_name.input.value.trim() || "",
                phone: this.inputs.phone.input.value.trim() || "",
                email: this.inputs.email.input.value.trim() || "",
                avatar_url: this.currentAvatarUrl || this.profileData?.photo_url || this.state.user?.avatar
            };

            const validation = ProfileService.validateProfile(profileData);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Сохраняем основные данные профиля
            await ProfileService.updateProfile(profileData);

            // Если email изменился, обновляем его через отдельный эндпоинт
            if (profileData.email !== this.originalEmail) {
                await ProfileService.updateEmail({ email: profileData.email });
                this.originalEmail = profileData.email;
            }

            // Обновляем состояние пользователя
            const updatedUser = {
                ...this.state.user,
                id: this.state.user?.id || ProfileService.getCurrentUserId(),
                firstName: profileData.first_name,
                lastName: profileData.last_name,
                email: profileData.email,
                phone: profileData.phone,
                name: `${profileData.first_name} ${profileData.last_name}`,
                avatar: profileData.avatar_url,
                photo_url: profileData.avatar_url
            };

            this.state.user = updatedUser;
            localStorage.setItem("userData", JSON.stringify(updatedUser));

            // Обновляем данные профиля
            this.profileData = {
                ...this.profileData,
                ...profileData
            };

            this.showLoading(false);

            Modal.show({
                title: 'Успех',
                message: 'Профиль успешно сохранен!',
                type: 'info',
                onConfirm: () => {
                    // Обновляем шапку и сайдбар
                    if (this.app.header) {
                        this.app.header.render();
                    }
                    // Перерисовываем текущую страницу чтобы обновить данные
                    if (this.app.currentPage && typeof this.app.currentPage.render === 'function') {
                        this.app.currentPage.render();
                    }
                }
            });

        } catch (error) {
            this.showLoading(false);
            console.error('Error saving profile:', error);

            let errorMessage = error.message || 'Не удалось сохранить профиль';

            Modal.show({
                title: 'Ошибка',
                message: errorMessage,
                type: 'error'
            });
        }
    }

    validateField(input, validator) {
        const value = input.value.trim();
        const error = validator(value);

        const errorElement = input.parentElement.querySelector('.profile__field-error');
        if (error) {
            input.classList.add('profile__field-input--error');
            input.classList.remove('profile__field-input--valid');
            if (errorElement) {
                errorElement.textContent = error;
                errorElement.classList.add('profile__field-error--visible');
            }
            return false;
        } else {
            input.classList.remove('profile__field-input--error');
            input.classList.add('profile__field-input--valid');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.remove('profile__field-error--visible');
            }
            return true;
        }
    }

    createLoading() {
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "profile__loading";
        loadingDiv.textContent = "Загрузка...";
        return loadingDiv;
    }

    createErrorSection(message) {
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

    showLoading(show) {
        this.isLoading = show;
        const saveButton = document.querySelector('.profile__save-button');
        if (saveButton) {
            saveButton.disabled = show;
            saveButton.textContent = show ? 'Сохранение...' : 'Сохранить изменения';
        }
    }

    addEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }
}