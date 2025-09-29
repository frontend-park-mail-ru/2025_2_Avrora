import { Section } from "../components/Section/Section.js";
import { BoardsWidget } from "./BoardsWidget.js";

/**
 * Класс главной страницы приложения
 * @class
 */
export class MainPage {
    /**
     * Создает экземпляр главной страницы
     * @param {HTMLElement} parent - Родительский элемент для рендеринга
     * @param {Object} state - Состояние приложения
     * @param {App} app - Экземпляр главного приложения
     */
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;

        this.sectionContainer = document.createElement("div");
        this.sectionContainer.className = 'section';
        
        this.boardsContainer = document.createElement("div");
        this.boardsContainer.className = 'boards';

        this.section = new Section(this.sectionContainer);
        this.boardsWidget = new BoardsWidget(this.boardsContainer, state, app);
    }

    /**
     * Рендерит главную страницу
     * Очищает родительский элемент и отображает секцию и виджет досок
     * @async
     */
    async render() {
        this.parent.innerHTML = "";

        this.parent.appendChild(this.sectionContainer);
        this.parent.appendChild(this.boardsContainer);

        this.section.render();
        await this.boardsWidget.render();
    }

    /**
     * Выполняет очистку ресурсов при переходе на другую страницу
     */
    cleanup() {
        if (this.boardsWidget.cleanup) {
            this.boardsWidget.cleanup();
        }
    }
}