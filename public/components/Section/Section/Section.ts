export class Section {
    private parent: HTMLElement;
    private eventListeners: Array<{
        element: EventTarget;
        event: string;
        handler: EventListenerOrEventListenerObject;
    }>;

    constructor(parent: HTMLElement) {
        this.parent = parent;
        this.eventListeners = [];
    }

    render(): void {
        this.cleanup();

        const section = document.createElement('section');
        section.className = 'section';

        const title = this.createTitle();
        const buttonGroup = this.createButtonGroup();

        section.appendChild(title);
        section.appendChild(buttonGroup);

        this.parent.appendChild(section);
        this.attachEventListeners();
    }

    private createTitle(): HTMLHeadingElement {
        const title = document.createElement('h1');
        title.className = 'section__title';
        title.textContent = 'Твой следующий адрес начинается здесь';
        return title;
    }

    private createButtonGroup(): HTMLDivElement {
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'section__button-group';

        const mapButton = this.createButton('show-map', 'Показать на карте');
        const listingsButton = this.createButton('show-listings', 'Показать объявления');

        buttonGroup.appendChild(mapButton);
        buttonGroup.appendChild(listingsButton);

        return buttonGroup;
    }

    private createButton(type: string, text: string): HTMLButtonElement {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `section__button section__button--${type}`;
        button.textContent = text;
        return button;
    }

    private attachEventListeners(): void {
        const mapButton = this.parent.querySelector('.section__button--show-map');
        const listingsButton = this.parent.querySelector('.section__button--show-listings');

        if (mapButton) {
            this.addEventListener(mapButton, 'click', () => this.handleMapClick());
        }

        if (listingsButton) {
            this.addEventListener(listingsButton, 'click', () => this.handleListingsClick());
        }
    }

    private handleMapClick(): void {
        console.log('Show map button clicked');
        this.dispatchEvent('showMap');
    }

    private handleListingsClick(): void {
        console.log('Show listings button clicked');
        this.dispatchEvent('showListings');
    }

    private dispatchEvent(eventName: string, detail: object = {}): void {
        const event = new CustomEvent(eventName, { detail });
        this.parent.dispatchEvent(event);
    }

    private addEventListener(
        element: EventTarget,
        event: string,
        handler: EventListenerOrEventListenerObject
    ): void {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    cleanup(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.parent.innerHTML = '';
    }

    onShowMap(handler: EventListenerOrEventListenerObject): void {
        this.addEventListener(this.parent, 'showMap', handler);
    }

    onShowListings(handler: EventListenerOrEventListenerObject): void {
        this.addEventListener(this.parent, 'showListings', handler);
    }
}