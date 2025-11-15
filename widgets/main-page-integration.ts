import { SupportWidget, SupportConfig } from './SupportWidget';

export class SupportIntegration {
    private supportWidget: SupportWidget | null = null;
    private iframe: HTMLIFrameElement | null = null;
    private isInitialized: boolean = false;
    private messageHandler: ((event: MessageEvent) => void) | null = null;

    constructor(private container: HTMLElement) {}

    public initializeSupportWidget(): void {
        if (this.isInitialized) {
            console.warn('Support widget already initialized');
            return;
        }

        try {
            // Добавляем кнопку поддержки (если еще нет)
            this.addSupportButton();

        } catch (error) {
            console.error('Error initializing support integration:', error);
        }
    }

    private setupMessageHandler(): void {
        // Удаляем старый обработчик если есть
        if (this.messageHandler) {
            window.removeEventListener('message', this.messageHandler);
        }

        this.messageHandler = (event: MessageEvent) => {
            // Проверяем источник сообщения для безопасности
            if (this.iframe && event.source !== this.iframe.contentWindow) return;

            const { type } = event.data;

            switch (type) {
                case 'SUPPORT_WIDGET_CLOSE':
                    this.destroyIframe();
                    break;
                case 'SUPPORT_WIDGET_HIDE':
                    // Просто скрываем iframe
                    if (this.iframe) {
                        this.iframe.style.display = 'none';
                    }
                    break;
                case 'SUPPORT_WIDGET_SHOW':
                    // Показываем iframe
                    if (this.iframe) {
                        this.iframe.style.display = 'block';
                    }
                    break;
            }
        };

        window.addEventListener('message', this.messageHandler);
    }

    private createIframe(): void {
        // Удаляем существующий iframe если есть
        this.destroyIframe();

        // Создаем новый iframe
        this.iframe = document.createElement('iframe');
        this.iframe.id = 'support-widget-iframe';
        this.iframe.style.cssText = `
            border: none;
            width: 400px;
            height: 500px;
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            display: none;
            background: transparent;
        `;

        // Конфигурация для бэкенда
        const config: SupportConfig = {
            apiBaseUrl: 'http://localhost:8080/api/v1',
            userId: this.getUserId(),
            userEmail: this.getUserEmail(),
            userName: this.getUserName()
        };

        // Загружаем HTML в iframe
        this.iframe.onload = () => {
            this.initializeWidgetInIframe(config);
            this.setupMessageHandler();
        };

        this.iframe.srcdoc = this.getIframeHTML();
        this.container.appendChild(this.iframe);
        this.isInitialized = true;
    }

    private initializeWidgetInIframe(config: SupportConfig): void {
        try {
            const iframeWindow = this.iframe?.contentWindow;
            const iframeDoc = this.iframe?.contentDocument || iframeWindow?.document;
            
            if (!iframeDoc || !iframeWindow) {
                console.error('Cannot access iframe document or window');
                return;
            }

            // Ждем полной загрузки DOM iframe
            if (iframeDoc.readyState === 'loading') {
                iframeDoc.addEventListener('DOMContentLoaded', () => {
                    this.injectStylesAndInitialize(iframeDoc, config);
                });
            } else {
                this.injectStylesAndInitialize(iframeDoc, config);
            }

        } catch (error) {
            console.error('Error initializing support widget in iframe:', error);
        }
    }

    private injectStylesAndInitialize(iframeDoc: Document, config: SupportConfig): void {
        // Добавляем стили в iframe
        this.injectStylesToIframe(iframeDoc);

        // Создаем контейнер в iframe
        let container = iframeDoc.getElementById('support-widget-container');
        if (!container) {
            container = iframeDoc.createElement('div');
            container.id = 'support-widget-container';
            container.style.cssText = `
                width: 100%;
                height: 100%;
                position: relative;
                display: flex;
            `;
            iframeDoc.body.appendChild(container);
        }

        // Очищаем контейнер и инициализируем виджет
        container.innerHTML = '';
        this.supportWidget = new SupportWidget(container, config);
        
        console.log('Support widget initialized successfully in iframe');

        // Принудительно перерисовываем
        setTimeout(() => {
            if (this.supportWidget) {
                this.supportWidget.show();
            }
        }, 100);
    }

