// src/components/Boards/BoardCard.js
export class BoardCard {
    constructor(boardData, state, app) {
        this.boardData = boardData; // already formatted
        this.state = state;
        this.app = app;
    }

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

    formatPrice(price) {
        if (price == null) return "Цена не указана";
        return new Intl.NumberFormat("ru-RU").format(price);
    }

    setEventListeners(card) {
        const likeButton = card.querySelector(".board__like");
        if (likeButton) {
            likeButton.addEventListener("click", (e) => this.handleLike(e));
        }
    }

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