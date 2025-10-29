export class Section {
    constructor(parent) {
        this.parent = parent;
        this.eventListeners = [];
    }

    render() {
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

    createTitle() {
        const title = document.createElement('h1');
        title.className = 'section__title';
        title.textContent = 'Твой следующий адрес начинается здесь';
        return title;
    }

    createButtonGroup() {
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'section__button-group';

        const mapButton = this.createButton('show-map', 'Показать на карте');
        const listingsButton = this.createButton('show-listings', 'Показать объявления');

        buttonGroup.appendChild(mapButton);
        buttonGroup.appendChild(listingsButton);

        return buttonGroup;
    }

    createButton(type, text) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `section__button section__button--${type}`;
        button.textContent = text;
        return button;
    }

    attachEventListeners() {
        const mapButton = this.parent.querySelector('.section__button--show-map');
        const listingsButton = this.parent.querySelector('.section__button--show-listings');

        if (mapButton) {
            this.addEventListener(mapButton, 'click', () => this.handleMapClick());
        }

        if (listingsButton) {
            this.addEventListener(listingsButton, 'click', () => this.handleListingsClick());
        }
    }

    handleMapClick() {
        console.log('Show map button clicked');
        this.dispatchEvent('showMap');
    }

    handleListingsClick() {
        console.log('Show listings button clicked');
        this.dispatchEvent('showListings');
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        this.parent.dispatchEvent(event);
    }

    addEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        this.parent.innerHTML = '';
    }

    onShowMap(handler) {
        this.addEventListener(this.parent, 'showMap', handler);
    }

    onShowListings(handler) {
        this.addEventListener(this.parent, 'showListings', handler);
    }
}