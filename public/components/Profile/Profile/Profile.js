export class Profile {
    constructor(state, app) {
        this.state = state;
        this.app = app;
        this.currentAvatarUrl = null; 
    }

    render() {
        const content = document.createElement("div");
        content.className = "profile__content";

        const block = document.createElement("div");
        block.className = "profile__block";

        const userSection = this.createUserSection();
        const dataSection = this.createDataSection();

        block.appendChild(userSection);
        block.appendChild(dataSection);
        content.appendChild(block);

        return content;
    }

    createUserSection() {
        const userSection = document.createElement("div");
        userSection.className = "profile__user-section";

        const avatar = document.createElement("img");
        avatar.className = "profile__avatar";
        avatar.src = this.state.user?.avatar || "../images/user.png";
        avatar.alt = "Аватар";
        avatar.id = "profile-avatar";

        const name = document.createElement("span");
        name.className = "profile__user-name";
        const fullName = this.state.user?.name || "Иван Иванов";
        name.textContent = fullName;

        userSection.appendChild(avatar);
        userSection.appendChild(name);

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

        fileInput.addEventListener("change", (e) => {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.getElementById("profile-avatar");
                    if (img) {
                        img.src = event.target.result;
                        this.currentAvatarUrl = event.target.result;
                    }
                };
                reader.readAsDataURL(file);
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
            { label: "Имя", key: "firstName", placeholder: "Введите имя" },
            { label: "Фамилия", key: "lastName", placeholder: "Введите фамилию" },
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
            input.value = this.state.user?.[key] || "";

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

        button.addEventListener("click", () => {
            this.handleSave();
        });

        return button;
    }

    handleSave() {
        const inputs = document.querySelectorAll('.profile__field-input');
        const updatedUser = {
            ...this.state.user,
            firstName: inputs[0]?.value.trim() || "",
            lastName: inputs[1]?.value.trim() || "",
            phone: inputs[2]?.value.trim() || "",
            email: inputs[3]?.value.trim() || "",
            name: `${inputs[0]?.value.trim()} ${inputs[1]?.value.trim()}`.trim() || "Иван Иванов",
            avatar: this.currentAvatarUrl || this.state.user?.avatar || "../images/user.png"
        };

        // Проверяем, что все обязательные поля заполнены
        const requiredFields = ['firstName', 'lastName', 'phone', 'email'];
        const missingFields = requiredFields.filter(field => !updatedUser[field] || updatedUser[field].trim() === '');

        if (missingFields.length > 0) {
            alert('Пожалуйста, заполните все обязательные поля: Имя, Фамилия, Телефон, Email');
            return;
        }

        this.state.user = updatedUser;
        localStorage.setItem("userData", JSON.stringify(updatedUser));

        // Показываем сообщение об успешном сохранении
        alert('Профиль успешно сохранен!');

        this.app.header?.render();
        if (this.app.currentPage && typeof this.app.currentPage.render === 'function') {
            this.app.currentPage.render();
        }
    }
}