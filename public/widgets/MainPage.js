import { Section } from "../components/Section/Section.js";
import { BoardsWidget } from "./BoardsWidget.js";

export class MainPage {
    constructor(parent, state, app) {
        this.parent = parent;
        this.state = state;
        this.app = app;

        this.sectionContainer = document.createElement("div");
        this.boardsContainer = document.createElement("div");

        this.section = new Section(this.sectionContainer);
        this.boardsWidget = new BoardsWidget(this.boardsContainer, state, app);
    }

    async render() {
        this.parent.innerHTML = "";

        this.parent.appendChild(this.sectionContainer);
        this.parent.appendChild(this.boardsContainer);

        this.section.render();
        await this.boardsWidget.render();
    }

    cleanup() {
        if (this.boardsWidget.cleanup) {
            this.boardsWidget.cleanup();
        }
    }
}
