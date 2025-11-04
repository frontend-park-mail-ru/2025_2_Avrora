export class OfferCreateFourthStage {
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

        this.root.appendChild(this.createProgress('4 этап. Цена', 80, 80));

        const block = document.createElement('div');
        block.className = 'create-ad__choice-block';

        const group = document.createElement('div');
        group.className = 'create-ad__form-row';

        const leftColumn = document.createElement('div');
        leftColumn.className = 'create-ad__form-column';

        leftColumn.appendChild(this.createFormGroup('Цена, руб', 'price', 'number'));
        leftColumn.appendChild(this.createFormGroup('Залог, руб', 'deposit', 'number'));
        leftColumn.appendChild(this.createFormGroup('Комиссия, %', 'commission', 'number'));

        const rightColumn = document.createElement('div');
        rightColumn.className = 'create-ad__form-column';

        const currentData = this.dataManager.getData();
        if (currentData.offer_type === 'rent') {
            rightColumn.appendChild(this.createRentalPeriodGroup());
        }

        group.appendChild(leftColumn);
        group.appendChild(rightColumn);
        block.appendChild(group);
        this.root.appendChild(block);

        this.root.appendChild(this.createNav({ prev: true, next: true }));

        this.restoreFormData();

        return this.root;
    }

    createProgress(titleText, value, ariaNow) {
        const progress = document.createElement('div');
        progress.className = 'create-ad__progress';

        const title = document.createElement('h1');
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

    createFormGroup(labelText, fieldName, type = 'text') {
        const group = document.createElement('div');
        group.className = 'create-ad__form-group';

        const label = document.createElement('h1');
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

        group.appendChild(label);
        group.appendChild(input);
        return group;
    }

    createRentalPeriodGroup() {
        const group = document.createElement('div');
        group.className = 'create-ad__form-group';

        const label = document.createElement('h1');
        label.className = 'create-ad__form-label';
        label.textContent = 'Срок аренды';

        const select = document.createElement('select');
        select.className = 'create-ad__input';
        select.dataset.field = 'rental_period';

        const options = [
            { value: '', text: 'Выберите срок' },
            { value: 'daily', text: 'Посуточно' },
            { value: 'weekly', text: 'Понедельно' },
            { value: 'monthly', text: 'Помесячно' },
            { value: 'yearly', text: 'Погодно' }
        ];

        options.forEach(optionData => {
            const option = document.createElement('option');
            option.value = optionData.value;
            option.textContent = optionData.text;
            select.appendChild(option);
        });

        select.addEventListener('change', () => {
            this.saveFormData();
        });

        group.appendChild(label);
        group.appendChild(select);
        return group;
    }

    saveFormData() {
        const formData = {};

        const inputs = this.root.querySelectorAll('.create-ad__input[data-field]');
        inputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                formData[input.dataset.field] = input.type === 'number' ?
                    parseInt(value) : value;
            } else {
                formData[input.dataset.field] = null;
            }
        });

        const selects = this.root.querySelectorAll('select[data-field]');
        selects.forEach(select => {
            if (select.value) {
                formData[select.dataset.field] = select.value;
            } else {
                formData[select.dataset.field] = null;
            }
        });

        console.log('Saving stage 4 data:', formData);
        this.dataManager.updateStage4(formData);
    }

    restoreFormData() {
        const currentData = this.dataManager.getData();
        console.log('Restoring stage 4 data:', currentData);

        const inputs = this.root.querySelectorAll('.create-ad__input[data-field]');
        inputs.forEach(input => {
            const fieldName = input.dataset.field;
            if (currentData[fieldName] !== undefined && currentData[fieldName] !== null) {
                input.value = currentData[fieldName];
            }
        });

        const selects = this.root.querySelectorAll('select[data-field]');
        selects.forEach(select => {
            const fieldName = select.dataset.field;
            if (currentData[fieldName] !== undefined && currentData[fieldName] !== null) {
                select.value = currentData[fieldName];
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