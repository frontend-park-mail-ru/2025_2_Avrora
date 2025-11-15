import { API_CONFIG } from "../config.js";

export class Ask {
    private parent: HTMLElement;
    private controller: any;
    private isModal: boolean;
    private signedEmail: string | null = null; // Например, из auth

    constructor(parent: HTMLElement, controller: any, isModal: boolean = false, signedEmail: string | null = null) {
        this.parent = parent;
        this.controller = controller;
        this.isModal = isModal;
        this.signedEmail = signedEmail; // можно передавать извне (например, из профиля)
    }

    async render(): Promise<void> {
        this.createDOMStructure();
        this.setupEventListeners();
    }

    private createDOMStructure(): void {
        this.parent.innerHTML = '';

        const askContainer = document.createElement('div');
        askContainer.className = 'ask-container';

        const askHeader = document.createElement('div');
        askHeader.className = 'ask-header';

        const title = document.createElement('h1');
        title.textContent = 'Расскажите о проблеме';

        const subtitle = document.createElement('p');
        subtitle.className = 'ask-subtitle';
        subtitle.textContent = 'Все поля обязательные. Заполните их внимательно — это поможет быстрее найти для вас решение.';

        askHeader.appendChild(title);
        askHeader.appendChild(subtitle);

        const form = document.createElement('form');
        form.className = 'ask-form';

        const firstSection = document.createElement('div');
        firstSection.className = 'form-section';

        // Category select (ENUM: 'bug', 'feature', 'general', 'billing')
        const categoryGroup = document.createElement('div');
        categoryGroup.className = 'form-group';

        const categoryLabel = document.createElement('label');
        categoryLabel.htmlFor = 'category';
        categoryLabel.textContent = 'Категория обращения *';

        const customSelect = document.createElement('div');
        customSelect.className = 'custom-select';

        const categorySelect = document.createElement('select');
        categorySelect.id = 'category';
        categorySelect.name = 'category';
        categorySelect.required = true;

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = 'Выберите категорию';

        const bugOption = document.createElement('option');
        bugOption.value = 'bug';
        bugOption.textContent = 'Ошибка (баг)';

        const featureOption = document.createElement('option');
        featureOption.value = 'feature';
        featureOption.textContent = 'Предложение по улучшению';

        const generalOption = document.createElement('option');
        generalOption.value = 'general';
        generalOption.textContent = 'Общий вопрос';

        const billingOption = document.createElement('option');
        billingOption.value = 'billing';
        billingOption.textContent = 'Проблемы с оплатой';

        categorySelect.append(defaultOption, bugOption, featureOption, generalOption, billingOption);

        const selectArrow = document.createElement('span');
        selectArrow.className = 'select-arrow';
        selectArrow.textContent = '▼';

        customSelect.append(categorySelect, selectArrow);
        categoryGroup.append(categoryLabel, customSelect);

        // Description
        const descriptionGroup = document.createElement('div');
        descriptionGroup.className = 'form-group';

        const descriptionLabel = document.createElement('label');
        descriptionLabel.htmlFor = 'problem-description';
        descriptionLabel.textContent = 'Опишите проблему как можно подробнее *';

        const descriptionTextarea = document.createElement('textarea');
        descriptionTextarea.id = 'problem-description';
        descriptionTextarea.name = 'description';
        descriptionTextarea.rows = 5;
        descriptionTextarea.required = true;

        descriptionGroup.append(descriptionLabel, descriptionTextarea);

        // File upload (supports multiple)
        const fileGroup = document.createElement('div');
        fileGroup.className = 'form-group';

        const fileLabel = document.createElement('label');
        fileLabel.textContent = 'Приложите скриншоты (до 5, до 5 МБ каждый)';

        const fileUpload = document.createElement('div');
        fileUpload.className = 'file-upload';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'screenshot';
        fileInput.name = 'screenshot';
        fileInput.accept = 'image/*';
        fileInput.multiple = true; // ✅ поддержка нескольких файлов

        const fileUploadLabel = document.createElement('label');
        fileUploadLabel.htmlFor = 'screenshot';
        fileUploadLabel.className = 'file-upload-label';

        const fileUploadText = document.createElement('span');
        fileUploadText.className = 'file-upload-text';
        fileUploadText.textContent = 'Выберите файлы';

        fileUploadLabel.append(fileUploadText);
        fileUpload.append(fileInput, fileUploadLabel);

        fileGroup.append(fileLabel, fileUpload);

        firstSection.append(categoryGroup, descriptionGroup, fileGroup);

        // Contact info
        const secondSection = document.createElement('div');
        secondSection.className = 'form-section';

        const contactsTitle = document.createElement('h2');
        contactsTitle.textContent = 'Ваши контактные данные';

        const contactsSubtitle = document.createElement('p');
        contactsSubtitle.className = 'ask-subtitle';
        contactsSubtitle.textContent = 'Мы ответим на указанный email';

        const nameGroup = document.createElement('div');
        nameGroup.className = 'form-group';

        const nameLabel = document.createElement('label');
        nameLabel.htmlFor = 'name';
        nameLabel.textContent = 'Имя *';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'name';
        nameInput.name = 'name';
        nameInput.required = true;

        nameGroup.append(nameLabel, nameInput);

        const emailGroup = document.createElement('div');
        emailGroup.className = 'form-group';

        const emailLabel = document.createElement('label');
        emailLabel.htmlFor = 'response-email';
        emailLabel.textContent = 'Email для ответа *';

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.id = 'response-email';
        emailInput.name = 'response_email';
        emailInput.required = true;

        emailGroup.append(emailLabel, emailInput);

        secondSection.append(contactsTitle, contactsSubtitle, nameGroup, emailGroup);

        // Actions
        const formActions = document.createElement('div');
        formActions.className = 'form-actions';

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'submit-button';
        submitButton.textContent = 'Отправить обращение';

        formActions.append(submitButton);

        if (this.isModal) {
            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.className = 'cancel-button';
            cancelButton.textContent = 'Отмена';
            formActions.append(cancelButton);
        }

        form.append(firstSection, secondSection, formActions);
        askContainer.append(askHeader, form);
        this.parent.append(askContainer);
    }

