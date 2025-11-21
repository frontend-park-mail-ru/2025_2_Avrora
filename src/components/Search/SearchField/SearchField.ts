interface SearchFieldOptions {
    parent?: HTMLElement | null;
    placeholder?: string;
    value?: string;
    onInput?: ((value: string) => void) | null;
    onSubmit?: ((value: string) => void) | null;
    reuseRoot?: boolean;
}

export class SearchField {
    private parent: HTMLElement | null;
    private placeholder: string;
    private value: string;
    private onInput: ((value: string) => void) | null;
    private onSubmit: ((value: string) => void) | null;
    private reuseRoot: boolean;
    private root: HTMLElement | null;
    private wrapper: HTMLDivElement | null;
    public input: HTMLInputElement;
    public clearButton: HTMLButtonElement | null;

    constructor({
        parent = null,
        placeholder = 'Город, улица, метро, дом',
        value = '',
        onInput = null,
        onSubmit = null,
        reuseRoot = false
    }: SearchFieldOptions = {}) {
        this.parent = parent;
        this.placeholder = placeholder;
        this.value = value;
        this.onInput = typeof onInput === 'function' ? onInput : null;
        this.onSubmit = typeof onSubmit === 'function' ? onSubmit : null;
        this.reuseRoot = Boolean(reuseRoot);

        this.root = null;
        this.wrapper = null;
        this.input = document.createElement('input');
        this.clearButton = null;

        this.handleEnter = this.handleEnter.bind(this);
        this.handleInput = this.handleInput.bind(this);

        this.createElement();
        if (this.parent && !this.reuseRoot) {
            this.mount(this.parent);
        }
    }

    private createElement(): void {
        if (this.reuseRoot && this.parent) {
            this.root = this.parent;
            this.root.classList.add('search-field');
            this.root.innerHTML = '';
        } else {
            this.root = document.createElement('div');
            this.root.className = 'search-field';
        }

        this.wrapper = document.createElement('div');
        this.wrapper.className = 'search-field__wrapper';

        this.input.type = 'text';
        this.input.className = 'search-field__input';
        this.input.placeholder = this.placeholder;
        this.input.autocomplete = 'off';
        this.input.value = this.value;

        this.input.addEventListener('input', this.handleInput);
        this.input.addEventListener('keydown', this.handleEnter);

        this.clearButton = document.createElement('button');
        this.clearButton.type = 'button';
        this.clearButton.className = 'search-field__clear';
        this.clearButton.innerHTML = '&times;';
        this.clearButton.style.display = this.value ? 'flex' : 'none';

        this.clearButton.addEventListener('click', () => {
            this.setValue('');
            if (this.onInput) {
                this.onInput('');
            }
        });

        this.wrapper.appendChild(this.input);
        this.wrapper.appendChild(this.clearButton);
        if (this.root) {
            this.root.appendChild(this.wrapper);
        }
    }

    private handleInput(): void {
        this.value = this.input.value;
        if (this.clearButton) {
            this.clearButton.style.display = this.value ? 'flex' : 'none';
        }

        if (this.onInput) {
            this.onInput(this.value);
        }
    }

    private handleEnter(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (this.onSubmit) {
                this.onSubmit(this.value);
            }
        }
    }

    mount(parent: HTMLElement): void {
        if (parent && this.root) {
            parent.appendChild(this.root);
        }
    }

    focus(): void {
        this.input.focus();
    }

    setValue(value: string): void {
        this.value = value ?? '';
        this.input.value = this.value;
        if (this.clearButton) {
            this.clearButton.style.display = this.value ? 'flex' : 'none';
        }
    }

    getValue(): string {
        return this.value;
    }

    setPlaceholder(text: string): void {
        this.placeholder = text;
        this.input.placeholder = text;
    }

    destroy(): void {
        this.input.removeEventListener('input', this.handleInput);
        this.input.removeEventListener('keydown', this.handleEnter);
        if (this.clearButton) {
            this.clearButton.removeEventListener('click', this.handleInput);
        }
        if (this.root) {
            this.root.remove();
        }
    }
}