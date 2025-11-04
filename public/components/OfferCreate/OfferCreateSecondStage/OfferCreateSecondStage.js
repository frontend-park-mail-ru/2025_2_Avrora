// OfferCreateSecondStage.js
export class OfferCreateSecondStage {
    constructor({ state, app, dataManager, isEditing = false, editOfferId = null } = {}) {
        this.state = state;
        this.app = app;
        this.dataManager = dataManager;
        this.isEditing = isEditing;
        this.editOfferId = editOfferId;
        this.root = null;
    }

    render() {
        this.root = document.createElement('div');
        this.root.className = 'create-ad';

        this.root.appendChild(this.createProgress('2 этап. Расположение', 40, 40));

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

        // Заменяем карту на плейсхолдер
        const mapSection = document.createElement('div');
        mapSection.className = 'create-ad__section';

        const mapTitle = document.createElement('h2');
        mapTitle.className = 'create-ad__form-label';
        mapTitle.textContent = 'Местоположение на карте';
        mapSection.appendChild(mapTitle);

        const mapPlaceholder = document.createElement('div');
        mapPlaceholder.className = 'map-placeholder';
        mapPlaceholder.innerHTML = `
            <div class="map-placeholder__icon">🗺️</div>
            <h3 class="map-placeholder__title">Карта находится в разработке</h3>
            <p class="map-placeholder__description">
                Функционал карты будет доступен в ближайшее время.
            </p>
        `;
        mapSection.appendChild(mapPlaceholder);

        this.root.appendChild(mapSection);

        this.root.appendChild(this.createNav({ prev: true, next: true }));

        this.restoreFormData();

        return this.root;
    }

    createProgress(titleText, value, ariaNow) {
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

    createInput(placeholder, fieldName) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'create-ad__input';
        input.placeholder = placeholder;
        input.dataset.field = fieldName;
        input.required = fieldName === 'address';

        input.addEventListener('input', () => {
            this.saveFormData();
        });

        input.addEventListener('blur', () => {
            this.saveFormData();
        });

        return input;
    }

    createFormGroup(labelText, fieldName, type = 'text') {
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

        input.addEventListener('input', () => {
            this.saveFormData();
        });

        input.addEventListener('blur', () => {
            this.saveFormData();
        });

        group.appendChild(label);
        group.appendChild(input);
        return group;
    }

    saveFormData() {
        const formData = {};

        const inputs = this.root.querySelectorAll('.create-ad__input[data-field]');
        inputs.forEach(input => {
            const value = input.value.trim();
            const fieldName = input.dataset.field;

            if (value) {
                formData[fieldName] = input.type === 'number' ?
                    parseInt(value) || null : value;
            } else {
                formData[fieldName] = null;
            }
        });

        console.log('Saving stage 2 data:', formData);
        this.dataManager.updateStage2(formData);
    }

    restoreFormData() {
        const currentData = this.dataManager.getData();
        console.log('Restoring stage 2 data:', currentData);

        const inputs = this.root.querySelectorAll('.create-ad__input[data-field]');
        inputs.forEach(input => {
            const fieldName = input.dataset.field;
            if (currentData[fieldName] !== undefined && currentData[fieldName] !== null) {
                input.value = currentData[fieldName];
            }
        });
    }

    createNav({ prev = false, next = false } = {}) {
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