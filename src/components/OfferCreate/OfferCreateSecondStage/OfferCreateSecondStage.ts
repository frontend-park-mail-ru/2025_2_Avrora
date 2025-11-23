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

        const complexNameInput = this.createInput('Название ЖК', 'complex_name');
        complexNameInput.required = false;

        this.addEventListener(complexNameInput, 'input', () => {
            this.clearError();
            this.saveComplexData();
        });

        complexNameBlock.appendChild(complexNameTitle);
        complexNameBlock.appendChild(complexNameInput);
        this.root.appendChild(complexNameBlock);

        this.mapContainer = document.createElement('div');
        this.mapContainer.className = 'create-ad__map';
        this.mapContainer.id = 'yandex-create-map';
        this.root.appendChild(this.mapContainer);

        this.root.appendChild(this.createNav({ prev: true, next: true }));

        this.restoreFormData();

        setTimeout(() => {
            this.initMap();
        }, 0);

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

        if (formData.complex_status === 'yes' && formData.complex_name) {
            formData.housing_complex = formData.complex_name;
        } else {
            formData.housing_complex = null;
        }

        return formData;
    }

    saveFormData(): void {
        const formData: FormData = this.collectFormData();
        this.dataManager.updateStage2(formData);
    }

    saveComplexData(): void {
        const formData: FormData = this.collectFormData();

        const complexData = {
            complex_status: formData.complex_status,
            in_housing_complex: formData.in_housing_complex,
            complex_name: formData.complex_name,
            housing_complex: formData.housing_complex
        };

        this.dataManager.updateStage2(complexData);
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

        if (!complexStatus && currentData.in_housing_complex !== undefined) {
            complexStatus = currentData.in_housing_complex ? 'yes' : 'no';
        } else if (!complexStatus) {
            complexStatus = 'no';
        }

        if (complexStatus === 'yes') {
            this.handleComplexToggle('yes');

            if (currentData.housing_complex && !currentData.complex_name) {
                const complexNameInput = this.root!.querySelector('input[data-field="complex_name"]') as HTMLInputElement;
                if (complexNameInput) {
                    complexNameInput.value = currentData.housing_complex;
                }
                this.dataManager.updateStage2({
                    complex_name: currentData.housing_complex,
                    housing_complex: currentData.housing_complex
                });
            }
        } else {
            this.handleComplexToggle('no');
        }

        if (currentData.address) {
            this.currentAddress = currentData.address;
        }
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
        }

        const formData: FormData = this.collectFormData();

        formData.complex_status = value;
        formData.in_housing_complex = value === 'yes';

        if (value === 'no') {
            formData.complex_name = null;
            formData.housing_complex = null;

            const complexNameInput = this.root!.querySelector('input[data-field="complex_name"]') as HTMLInputElement;
            if (complexNameInput) {
                complexNameInput.value = '';
            }
        } else if (value === 'yes') {
            const complexNameInput = this.root!.querySelector('input[data-field="complex_name"]') as HTMLInputElement;
            if (complexNameInput && complexNameInput.value) {
                formData.housing_complex = complexNameInput.value;
            }
        }

        this.dataManager.updateStage2(formData);
    }

    updateCurrentAddress(address: string): void {
        this.currentAddress = address;
        this.initMap();
    }

    async initMap(): Promise<void> {
        if (!window.ymaps) {
            return;
        }

        try {
            await new Promise(resolve => {
                if (window.ymaps.ready) {
                    resolve(true);
                } else {
                    window.ymaps.ready(resolve);
                }
            });

            const container = document.getElementById('yandex-create-map');
            if (!container) {
                return;
            }

            if ((window as any).createAdMapInstance) {
                (window as any).createAdMapInstance.destroy();
                (window as any).createAdMapInstance = null;
            }

            (window as any).createAdMapInstance = new ymaps.Map('yandex-create-map', {
                center: [55.75, 37.62],
                zoom: 10,
                controls: ['zoomControl', 'fullscreenControl']
            }, {
                suppressMapOpenBlock: true,
                balloonMaxWidth: 200,
                geolocationControlSize: 'large',
                geolocationControlPosition: { top: '50px', right: '10px' },
                zoomControlSize: 'small'
            });

            const mapInstance = (window as any).createAdMapInstance;

            if (this.currentAddress.trim()) {
                const geocodeResult = await ymaps.geocode(this.currentAddress);
                const firstGeoObject = geocodeResult.geoObjects.get(0);

                if (firstGeoObject) {
                    const coords = firstGeoObject.geometry.getCoordinates();
                    mapInstance.setCenter(coords, 16);

                    const customIcon = new ymaps.Placemark(coords, {
                        hintContent: this.currentAddress,
                        balloonContent: this.currentAddress
                    }, {
                        iconLayout: 'default#image',
                        iconImageHref: '/images/map-marker.svg',
                        iconImageSize: [30, 40],
                        iconImageOffset: [-15, -40]
                    });

                    mapInstance.geoObjects.add(customIcon);
                }
            }

        } catch (error) {

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

        if ((window as any).createAdMapInstance) {
            (window as any).createAdMapInstance.destroy();
            (window as any).createAdMapInstance = null;
        }
    }
}