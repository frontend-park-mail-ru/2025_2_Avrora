interface StageOptions {
    state: any;
    app: any;
    dataManager: any;
    isEditing?: boolean;
    editOfferId?: string | null;
}

export class OfferCreateFirstStage {
    state: any;
    app: any;
    dataManager: any;
    isEditing: boolean;
    editOfferId: string | null;
    root: HTMLElement | null;

    constructor({ state, app, dataManager, isEditing = false, editOfferId = null }: StageOptions = {}) {
        this.state = state;
        this.app = app;
        this.dataManager = dataManager;
        this.isEditing = isEditing;
        this.editOfferId = editOfferId;
        this.root = null;
    }

    render(): HTMLElement {
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
                this.makeButton('Квартира', 'property_type', 'apartment'),
                this.makeButton('Дом', 'property_type', 'house')
            ], 'property_type')
        );

        this.root.appendChild(this.createNav({ prev: true, next: true }));

        this.restoreSelectedValues();

        return this.root;
    }

    createProgress(titleText: string, value: number, ariaNow: number): HTMLElement {
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

    createChoiceBlock(titleText: string, buttons: HTMLButtonElement[], fieldName: string): HTMLElement {
        const block = document.createElement('div');
        block.className = 'create-ad__choice-block';

        const title = document.createElement('h1');
        title.className = 'create-ad__form-label';
        title.textContent = titleText;

        const group = document.createElement('div');
        group.className = 'create-ad__choice-group';
        group.dataset.field = fieldName;

        buttons.forEach(button => group.appendChild(button));

        block.appendChild(title);
        block.appendChild(group);
        return block;
    }

    makeButton(text: string, field: string, value: string): HTMLButtonElement {
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
            const group = btn.closest('.create-ad__choice-group');
            if (group) {
                const siblings = group.querySelectorAll('.create-ad__choice-button');
                siblings.forEach(sibling => sibling.classList.remove('active'));
            }

            btn.classList.add('active');

            const update: any = {};
            update[field] = value;
            this.dataManager.updateStage1(update);
        });

        return btn;
    }

    restoreSelectedValues(): void {
        const currentData = this.dataManager.getData();

        ['category', 'offer_type', 'property_type'].forEach(field => {
            const value = currentData[field];
            if (value) {
                const group = this.root!.querySelector(`.create-ad__choice-group[data-field="${field}"]`);
                if (group) {
                    const buttons = group.querySelectorAll('.create-ad__choice-button');
                    buttons.forEach(button => {
                        button.classList.remove('active');
                        if ((button as HTMLElement).dataset.value === value) {
                            button.classList.add('active');
                        }
                    });
                }
            }
        });
    }

    createNav({ prev = false, next = false, publish = false }: { prev?: boolean; next?: boolean; publish?: boolean } = {}): HTMLElement {
        const nav = document.createElement('div');
        nav.className = 'create-ad__nav';

        const group = document.createElement('div');
        group.className = 'create-ad__nav-group';

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