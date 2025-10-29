export class OfferCreateFirstStage {
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

        this.root.appendChild(this.createProgress('1 этап. Тип сделки', 20, 20));

        this.root.appendChild(
            this.createChoiceBlock('Вид недвижимости', [
                this.makeButton('Новостройки', 'category', 'new'),
                this.makeButton('Вторичка', 'category', 'secondary')
            ], 'category')
        );

        this.root.appendChild(
            this.createChoiceBlock('Тип объявления', [
                this.makeButton('Продажа', 'offer_type', 'sale'),
                this.makeButton('Аренда', 'offer_type', 'rent')
            ], 'offer_type')
        );

        this.root.appendChild(
            this.createChoiceBlock('Тип недвижимости', [
                this.makeButton('Квартира', 'property_type', 'flat'),
                this.makeButton('Дом', 'property_type', 'house'),
                this.makeButton('Гараж', 'property_type', 'garage')
            ], 'property_type')
        );

        this.root.appendChild(this.createNav({ prev: true, next: true }));

        this.restoreSelectedValues();

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
            this.dataManager.updateStage1(update);

            console.log(`Selected ${field}: ${value}`, this.dataManager.getData());
        });

        return btn;
    }

    restoreSelectedValues() {
        const currentData = this.dataManager.getData();
        console.log('Restoring values for stage 1:', currentData);

        ['category', 'offer_type', 'property_type'].forEach(field => {
            const value = currentData[field];
            if (value) {
                const button = this.root.querySelector(`.create-ad__choice-button[data-field="${field}"][data-value="${value}"]`);
                if (button) {
                    button.classList.add('active');
                    console.log(`Restored ${field}: ${value}`);
                }
            }
        });
    }

    createNav({ prev = false, next = false, publish = false } = {}) {
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
            const forward = document.createElement('button');
            forward.className = 'create-ad__nav-button create-ad__nav-button_next';
            forward.textContent = 'Дальше';
            forward.dataset.action = 'next';
            group.appendChild(forward);
        }

        if (publish) {
            const pub = document.createElement('button');
            pub.className = 'create-ad__nav-button create-ad__nav-button_publish';
            pub.textContent = 'Опубликовать';
            pub.dataset.action = 'publish';
            group.appendChild(pub);
        }

        nav.appendChild(group);
        return nav;
    }
}