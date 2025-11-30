interface StageOptions {
    state: any;
    app: any;
    dataManager: any;
    isEditing?: boolean;
    editOfferId?: string | null;
}

interface FormData {
    [key: string]: string | number | boolean | null;
    complex_status?: string | null;
    complex_name?: string | null;
    in_housing_complex?: boolean;
    housing_complex?: string | null;
    housing_complex_id?: string | null;
}

interface HousingComplex {
    ID: string;
    Name: string;
    Address?: string;
    Metro?: string;
    StartingPrice?: number;
    ImageURL?: string;
}

interface ComplexesResponse {
    Meta: {
        Total: number;
        Offset: number;
    };
    Complexes: HousingComplex[];
}

export class OfferCreateSecondStage {
    state: any;
    app: any;
    dataManager: any;
    isEditing: boolean;
    editOfferId: string | null;
    root: HTMLElement | null;
    private errorContainer: HTMLElement | null;
    private mapContainer: HTMLElement | null;
    private currentAddress: string = '';
    private eventListeners: Array<{element: EventTarget, event: string, handler: EventListenerOrEventListenerObject}> = [];
    private allHousingComplexes: HousingComplex[] = [];
    private filteredComplexes: HousingComplex[] = [];
    private complexSearchTimeout: number | null = null;
    private selectedComplex: HousingComplex | null = null;
    private complexesLoaded: boolean = false;
    private pendingComplexRestoration: string | null = null;
    private mapInitialized: boolean = false;
    private updateMapTimeout: number | null = null;
    private emptyMapInstance: any = null;

    constructor({ state, app, dataManager, isEditing = false, editOfferId = null }: StageOptions = {}) {
        this.state = state;
        this.app = app;
        this.dataManager = dataManager;
        this.isEditing = isEditing;
        this.editOfferId = editOfferId;
        this.root = null;
        this.errorContainer = null;
        this.mapContainer = null;
    }

    render(): HTMLElement {
        this.root = document.createElement('div');
        this.root.className = 'create-ad';

        this.root.appendChild(this.createProgress('2 этап. Расположение', 40, 40));

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

        const addressInput = this.createInput('Город, улица, корпус, подъезд, дом, квартира', 'address');
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

        const complexBlock = document.createElement('div');
        complexBlock.className = 'create-ad__choice-block';

        const complexTitle = document.createElement('h2');
        complexTitle.className = 'create-ad__form-label';
        complexTitle.textContent = 'В составе жилищного комплекса';

        const complexGroup = document.createElement('div');
        complexGroup.className = 'create-ad__choice-group';

        const yesButton = document.createElement('button');
        yesButton.className = 'create-ad__choice-button';
        yesButton.dataset.value = 'yes';
        yesButton.textContent = 'Да';
        this.addEventListener(yesButton, 'click', () => this.handleComplexToggle('yes'));

        const noButton = document.createElement('button');
        noButton.className = 'create-ad__choice-button';
        noButton.dataset.value = 'no';
        noButton.textContent = 'Нет';
        this.addEventListener(noButton, 'click', () => this.handleComplexToggle('no'));

        complexGroup.appendChild(yesButton);
        complexGroup.appendChild(noButton);
        complexBlock.appendChild(complexTitle);
        complexBlock.appendChild(complexGroup);
        this.root.appendChild(complexBlock);

        const complexNameBlock = document.createElement('div');
        complexNameBlock.className = 'create-ad__choice-block';
        complexNameBlock.id = 'complex-name-block';
        complexNameBlock.style.display = 'none';

        const complexNameTitle = document.createElement('h2');
        complexNameTitle.className = 'create-ad__form-label';
        complexNameTitle.textContent = 'Название жилищного комплекса';

        const complexNameContainer = document.createElement('div');
        complexNameContainer.className = 'create-ad__autocomplete-container';

        const complexNameInput = this.createAutocompleteInput('Начните вводить название ЖК...', 'complex_name');

        const dropdown = document.createElement('div');
        dropdown.className = 'create-ad__autocomplete-dropdown';
        dropdown.style.display = 'none';

        const selectedComplexInfo = document.createElement('div');
        selectedComplexInfo.className = 'create-ad__selected-complex';
        selectedComplexInfo.style.display = 'none';

        complexNameContainer.appendChild(complexNameInput);
        complexNameContainer.appendChild(dropdown);
        complexNameContainer.appendChild(selectedComplexInfo);

        complexNameBlock.appendChild(complexNameTitle);
        complexNameBlock.appendChild(complexNameContainer);
        this.root.appendChild(complexNameBlock);

        this.mapContainer = document.createElement('div');
        this.mapContainer.className = 'create-ad__map';
        this.mapContainer.id = 'yandex-create-map';
        this.mapContainer.style.height = '400px';
        this.mapContainer.style.marginTop = '20px';
        this.mapContainer.style.borderRadius = '8px';
        this.mapContainer.style.overflow = 'hidden';
        this.mapContainer.style.border = '1px solid #e0e0e0';
        this.root.appendChild(this.mapContainer);

        this.root.appendChild(this.createNav({ prev: true, next: true }));

        this.loadAllComplexes().then(() => {
            this.restoreFormData();
        });

        setTimeout(() => {
            this.initMap();
            this.injectAutocompleteStyles();
        }, 0);

        return this.root;
    }

