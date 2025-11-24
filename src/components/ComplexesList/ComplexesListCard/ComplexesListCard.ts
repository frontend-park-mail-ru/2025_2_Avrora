interface ComplexCardData {
    id?: number;
    ID?: number;
    title?: string;
    status?: string;
    metro?: string;
    address?: string;
    imageUrl?: string;
    startingPrice?: string;
}

interface ComplexesListCardOptions {
    navigate?: (path: string) => void;
}

export default class ComplexesListCard {
    rootEl: HTMLElement;
    data: ComplexCardData;
    navigate: ((path: string) => void) | null;
    imageEl: HTMLImageElement | null;
    onCardClick: (e: Event) => void;
    onImageError: () => void;

    constructor(rootEl: HTMLElement, data: ComplexCardData = {}, options: ComplexesListCardOptions = {}) {
        if (!rootEl) throw new Error('ComplexesListCard: root element is required');
        this.rootEl = rootEl;
        this.data = data;
        this.imageEl = null;

        this.navigate = typeof options.navigate === 'function' ? options.navigate : null;
        this.onCardClick = this.onCardClick.bind(this);
        this.onImageError = this.onImageError.bind(this);

        this.mount();
    }

    mount(): void {
        this.render();
        this.rootEl.addEventListener('click', this.onCardClick);
    }

    render(): void {
        // Создаем HTML напрямую без использования шаблона списка
        const complexId = this.data.id || this.data.ID;
        
        let imageHtml = '';
        if (this.data.imageUrl) {
            imageHtml = `<img class="complexes-list__image" src="${this.data.imageUrl}" alt="Фото ЖК ${this.data.title}" loading="lazy">`;
        }

        const html = `
            ${imageHtml}
            <span class="complexes-list__item-title">${this.data.title || ''}</span>
            <span class="complexes-list__status">${this.data.status || ''}</span>
            <span class="complexes-list__metro">
                <img src="../../images/metro.png" alt="Метро"> ${this.data.metro || ''}
            </span>
            <span class="complexes-list__address">${this.data.address || ''}</span>
        `;

        this.rootEl.innerHTML = html;
        this.rootEl.setAttribute('data-complex-id', complexId?.toString() || '');

        this.imageEl = this.rootEl.querySelector('.complexes-list__image');

        if (this.imageEl) {
            this.imageEl.addEventListener('error', this.onImageError);
        }
    }

    onImageError(): void {
        if (this.imageEl) {
            this.imageEl.src = '../images/default_complex.jpg';
            this.imageEl.alt = 'Изображение недоступно';
        }
    }

    onCardClick(e: Event): void {
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

    update(data: ComplexCardData = {}): void {
        this.data = { ...this.data, ...data };
        this.render();
    }

    destroy(): void {
        this.rootEl.removeEventListener('click', this.onCardClick);
        if (this.imageEl) {
            this.imageEl.removeEventListener('error', this.onImageError);
        }
    }
}