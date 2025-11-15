export interface SupportMessage {
    id: string;
    text: string;
    timestamp: Date;
    isUser: boolean;
    sender?: string;
}

export interface SupportConfig {
    apiBaseUrl: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
}

export class SupportWidget {
    private container: HTMLElement;
    private config: SupportConfig;
    private isOpen: boolean = false;
    private isMinimized: boolean = false;
    private messages: SupportMessage[] = [];

    constructor(container: HTMLElement, config: SupportConfig) {
        this.container = container;
        this.config = config;
        this.init();
    }

    private init(): void {
        this.render();
        this.bindEvents();
        this.loadInitialMessages();
    }

    private render(): void {
        this.container.innerHTML = this.getWidgetHTML();
    }

    private getWidgetHTML(): string {
        const resizeIcon = `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M13,3 L13,13 L3,13 L3,3 L13,3 Z M12,4 L4,4 L4,12 L12,12 L12,4 Z M6,6 L10,6 L10,10 L6,10 L6,6 Z"/></svg>`;
        const closeIcon = `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8,7 L12,3 L13,4 L9,8 L13,12 L12,13 L8,9 L4,13 L3,12 L7,8 L3,4 L4,3 L8,7 Z"/></svg>`;
        const sendIcon = `<svg viewBox="0 0 18 18" fill="currentColor"><path d="M1.5,9L0.8,8.3L0.1,9L0.8,9.7L1.5,9M1,9.5L15,2.5L15,9.5L1,9.5Z"/></svg>`;

        return `
            <div class="support ${this.isMinimized ? 'support--minimized' : ''}">
                <div class="support__header">
                    <button class="support__header__resize" type="button" aria-label="Свернуть">
                        ${resizeIcon}
                    </button>
                    <div class="support__header__title">Бот поддержки Homa</div>
                    <button class="support__header__close" type="button" aria-label="Закрыть">
                        ${closeIcon}
                    </button>
                </div>
                
                <div class="support__chat">
                    ${this.messages.map(message => this.renderMessage(message)).join('')}
                </div>

                <div class="support__footer">
                    <div class="support__footer__carousel">
                        <div class="support__footer__carousel__wrapper">
                            <div class="support__footer__carousel_item" data-question="Вопрос по аренде">Вопрос по аренде</div>
                            <div class="support__footer__carousel_item" data-question="Техническая проблема">Техническая проблема</div>
                            <div class="support__footer__carousel_item" data-question="Сотрудничество">Сотрудничество</div>
                            <div class="support__footer__carousel_item" data-question="Другое">Другое</div>
                        </div>
                    </div>
                    <div class="support__footer__input">
                        <input type="text" placeholder="Введите ваш вопрос..." id="support-input">
                        <button class="support__footer__send_button" type="button" aria-label="Отправить">
                            ${sendIcon}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderMessage(message: SupportMessage): string {
        const avatar = !message.isUser ? '<div class="support__message__avatar">H</div>' : '';
        
        return `
            <div class="support__message support__message--${message.isUser ? 'user' : 'bot'}">
                ${avatar}
                <div class="support__message__content">
                    <div class="support__message__text">${this.escapeHtml(message.text)}</div>
                    <div class="support__message__time">${this.formatTime(message.timestamp)}</div>
                </div>
            </div>
        `;
    }

    private bindEvents(): void {
        // Кнопка закрытия
        const closeBtn = this.container.querySelector('.support__header__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Кнопка изменения размера
        const resizeBtn = this.container.querySelector('.support__header__resize');
        if (resizeBtn) {
            resizeBtn.addEventListener('click', () => this.toggleMinimize());
        }

        // Кнопка отправки сообщения
        const sendBtn = this.container.querySelector('.support__footer__send_button');
        const input = this.container.querySelector('#support-input') as HTMLInputElement;
        
        if (sendBtn && input) {
            const sendMessageHandler = () => {
                if (input.value.trim()) {
                    this.sendMessage(input.value);
                }
            };
            
            sendBtn.addEventListener('click', sendMessageHandler);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessageHandler();
                }
            });
        }

        // Быстрые вопросы
        const quickQuestions = this.container.querySelectorAll('.support__footer__carousel_item');
        quickQuestions.forEach(item => {
            item.addEventListener('click', () => {
                const question = item.getAttribute('data-question');
                if (question) {
                    this.sendMessage(question);
                }
            });
        });

        // Инициализация карусели
        this.initCarousel();
    }

    private initCarousel(): void {
        const wrapper = this.container.querySelector('.support__footer__carousel__wrapper') as HTMLElement;
        if (!wrapper) return;

        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID: number;

        const touchStart = (event: MouseEvent | TouchEvent) => {
            isDragging = true;
            startPos = getPositionX(event);
            animationID = requestAnimationFrame(animation);
            wrapper.style.cursor = 'grabbing';
        };

        const touchEnd = () => {
            isDragging = false;
            cancelAnimationFrame(animationID);
            wrapper.style.cursor = 'grab';
        };

        const touchMove = (event: MouseEvent | TouchEvent) => {
            if (isDragging) {
                const currentPosition = getPositionX(event);
                currentTranslate = prevTranslate + currentPosition - startPos;
            }
        };

        const getPositionX = (event: MouseEvent | TouchEvent): number => {
            return event.type.includes('mouse') ? 
                (event as MouseEvent).pageX : 
                (event as TouchEvent).touches[0].clientX;
        };

        const animation = () => {
            wrapper.style.transform = `translateX(${currentTranslate}px)`;
            if (isDragging) {
                requestAnimationFrame(animation);
            }
        };

        // Добавляем обработчики событий
        wrapper.addEventListener('touchstart', touchStart as EventListener);
        wrapper.addEventListener('touchend', touchEnd as EventListener);
        wrapper.addEventListener('touchmove', touchMove as EventListener);
        
        wrapper.addEventListener('mousedown', touchStart as EventListener);
        wrapper.addEventListener('mouseup', touchEnd as EventListener);
        wrapper.addEventListener('mouseleave', touchEnd as EventListener);
        wrapper.addEventListener('mousemove', touchMove as EventListener);

        // Отключаем контекстное меню
        wrapper.oncontextmenu = (event) => {
            event.preventDefault();
            event.stopPropagation();
            return false;
        };
    }

    private async sendMessage(text: string): Promise<void> {
        if (!text.trim()) return;

        const userMessage: SupportMessage = {
            id: this.generateId(),
            text: text.trim(),
            timestamp: new Date(),
            isUser: true
        };

        this.addMessage(userMessage);
        this.clearInput();

        try {
            // Отправка сообщения на бэкенд
            const response = await this.sendToBackend(userMessage);
            
            if (response) {
                const botMessage: SupportMessage = {
                    id: this.generateId(),
                    text: response,
                    timestamp: new Date(),
                    isUser: false
                };
                this.addMessage(botMessage);
            }
        } catch (error) {
            console.error('Error sending message to backend:', error);
            
            // Заглушка на случай ошибки
            const fallbackMessage: SupportMessage = {
                id: this.generateId(),
                text: "Спасибо за обращение! Наш специалист свяжется с вами в ближайшее время.",
                timestamp: new Date(),
                isUser: false
            };
            this.addMessage(fallbackMessage);
        }
    }

    private async sendToBackend(message: SupportMessage): Promise<string> {
        // Интеграция с бэкендом
        const payload = {
            message: message.text,
            userId: this.config.userId,
            userEmail: this.config.userEmail,
            userName: this.config.userName,
            timestamp: message.timestamp.toISOString()
        };

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/support/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                return data.response || data.message || "Сообщение получено. Ожидайте ответа.";
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Backend request failed:', error);
            throw error;
        }
    }

    private addMessage(message: SupportMessage): void {
        this.messages.push(message);
        this.updateChat();
        this.scrollToBottom();
    }

    private updateChat(): void {
        const chatContainer = this.container.querySelector('.support__chat');
        if (chatContainer) {
            chatContainer.innerHTML = this.messages.map(msg => this.renderMessage(msg)).join('');
        }
    }

    private scrollToBottom(): void {
        const chatContainer = this.container.querySelector('.support__chat');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    private clearInput(): void {
        const input = this.container.querySelector('#support-input') as HTMLInputElement;
        if (input) {
            input.value = '';
        }
    }

    private loadInitialMessages(): void {
        const initialMessage: SupportMessage = {
            id: this.generateId(),
            text: "Здравствуйте! Чем могу помочь?",
            timestamp: new Date(),
            isUser: false
        };
        this.addMessage(initialMessage);
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private formatTime(date: Date): string {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Public methods
    public show(): void {
        this.isOpen = true;
        this.isMinimized = false;
        this.render();
        this.bindEvents();
        this.scrollToBottom();
        
        // Отправляем сообщение о показе
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'SUPPORT_WIDGET_SHOW' }, '*');
        }
    }

    public hide(): void {
        this.isOpen = false;
        this.container.innerHTML = '';
        
        // Отправляем сообщение о скрытии
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'SUPPORT_WIDGET_HIDE' }, '*');
        }
    }

    public close(): void {
        this.hide();
        // Отправляем сообщение о полном закрытии (удалении iframe)
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'SUPPORT_WIDGET_CLOSE' }, '*');
        }
    }

    public toggle(): void {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    public toggleMinimize(): void {
        this.isMinimized = !this.isMinimized;
        this.render();
        this.bindEvents();
    }

    public updateConfig(newConfig: Partial<SupportConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    public getMessages(): SupportMessage[] {
        return [...this.messages];
    }

    public clearMessages(): void {
        this.messages = [];
        this.updateChat();
        this.loadInitialMessages();
    }
}

// Глобальная переменная для интеграции
declare global {
    interface Window {
        SupportWidget: typeof SupportWidget;
    }
}

// Экспорт для использования в других модулях
if (typeof window !== 'undefined') {
    window.SupportWidget = SupportWidget;
}