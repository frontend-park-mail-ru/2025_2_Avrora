interface StageOptions {
    state: any;
    app: any;
    dataManager: any;
    isEditing?: boolean;
    editOfferId?: string | null;
}

export class OfferCreateThirdStage {
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

    createProgress(titleText: string, value: number, ariaNow: number): HTMLElement {
        const progress = document.createElement('div');
        progress.className = 'create-ad__progress';

        const title = document.createElement('h1');
        title.className = 'create-ad__progress-title';
        title.textContent = this.isEditing ? titleText.replace('создания', 'редактирования') : titleText;

        const barWrap = document.createElement('div');
        barWrap.className = 'create-ad__progress-bar';
        barWrap.setAttribute('role', 'progressbar');
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

    createInputBlock(titleText: string, fieldName: string, type: string = 'text'): HTMLElement {
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
        input.min = type === 'number' ? '0' : undefined;
        input.step = type === 'number' ? '0.01' : undefined;

        input.addEventListener('input', () => this.saveFormData());

        group.appendChild(input);
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
        if (String(currentData[field]) === value) {
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
            if (field === 'rooms') {
                update[field] = parseInt(value) || 0;
            } else {
                update[field] = value;
            }
            this.dataManager.updateStage3(update);
        });

        return btn;
    }

    saveFormData(): void {
        const formData: any = {};
        const inputs = this.root!.querySelectorAll('.create-ad__input[data-field]');
        inputs.forEach(input => {
            const value = (input as HTMLInputElement).value.trim();
            const fieldName = (input as HTMLElement).dataset.field!;

            if (value) {
                formData[fieldName] = (input as HTMLInputElement).type === 'number' ?
                    parseFloat(value) || null : value;
            } else {
                formData[fieldName] = null;
            }
        });

        const activeButtons = this.root!.querySelectorAll('.create-ad__choice-button.active');
        activeButtons.forEach(button => {
            const fieldName = (button as HTMLElement).dataset.field!;
            const value = (button as HTMLElement).dataset.value!;

            if (fieldName === 'rooms') {
                formData[fieldName] = parseInt(value) || 0;
            } else {
                formData[fieldName] = value;
            }
        });

        this.dataManager.updateStage3(formData);
    }

    restoreFormData(): void {
        const currentData = this.dataManager.getData();

        const roomButtons = this.root!.querySelectorAll('.create-ad__choice-button[data-field="rooms"]');
        roomButtons.forEach(button => button.classList.remove('active'));

        if (currentData.rooms !== undefined && currentData.rooms !== null) {
            const button = this.root!.querySelector(`.create-ad__choice-button[data-field="rooms"][data-value="${String(currentData.rooms)}"]`) as HTMLButtonElement;
            if (button) {
                button.classList.add('active');
            }
        }

        ['area', 'living_area', 'kitchen_area'].forEach(field => {
            const input = this.root!.querySelector(`.create-ad__input[data-field="${field}"]`) as HTMLInputElement;
            if (input && currentData[field] != null) {
                input.value = String(currentData[field]);
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