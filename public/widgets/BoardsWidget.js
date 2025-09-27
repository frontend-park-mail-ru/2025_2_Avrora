import { API } from "../utils/API.js";

export class BoardsWidget {
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.eventListeners = [];
        this.isLoading = false;
    }

    async render() {
        try {
            this.isLoading = true;

            let boards = this.state.boards && this.state.boards.length > 0
                ? this.state.boards
                : await this.loadBoards();

            this.renderContent(boards);
            this.setEventListeners();
        } catch (error) {
            console.error("Error rendering boards:", error);
            this.renderError("Не удалось загрузить объявления");
        } finally {
            this.isLoading = false;
        }
    }

    async loadBoards() {
        const result = await API.get("/boards/popular");
        if (result.ok) {
            return result.data.boards || [];
        }
        return [];
    }

    renderContent(boards) {
        if (!boards || boards.length === 0) {
            this.renderEmptyState();
            return;
        }

        const template = Handlebars.templates["Boards.hbs"];
        const formattedBoards = boards.map((board, index) => ({
            id: board.id || index,
            name: board.title || `Объявление ${index + 1}`,
            image: board.imageUrl || board.image || "../../images/living-room.jpg",
            likeClass: board.isLiked ? "liked" : "",
            likeIcon: board.isLiked
                ? "../../images/active-like-icon.png"
                : "../../images/like-icon.png",
            price: board.price ? `${this.formatPrice(board.price)} руб.` : "Цена не указана",
            description: board.description || "Описание отсутствует",
            metro: board.metroStation || board.metro || "Не указано",
            address: board.address || "Адрес не указан"
        }));

        this.parent.innerHTML = template({ items: formattedBoards });
    }

    renderError(message) {
        this.parent.innerHTML = `
            <div class="list-items">
                <h1>Популярные объявления</h1>
                <div class="error-state">
                    <p>${message}</p>
                    <button class="retry-button">Попробовать снова</button>
                </div>
            </div>
        `;

        const retryButton = this.parent.querySelector(".retry-button");
        if (retryButton) {
            this.addEventListener(retryButton, "click", () => this.render());
        }
    }

    renderEmptyState() {
        this.parent.innerHTML = `
            <div class="list-items">
                <h1>Популярные объявления</h1>
                <div class="empty-state">
                    <p>Нет доступных объявлений</p>
                </div>
            </div>
        `;
    }

    formatPrice(price) {
        return new Intl.NumberFormat("ru-RU").format(price);
    }

    setEventListeners() {
        this.removeEventListeners();

        const likeButtons = this.parent.querySelectorAll(".board__like");
        likeButtons.forEach(button => {
            this.addEventListener(button, "click", (e) => this.handleLike(e));
        });
    }

    async handleLike(event) {
        if (!this.state.user) {
            this.app.router.navigate("/login");
            return;
        }

        const likeButton = event.currentTarget;
        const adId = likeButton.dataset.adId;

        if (!adId) return;

        try {
            const result = await API.post(`/boards/${adId}/like`);
            if (result.ok) {
                likeButton.classList.toggle("liked");
                const likeIcon = likeButton.querySelector("img");
                if (likeButton.classList.contains("liked")) {
                    likeIcon.src = "../../images/active-like-icon.png";
                } else {
                    likeIcon.src = "../../images/like-icon.png";
                }
                this.updateBoardLikeState(adId, result.data.isLiked);
            }
        } catch (error) {
            console.error("Не удалось обновить лайк", error);
        }
    }

    updateBoardLikeState(adId, isLiked) {
        const boardIndex = this.state.boards.findIndex(board => board.id == adId);
        if (boardIndex !== -1) {
            this.state.boards[boardIndex].isLiked = isLiked;
        }
    }

    addEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    removeEventListeners() {
        this.eventListeners.forEach(({ element, event, handler }) =>
            element.removeEventListener(event, handler)
        );
        this.eventListeners = [];
    }

    cleanup() {
        this.removeEventListeners();
    }
}
