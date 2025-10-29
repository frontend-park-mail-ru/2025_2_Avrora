export class OfferCreateThirdStage {
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

        this.root.appendChild(this.createProgress('3 этап. Параметры', 60, 60));

        this.root.appendChild(
            this.createChoiceBlock('Количество комнат', [
                this.makeButton('Студия', 'rooms', '0'),
                this.makeButton('1', 'rooms', '1'),
                this.makeButton('2', 'rooms', '2'),
                this.makeButton('3', 'rooms', '3'),
                this.makeButton('4+', 'rooms', '4')
            ], 'rooms')
        );

        this.root.appendChild(this.createInputBlock('Общая площадь, м²', 'area', 'number'));
        this.root.appendChild(this.createInputBlock('Жилая площадь, м²', 'living_area', 'number'));
        this.root.appendChild(this.createInputBlock('Площадь кухни, м²', 'kitchen_area', 'number'));

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

    createChoiceBlock(titleText, buttons, fieldName) {
        const block = document.createElement('div');
        block.className = 'create-ad__choice-block';

        const title = document.createElement('h1');
        title.className = 'create-ad__form-label';
        title.textContent = titleText;

        const group = document.createElement('div');
        group.className = 'create-ad__choice-group';

        buttons.forEach((button) => group.appendChild(button));

        block.appendChild(title);
        block.appendChild(group);
        return block;
    }

    createInputBlock(titleText, fieldName, type = 'text') {
        const block = document.createElement('div');
        block.className = 'create-ad__choice-block';

        const title = document.createElement('h1');
        title.className = 'create-ad__form-label';
        title.textContent = titleText;

        const group = document.createElement('div');
        group.className = 'create-ad__choice-group';

        const input = document.createElement('input');
        input.type = type;
        input.className = 'create-ad__input';
        input.placeholder = titleText;
        input.dataset.field = fieldName;

        input.addEventListener('input', () => {
            this.saveFormData();
        });

        group.appendChild(input);
        block.appendChild(title);
        block.appendChild(group);
        return block;
    }

    makeButton(text, field, value) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'create-ad__choice-button';
        btn.textContent = text;
        btn.dataset.field = field;
        btn.dataset.value = value;

        const currentData = this.dataManager.getData();
        if (currentData[field] === value) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
            const siblings = this.root.querySelectorAll(`.create-ad__choice-button[data-field="${field}"]`);
            siblings.forEach(sibling => sibling.classList.remove('active'));

            btn.classList.add('active');

            const update = {};
            update[field] = value;
            this.dataManager.updateStage3(update);

            console.log(`Selected ${field}: ${value}`, this.dataManager.getData());
        });

        return btn;
    }

    saveFormData() {
        const formData = {};

        const inputs = this.root.querySelectorAll('.create-ad__input[data-field]');
        inputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                formData[input.dataset.field] = input.type === 'number' ?
                    parseFloat(value) : value;
            } else {
                formData[input.dataset.field] = null;
            }
        });

        const activeButtons = this.root.querySelectorAll('.create-ad__choice-button.active');
        activeButtons.forEach(button => {
            formData[button.dataset.field] = button.dataset.value;
        });

        console.log('Saving stage 3 data:', formData);
        this.dataManager.updateStage3(formData);
    }

    restoreFormData() {
        const currentData = this.dataManager.getData();
        console.log('Restoring stage 3 data:', currentData);

        const inputs = this.root.querySelectorAll('.create-ad__input[data-field]');
        inputs.forEach(input => {
            const fieldName = input.dataset.field;
            if (currentData[fieldName] !== undefined && currentData[fieldName] !== null) {
                input.value = currentData[fieldName];
            }
        });

        if (currentData.rooms !== undefined && currentData.rooms !== null) {
            const button = this.root.querySelector(`.create-ad__choice-button[data-field="rooms"][data-value="${currentData.rooms}"]`);
            if (button) {
                button.classList.add('active');
                console.log(`Restored rooms: ${currentData.rooms}`);
            }
        }
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