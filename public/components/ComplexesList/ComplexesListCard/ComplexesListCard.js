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
        // Очищаем содержимое карточки
        this.rootEl.innerHTML = '';

        // Добавляем изображение если есть
        if (this.data.imageUrl) {
            const img = document.createElement('img');
            img.className = 'complexes-list__image';
            img.src = this.data.imageUrl;
            img.alt = this.data.title ? `Фото ЖК ${this.data.title}` : 'Фото ЖК';
            img.loading = 'lazy';
            this.rootEl.appendChild(img);
            this.imageEl = img;
        }

        // Создаем элементы для данных комплекса
        const titleEl = document.createElement('span');
        titleEl.className = 'complexes-list__item-title';
        titleEl.textContent = this.data.title || 'Название не указано';
        this.rootEl.appendChild(titleEl);

        const statusEl = document.createElement('span');
        statusEl.className = 'complexes-list__status';
        statusEl.textContent = this.data.status || 'Статус не указан';
        this.rootEl.appendChild(statusEl);

        const metroEl = document.createElement('span');
        metroEl.className = 'complexes-list__metro';
        
        const metroIcon = document.createElement('img');
        metroIcon.src = '../../images/metro.png';
        metroIcon.alt = 'Метро';
        metroEl.appendChild(metroIcon);
        
        const metroText = document.createTextNode(` ${this.data.metro || 'Метро не указано'}`);
        metroEl.appendChild(metroText);
        this.rootEl.appendChild(metroEl);

        const addressEl = document.createElement('span');
        addressEl.className = 'complexes-list__address';
        addressEl.textContent = this.data.address || 'Адрес не указан';
        this.rootEl.appendChild(addressEl);
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
    }
}