    private setupEventListeners(): void {
        const form = this.parent.querySelector('.ask-form') as HTMLFormElement;
        const fileInput = this.parent.querySelector('#screenshot') as HTMLInputElement;
        const fileLabel = this.parent.querySelector('.file-upload-label') as HTMLLabelElement;
        const cancelButton = this.parent.querySelector('.cancel-button') as HTMLButtonElement;

        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        if (fileInput && fileLabel) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e, fileLabel));
        }

        if (cancelButton && this.isModal) {
            cancelButton.addEventListener('click', () => this.closeModal());
        }

        this.setupRealTimeValidation();
    }

    private handleFormSubmit(e: Event): void {
        e.preventDefault();
        if (this.validateForm()) {
            this.submitForm();
        }
    }

    private handleFileSelect(e: Event, fileLabel: HTMLLabelElement): void {
        const target = e.target as HTMLInputElement;
        const files = target.files;

        if (files && files.length > 0) {
            // Обрезаем имя при >1 файле
            const label = files.length === 1
                ? (files[0].name.length > 20 ? files[0].name.substring(0, 17) + '...' : files[0].name)
                : `${files.length} файл(ов)`;

            this.updateFileLabel(fileLabel, label);

            // Проверка размера каждого файла
            for (let i = 0; i < files.length; i++) {
                if (files[i].size > 5 * 1024 * 1024) {
                    this.showError(`Файл "${files[i].name}" превышает 5MB`);
                    target.value = '';
                    this.resetFileLabel(fileLabel);
                    return;
                }
            }
        } else {
            this.resetFileLabel(fileLabel);
        }
    }

    private updateFileLabel(fileLabel: HTMLLabelElement, text: string): void {
        const textEl = fileLabel.querySelector('.file-upload-text') as HTMLElement;
        if (textEl) textEl.textContent = text;
        fileLabel.style.backgroundColor = 'rgba(31, 187, 114, 0.1)';
        fileLabel.style.borderColor = '#1FBB72';
    }

    private resetFileLabel(fileLabel: HTMLLabelElement): void {
        const textEl = fileLabel.querySelector('.file-upload-text') as HTMLElement;
        if (textEl) textEl.textContent = 'Выберите файлы';
        fileLabel.style.backgroundColor = '#F5F5F5';
        fileLabel.style.borderColor = '#A0A8BE';
    }

    private setupRealTimeValidation(): void {
        const form = this.parent.querySelector('.ask-form') as HTMLFormElement;
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement);
            });
            input.addEventListener('input', () => {
                this.clearFieldError(input as HTMLElement);
            });
        });
    }

    private validateForm(): boolean {
        let isValid = true;
        const form = this.parent.querySelector('.ask-form') as HTMLFormElement;
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            if (!this.validateField(field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)) {
                isValid = false;
            }
        });
        return isValid;
    }

    private validateField(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean {
        this.clearFieldError(field);
        const value = field.value.trim();

        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'Это поле обязательно для заполнения');
            return false;
        }

        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Введите корректный email');
                return false;
            }
        }

        if (field.id === 'problem-description' && value.length < 10) {
            this.showFieldError(field, 'Описание должно быть не короче 10 символов');
            return false;
        }

        return true;
    }

    private showFieldError(field: HTMLElement, message: string): void {
        this.clearFieldError(field);
        field.style.borderColor = '#dc3545';
        const errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        errorEl.style.cssText = `color: #dc3545; font-size: 12px; margin-top: 5px; font-family: 'Inter', sans-serif;`;
        errorEl.textContent = message;
        field.parentNode?.insertBefore(errorEl, field.nextSibling);
    }

    private clearFieldError(field: HTMLElement): void {
        field.style.borderColor = '';
        field.parentNode?.querySelector('.field-error')?.remove();
    }

    private showError(message: string): void {
        alert(message);
    }

    // 📤 Отправка формы
    private async submitForm(): Promise<void> {
        const form = this.parent.querySelector('.ask-form') as HTMLFormElement;
        const submitButton = this.parent.querySelector('.submit-button') as HTMLButtonElement;
        const fileInput = this.parent.querySelector('#screenshot') as HTMLInputElement;

        this.showLoadingState(submitButton);

        try {
            // Сбор данных
            const category = (form.querySelector('#category') as HTMLSelectElement).value;
            const description = (form.querySelector('#problem-description') as HTMLTextAreaElement).value;
            const name = (form.querySelector('#name') as HTMLInputElement).value;
            const responseEmail = (form.querySelector('#response-email') as HTMLInputElement).value;
            const signedEmail = this.signedEmail || responseEmail; // fallback

            // Загрузка файлов → photo_urls[]
            let photoUrls: string[] = [];
            if (fileInput.files && fileInput.files.length > 0) {
                const uploadPromises = Array.from(fileInput.files).map(file => this.uploadFile(file));
                photoUrls = await Promise.all(uploadPromises);
            }

            // Формируем тело запроса по новому формату
            const ticketData = {
                signed_email: signedEmail,
                response_email: responseEmail,
                name: name,
                category: category,
                description: description,
                photo_urls: photoUrls // массив строк
            };

            // ✅ Отправляем JSON
            const response = await fetch(
                `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.SUPPORT_TICKETS.CREATE}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        // 'Authorization': `Bearer ${token}` // добавить, если нужна авторизация
                    },
                    body: JSON.stringify(ticketData)
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Ticket created:', result);

            this.showSuccess();
            form.reset();
            this.resetAllFileLabels();

            if (this.isModal) setTimeout(() => this.closeModal(), 1000);

        } catch (error) {
            console.error('❌ Submission error:', error);
            this.showError(
                error instanceof Error
                    ? error.message
                    : 'Не удалось отправить обращение. Проверьте соединение и повторите попытку.'
            );
        } finally {
            this.hideLoadingState(submitButton);
        }
    }

    // 🖼️ Загрузка одного файла
    private async uploadFile(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('image', file); // ключ должен совпадать с ожидаемым на backend (например, `file`)

        const response = await fetch(
            `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.MEDIA.UPLOAD}`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `Ошибка загрузки файла: ${response.status}`);
        }

        const result = await response.json();
        // Предполагается, что backend возвращает { filename: "xyz.png" } или { url: "https://..." }
        // Адаптируем под ожидаемый формат photo_urls (полные URL)
        if (typeof result === 'string') return result;
        if (result.url) return result.url;
        if (result.filename) return `${API_CONFIG.API_BASE_URL}${API_CONFIG.ENDPOINTS.MEDIA.BY_FILENAME}/${result.filename}`;
        throw new Error('Некорректный ответ сервера при загрузке файла');
    }

    private showLoadingState(button: HTMLButtonElement): void {
        button.disabled = true;
        button.textContent = 'Отправка...';
        button.style.opacity = '0.7';
    }

    private hideLoadingState(button: HTMLButtonElement): void {
        button.disabled = false;
        button.textContent = 'Отправить обращение';
        button.style.opacity = '1';
    }

    private showSuccess(): void {
        alert('✅ Ваше обращение успешно отправлено! Мы ответим на указанный email в ближайшее время.');
    }

    private resetAllFileLabels(): void {
        this.parent.querySelectorAll('.file-upload-label').forEach(label => {
            this.resetFileLabel(label as HTMLLabelElement);
        });
    }

    private closeModal(): void {
        if (this.isModal && this.parent.parentNode) {
            this.parent.remove();
        }
    }

    public setFormData(data: Record<string, string>): void {
        const form = this.parent.querySelector('.ask-form') as HTMLFormElement;
        for (const [key, value] of Object.entries(data)) {
            const el = form.querySelector(`[name="${key}"]`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
            if (el) el.value = value;
        }
    }

    public reset(): void {
        const form = this.parent.querySelector('.ask-form') as HTMLFormElement;
        form.reset();
        this.resetAllFileLabels();
        this.clearAllErrors();
    }

    private clearAllErrors(): void {
        this.parent.querySelectorAll('.field-error').forEach(el => el.remove());
        this.parent.querySelectorAll('input, textarea, select').forEach(el => {
            (el as HTMLElement).style.borderColor = '';
        });
    }

    cleanup(): void {
        this.parent.innerHTML = '';
    }
}