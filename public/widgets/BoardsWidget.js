import { API } from "../utils/API.js";
import { API_CONFIG } from "../config.js";
import { BoardCard } from "../components/Boards/BoardCard.js";

export class BoardsWidget {
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;
        this.eventListeners = [];
        this.isLoading = false;
        this.boardCards = [];
    }

    async render() {
        try {
            this.isLoading = true;

            let boards = this.state.boards && this.state.boards.length > 0
                ? this.state.boards
                : await this.loadBoards();

            this.renderContent(boards);
        } catch (error) {
            console.error("Error rendering boards:", error);
            this.renderError("Не удалось загрузить объявления");
        } finally {
            this.isLoading = false;
        }
    }

   async loadBoards() {
        const result = await API.get(API_CONFIG.ENDPOINTS.BOARDS.OFFERS);
        if (result.ok && result.data && Array.isArray(result.data.offers)) {
            this.meta = result.data.meta || { page: 1, total: 0, limit: 20 };
            return result.data.offers;
        }
        return [];
    }

    renderContent(offers) {
        this.cleanup();

        if (!offers || offers.length === 0) {
            this.renderEmptyState();
            return;
        }

        const title = document.createElement('h1');
        title.textContent = 'Популярные объявления';
        this.parent.appendChild(title);

        const boardsContainer = document.createElement('div');
        boardsContainer.className = 'boards__container';

        // ✅ Format each raw offer into BoardCard-compatible object
        this.boardCards = offers.map(offer => 
            new BoardCard(this.formatBoard(offer), this.state, this.app)
        );

        this.boardCards.forEach(boardCard => {
            const cardElement = boardCard.render();
            boardsContainer.appendChild(cardElement);
        });

        this.parent.appendChild(boardsContainer);
    }

    formatBoard(offer) {
        // You might later load user likes from state or localStorage
        const isLiked = this.state.user?.likedOffers?.includes(offer.id) || false;

        return {
            id: offer.id,
            title: offer.title || 'Без названия',
            description: offer.description || '',
            price: offer.price,
            area: offer.area,
            rooms: offer.rooms,
            address: offer.address || 'Адрес не указан',
            offer_type: offer.offer_type,

            // UI-only fields for BoardCard
            image: "../../images/default_offer.jpg", // or from CDN if available
            likeClass: isLiked ? "liked" : "",
            likeIcon: isLiked
                ? "../../images/active__like.png"
                : "../../images/like.png",
            metro: "Метро не указано" // or fetch from location_id if you have mapping
        };
    }

    renderError(message) {
        this.cleanup();
        
        const title = document.createElement('h1');
        title.textContent = 'Популярные объявления';
        this.parent.appendChild(title);

        const errorState = document.createElement('div');
        errorState.className = 'error__state';
        
        const errorText = document.createElement('p');
        errorText.textContent = message;
        errorState.appendChild(errorText);
        
        const retryButton = document.createElement('button');
        retryButton.className = 'retry__button';
        retryButton.textContent = 'Попробовать снова';
        errorState.appendChild(retryButton);
        
        this.parent.appendChild(errorState);

        this.addEventListener(retryButton, "click", () => this.render());
    }

    renderEmptyState() {
        this.cleanup();
        
        const title = document.createElement('h1');
        title.textContent = 'Популярные объявления';
        this.parent.appendChild(title);

        const emptyState = document.createElement('div');
        emptyState.className = 'empty__state';
        
        const emptyText = document.createElement('p');
        emptyText.textContent = 'Нет доступных объявлений';
        emptyState.appendChild(emptyText);
        
        this.parent.appendChild(emptyState);
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
        this.boardCards = [];
        this.parent.innerHTML = '';
    }
}