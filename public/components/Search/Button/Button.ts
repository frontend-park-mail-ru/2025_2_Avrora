interface ButtonOptions {
    text?: string;
    type?: 'button' | 'submit' | 'reset';
    onClick?: ((this: HTMLButtonElement, ev: MouseEvent) => void) | null;
    className?: string;
}

export class Button {
    private text: string;
    private type: 'button' | 'submit' | 'reset';
    private onClick: ((this: HTMLButtonElement, ev: MouseEvent) => void) | null;
    private className: string;
    private element: HTMLButtonElement | null;

    constructor({
        text = '',
        type = 'button',
        onClick = null,
        className = 'button'
    }: ButtonOptions = {}) {
        this.text = text;
        this.type = type;
        this.onClick = typeof onClick === 'function' ? onClick : null;
        this.className = className;
        this.element = null;

        this.createElement();
    }

    private createElement(): void {
        this.element = document.createElement('button');
        this.element.type = this.type;
        this.element.className = this.className;
        this.element.textContent = this.text;

        if (this.onClick) {
            this.element.addEventListener('click', this.onClick);
        }
    }

    setText(text: string): void {
        this.text = text;
        if (this.element) {
            this.element.textContent = text;
        }
    }

    mount(parent: HTMLElement): void {
        if (parent && this.element) {
            parent.appendChild(this.element);
        }
    }

    destroy(): void {
        if (this.element) {
            if (this.onClick) {
                this.element.removeEventListener('click', this.onClick);
            }
            this.element.remove();
            this.element = null;
        }
    }

    // Дополнительные геттеры для доступа к элементу если нужно
    getElement(): HTMLButtonElement | null {
        return this.element;
    }

    // Метод для обновления опций
    updateOptions(options: Partial<ButtonOptions>): void {
        if (options.text !== undefined) {
            this.setText(options.text);
        }
        
        if (options.className !== undefined && this.element) {
            this.className = options.className;
            this.element.className = options.className;
        }

        if (options.onClick !== undefined && this.element) {
            // Удаляем старый обработчик если был
            if (this.onClick) {
                this.element.removeEventListener('click', this.onClick);
            }
            
            // Устанавливаем новый
            this.onClick = typeof options.onClick === 'function' ? options.onClick : null;
            if (this.onClick) {
                this.element.addEventListener('click', this.onClick);
            }
        }

        if (options.type !== undefined && this.element) {
            this.type = options.type;
            this.element.type = options.type;
        }
    }
}