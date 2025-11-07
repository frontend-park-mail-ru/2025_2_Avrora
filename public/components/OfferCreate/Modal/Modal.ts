interface ModalOptions {
    title?: string;
    message?: string;
    type?: 'confirm' | 'error' | 'info' | 'success' | 'loading';
    confirmText?: string;
    cancelText?: string;
    closable?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface CurrentModal {
    element: HTMLElement;
    escapeHandler: ((e: KeyboardEvent) => void) | null;
}

export class Modal {
    static currentModal: CurrentModal | null = null;

    static show(options: ModalOptions): HTMLElement {
        this.hide();

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.animation = 'fadeIn 0.3s ease-out';

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.animation = 'slideIn 0.3s ease-out';

        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal__header';

        const modalTitle = document.createElement('h3');
        modalTitle.textContent = options.title || '';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal__close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Закрыть');

        modalHeader.appendChild(modalTitle);

        if (options.closable !== false) {
            modalHeader.appendChild(closeBtn);
        }

        const modalBody = document.createElement('div');
        modalBody.className = 'modal__body';

        const modalText = document.createElement('p');
        modalText.textContent = options.message || '';
        modalBody.appendChild(modalText);

        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal__footer';

        if (options.type === 'confirm') {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'modal__btn modal__btn--cancel';
            cancelBtn.textContent = options.cancelText || 'Отмена';
            cancelBtn.addEventListener('click', () => {
                if (options.onCancel) options.onCancel();
                this.hide();
            });

            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'modal__btn modal__btn--confirm';
            confirmBtn.textContent = options.confirmText || 'Подтвердить';
            confirmBtn.addEventListener('click', () => {
                if (options.onConfirm) options.onConfirm();
                this.hide();
            });

            modalFooter.appendChild(cancelBtn);
            modalFooter.appendChild(confirmBtn);
        } else {
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'modal__btn modal__btn--confirm';
            confirmBtn.textContent = options.confirmText || 'OK';
            confirmBtn.addEventListener('click', () => {
                if (options.onConfirm) options.onConfirm();
                this.hide();
            });

            modalFooter.appendChild(confirmBtn);
        }

        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        modal.appendChild(modalFooter);
        modalOverlay.appendChild(modal);

        const closeModal = () => {
            if (options.onCancel) options.onCancel();
            this.hide();
        };

        if (options.closable !== false) {
            modalOverlay.addEventListener('click', (e: MouseEvent) => {
                if (e.target === modalOverlay) closeModal();
            });
        }

        if (options.closable !== false) {
            closeBtn.addEventListener('click', closeModal);
        }

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && options.closable !== false) {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };

        if (options.closable !== false) {
            document.addEventListener('keydown', handleEscape);
        }

        this.currentModal = {
            element: modalOverlay,
            escapeHandler: handleEscape
        };

        document.body.appendChild(modalOverlay);
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            const confirmButton = modalOverlay.querySelector('.modal__btn--confirm') as HTMLButtonElement;
            if (confirmButton) confirmButton.focus();
        }, 100);

        return modalOverlay;
    }

    static confirm(options: ModalOptions): Promise<boolean> {
        return new Promise((resolve) => {
            this.show({
                title: options.title || 'Подтверждение',
                message: options.message,
                type: 'confirm',
                confirmText: options.confirmText || 'Да',
                cancelText: options.cancelText || 'Нет',
                closable: options.closable !== false,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }

    static error(options: ModalOptions): HTMLElement {
        return this.show({
            title: options.title || 'Ошибка',
            message: options.message,
            type: 'error',
            confirmText: options.confirmText || 'OK',
            onConfirm: options.onConfirm,
            closable: options.closable !== false
        });
    }

    static info(options: ModalOptions): HTMLElement {
        return this.show({
            title: options.title || 'Информация',
            message: options.message,
            type: 'info',
            confirmText: options.confirmText || 'OK',
            onConfirm: options.onConfirm,
            closable: options.closable !== false
        });
    }

    static success(options: ModalOptions): HTMLElement {
        return this.show({
            title: options.title || 'Успех',
            message: options.message,
            type: 'success',
            confirmText: options.confirmText || 'OK',
            onConfirm: options.onConfirm,
            closable: options.closable !== false
        });
    }

    static hide(): void {
        if (this.currentModal) {
            const { element, escapeHandler } = this.currentModal;

            if (escapeHandler) {
                document.removeEventListener('keydown', escapeHandler);
            }

            element.style.animation = 'fadeOut 0.3s ease-out';
            const modal = element.querySelector('.modal') as HTMLElement;
            if (modal) {
                modal.style.animation = 'slideOut 0.3s ease-out';
            }

            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
                document.body.style.overflow = '';
            }, 300);

            this.currentModal = null;
        }
    }

    static loading(options: ModalOptions): HTMLElement {
        this.hide();

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay modal-overlay--loading';

        const modal = document.createElement('div');
        modal.className = 'modal modal--loading';

        const spinner = document.createElement('div');
        spinner.className = 'modal__spinner';

        const modalText = document.createElement('p');
        modalText.textContent = options.message || 'Загрузка...';

        modal.appendChild(spinner);
        modal.appendChild(modalText);
        modalOverlay.appendChild(modal);

        modalOverlay.style.pointerEvents = 'auto';

        this.currentModal = {
            element: modalOverlay,
            escapeHandler: null
        };

        document.body.appendChild(modalOverlay);
        document.body.style.overflow = 'hidden';

        return modalOverlay;
    }

    static updateLoadingMessage(message: string): void {
        if (this.currentModal) {
            const modalText = this.currentModal.element.querySelector('p');
            if (modalText) {
                modalText.textContent = message;
            }
        }
    }
}