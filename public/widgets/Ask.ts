export class Ask {
    private parent: HTMLElement;
    private controller: any;
    private isModal: boolean;

    constructor(parent: HTMLElement, controller: any, isModal: boolean = false) {
        this.parent = parent;
        this.controller = controller;
        this.isModal = isModal;
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
        subtitle.textContent = 'Все поля обязательные. Заполните их внимательно - это поможет быстрее найти для вас решение.';

        askHeader.appendChild(title);
        askHeader.appendChild(subtitle);

        const form = document.createElement('form');
        form.className = 'ask-form';

        const firstSection = document.createElement('div');
        firstSection.className = 'form-section';

        const issueTypeGroup = document.createElement('div');
        issueTypeGroup.className = 'form-group';

        const issueTypeLabel = document.createElement('label');
        issueTypeLabel.htmlFor = 'issue-type';
        issueTypeLabel.textContent = 'С чем связано ваше обращение? *';

        const customSelect = document.createElement('div');
        customSelect.className = 'custom-select';

        const issueTypeSelect = document.createElement('select');
        issueTypeSelect.id = 'issue-type';
        issueTypeSelect.name = 'issue-type';
        issueTypeSelect.required = true;

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = 'Не выбрано';

        const technicalOption = document.createElement('option');
        technicalOption.value = 'technical';
        technicalOption.textContent = 'Баг';

        const paymentOption = document.createElement('option');
        paymentOption.value = 'payment';
        paymentOption.textContent = 'Предложения';

        const featureOption = document.createElement('option');
        featureOption.value = 'feature';
        featureOption.textContent = 'Вопросы по оплате';

        const otherOption = document.createElement('option');
        otherOption.value = 'other';
        otherOption.textContent = 'Другое';

        issueTypeSelect.appendChild(defaultOption);
        issueTypeSelect.appendChild(technicalOption);
        issueTypeSelect.appendChild(paymentOption);
        issueTypeSelect.appendChild(featureOption);
        issueTypeSelect.appendChild(otherOption);

        const selectArrow = document.createElement('span');
        selectArrow.className = 'select-arrow';
        selectArrow.textContent = '▼';

        customSelect.appendChild(issueTypeSelect);
        customSelect.appendChild(selectArrow);

        issueTypeGroup.appendChild(issueTypeLabel);
        issueTypeGroup.appendChild(customSelect);

        const descriptionGroup = document.createElement('div');
        descriptionGroup.className = 'form-group';

        const descriptionLabel = document.createElement('label');
        descriptionLabel.htmlFor = 'problem-description';
        descriptionLabel.textContent = 'Опишите проблему как можно подробнее';

        const descriptionTextarea = document.createElement('textarea');
        descriptionTextarea.id = 'problem-description';
        descriptionTextarea.name = 'problem-description';
        descriptionTextarea.rows = 5;
        descriptionTextarea.required = true;

        descriptionGroup.appendChild(descriptionLabel);
        descriptionGroup.appendChild(descriptionTextarea);

        const fileGroup = document.createElement('div');
        fileGroup.className = 'form-group';

        const fileLabel = document.createElement('label');
        fileLabel.textContent = 'Приложите скриншот с вашей проблемой, это поможет оператору быстрее разобраться';

        const fileUpload = document.createElement('div');
        fileUpload.className = 'file-upload';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'screenshot';
        fileInput.name = 'screenshot';
        fileInput.accept = 'image/*';

        const fileUploadLabel = document.createElement('label');
        fileUploadLabel.htmlFor = 'screenshot';
        fileUploadLabel.className = 'file-upload-label';

        const fileUploadText = document.createElement('span');
        fileUploadText.className = 'file-upload-text';
        fileUploadText.textContent = 'Выберите файл';

        fileUploadLabel.appendChild(fileUploadText);
        fileUpload.appendChild(fileInput);
        fileUpload.appendChild(fileUploadLabel);

        fileGroup.appendChild(fileLabel);
        fileGroup.appendChild(fileUpload);

        firstSection.appendChild(issueTypeGroup);
        firstSection.appendChild(descriptionGroup);
        firstSection.appendChild(fileGroup);

        const secondSection = document.createElement('div');
        secondSection.className = 'form-section';

        const contactsTitle = document.createElement('h2');
        contactsTitle.textContent = 'Оставьте свои контакты';

        const contactsSubtitle = document.createElement('p');
        contactsSubtitle.className = 'ask-subtitle';
        contactsSubtitle.textContent = 'Мы свяжемся с вами в ближайшее время';

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

        nameGroup.appendChild(nameLabel);
        nameGroup.appendChild(nameInput);

        const emailGroup = document.createElement('div');
        emailGroup.className = 'form-group';

        const emailLabel = document.createElement('label');
        emailLabel.htmlFor = 'contact-email';
        emailLabel.textContent = 'Почта для связи';

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.id = 'contact-email';
        emailInput.name = 'contact-email';
        emailInput.required = true;

        emailGroup.appendChild(emailLabel);
        emailGroup.appendChild(emailInput);

        secondSection.appendChild(contactsTitle);
        secondSection.appendChild(contactsSubtitle);
        secondSection.appendChild(nameGroup);
        secondSection.appendChild(emailGroup);

        const formActions = document.createElement('div');
        formActions.className = 'form-actions';

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'submit-button';
        submitButton.textContent = 'Отправить обращение';

        formActions.appendChild(submitButton);

        if (this.isModal) {
            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.className = 'cancel-button';
            cancelButton.textContent = 'Отмена';
            formActions.appendChild(cancelButton);
        }

        form.appendChild(firstSection);
        form.appendChild(secondSection);
        form.appendChild(formActions);

        askContainer.appendChild(askHeader);
        askContainer.appendChild(form);

        this.parent.appendChild(askContainer);
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
            const fileName = files[0].name;
            this.updateFileLabel(fileLabel, fileName);
            
            if (files[0].size > 5 * 1024 * 1024) {
                this.showError('Файл слишком большой. Максимальный размер: 5MB');
                target.value = '';
                this.resetFileLabel(fileLabel);
            }
        } else {
            this.resetFileLabel(fileLabel);
        }
    }

    private updateFileLabel(fileLabel: HTMLLabelElement, fileName: string): void {
        const textElement = fileLabel.querySelector('.file-upload-text') as HTMLElement;
        if (textElement) {
            const shortName = fileName.length > 20 
                ? fileName.substring(0, 17) + '...' 
                : fileName;
            textElement.textContent = shortName;
        }
        
        fileLabel.style.backgroundColor = 'rgba(31, 187, 114, 0.1)';
        fileLabel.style.borderColor = '#1FBB72';
    }

    private resetFileLabel(fileLabel: HTMLLabelElement): void {
        const textElement = fileLabel.querySelector('.file-upload-text') as HTMLElement;
        if (textElement) {
            textElement.textContent = 'Выберите файл';
        }
        
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

        if (field.hasAttribute('required') && !field.value.trim()) {
            this.showFieldError(field, 'Это поле обязательно для заполнения');
            return false;
        }

        if (field.type === 'email' && field.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value.trim())) {
                this.showFieldError(field, 'Введите корректный email адрес');
                return false;
            }
        }

        if (field.id === 'problem-description' && field.value.trim().length < 10) {
            this.showFieldError(field, 'Описание проблемы должно содержать не менее 10 символов');
            return false;
        }

        return true;
    }

    private showFieldError(field: HTMLElement, message: string): void {
        this.clearFieldError(field);
        field.style.borderColor = '#dc3545';
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: #dc3545;
            font-size: 12px;
            margin-top: 5px;
            font-family: 'Inter', sans-serif;
        `;
        errorElement.textContent = message;
        
        field.parentNode?.insertBefore(errorElement, field.nextSibling);
    }

    private clearFieldError(field: HTMLElement): void {
        field.style.borderColor = '';
        
        const existingError = field.parentNode?.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    private showError(message: string): void {
        alert(message);
    }

    private async submitForm(): Promise<void> {
        const form = this.parent.querySelector('.ask-form') as HTMLFormElement;
        const submitButton = this.parent.querySelector('.submit-button') as HTMLButtonElement;
        const formData = new FormData(form);

        this.showLoadingState(submitButton);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log('Form data:', Object.fromEntries(formData));
            this.showSuccess();
            form.reset();
            this.resetAllFileLabels();
            
            if (this.isModal) {
                setTimeout(() => this.closeModal(), 1000);
            }
            
        } catch (error) {
            this.showError('Произошла ошибка при отправке формы. Попробуйте еще раз.');
            console.error('Form submission error:', error);
        } finally {
            this.hideLoadingState(submitButton);
        }
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
        alert('Ваше обращение успешно отправлено! Мы свяжемся с вами в ближайшее время.');
    }

    private resetAllFileLabels(): void {
        const fileLabels = this.parent.querySelectorAll('.file-upload-label');
        fileLabels.forEach(label => {
            this.resetFileLabel(label as HTMLLabelElement);
        });
    }

    private closeModal(): void {
        if (this.isModal && this.parent.parentNode) {
            this.parent.parentNode.removeChild(this.parent);
        }
    }

    public setFormData(data: { [key: string]: string }): void {
        const form = this.parent.querySelector('.ask-form') as HTMLFormElement;
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
            if (field) {
                field.value = data[key];
            }
        });
    }

    public reset(): void {
        const form = this.parent.querySelector('.ask-form') as HTMLFormElement;
        form.reset();
        this.resetAllFileLabels();
        this.clearAllErrors();
    }

    private clearAllErrors(): void {
        const errors = this.parent.querySelectorAll('.field-error');
        errors.forEach(error => error.remove());
        
        const fields = this.parent.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            (field as HTMLElement).style.borderColor = '';
        });
    }

    cleanup(): void {
        this.parent.innerHTML = '';
    }
}