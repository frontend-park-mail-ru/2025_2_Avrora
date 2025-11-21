// OfferCreateSecondStage.ts
interface StageOptions {
    state: any;
    app: any;
    dataManager: any;
    isEditing?: boolean;
    editOfferId?: string | null;
}

interface FormData {
    [key: string]: string | number | null;
}

export class OfferCreateSecondStage {
    state: any;
    app: any;
    dataManager: any;
    isEditing: boolean;
    editOfferId: string | null;
    root: HTMLElement | null;
    private errorContainer: HTMLElement | null;

    constructor({ state, app, dataManager, isEditing = false, editOfferId = null }: StageOptions = {}) {
        this.state = state;
        this.app = app;
        this.dataManager = dataManager;
        this.isEditing = isEditing;
        this.editOfferId = editOfferId;
        this.root = null;
        this.errorContainer = null;
    }

    render(): HTMLElement {
        this.root = document.createElement('div');
        this.root.className = 'create-ad';

        this.root.appendChild(this.createProgress('2 этап. Расположение', 40, 40));

        // Создаем контейнер для ошибок
        this.errorContainer = document.createElement('div');
        this.errorContainer.className = 'create-ad__error-container';
        this.errorContainer.style.display = 'none';
        this.root.appendChild(this.errorContainer);

        const addressBlock = document.createElement('div');
        addressBlock.className = 'create-ad__choice-block';

        const addressTitle = document.createElement('h2');
        addressTitle.className = 'create-ad__form-label';
        addressTitle.textContent = 'Адрес';

        const addressGroup = document.createElement('div');
        addressGroup.className = 'create-ad__choice-group';

        const addressInput = this.createInput('Введите адрес...', 'address');
        addressInput.required = true;
        addressGroup.appendChild(addressInput);

        addressBlock.appendChild(addressTitle);
        addressBlock.appendChild(addressGroup);
        this.root.appendChild(addressBlock);

        const floorsBlock = document.createElement('div');
        floorsBlock.className = 'create-ad__choice-block';

        const floorsGroup = document.createElement('div');
        floorsGroup.className = 'create-ad__form-row';

        const floorItem = this.createFormGroup('Этаж', 'floor', 'number');
        const totalFloorsItem = this.createFormGroup('Этажей в доме', 'total_floors', 'number');

        floorsGroup.appendChild(floorItem);
        floorsGroup.appendChild(totalFloorsItem);
        floorsBlock.appendChild(floorsGroup);
        this.root.appendChild(floorsBlock);

        this.root.appendChild(this.createNav({ prev: true, next: true }));

        this.restoreFormData();

        return this.root;
    }

    createProgress(titleText: string, value: number, ariaNow: number): HTMLElement {
        const progress = document.createElement('div');
        progress.className = 'create-ad__progress';

        const title = document.createElement('h2');
        title.className = 'create-ad__progress-title';
        title.textContent = this.isEditing ? titleText.replace('создания', 'редактирования') : titleText;

        const barWrap = document.createElement('div');
        barWrap.className = 'create-ad__progress-bar';
        barWrap.setAttribute('role', 'progressbar');
        barWrap.setAttribute('aria-label', 'Готово');
        barWrap.setAttribute('aria-valuemin', '0');
        barWrap.setAttribute('aria-valuemax', '100');
        barWrap.setAttribute('aria-valuenow', String(ariaNow));
        barWrap.style.setProperty('--value', String(value));

        const bar = document.createElement('div');
        bar.className = 'create-ad__progress-bar-inner';
        barWrap.appendChild(bar);

        progress.appendChild(title);
        progress.appendChild(barWrap);
        return progress;
    }

    createInput(placeholder: string, fieldName: string): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'create-ad__input';
        input.placeholder = placeholder;
        input.dataset.field = fieldName;
        input.required = fieldName === 'address';

        input.addEventListener('input', () => {
            this.clearError();
            this.saveFormData();
        });

        input.addEventListener('blur', () => {
            this.validateAndSave();
        });

