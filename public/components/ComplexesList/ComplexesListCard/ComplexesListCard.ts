export default class ComplexesListCard {
    rootEl: HTMLElement;
    data: any;
    imageEl: HTMLImageElement | null;
    navigate: ((path: string) => void) | null;

    constructor(rootEl: HTMLElement, data: any = {}, options: any = {}) {
        if (!rootEl) throw new Error('ComplexesListCard: root element is required');
        this.rootEl = rootEl;
        this.data = data;
        this.imageEl = null;

        this.navigate = typeof options.navigate === 'function' ? options.navigate : null;

        this.mount();
    }

    private mount(): void {
        this.render();
        this.rootEl.addEventListener('click', this.onCardClick.bind(this));
    }

    private render(): void {
        const template = (Handlebars as any).templates['ComplexesList.hbs'];

        const rendered = template({
            complexes: [this.data]
        });

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rendered;

        const cardElement = tempDiv.querySelector('.complexes-list__item');

        this.rootEl.innerHTML = '';
        if (cardElement) {
            this.rootEl.appendChild(cardElement);
        }

        this.imageEl = this.rootEl.querySelector('.complexes-list__image');

        if (this.imageEl) {
            this.imageEl.addEventListener('error', () => {
                if (this.imageEl) {
                    this.imageEl.src = '../images/default_complex.jpg';
                    this.imageEl.alt = 'Изображение недоступно';
                }
            });
        }
    }

    private onCardClick(e: Event): void {
        const complexId = this.data.id || this.data.ID;
        if (!complexId) {
            console.error('Complex ID is missing');
            return;
        }

        const path = `/complexes/${complexId}`;
        if (this.navigate) {
            this.navigate(path);
            return;
        }
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }

    update(data: any = {}): void {
        this.data = { ...this.data, ...data };
        this.render();
    }

    destroy(): void {
        this.rootEl.removeEventListener('click', this.onCardClick);
        if (this.imageEl) {
            this.imageEl.removeEventListener('error', () => {});
        }
    }
}