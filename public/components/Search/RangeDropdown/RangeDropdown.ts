// RangeDropdown.ts
interface RangeDropdownOptions {
    parent?: HTMLElement | null;
    placeholder?: string;
    onSelect?: ((value: { from: string; to: string }) => void) | null;
    reuseRoot?: boolean;
    type?: 'price' | 'area';
    validateRange?: boolean;
}

interface RangeValue {
    from: string;
    to: string;
}

export class RangeDropdown {
    private parent: HTMLElement | null;
    private placeholder: string;
    private onSelect: ((value: RangeValue) => void) | null;
    private reuseRoot: boolean;
    private type: 'price' | 'area';
    private validateRange: boolean;

    private isOpen: boolean;
    private valueFrom: string;
    private valueTo: string;

    private root: HTMLElement;
    private button: HTMLButtonElement;
    private content: HTMLDivElement;
    private inputFrom: HTMLInputElement;
    private inputTo: HTMLInputElement;

    private handleDocumentClick: (event: MouseEvent) => void;
    private handleKeyDown: (event: KeyboardEvent) => void;
    private handleButtonClick: (event: MouseEvent) => void;
    private handleInput: (event: Event) => void;
    private handleInputBlur: (event: FocusEvent) => void;
    private handleInputKeyDown: (event: KeyboardEvent) => void;

    constructor({
        parent = null,
        placeholder = 'Цена',
        onSelect = null,
        reuseRoot = false,
        type = 'price',
        validateRange = false
    }: RangeDropdownOptions = {}) {
        this.parent = parent;
        this.placeholder = placeholder;
        this.onSelect = typeof onSelect === 'function' ? onSelect : null;
        this.reuseRoot = Boolean(reuseRoot);
        this.type = type;
        this.validateRange = Boolean(validateRange);

        this.isOpen = false;
        this.valueFrom = '';
        this.valueTo = '';

        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.handleInputKeyDown = this.handleInputKeyDown.bind(this);

        this.createElement();
        if (this.parent && !this.reuseRoot) {
            this.mount(this.parent);
        }
    }

    private createElement(): void {
        if (this.reuseRoot && this.parent) {
            this.root = this.parent;
            this.root.classList.add('dropdown', 'dropdown--range');
            this.root.innerHTML = '';
        } else {
            this.root = document.createElement('div');
            this.root.className = 'dropdown dropdown--range';
        }

        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'dropdown__button';
        this.button.textContent = this.placeholder;
        this.button.setAttribute('aria-haspopup', 'listbox');
        this.button.setAttribute('aria-expanded', 'false');

        this.content = document.createElement('div');
        this.content.className = 'dropdown__content';
        this.content.setAttribute('role', 'listbox');

        this.createRangeInputs();

        this.root.appendChild(this.button);
        this.root.appendChild(this.content);

        this.button.addEventListener('click', this.handleButtonClick);
    }

    private createRangeInputs(): void {
        this.content.innerHTML = '';

        const rangeContainer = document.createElement('div');
        rangeContainer.className = 'dropdown__range';

        const fromWrapper = document.createElement('div');
        fromWrapper.className = 'dropdown__input-wrapper';

        const fromLabel = document.createElement('span');
        fromLabel.className = 'dropdown__label';
        fromLabel.textContent = 'от';

        this.inputFrom = document.createElement('input');
        this.inputFrom.type = 'text';
        this.inputFrom.className = 'dropdown__input';
        this.inputFrom.placeholder = '0';
        this.inputFrom.value = this.valueFrom;
        this.inputFrom.addEventListener('input', this.handleInput);
        this.inputFrom.addEventListener('blur', this.handleInputBlur);
        this.inputFrom.addEventListener('keydown', this.handleInputKeyDown);

        const fromUnit = document.createElement('span');
        fromUnit.className = 'dropdown__unit';
        fromUnit.textContent = this.type === 'price' ? '₽' : 'м²';

        fromWrapper.appendChild(fromLabel);
        fromWrapper.appendChild(this.inputFrom);
        fromWrapper.appendChild(fromUnit);

        const separator = document.createElement('span');
        separator.className = 'dropdown__separator';
        separator.textContent = '–';

        const toWrapper = document.createElement('div');
        toWrapper.className = 'dropdown__input-wrapper';

        const toLabel = document.createElement('span');
        toLabel.className = 'dropdown__label';
        toLabel.textContent = 'до';

        this.inputTo = document.createElement('input');
        this.inputTo.type = 'text';
        this.inputTo.className = 'dropdown__input';
        this.inputTo.placeholder = '0';
        this.inputTo.value = this.valueTo;
        this.inputTo.addEventListener('input', this.handleInput);
        this.inputTo.addEventListener('blur', this.handleInputBlur);
        this.inputTo.addEventListener('keydown', this.handleInputKeyDown);

        const toUnit = document.createElement('span');
        toUnit.className = 'dropdown__unit';
        toUnit.textContent = this.type === 'price' ? '₽' : 'м²';

        toWrapper.appendChild(toLabel);
        toWrapper.appendChild(this.inputTo);
        toWrapper.appendChild(toUnit);

        rangeContainer.appendChild(fromWrapper);
        rangeContainer.appendChild(separator);
        rangeContainer.appendChild(toWrapper);
        this.content.appendChild(rangeContainer);
    }

    private handleButtonClick(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.toggle();
    }

    private handleInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        // Разрешаем только цифры
        input.value = input.value.replace(/[^\d]/g, '');

        if (input === this.inputFrom) {
            this.valueFrom = input.value;
        } else {
            this.valueTo = input.value;
        }