        return input;
    }

    createFormGroup(labelText: string, fieldName: string, type: string = 'text'): HTMLElement {
        const group = document.createElement('div');
        group.className = 'create-ad__form-group';

        const label = document.createElement('h2');
        label.className = 'create-ad__form-label';
        label.textContent = labelText;

        const input = document.createElement('input');
        input.type = type;
        input.className = 'create-ad__input';
        input.placeholder = labelText;
        input.dataset.field = fieldName;
        input.min = fieldName === 'floor' || fieldName === 'total_floors' ? '0' : undefined;

        input.addEventListener('input', () => {
            this.clearError();
            this.saveFormData();
        });

        input.addEventListener('blur', () => {
            this.validateAndSave();
        });

        group.appendChild(label);
        group.appendChild(input);
        return group;
    }

    validateAndSave(): void {
        const formData: FormData = this.collectFormData();
        const validationResult = this.validateFormData(formData);

        if (!validationResult.isValid) {
            this.showError(validationResult.message!);
            return;
        }

        this.saveFormData();
    }

    collectFormData(): FormData {
        const formData: FormData = {};
        const inputs = this.root!.querySelectorAll('.create-ad__input[data-field]');

        inputs.forEach(input => {
            const value = (input as HTMLInputElement).value.trim();
            const fieldName = (input as HTMLElement).dataset.field!;

            if (value) {
                formData[fieldName] = (input as HTMLInputElement).type === 'number' ?
                    parseInt(value) || null : value;
            } else {
                formData[fieldName] = null;
            }
        });

        return formData;
    }

    validateFormData(data: FormData): { isValid: boolean; message?: string } {
        // Проверка обязательного поля адреса
        if (!data.address) {
            return { isValid: false, message: 'Введите адрес' };
        }

        // Проверка корректности этажей
        const floor = data.floor as number;
        const totalFloors = data.total_floors as number;

        // Если заполнено только одно из полей этажей
        if ((floor !== null && totalFloors === null) || (floor === null && totalFloors !== null)) {
            return { isValid: false, message: 'Заполните оба поля: этаж и количество этажей в доме' };
        }

        // Если заполнены оба поля
        if (floor !== null && totalFloors !== null) {
            if (floor < 0) {
                return { isValid: false, message: 'Этаж не может быть отрицательным числом' };
            }

            if (totalFloors <= 0) {
                return { isValid: false, message: 'Общее количество этажей должно быть положительным числом' };
            }

            if (floor > totalFloors) {
                return { isValid: false, message: 'Этаж не может быть больше общего количества этажей в доме' };
            }

            if (floor === 0 && totalFloors > 0) {
                return { isValid: false, message: 'Этаж 0 обычно не используется. Используйте 1 для первого этажа.' };
            }
        }

        return { isValid: true };
    }

    saveFormData(): void {
        const formData: FormData = this.collectFormData();
        const validationResult = this.validateFormData(formData);

        if (!validationResult.isValid) {
            // Не сохраняем данные при ошибке валидации
            return;
        }

        this.dataManager.updateStage2(formData);
    }

    showError(message: string): void {
        if (!this.errorContainer) return;

        this.errorContainer.innerHTML = '';
        this.errorContainer.style.display = 'block';

        const errorElement = document.createElement('div');
        errorElement.className = 'create-ad__error-message';
        errorElement.textContent = message;

        this.errorContainer.appendChild(errorElement);

        // Прокручиваем к ошибке
        this.errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    clearError(): void {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'none';
            this.errorContainer.innerHTML = '';
        }
    }

    restoreFormData(): void {
        const currentData = this.dataManager.getData();

        const inputs = this.root!.querySelectorAll('.create-ad__input[data-field]');
        inputs.forEach(input => {
            const fieldName = (input as HTMLElement).dataset.field!;
            if (currentData[fieldName] !== undefined && currentData[fieldName] !== null) {
                (input as HTMLInputElement).value = String(currentData[fieldName]);
            }
        });
    }

    createNav({ prev = false, next = false }: { prev?: boolean; next?: boolean } = {}): HTMLElement {
        const nav = document.createElement('div');
        nav.className = 'create-ad__nav';

        const group = document.createElement('div');
        group.className = 'create-ad__nav-group';

        if (prev) {
            const back = document.createElement('button');
            back.className = 'create-ad__nav-button create-ad__nav-button_prev';
            back.textContent = 'Назад';
            back.dataset.action = 'prev';
            group.appendChild(back);
        }

        if (next) {
            const nextBtn = document.createElement('button');
            nextBtn.className = 'create-ad__nav-button create-ad__nav-button_next';
            nextBtn.textContent = 'Дальше';
            nextBtn.dataset.action = 'next';
            group.appendChild(nextBtn);
        }

        nav.appendChild(group);
        return nav;
    }
}