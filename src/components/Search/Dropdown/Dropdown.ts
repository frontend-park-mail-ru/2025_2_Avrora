interface DropdownItem {
    label: string;
    value: string;
}

interface DropdownOptions {
    parent?: HTMLElement | null;
    placeholder?: string;
    items?: (string | number | DropdownItem)[];
    onSelect?: ((selected: { label: string; value: string | null }) => void) | null;
    reuseRoot?: boolean;
}

export class Dropdown {
    private parent: HTMLElement | null;
    private placeholder: string;
    private items: DropdownItem[];
    private onSelect: ((selected: { label: string; value: string | null }) => void) | null;
    private reuseRoot: boolean;
    private isOpen: boolean;
    private value: string | null;
    private label: string;
    private root: HTMLElement | null;
    private button: HTMLButtonElement | null;
    private content: HTMLDivElement | null;

    constructor({
        parent = null,
        placeholder = 'Тип сделки',
        items = [],
        onSelect = null,
        reuseRoot = false
    }: DropdownOptions = {}) {
        this.parent = parent;
        this.placeholder = placeholder;
        this.items = this.normalizeItems(items);
        this.onSelect = typeof onSelect === 'function' ? onSelect : null;
        this.reuseRoot = Boolean(reuseRoot);

        this.isOpen = false;
        this.value = null;
        this.label = placeholder;

        this.root = null;
        this.button = null;
        this.content = null;

        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleButtonClick = this.handleButtonClick.bind(this);

        this.createElement();
        if (this.parent && !this.reuseRoot) {
            this.mount(this.parent);
        }
    }

    private normalizeItems(items: (string | number | DropdownItem)[]): DropdownItem[] {
        return items.map(item => {
            if (typeof item === 'string' || typeof item === 'number') {
                return { label: String(item), value: String(item) };
            }
            const label = String(item.label ?? '');
            const value = String(item.value ?? item.label ?? '');
            return { label, value };
        });
    }

    private createElement(): void {
        if (this.reuseRoot && this.parent) {
            this.root = this.parent;
            this.root.classList.add('dropdown');
            this.root.innerHTML = '';
        } else {
            this.root = document.createElement('div');
            this.root.className = 'dropdown';
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

        this.renderItems();

        if (this.root) {
            this.root.appendChild(this.button);
            this.root.appendChild(this.content);
        }

        if (this.button) {
            this.button.addEventListener('click', this.handleButtonClick);
        }
    }

    private handleButtonClick(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.toggle();
    }

    private renderItems(): void {
        if (!this.content) return;

        this.content.innerHTML = '';

        this.items.forEach(item => {
            const itemElement = document.createElement('button');
            itemElement.type = 'button';
            itemElement.className = 'dropdown__item';
            itemElement.textContent = item.label;
            itemElement.dataset.value = item.value;

            if (this.value === item.value) {
                itemElement.classList.add('dropdown__item--selected');
                itemElement.classList.add('dropdown__item--active');
            }

            itemElement.addEventListener('click', (event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.select(item);
            });

            this.content!.appendChild(itemElement);
        });
    }

    open(): void {
        if (this.isOpen || !this.root || !this.button) return;
        this.isOpen = true;
        this.root.classList.add('dropdown--open');
        this.button.setAttribute('aria-expanded', 'true');

        document.addEventListener('click', this.handleDocumentClick, { capture: true });
        document.addEventListener('keydown', this.handleKeyDown);
    }

    close(): void {
        if (!this.isOpen || !this.root || !this.button) return;
        this.isOpen = false;
        this.root.classList.remove('dropdown--open');
        this.button.setAttribute('aria-expanded', 'false');

        if (!this.value) {
            this.root.classList.remove('dropdown--active');
        }

        document.removeEventListener('click', this.handleDocumentClick, { capture: true });
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    toggle(): void {
        this.isOpen ? this.close() : this.open();
    }

    private handleDocumentClick(event: MouseEvent): void {
        if (this.root && !this.root.contains(event.target as Node)) {
            this.close();
        }
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    select(item: DropdownItem): void {
        this.value = item.value;
        this.label = item.label;
        if (this.button) {
            this.button.textContent = item.label;
        }

        if (this.root) {
            this.root.classList.add('dropdown--active');
        }

        if (this.content) {
            this.content.querySelectorAll('.dropdown__item').forEach(element => {
                element.classList.remove('dropdown__item--selected');
                element.classList.remove('dropdown__item--active');
                if (element instanceof HTMLElement && element.dataset.value === item.value) {
                    element.classList.add('dropdown__item--selected');
                    element.classList.add('dropdown__item--active');
                }
            });
        }

        if (this.onSelect) {
            this.onSelect({ label: item.label, value: item.value });
        }

        this.close();
    }

    clear(): void {
        this.value = null;
        this.label = this.placeholder;
        if (this.button) {
            this.button.textContent = this.placeholder;
        }

        if (this.root) {
            this.root.classList.remove('dropdown--active');
        }

        if (this.content) {
            this.content.querySelectorAll('.dropdown__item').forEach(element => {
                element.classList.remove('dropdown__item--selected');
                element.classList.remove('dropdown__item--active');
            });
        }

        if (this.onSelect) {
            this.onSelect({ label: this.placeholder, value: null });
        }
    }

    getValue(): string | null {
        return this.value;
    }

    setValue(value: string): void {
        const found = this.items.find(item => item.value === value);
        if (found) {
            this.select(found);
        } else {
            this.clear();
        }
    }

    setItems(items: (string | number | DropdownItem)[]): void {
        this.items = this.normalizeItems(items);
        this.renderItems();
    }

    setPlaceholder(text: string): void {
        this.placeholder = text;
        if (!this.value && this.button) {
            this.button.textContent = text;
        }
    }

    mount(parent: HTMLElement): void {
        if (parent && this.root) {
            parent.appendChild(this.root);
        }
    }

    destroy(): void {
        this.close();
        if (this.button) {
            this.button.removeEventListener('click', this.handleButtonClick);
        }
        if (this.root && !this.reuseRoot) {
            this.root.remove();
        }
    }
}