interface FooterTemplateData {
    currentYear: number;
}

export class Footer {
    private parent: HTMLElement;
    private controller: any;
    private eventListeners: { element: Element; event: string; handler: EventListenerOrEventListenerObject }[];
    private template: ((data: FooterTemplateData) => string) | null;
    private container: HTMLElement | null;

    constructor(parent: HTMLElement, controller: any) {
        this.parent = parent;
        this.controller = controller;
        this.eventListeners = [];
        this.template = null;
        this.container = null;
    }

    async render(): Promise<void> {
        this.cleanup();

        const template = await this.loadTemplate();
        const templateData: FooterTemplateData = {
            currentYear: new Date().getFullYear()
        };

        if (typeof template !== 'function') {
            console.error('Footer template is not a function:', template);
            throw new Error('Footer template is not a valid function');
        }

        const html = template(templateData);
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;

        this.container = tempContainer.firstElementChild as HTMLElement;
        this.parent.appendChild(this.container);
        this.attachEventListeners();
    }

    private async loadTemplate(): Promise<(data: FooterTemplateData) => string> {
        if (this.template) return this.template;

        try {
            const templates = (window as any).Handlebars.templates;
            this.template = templates['Footer'] || templates['Footer.hbs'];

            if (!this.template) {
                throw new Error('Footer template not found in compiled templates');
            }

            if (typeof this.template !== 'function') {
                throw new Error('Footer template is not a function');
            }

            return this.template;
        } catch (error) {
            console.error('Failed to load footer template:', error);
            throw new Error('Footer template loading failed');
        }
    }

    private attachEventListeners(): void {
        if (!this.container) return;

        const supportButton = this.container.querySelector('.footer__support-btn');
        if (supportButton) {
            this.addEventListener(supportButton, 'click', (e: Event) => {
                e.preventDefault();
                this.openSupportModal();
            });
        }

        // Обработчики для навигационных ссылок
        const navLinks = this.container.querySelectorAll('.footer__link[href]');
        navLinks.forEach(link => {
            this.addEventListener(link, 'click', (e: Event) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    this.controller.navigate(href);
                }
            });
        });
    }

    private openSupportModal(): void {
        // Создаем модальное окно
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Создаем контейнер для формы
        const askContainer = document.createElement('div');
        askContainer.className = 'ask-modal-container';
        
        modalContent.appendChild(askContainer);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // Загружаем и рендерим форму поддержки
        import('../../../widgets/Ask.ts').then(module => {
            const Ask = module.Ask;
            const askForm = new Ask(askContainer, this.controller, true);
            askForm.render();
        }).catch(error => {
            console.error('Failed to load Ask module:', error);
            this.showError('Не удалось загрузить форму поддержки');
        });

        // Закрытие модального окна при клике на overlay
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });

        // Добавляем стили для модального окна
        this.addModalStyles();
    }

    private addModalStyles(): void {
        if (!document.querySelector('#modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'modal-styles';
            styles.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal-content {
                    background: white;
                    border-radius: 12px;
                    max-width: 90%;
                    max-height: 90%;
                    overflow: auto;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .ask-modal-container {
                    width: 700px;
                    max-width: 100%;
                }

                @media (max-width: 768px) {
                    .modal-overlay {
                        padding: 10px;
                    }
                    
                    .ask-modal-container {
                        width: 100%;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    private addEventListener(
        element: Element,
        event: string,
        handler: EventListenerOrEventListenerObject
    ): void {
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    private showError(message: string): void {
        alert(message);
    }

    cleanup(): void {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}