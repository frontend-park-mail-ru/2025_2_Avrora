export class Dropdown {
    constructor({
        parent = null,
        placeholder = 'Тип сделки',
        items = [],
        onSelect = null,
        reuseRoot = false
    } = {}) {
        this.parent = parent;
        this.placeholder = placeholder;
        this.items = this.normalizeItems(items);
        this.onSelect = typeof onSelect === 'function' ? onSelect : null;
        this.reuseRoot = Boolean(reuseRoot);

        this.isOpen = false;
        this.value = null;
        this.label = placeholder;

        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleButtonClick = this.handleButtonClick.bind(this);

        this.createElement();
        if (this.parent && !this.reuseRoot) {
            this.mount(this.parent);
        }
    }

    normalizeItems(items) {
        return items.map(item => {
            if (typeof item === 'string' || typeof item === 'number') {
                return { label: String(item), value: String(item) };
            }
            const label = String(item.label ?? '');
            const value = String(item.value ?? item.label ?? '');
            return { label, value };
        });
    }

    createElement() {
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

        this.root.appendChild(this.button);
        this.root.appendChild(this.content);

        this.button.addEventListener('click', this.handleButtonClick);
    }

    handleButtonClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.toggle();
    }

    renderItems() {
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

            itemElement.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.select(item);
            });

            this.content.appendChild(itemElement);
        });
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.root.classList.add('dropdown--open');
        this.button.setAttribute('aria-expanded', 'true');

        document.addEventListener('click', this.handleDocumentClick, { capture: true });
        document.addEventListener('keydown', this.handleKeyDown);
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.root.classList.remove('dropdown--open');
        this.button.setAttribute('aria-expanded', 'false');

        if (!this.value) {
            this.root.classList.remove('dropdown--active');
        }

        document.removeEventListener('click', this.handleDocumentClick, { capture: true });
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    handleDocumentClick(event) {
        if (!this.root.contains(event.target)) {
            this.close();
        }
    }

    handleKeyDown(event) {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    select(item) {
        this.value = item.value;
        this.label = item.label;
        this.button.textContent = item.label;

        this.root.classList.add('dropdown--active');

        this.content.querySelectorAll('.dropdown__item').forEach(element => {
            element.classList.remove('dropdown__item--selected');
            element.classList.remove('dropdown__item--active');
            if (element.dataset.value === item.value) {
                element.classList.add('dropdown__item--selected');
                element.classList.add('dropdown__item--active');
            }
        });

        if (this.onSelect) {
            this.onSelect({ label: item.label, value: item.value });
        }

        this.close();
    }

    clear() {
        this.value = null;
        this.label = this.placeholder;
        this.button.textContent = this.placeholder;

        this.root.classList.remove('dropdown--active');

        this.content.querySelectorAll('.dropdown__item').forEach(element => {
            element.classList.remove('dropdown__item--selected');
            element.classList.remove('dropdown__item--active');
        });

        if (this.onSelect) {
            this.onSelect({ label: this.placeholder, value: null });
        }
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        const found = this.items.find(item => item.value === value);
        if (found) {
            this.select(found);
        } else {
            this.clear();
        }
    }

    setItems(items) {
        this.items = this.normalizeItems(items);
        this.renderItems();
    }

    setPlaceholder(text) {
        this.placeholder = text;
        if (!this.value) {
            this.button.textContent = text;
        }
    }

    mount(parent) {
        if (parent) {
            parent.appendChild(this.root);
        }
    }

    destroy() {
        this.close();
        if (this.button) {
            this.button.removeEventListener('click', this.handleButtonClick);
        }
        if (this.root && !this.reuseRoot) {
            this.root.remove();
        }
    }
}