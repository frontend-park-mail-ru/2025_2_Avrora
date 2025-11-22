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
    private mapContainer: HTMLElement | null; 
    private currentAddress: string = ''; 

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
        yesButton.addEventListener('click', () => this.handleComplexToggle('yes'));

        const noButton = document.createElement('button');
        noButton.className = 'create-ad__choice-button';
        noButton.dataset.value = 'no';
        noButton.textContent = 'Нет';
        noButton.addEventListener('click', () => this.handleComplexToggle('no'));

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

        input.addEventListener('input', () => {
            this.clearError();
            this.saveFormData();
            this.updateCurrentAddress(input.value); 
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
        if (!data.address) {
            return { isValid: false, message: 'Введите адрес' };
        }

        const floor = data.floor as number;
        const totalFloors = data.total_floors as number;

        if ((floor !== null && totalFloors === null) || (floor === null && totalFloors !== null)) {
            return { isValid: false, message: 'Заполните оба поля: этаж и количество этажей в доме' };
        }

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

        if (currentData.complex_status === 'yes') {
            this.handleComplexToggle('yes');
        } else if (currentData.complex_status === 'no') {
            this.handleComplexToggle('no');
        }

        if (currentData.complex_name) {
            const complexNameInput = this.root!.querySelector('input[data-field="complex_name"]') as HTMLInputElement;
            if (complexNameInput) {
                complexNameInput.value = currentData.complex_name;
            }
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

    handleComplexToggle(value: string): void {
        const yesButton = this.root!.querySelector('[data-value="yes"]') as HTMLButtonElement;
        const noButton = this.root!.querySelector('[data-value="no"]') as HTMLButtonElement;
        const complexNameBlock = this.root!.getElementById('complex-name-block');

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

        const formData = this.collectFormData();
        formData.complex_status = value;
        this.dataManager.updateStage2(formData);
    }

    updateCurrentAddress(address: string): void {
        this.currentAddress = address;
        this.initMap(); 
    }

    async initMap(): Promise<void> {
        if (!window.ymaps) {
            console.error('Яндекс.Карты не загружены');
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
                console.error('Контейнер для карты не найден');
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
                } else {
                    console.warn(`Адрес "${this.currentAddress}" не найден на карте`);
                }
            }

        } catch (error) {
            console.error('Ошибка при инициализации карты:', error);
        }
    }

    cleanup(): void {
        if ((window as any).createAdMapInstance) {
            (window as any).createAdMapInstance.destroy();
            (window as any).createAdMapInstance = null;
        }

        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        if (this.root) {
            this.root.remove();
        }
    }
}