    private injectStylesToIframe(iframeDoc: Document): void {
        // Удаляем старые стили если есть
        const oldStyles = iframeDoc.getElementById('support-widget-styles');
        if (oldStyles) {
            oldStyles.remove();
        }

        const styleElement = iframeDoc.createElement('style');
        styleElement.id = 'support-widget-styles';
        styleElement.textContent = this.getCompiledCSS();
        iframeDoc.head.appendChild(styleElement);
    }

    private getCompiledCSS(): string {
        return `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            html, body {
                width: 100%;
                height: 100%;
                font-family: "Inter", sans-serif;
                background: transparent;
                overflow: hidden;
            }
            
            #support-widget-container {
                width: 100%;
                height: 100%;
                position: relative;
                display: flex;
            }

            .support {
                border: 1px solid #dee2e6;
                border-radius: 12px;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                background: #fff;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                font-family: "Inter", sans-serif;
                overflow: hidden;
            }

            .support--minimized {
                height: 60px !important;
            }

            .support--minimized .support__chat,
            .support--minimized .support__footer {
                display: none !important;
            }

            .support__header {
                display: flex !important;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: #1FBB72;
                border-radius: 12px 12px 0 0;
                color: white;
                min-height: 60px;
                flex-shrink: 0;
            }

            .support__header__resize,
            .support__header__close {
                width: 24px;
                height: 24px;
                border: none;
                cursor: pointer;
                background: transparent;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.2s ease;
                color: white;
            }

            .support__header__resize:hover,
            .support__header__close:hover {
                opacity: 0.8;
            }

            .support__header__resize svg,
            .support__header__close svg {
                width: 16px;
                height: 16px;
                fill: currentColor;
            }

            .support__header__title {
                font-weight: 600;
                font-size: 16px;
                flex: 1;
                text-align: center;
            }

            .support__chat {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 15px;
                background: #f8f9fa;
                min-height: 0;
            }

            .support__message {
                display: flex;
                gap: 10px;
                max-width: 85%;
            }

            .support__message--user {
                align-self: flex-end;
                flex-direction: row-reverse;
            }

            .support__message--bot {
                align-self: flex-start;
            }

            .support__message__avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #1FBB72;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 14px;
                flex-shrink: 0;
            }

            .support__message__content {
                background: white;
                padding: 12px 16px;
                border-radius: 18px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                word-wrap: break-word;
                max-width: 100%;
            }

            .support__message--user .support__message__content {
                background: #1FBB72;
                color: white;
            }

            .support__message__text {
                font-size: 14px;
                line-height: 1.4;
                margin-bottom: 4px;
                word-break: break-word;
            }

            .support__message__time {
                font-size: 11px;
                opacity: 0.7;
                text-align: right;
            }

            .support__footer {
                padding: 15px 20px;
                background: white;
                border-top: 1px solid #dee2e6;
                flex-shrink: 0;
            }

            .support__footer__carousel {
                overflow: hidden;
                position: relative;
                margin-bottom: 12px;
                height: 40px;
            }

            .support__footer__carousel__wrapper {
                display: flex;
                transition: transform 0.3s ease;
                height: 100%;
                cursor: grab;
                gap: 8px;
            }

            .support__footer__carousel__wrapper:active {
                cursor: grabbing;
            }

            .support__footer__carousel_item {
                flex: 0 0 auto;
                min-width: 120px;
                padding: 8px 12px;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid #e0e0e0;
                border-radius: 20px;
                background: white;
                font-size: 12px;
                font-weight: 500;
                color: #333;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .support__footer__carousel_item:hover {
                border-color: #1FBB72;
                color: #1FBB72;
            }

            .support__footer__carousel_item:active {
                background: rgba(31, 187, 114, 0.1);
            }

            .support__footer__input {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .support__footer__input input {
                flex: 1;
                height: 40px;
                border: 1px solid #dee2e6;
                border-radius: 20px;
                padding: 0 16px;
                font-size: 14px;
                background: #f8f9fa;
                transition: all 0.2s ease;
                outline: none;
                font-family: inherit;
            }

            .support__footer__input input:focus {
                border-color: #1FBB72;
                background: white;
                box-shadow: 0 0 0 2px rgba(31, 187, 114, 0.1);
            }

            .support__footer__input input::placeholder {
                color: #A0A8BE;
            }

            .support__footer__send_button {
                width: 40px;
                height: 40px;
                border: none;
                cursor: pointer;
                background: #1FBB72;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                flex-shrink: 0;
                color: white;
            }

            .support__footer__send_button:hover {
                background: #18955c;
                transform: scale(1.05);
            }

            .support__footer__send_button:active {
                transform: scale(0.95);
            }

            .support__footer__send_button svg {
                width: 18px;
                height: 18px;
                fill: currentColor;
            }

            .support__chat::-webkit-scrollbar {
                width: 4px;
            }

            .support__chat::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 2px;
            }

            .support__chat::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 2px;
            }

            .support__chat::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }
        `;
    }

