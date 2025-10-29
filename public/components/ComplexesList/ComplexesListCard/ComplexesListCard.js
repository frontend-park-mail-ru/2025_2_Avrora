export default class ComplexesListCard {
    constructor(rootEl, data = {}, options = {}) {
        if (!rootEl) throw new Error('ComplexesListCard: root element is required');
        this.rootEl = rootEl;
        this.data = data;
        this.imageEl = null;

        this.navigate = typeof options.navigate === 'function' ? options.navigate : null;
        this.onCardClick = this.onCardClick.bind(this);

        this.mount();
    }

    mount() {
        this.render();
        this.rootEl.addEventListener('click', this.onCardClick);
    }

    render() {
        const template = Handlebars.templates['ComplexesList.hbs'];

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
                this.imageEl.src = 'https://via.placeholder.com/300x200?text=No+Image';
                this.imageEl.alt = 'Изображение недоступно';
            });
        }
    }

    onCardClick(e) {
        const path = `/complexes/${this.data.id}`;
        if (this.navigate) {
            this.navigate(path);
            return;
        }
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }

    update(data = {}) {
        this.data = { ...this.data, ...data };
        this.render();
    }

    destroy() {
        this.rootEl.removeEventListener('click', this.onCardClick);
        if (this.imageEl) {
            this.imageEl.removeEventListener('error', () => {});
        }
    }
}