        // Валидация диапазона в реальном времени
        if (this.validateRange && this.valueFrom && this.valueTo) {
            this.validateAndSwapValues();
        }
    }

    private handleInputBlur(event: FocusEvent): void {
        // Валидация при потере фокуса
        if (this.validateRange && (this.valueFrom || this.valueTo)) {
            this.validateAndSwapValues();
        }

        if (this.valueFrom || this.valueTo) {
            this.applyValues();
        }
    }

    private handleInputKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            // Валидация перед закрытием
            if (this.validateRange && (this.valueFrom || this.valueTo)) {
                this.validateAndSwapValues();
            }
            this.close();
        }
    }

    private validateAndSwapValues(): void {
        const fromNum = this.valueFrom ? parseInt(this.valueFrom) : 0;
        const toNum = this.valueTo ? parseInt(this.valueTo) : 0;

        if (fromNum > 0 && toNum > 0 && fromNum > toNum) {
            // Меняем значения местами
            [this.valueFrom, this.valueTo] = [this.valueTo, this.valueFrom];
            this.inputFrom.value = this.valueFrom;
            this.inputTo.value = this.valueTo;
        }
    }

    private applyValues(): void {
        this.updateButtonText();

        if (this.valueFrom || this.valueTo) {
            this.root.classList.add('dropdown--active');
        } else {
            this.root.classList.remove('dropdown--active');
        }

        if (this.onSelect) {
            this.onSelect({
                from: this.valueFrom,
                to: this.valueTo
            });
        }
    }

    private updateButtonText(): void {
        if (this.valueFrom && this.valueTo) {
            this.button.textContent = `${this.formatValue(this.valueFrom)}–${this.formatValue(this.valueTo)} ${this.type === 'price' ? '₽' : 'м²'}`;
        } else if (this.valueFrom) {
            this.button.textContent = `от ${this.formatValue(this.valueFrom)} ${this.type === 'price' ? '₽' : 'м²'}`;
        } else if (this.valueTo) {
            this.button.textContent = `до ${this.formatValue(this.valueTo)} ${this.type === 'price' ? '₽' : 'м²'}`;
        } else {
            this.button.textContent = this.placeholder;
        }
    }

    private formatValue(value: string): string {
        if (!value) return '';
        if (this.type === 'price') {
            return new Intl.NumberFormat('ru-RU').format(Number(value));
        }
        return value;
    }

    open(): void {
        if (this.isOpen) return;
        this.isOpen = true;
        this.root.classList.add('dropdown--open');
        this.button.setAttribute('aria-expanded', 'true');

        setTimeout(() => {
            if (this.inputFrom) {
                this.inputFrom.focus();
            }
        }, 100);

        document.addEventListener('click', this.handleDocumentClick, { capture: true });
        document.addEventListener('keydown', this.handleKeyDown);
    }

    close(): void {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.root.classList.remove('dropdown--open');
        this.button.setAttribute('aria-expanded', 'false');

        if (this.valueFrom || this.valueTo) {
            this.applyValues();
        }

        document.removeEventListener('click', this.handleDocumentClick, { capture: true });
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    toggle(): void {
        this.isOpen ? this.close() : this.open();
    }

    private handleDocumentClick(event: MouseEvent): void {
        if (!this.root.contains(event.target as Node)) {
            this.close();
        }
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    getValue(): RangeValue {
        return {
            from: this.valueFrom,
            to: this.valueTo
        };
    }

    setValue(from: string = '', to: string = ''): void {
        this.valueFrom = from;
        this.valueTo = to;
        if (this.inputFrom) this.inputFrom.value = from;
        if (this.inputTo) this.inputTo.value = to;

        if (this.validateRange && from && to) {
            this.validateAndSwapValues();
        }

        this.updateButtonText();
        
        if (from || to) {
            this.root.classList.add('dropdown--active');
        } else {
            this.root.classList.remove('dropdown--active');
        }
    }

    clear(): void {
        this.valueFrom = '';
        this.valueTo = '';
        if (this.inputFrom) this.inputFrom.value = '';
        if (this.inputTo) this.inputTo.value = '';
        this.button.textContent = this.placeholder;
        this.root.classList.remove('dropdown--active');

        if (this.onSelect) {
            this.onSelect({ from: '', to: '' });
        }
    }

    setPlaceholder(text: string): void {
        this.placeholder = text;
        if (!this.valueFrom && !this.valueTo) {
            this.button.textContent = text;
        }
    }

    mount(parent: HTMLElement): void {
        if (parent) {
            parent.appendChild(this.root);
        }
    }

    destroy(): void {
        this.close();
        if (this.button) {
            this.button.removeEventListener('click', this.handleButtonClick);
        }
        if (this.inputFrom) {
            this.inputFrom.removeEventListener('input', this.handleInput);
            this.inputFrom.removeEventListener('blur', this.handleInputBlur);
            this.inputFrom.removeEventListener('keydown', this.handleInputKeyDown);
        }
        if (this.inputTo) {
            this.inputTo.removeEventListener('input', this.handleInput);
            this.inputTo.removeEventListener('blur', this.handleInputBlur);
            this.inputTo.removeEventListener('keydown', this.handleInputKeyDown);
        }
        if (this.root && !this.reuseRoot) {
            this.root.remove();
        }
    }

    getType(): 'price' | 'area' {
        return this.type;
    }

    isRangeValid(): boolean {
        if (!this.valueFrom && !this.valueTo) return true;
        
        const fromNum = this.valueFrom ? parseInt(this.valueFrom) : 0;
        const toNum = this.valueTo ? parseInt(this.valueTo) : 0;
        
        if (fromNum > 0 && toNum > 0) {
            return fromNum <= toNum;
        }
        
        return true;
    }
}