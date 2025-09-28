export class BoardCard {
    constructor(boardData, state, app) {
        this.boardData = boardData;
        this.state = state;
        this.app = app;
    }

    render() {
        const template = Handlebars.templates["Boards.hbs"];
        const formattedBoard = {
            id: this.boardData.id,
            name: this.boardData.title || `Объявление`,
            // image: this.boardData.image,
            // likeClass: this.boardData.isLiked ? "liked" : "",
            // likeIcon: this.boardData.isLiked
            //     ? "../../images/active__like.png"
            //     : "../../images/like.png",
            likeClass: "",
            likeIcon: "../../images/like.png",
            price: this.boardData.price ? `${this.formatPrice(this.boardData.price)} ₽/мес.` : "Цена не указана",
            rooms: this.boardData.rooms ? `${this.boardData.rooms}-комн. кв.` : "",
            area: this.boardData.area ? `${this.boardData.area}м²` : "",
            metro: "Метро не указано",
            address: this.boardData.address || "Адрес не указан",
        };

        const cardElement = document.createElement('div');
        cardElement.innerHTML = template({ items: [formattedBoard] });
        
        this.setEventListeners(cardElement);
        
        return cardElement.firstElementChild;
    }

    formatPrice(price) {
        return new Intl.NumberFormat("ru-RU").format(price);
    }

    setEventListeners(cardElement) {
        const likeButton = cardElement.querySelector(".board__like");
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

        likeButton.classList.toggle("liked");
        const likeIcon = likeButton.querySelector("img");
        const isLikedNow = likeButton.classList.contains("liked");

        if (likeIcon) {
            likeIcon.src = isLikedNow ? "../../images/active__like.png" : "../../images/like.png";
        }

        this.boardData.isLiked = isLikedNow;
    }
}