    private getIframeHTML(): string {
        return `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Поддержка</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    html, body {
                        width: 100%;
                        height: 100%;
                        font-family: "Inter", sans-serif;
                        background: transparent;
                        overflow: hidden;
                    }
                    
                    #support-widget-container {
                        width: 100%;
                        height: 100%;
                        position: relative;
                        display: flex;
                        background: transparent;
                    }
                </style>
            </head>
            <body style="background: transparent;">
                <div id="support-widget-container"></div>
            </body>
            </html>
        `;
    }

    private addSupportButton(): void {
        // Проверяем, не существует ли уже кнопки
        const existingButton = document.getElementById('support-floating-button');
        if (existingButton) return;

        const supportButton = document.createElement('button');
        supportButton.id = 'support-floating-button';
        supportButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
            </svg>
            <span>Поддержка</span>
        `;
        
        supportButton.addEventListener('click', () => {
            this.toggleSupport();
        });

        supportButton.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            background: #1FBB72;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-family: "Inter", sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(31, 187, 114, 0.3);
            transition: all 0.3s ease;
        `;

        supportButton.addEventListener('mouseenter', () => {
            supportButton.style.transform = 'translateY(-2px)';
            supportButton.style.boxShadow = '0 6px 16px rgba(31, 187, 114, 0.4)';
        });

        supportButton.addEventListener('mouseleave', () => {
            supportButton.style.transform = 'translateY(0)';
            supportButton.style.boxShadow = '0 4px 12px rgba(31, 187, 114, 0.3)';
        });

        document.body.appendChild(supportButton);
    }

    private getUserId(): string {
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                return user.id || '';
            }
        } catch (error) {
            console.error('Error getting user ID:', error);
        }
        return '';
    }

    private getUserEmail(): string {
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                return user.email || '';
            }
        } catch (error) {
            console.error('Error getting user email:', error);
        }
        return '';
    }

    private getUserName(): string {
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                return `${user.firstName || ''} ${user.lastName || ''}`.trim();
            }
        } catch (error) {
            console.error('Error getting user name:', error);
        }
        return '';
    }

    private destroyIframe(): void {
        if (this.iframe) {
            this.iframe.remove();
            this.iframe = null;
        }
        this.supportWidget = null;
        this.isInitialized = false;
    }

    public showSupport(): void {
        // Создаем новый iframe если его нет
        if (!this.iframe) {
            this.createIframe();
        }
        
        // Показываем iframe
        if (this.iframe) {
            this.iframe.style.display = 'block';
        }
    }

    public hideSupport(): void {
        if (this.iframe) {
            this.iframe.style.display = 'none';
        }
    }

    public toggleSupport(): void {
        if (this.iframe && this.iframe.style.display !== 'none') {
            this.hideSupport();
        } else {
            this.showSupport();
        }
    }

    public destroy(): void {
        // Удаляем обработчик сообщений
        if (this.messageHandler) {
            window.removeEventListener('message', this.messageHandler);
            this.messageHandler = null;
        }

        // Удаляем iframe
        this.destroyIframe();

        // Удаляем кнопку
        const supportButton = document.getElementById('support-floating-button');
        if (supportButton) {
            supportButton.remove();
        }
        
        console.log('Support integration destroyed');
    }
}

// Глобальная интеграция с основным приложением
declare global {
    interface Window {
        supportIntegration: SupportIntegration;
    }
}