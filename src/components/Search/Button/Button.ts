interface ButtonOptions {
    text?: string;
    type?: string;
    onClick?: (event: MouseEvent) => void;
    className?: string;
}

export class Button {
    private text: string;
    private type: string;
    private onClick: ((event: MouseEvent) => void) | null;
    private className: string;
    public element: HTMLButtonElement | null;

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

        if (this.onClick && this.element) {
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
        }
    }
}