    createAutocompleteInput(placeholder: string, fieldName: string): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'create-ad__input create-ad__input--autocomplete';
        input.placeholder = placeholder;
        input.dataset.field = fieldName;
        input.autocomplete = 'off';

        this.addEventListener(input, 'input', (e: Event) => {
            const value = (e.target as HTMLInputElement).value;
            this.handleComplexSearch(value);
        });

        this.addEventListener(input, 'focus', (e: Event) => {
            const value = (e.target as HTMLInputElement).value;
            if (value.length > 0 && this.filteredComplexes.length > 0) {
                this.showAutocompleteDropdown(this.filteredComplexes);
            } else if (value.length === 0 && this.complexesLoaded) {
                this.showAutocompleteDropdown(this.allHousingComplexes.slice(0, 10));
            }
        });

        this.addEventListener(input, 'blur', () => {
            setTimeout(() => {
                this.hideAutocompleteDropdown();
            }, 200);
        });

        this.addEventListener(input, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                this.hideAutocompleteDropdown();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const dropdown = this.root!.querySelector('.create-ad__autocomplete-dropdown') as HTMLElement;
                const firstItem = dropdown?.querySelector('.create-ad__autocomplete-item') as HTMLElement;
                if (firstItem && !firstItem.classList.contains('create-ad__autocomplete-item--no-results')) {
                    firstItem.click();
                }
            }
        });

        return input;
    }

    async loadAllComplexes(): Promise<void> {
        try {
            const response = await fetch('/api/v1/complexes/list?limit=100');

            if (response.ok) {
                const data: ComplexesResponse = await response.json();
                this.allHousingComplexes = data.Complexes || [];
                this.complexesLoaded = true;

                if (this.pendingComplexRestoration) {
                    this.restoreComplexSelection(this.pendingComplexRestoration);
                    this.pendingComplexRestoration = null;
                }
            } else {
                this.allHousingComplexes = [];
            }
        } catch (error) {
            this.allHousingComplexes = [];
        }
    }

    handleComplexSearch(searchTerm: string): void {
        if (this.complexSearchTimeout) {
            clearTimeout(this.complexSearchTimeout);
        }

        if (this.selectedComplex && searchTerm !== this.selectedComplex.Name) {
            this.selectedComplex = null;
            this.hideSelectedComplexInfo();
        }

        if (!this.complexesLoaded) {
            this.showLoadingMessage();
            return;
        }

        if (searchTerm.length === 0) {
            this.hideAutocompleteDropdown();
            return;
        }

        this.complexSearchTimeout = window.setTimeout(() => {
            this.performComplexSearch(searchTerm);
        }, 300);
    }

    performComplexSearch(searchTerm: string): void {
        if (!this.complexesLoaded) {
            this.showLoadingMessage();
            return;
        }

        this.filteredComplexes = this.allHousingComplexes.filter(complex =>
            complex.Name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.showAutocompleteDropdown(this.filteredComplexes);
    }

    showAutocompleteDropdown(complexes: HousingComplex[]): void {
        const dropdown = this.root!.querySelector('.create-ad__autocomplete-dropdown') as HTMLElement;
        if (!dropdown) return;

        dropdown.innerHTML = '';

        if (complexes.length === 0) {
            this.showNoResults();
        } else {
            const limitedComplexes = complexes.slice(0, 10);
            limitedComplexes.forEach(complex => {
                const item = this.createComplexItem(complex);
                dropdown.appendChild(item);
            });

            if (complexes.length > 10) {
                const moreResults = document.createElement('div');
                moreResults.className = 'create-ad__autocomplete-more-results';
                moreResults.textContent = `... и еще ${complexes.length - 10} результатов`;
                dropdown.appendChild(moreResults);
            }
        }

        dropdown.style.display = 'block';
    }

    createComplexItem(complex: HousingComplex): HTMLElement {
        const item = document.createElement('div');
        item.className = 'create-ad__autocomplete-item';
        item.dataset.complexId = complex.ID;

        const name = document.createElement('div');
        name.className = 'create-ad__autocomplete-item-name';
        name.textContent = complex.Name;
        item.appendChild(name);

        if (complex.Address) {
            const address = document.createElement('div');
            address.className = 'create-ad__autocomplete-item-address';
            address.textContent = complex.Address;
            item.appendChild(address);
        }

        if (complex.Metro) {
            const metro = document.createElement('div');
            metro.className = 'create-ad__autocomplete-item-metro';
            metro.textContent = `🚇 ${complex.Metro}`;
            item.appendChild(metro);
        }

        if (complex.StartingPrice) {
            const price = document.createElement('div');
            price.className = 'create-ad__autocomplete-item-price';
            price.textContent = `от ${this.formatPrice(complex.StartingPrice)} руб.`;
            item.appendChild(price);
        }

        this.addEventListener(item, 'mousedown', (e: Event) => {
            e.preventDefault();
            this.selectHousingComplex(complex);
        });

        return item;
    }

    showNoResults(): void {
        const dropdown = this.root!.querySelector('.create-ad__autocomplete-dropdown') as HTMLElement;
        if (!dropdown) return;

        dropdown.innerHTML = '';

        const noResults = document.createElement('div');
        noResults.className = 'create-ad__autocomplete-item create-ad__autocomplete-item--no-results';
        noResults.textContent = 'Жилищные комплексы не найдены';
        dropdown.appendChild(noResults);

        dropdown.style.display = 'block';
    }

    showLoadingMessage(): void {
        const dropdown = this.root!.querySelector('.create-ad__autocomplete-dropdown') as HTMLElement;
        if (!dropdown) return;

        dropdown.innerHTML = '';

        const loading = document.createElement('div');
        loading.className = 'create-ad__autocomplete-item create-ad__autocomplete-item--loading';
        loading.textContent = 'Загрузка списка ЖК...';
        dropdown.appendChild(loading);

        dropdown.style.display = 'block';
    }

    hideAutocompleteDropdown(): void {
        const dropdown = this.root!.querySelector('.create-ad__autocomplete-dropdown') as HTMLElement;
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    selectHousingComplex(complex: HousingComplex): void {
        const input = this.root!.querySelector('input[data-field="complex_name"]') as HTMLInputElement;
        if (input) {
            input.value = complex.Name;
        }

        this.selectedComplex = complex;
        this.hideAutocompleteDropdown();
        this.showSelectedComplexInfo(complex);
        this.clearError();

        const formData: FormData = this.collectFormData();
        formData.complex_name = complex.Name;
        formData.housing_complex = complex.Name;
        formData.housing_complex_id = complex.ID;
        formData.in_housing_complex = true;
        this.dataManager.updateStage2(formData);
    }

    showSelectedComplexInfo(complex: HousingComplex): void {
        const container = this.root!.querySelector('.create-ad__selected-complex') as HTMLElement;
        if (!container) return;

        container.innerHTML = '';
        container.style.display = 'block';

        const info = document.createElement('div');
        info.className = 'create-ad__selected-complex-info';

        const name = document.createElement('div');
        name.className = 'create-ad__selected-complex-name';
        name.textContent = complex.Name;
        info.appendChild(name);

        if (complex.Address) {
            const address = document.createElement('div');
            address.className = 'create-ad__selected-complex-address';
            address.textContent = complex.Address;
            info.appendChild(address);
        }

        if (complex.Metro) {
            const metro = document.createElement('div');
            metro.className = 'create-ad__selected-complex-metro';
            metro.textContent = `Метро: ${complex.Metro}`;
            info.appendChild(metro);
        }

        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'create-ad__selected-complex-clear';
        clearBtn.textContent = '×';
        clearBtn.title = 'Очистить выбор';
        this.addEventListener(clearBtn, 'click', () => this.clearSelectedComplex());

        container.appendChild(info);
        container.appendChild(clearBtn);
    }

    hideSelectedComplexInfo(): void {
        const container = this.root!.querySelector('.create-ad__selected-complex') as HTMLElement;
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }
    }

    clearSelectedComplex(): void {
        const input = this.root!.querySelector('input[data-field="complex_name"]') as HTMLInputElement;
        if (input) {
            input.value = '';
        }

        this.selectedComplex = null;
        this.hideSelectedComplexInfo();
        this.clearError();

        const formData: FormData = this.collectFormData();
        formData.complex_name = null;
        formData.housing_complex = null;
        formData.housing_complex_id = null;
        formData.in_housing_complex = false;
        this.dataManager.updateStage2(formData);
    }

    private restoreComplexSelection(complexName: string): void {
        if (!this.complexesLoaded) {
            this.pendingComplexRestoration = complexName;
            return;
        }

        const complex = this.allHousingComplexes.find(c => c.Name === complexName);
        if (complex) {
            this.selectedComplex = complex;
            this.showSelectedComplexInfo(complex);

            const input = this.root!.querySelector('input[data-field="complex_name"]') as HTMLInputElement;
            if (input) {
                input.value = complex.Name;
            }
        }
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('ru-RU').format(price);
    }

    private injectAutocompleteStyles(): void {
        if (document.querySelector('#autocomplete-styles')) return;

        const styles = `
            .create-ad__autocomplete-container {
                position: relative;
                width: 100%;
            }

            .create-ad__input--autocomplete {
                width: 100%;
                box-sizing: border-box;
            }

            .create-ad__autocomplete-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-top: none;
                border-radius: 0 0 4px 4px;
                max-height: 400px;
                overflow-y: auto;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .create-ad__autocomplete-item {
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                transition: background-color 0.2s;
            }

            .create-ad__autocomplete-item:hover {
                background-color: #f8f9fa;
            }

            .create-ad__autocomplete-item:last-child {
                border-bottom: none;
            }

            .create-ad__autocomplete-item--no-results {
                color: #6c757d;
                cursor: default;
                font-style: italic;
                text-align: center;
            }

            .create-ad__autocomplete-item--loading {
                color: #6c757d;
                cursor: default;
                text-align: center;
            }

            .create-ad__autocomplete-item--no-results:hover,
            .create-ad__autocomplete-item--loading:hover {
                background-color: white;
            }

            .create-ad__autocomplete-item-name {
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
            }

            .create-ad__autocomplete-item-address {
                font-size: 14px;
                color: #666;
                margin-bottom: 2px;
            }

            .create-ad__autocomplete-item-metro {
                font-size: 13px;
                color: #007bff;
                margin-bottom: 2px;
            }

            .create-ad__autocomplete-item-price {
                font-size: 12px;
                color: #28a745;
                font-weight: 500;
            }

            .create-ad__autocomplete-more-results {
                padding: 8px 16px;
                font-size: 12px;
                color: #6c757d;
                text-align: center;
                border-top: 1px solid #f0f0f0;
                background-color: #f8f9fa;
            }

            .create-ad__selected-complex {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                padding: 12px;
                margin-top: 8px;
            }

            .create-ad__selected-complex-info {
                flex: 1;
            }

            .create-ad__selected-complex-name {
                font-weight: 600;
                color: #333;
                margin-bottom: 4px;
            }

            .create-ad__selected-complex-address {
                font-size: 14px;
                color: #666;
                margin-bottom: 2px;
            }

            .create-ad__selected-complex-metro {
                font-size: 13px;
                color: #007bff;
            }

            .create-ad__selected-complex-clear {
                background: none;
                border: none;
                font-size: 18px;
                color: #6c757d;
                cursor: pointer;
                padding: 0 4px;
                margin-left: 8px;
                line-height: 1;
            }

            .create-ad__selected-complex-clear:hover {
                color: #dc3545;
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.id = 'autocomplete-styles';
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }

    handleComplexToggle(value: string): void {
        const yesButton = this.root!.querySelector('[data-value="yes"]') as HTMLButtonElement;
        const noButton = this.root!.querySelector('[data-value="no"]') as HTMLButtonElement;
        const complexNameBlock = this.root!.querySelector('#complex-name-block') as HTMLElement;

        if (value === 'yes') {
            yesButton.classList.add('active');
            noButton.classList.remove('active');
            if (complexNameBlock) {
                complexNameBlock.style.display = 'block';
            }
        } else {
            noButton.classList.add('active');
            yesButton.classList.remove('active');
            if (complexNameBlock) {
                complexNameBlock.style.display = 'none';
            }
            this.hideAutocompleteDropdown();
            this.hideSelectedComplexInfo();
            this.selectedComplex = null;

            const formData: FormData = this.collectFormData();
            formData.complex_name = null;
            formData.housing_complex = null;
            formData.housing_complex_id = null;
            formData.in_housing_complex = false;
            this.dataManager.updateStage2(formData);
        }

        const formData: FormData = this.collectFormData();
        formData.complex_status = value;
        formData.in_housing_complex = value === 'yes';

        this.dataManager.updateStage2(formData);
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

        this.addEventListener(input, 'input', () => {
            this.clearError();
            this.saveFormData();
            this.updateCurrentAddress(input.value);
        });

        this.addEventListener(input, 'blur', () => {
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

        this.addEventListener(input, 'input', () => {
            this.clearError();
            this.saveFormData();
        });

        this.addEventListener(input, 'blur', () => {
            this.validateAndSave();
        });

        group.appendChild(label);
        group.appendChild(input);
        return group;
    }

    validateAndSave(): void {
        const formData: FormData = this.collectFormData();
        const validation = this.validateFormData(formData);

        if (!validation.isValid) {
            this.showError(validation.message!);
            return;
        }

        this.clearError();
        this.saveFormData();
    }

    validateFormData(formData: FormData): { isValid: boolean; message?: string } {
        if (formData.floor !== null && formData.total_floors !== null) {
            if (formData.floor < 0) {
                return { isValid: false, message: 'Этаж не может быть отрицательным числом' };
            }

            if (formData.total_floors !== null && formData.total_floors <= 0) {
                return { isValid: false, message: 'Общее количество этажей должно быть положительным числом' };
            }

            if (formData.floor > formData.total_floors) {
                return { isValid: false, message: 'Этаж не может быть больше общего количества этажей в доме' };
            }

            if (formData.floor === 0 && formData.total_floors > 0) {
                return { isValid: false, message: 'Этаж 0 обычно не используется. Используйте 1 для первого этажа.' };
            }
        }

        if (formData.complex_status === 'yes' && (!formData.complex_name || formData.complex_name.trim() === '')) {
            return { isValid: false, message: 'Введите название жилищного комплекса' };
        }

        return { isValid: true };
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

        const yesButton = this.root!.querySelector('[data-value="yes"]') as HTMLButtonElement;
        const noButton = this.root!.querySelector('[data-value="no"]') as HTMLButtonElement;

        if (yesButton && yesButton.classList.contains('active')) {
            formData.complex_status = 'yes';
            formData.in_housing_complex = true;
        } else if (noButton && noButton.classList.contains('active')) {
            formData.complex_status = 'no';
            formData.in_housing_complex = false;
        } else {
            formData.complex_status = 'no';
            formData.in_housing_complex = false;
        }

        if (this.selectedComplex) {
            formData.complex_name = this.selectedComplex.Name;
            formData.housing_complex = this.selectedComplex.Name;
            formData.housing_complex_id = this.selectedComplex.ID;
        } else if (formData.complex_status === 'yes' && formData.complex_name) {
            formData.housing_complex = formData.complex_name;
        } else {
            formData.housing_complex = null;
            formData.housing_complex_id = null;
        }

        return formData;
    }

    saveFormData(): void {
        const formData: FormData = this.collectFormData();
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

        let complexStatus = currentData.complex_status;

        if (!complexStatus) {
            if (currentData.housing_complex || currentData.in_housing_complex) {
                complexStatus = 'yes';
            } else {
                complexStatus = 'no';
            }
        }

        this.handleComplexToggle(complexStatus);

        if (complexStatus === 'yes' && currentData.housing_complex) {
            this.restoreComplexSelection(currentData.housing_complex);
        }

        if (currentData.address) {
            this.currentAddress = currentData.address;
        }
        
        // Карта инициализируется всегда, независимо от наличия адреса
        this.initMap();
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
            this.addEventListener(back, 'click', () => {
                this.saveFormData();
            });
            group.appendChild(back);
        }

        if (next) {
            const nextBtn = document.createElement('button');
            nextBtn.className = 'create-ad__nav-button create-ad__nav-button_next';
            nextBtn.textContent = 'Дальше';
            nextBtn.dataset.action = 'next';
            this.addEventListener(nextBtn, 'click', () => {
                const validation = this.validateFormData(this.collectFormData());
                if (!validation.isValid) {
                    this.showError(validation.message!);
                    return;
                }
                this.saveFormData();
            });
            group.appendChild(nextBtn);
        }

        nav.appendChild(group);
        return nav;
    }

    updateCurrentAddress(address: string): void {
        this.currentAddress = address;

        if (this.updateMapTimeout) {
            clearTimeout(this.updateMapTimeout);
        }

        this.updateMapTimeout = window.setTimeout(() => {
            this.updateMapWithAddress();
        }, 500);
    }

    async initMap(): Promise<void> {
        // Всегда показываем карту, даже если адрес не введен
        try {
            if (this.currentAddress && this.currentAddress.trim().length >= 5) {
                // Если есть адрес, используем YandexMapService для показа маркера
                await this.updateMapWithAddress();
            } else {
                // Если адреса нет или он слишком короткий, показываем пустую карту
                await this.initEmptyMap();
            }
        } catch (error) {
            // В случае ошибки показываем пустую карту
            await this.initEmptyMap();
        }
    }

    private async updateMapWithAddress(): Promise<void> {
        if (!this.currentAddress || this.currentAddress.trim().length < 5) {
            await this.initEmptyMap();
            return;
        }

        try {
            // Сначала уничтожаем предыдущую карту
            await this.destroyCurrentMap();

            const { YandexMapService } = await import('../../../utils/YandexMapService.js');
            await YandexMapService.initMap('yandex-create-map', this.currentAddress);
            this.mapInitialized = true;
        } catch (error) {
            console.error('Error updating map with address:', error);
            await this.initEmptyMap();
        }
    }

    private async destroyCurrentMap(): Promise<void> {
        try {
            const { YandexMapService } = await import('../../../utils/YandexMapService.js');
            YandexMapService.destroyMap();
        } catch (error) {
            // Игнорируем ошибки при уничтожении карты
        }

        if (this.emptyMapInstance) {
            try {
                this.emptyMapInstance.destroy();
            } catch (error) {
                // Игнорируем ошибки
            }
            this.emptyMapInstance = null;
        }
    }

    private async initEmptyMap(): Promise<void> {
        if (!window.ymaps3) {
            const mapContainer = document.getElementById('yandex-create-map');
            if (mapContainer) {
                mapContainer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 14px; text-align: center; padding: 20px; background: #f5f5f5;">
                        Карта временно недоступна
                    </div>
                `;
            }
            return;
        }

        try {
            await this.destroyCurrentMap();
            await ymaps3.ready;

            const container = document.getElementById('yandex-create-map');
            if (!container) {
                return;
            }

            // Очищаем контейнер
            container.innerHTML = '';

            const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer} = ymaps3;

            // Создаем карту с центром в Москве
            this.emptyMapInstance = new YMap(
                container,
                {
                    location: {
                        center: [37.6173, 55.7558],
                        zoom: 10
                    }
                }
            );

            // Добавляем слои
            this.emptyMapInstance.addChild(new YMapDefaultSchemeLayer());
            this.emptyMapInstance.addChild(new YMapDefaultFeaturesLayer());

        } catch (error) {
            const mapContainer = document.getElementById('yandex-create-map');
            if (mapContainer) {
                mapContainer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 14px; text-align: center; padding: 20px;">
                        Не удалось загрузить карту
                    </div>
                `;
            }
        }
    }

    addEventListener(element: EventTarget, event: string, handler: EventListenerOrEventListenerObject): void {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    cleanup(): void {
        this.eventListeners.forEach(({ element, event, handler }) =>
            element.removeEventListener(event, handler)
        );
        this.eventListeners = [];

        if (this.complexSearchTimeout) {
            clearTimeout(this.complexSearchTimeout);
        }

        if (this.updateMapTimeout) {
            clearTimeout(this.updateMapTimeout);
        }

        // Уничтожаем карты
        this.destroyCurrentMap();
    }
}