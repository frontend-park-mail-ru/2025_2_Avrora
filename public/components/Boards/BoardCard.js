/**
 * Класс карточки объявления с возможностью лайка
 * @class
 */
export class BoardCard {
    /**
     * Создает экземпляр карточки объявления
     * @param {Object} boardData - Данные объявления
     * @param {Object} state - Состояние приложения
     * @param {App} app - Экземпляр главного приложения
     */
    constructor(boardData, state, app) {
        this.boardData = boardData;
        this.state = state;
        this.app = app;
    }

    /**
     * Рендерит карточку объявления
     * @returns {HTMLElement} DOM-элемент карточки
     */
    render() {
        const card = document.createElement('div');
        card.className = 'board__block';

        card.innerHTML = `
            <img class="board__image" src="${this.boardData.image}" alt="Фото объявления">
            <span class="board__like ${this.boardData.likeClass}" data-ad-id="${this.boardData.id}">
                <img src="${this.boardData.likeIcon}" alt="Лайк">
            </span>
            <span class="board__price">${this.formatPrice(this.boardData.price)} ₽</span>
            <span class="board__description">
                ${this.boardData.rooms ? `${this.boardData.rooms}-комн.` : ''} · 
                ${this.boardData.area ? `${this.boardData.area}м²` : ''}
            </span>
            <span class="board__metro">
                <img src="../../images/metro.png" alt="Метро"> ${this.boardData.metro}
            </span>
            <span class="board__address">${this.boardData.address}</span>
        `;

        this.setEventListeners(card);
        return card;
    }

    /**
     * Форматирует цену для отображения
     * @param {number} price - Цена объявления
     * @returns {string} Отформатированная цена или сообщение об отсутствии цены
     */
    formatPrice(price) {
        if (price == null) return "Цена не указана";
        return new Intl.NumberFormat("ru-RU").format(price);
    }

    /**
     * Устанавливает обработчики событий для карточки
     * @param {HTMLElement} card - DOM-элемент карточки
     */
    setEventListeners(card) {
        const likeButton = card.querySelector(".board__like");
        if (likeButton) {
            likeButton.addEventListener("click", (e) => this.handleLike(e));
        }
    }

    /**
     * Обрабатывает клик по кнопке лайка
     * @param {Event} event - Событие клика
     * @async
     */
    async handleLike(event) {
        if (!this.state.user) {
            this.app.router.navigate("/login");
            return;
        }

        const likeButton = event.currentTarget;
        const adId = likeButton.dataset.adId;
        if (!adId) return;

        const isLikedNow = !likeButton.classList.contains("liked");
        likeButton.classList.toggle("liked", isLikedNow);

        const likeIcon = likeButton.querySelector("img");
        if (likeIcon) {
            likeIcon.src = isLikedNow
                ? "../../images/active__like.png"
                : "../../images/like.png";
        }

        this.boardData.isLiked = isLikedNow;
    }
}