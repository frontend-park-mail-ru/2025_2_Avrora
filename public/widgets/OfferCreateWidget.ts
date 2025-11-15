import { OfferCreateFirstStage } from '../components/OfferCreate/OfferCreateFirstStage/OfferCreateFirstStage.ts';
import { OfferCreateSecondStage } from '../components/OfferCreate/OfferCreateSecondStage/OfferCreateSecondStage.ts';
import { OfferCreateThirdStage } from '../components/OfferCreate/OfferCreateThirdStage/OfferCreateThirdStage.ts';
import { OfferCreateFourthStage } from '../components/OfferCreate/OfferCreateFourthStage/OfferCreateFourthStage.ts';
import { OfferCreateFifthStage } from '../components/OfferCreate/OfferCreateFifthStage/OfferCreateFifthStage.ts';
import { OfferCreateDataManager } from '../utils/OfferCreateDataManager.ts';
import { Modal } from '../components/OfferCreate/Modal/Modal.ts';

interface OfferCreateWidgetOptions {
    step?: number;
    isEditing?: boolean;
}

export class OfferCreateWidget {
    private parent: HTMLElement;
    private controller: any;
    private step: number;
    private eventListeners: Array<{element: EventTarget, event: string, handler: EventListenerOrEventListenerObject}>;
    private dataManager: OfferCreateDataManager;
    private isEditing: boolean;
    private editOfferId: string | null;
    private currentStageElement: HTMLElement | null;

    constructor(parent: HTMLElement, controller: any, options: OfferCreateWidgetOptions = {}) {
        this.parent = parent;
        this.controller = controller;
        this.step = options.step || 1;
        this.eventListeners = [];
        this.dataManager = new OfferCreateDataManager();
        this.isEditing = options.isEditing || false;
        this.editOfferId = null;
        this.currentStageElement = null;
    }

    async renderWithParams(params: { id?: string } = {}): Promise<void> {
        this.cleanup();

        const isNewCreation = !this.isEditing &&
                         window.location.pathname === '/create-ad' &&
                         !this.dataManager.getData().offer_type;

        if (isNewCreation) {
            this.dataManager.clear();
        }

        if (this.isEditing && params.id) {
            if (this.editOfferId !== params.id) {
                this.editOfferId = params.id;
                await this.loadOfferData(this.editOfferId);
            }
        } else if (!this.isEditing && this.editOfferId) {
            this.editOfferId = null;
            this.dataManager.clear();
        }

        this.step = this.resolveStepFromLocation();
        await this.render();
    }

    async loadOfferData(offerId: string): Promise<void> {
        try {
            await this.controller.loadOfferData(offerId, this.dataManager);
        } catch (error) {
            console.error('Error loading offer data:', error);
            this.showError('Ошибка при загрузке данных объявления');
        }
    }

    async render(): Promise<void> {
        this.cleanup();
        this.step = this.resolveStepFromLocation();

        let stageEl: HTMLElement;
        const stageOptions = {
            controller: this.controller,
            dataManager: this.dataManager,
            isEditing: this.isEditing,
            editOfferId: this.editOfferId
        };

        switch (this.step) {
            case 2:
                stageEl = new OfferCreateSecondStage(stageOptions).render();
                break;
            case 3:
                stageEl = new OfferCreateThirdStage(stageOptions).render();
                break;
            case 4:
                stageEl = new OfferCreateFourthStage(stageOptions).render();
                break;
            case 5:
                stageEl = new OfferCreateFifthStage(stageOptions).render();
                break;
            default:
                stageEl = new OfferCreateFirstStage(stageOptions).render();
                break;
        }

        this.currentStageElement = stageEl;
        this.parent.appendChild(stageEl);
        this.attachEventListeners();
    }

    attachEventListeners(): void {
        const prevBtn = this.parent.querySelector('[data-action="prev"]') as HTMLButtonElement;
        const nextBtn = this.parent.querySelector('[data-action="next"]') as HTMLButtonElement;
        const publishBtn = this.parent.querySelector('[data-action="publish"]') as HTMLButtonElement;

        if (prevBtn) {
            this.addEventListener(prevBtn, 'click', (e: Event) => {
                e.preventDefault();
                this.saveCurrentStepData();
                const prev = Math.max(1, this.step - 1);
                this.navigateToStep(prev);
            });
        }

        if (nextBtn) {
            this.addEventListener(nextBtn, 'click', (e: Event) => {
                e.preventDefault();
                this.saveCurrentStepData();

                if (this.validateCurrentStep()) {
                    const next = Math.min(5, this.step + 1);
                    this.navigateToStep(next);
                }
            });
        }

        if (publishBtn) {
            this.addEventListener(publishBtn, 'click', async (e: Event) => {
                e.preventDefault();
                this.saveCurrentStepData();
                await this.handlePublish();
            });
        }
    }

    saveCurrentStepData(): void {
        try {
            const currentForm = this.currentStageElement || this.parent.querySelector('.create-ad');
            if (!currentForm) return;

            const formData = this.collectFormData(currentForm as HTMLElement);

            Object.keys(formData).forEach(key => {
                if (formData[key] === '' || formData[key] === undefined) {
                    formData[key] = null;
                }
            });

            // Автоматически генерируем заголовок при сохранении данных
            if (this.shouldGenerateTitle()) {
                formData.title = this.generateTitle();
            }

            this.dataManager.updateData(this.step, formData);
        } catch (error) {
            console.error('Error saving step data:', error);
        }
    }

    shouldGenerateTitle(): boolean {
        const currentData = this.dataManager.getData();
        // Генерируем заголовок, если его нет или если это новая запись
        return !currentData.title || (!this.isEditing && this.step >= 2);
    }

    generateTitle(): string {
        const data = this.dataManager.getData();
        
        const offerTypeMap: {[key: string]: string} = {
            'sale': 'Продажа',
            'rent': 'Аренда'
        };

        const propertyTypeMap: {[key: string]: string} = {
            'apartment': 'квартиры',
            'house': 'дома'
        };

        const categoryMap: {[key: string]: string} = {
            'new': 'новостройки',
            'secondary': 'вторички'
        };

        const roomLabels: {[key: string]: string} = {
            '0': 'Студия',
            '1': '1-комнатная',
            '2': '2-комнатная',
            '3': '3-комнатная',
            '4': '4-комнатная'
        };

        const parts: string[] = [];

        // Тип объявления
        if (data.offer_type && offerTypeMap[data.offer_type]) {
            parts.push(offerTypeMap[data.offer_type]);
        }

        // Количество комнат
        if (data.rooms !== undefined && data.rooms !== null) {
            const roomLabel = roomLabels[data.rooms] || `${data.rooms}-комнатная`;
            parts.push(roomLabel);
        }

        // Тип недвижимости
        if (data.property_type && propertyTypeMap[data.property_type]) {
            parts.push(propertyTypeMap[data.property_type]);
        }

        // Категория (новостройка/вторичка)
        if (data.category && categoryMap[data.category]) {
            parts.push(categoryMap[data.category]);
        }

        // Площадь
        if (data.area) {
            parts.push(`${data.area} м²`);
        }

        // Адрес (если есть и нужно сократить)
        if (data.address) {
            const shortAddress = this.getShortAddress(data.address);
            if (shortAddress) {
                parts.push(shortAddress);
            }
        }

        // Если ничего не собрали, возвращаем заголовок по умолчанию
        if (parts.length === 0) {
            return 'Новое объявление о недвижимости';
        }

        return parts.join(' ');
    }

    getShortAddress(fullAddress: string): string {
        if (!fullAddress) return '';
        
        // Убираем лишние части адреса, оставляем только район или улицу
        const addressParts = fullAddress.split(',');
        
        // Возвращаем первые 2-3 части адреса (обычно город, район, улица)
        if (addressParts.length > 1) {
            return addressParts.slice(0, Math.min(2, addressParts.length)).join(', ').trim();
        }
        
        return fullAddress;
    }

    validateCurrentStep(): boolean {
        const currentData = this.dataManager.getData();
        
        // Для 5-го этапа дополнительно проверяем валидацию изображений
        if (this.step === 5) {
            const imagesValidation = this.validateImages(currentData);
            if (!imagesValidation.isValid) {
                this.showError(imagesValidation.message!);
                return false;
            }
        }
        
        return this.controller.validateOfferStep(this.step, currentData);
    }

    validateImages(data: any): { isValid: boolean; message?: string } {
        if (!data.images || data.images.length === 0) {
            return {
                isValid: false,
                message: 'Необходимо загрузить минимум одну фотографию'
            };
        }

        if (data.images.length > 10) {
            return {
                isValid: false,
                message: 'Можно загрузить не более 10 фотографий'
            };
        }

        return { isValid: true };
    }

    collectFormData(formElement: HTMLElement): any {
        const formData: any = {};

        const activeButtons = formElement.querySelectorAll('.create-ad__choice-button.active');
        activeButtons.forEach(button => {
            const field = (button as HTMLElement).dataset.field;
            if (field) {
                formData[field] = (button as HTMLElement).dataset.value || null;
            }
        });

        const inputs = formElement.querySelectorAll('.create-ad__input[data-field]');
        inputs.forEach(input => {
            const field = (input as HTMLElement).dataset.field;
            if (field) {
                let value = (input as HTMLInputElement).value.trim();
                formData[field] = value === '' ? null : 
                    (input as HTMLInputElement).type === 'number' ? 
                    (parseFloat(value) || null) : value;
            }
        });

        const textareas = formElement.querySelectorAll('textarea[data-field]');
        textareas.forEach(textarea => {
            const field = (textarea as HTMLElement).dataset.field;
            if (field) {
                formData[field] = (textarea as HTMLTextAreaElement).value.trim() || null;
            }
        });

        const selects = formElement.querySelectorAll('select[data-field]');
        selects.forEach(select => {
            const field = (select as HTMLElement).dataset.field;
            if (field) {
                formData[field] = (select as HTMLSelectElement).value || null;
            }
        });

        return formData;
    }

    async handlePublish(): Promise<void> {
        if (!await this.controller.canManageOffers()) {
            return;
        }

        try {
            this.saveCurrentStepData();
            const currentData = this.dataManager.getData();

            // Добавляем user_id из текущего пользователя
            if (this.controller.user && this.controller.user.id) {
                currentData.user_id = this.controller.user.id;
            }

            // Убеждаемся, что заголовок сгенерирован перед публикацией
            if (!currentData.title || currentData.title.trim() === '') {
                currentData.title = this.generateTitle();
            }

            // Проверяем валидацию изображений перед публикацией
            const imagesValidation = this.validateImages(currentData);
            if (!imagesValidation.isValid) {
                this.showError(imagesValidation.message!);
                return;
            }

            const validationResult = this.controller.validateOfferData(currentData);
            if (!validationResult.isValid) {
                this.showError(validationResult.message!);
                return;
            }

            const publishBtn = this.parent.querySelector('[data-action="publish"]') as HTMLButtonElement;
            const originalText = publishBtn.textContent;
            publishBtn.textContent = this.isEditing ? 'Сохранение...' : 'Публикация...';
            publishBtn.disabled = true;

            let result: any;
            if (this.isEditing) {
                result = await this.controller.updateOffer(this.editOfferId!, currentData);
            } else {
                result = await this.controller.createOffer(currentData);
            }

            if (result.ok) {
                const successMessage = this.isEditing ? 
                    'Объявление успешно обновлено!' : 
                    'Объявление успешно опубликовано!';

                this.showSuccess(successMessage);

                if (!this.isEditing) {
                    this.dataManager.clear();
                }

                setTimeout(() => {
                    this.controller.navigate('/profile/myoffers');
                }, 2000);
            } else {
                this.controller.handleAPIError(result, this.isEditing);
            }
        } catch (error) {
            console.error('Network error during publish:', error);
            this.showError(`Сетевая ошибка: ${(error as Error).message}`);
        } finally {
            const publishBtn = this.parent.querySelector('[data-action="publish"]') as HTMLButtonElement;
            if (publishBtn) {
                publishBtn.textContent = this.isEditing ? 'Сохранить изменения' : 'Опубликовать';
                publishBtn.disabled = false;
            }
        }
    }

    resolveStepFromLocation(): number {
        const path = window.location.pathname;
        if (path.includes('/step-5')) return 5;
        if (path.includes('/step-4')) return 4;
        if (path.includes('/step-3')) return 3;
        if (path.includes('/step-2')) return 2;
        return 1;
    }

    navigateToStep(step: number): void {
        if (this.isEditing && this.editOfferId) {
            const route = step === 1 ? `/edit-offer/${this.editOfferId}` : `/edit-offer/${this.editOfferId}/step-${step}`;
            this.controller.navigate(route);
        } else {
            const route = step === 1 ? '/create-ad' : `/create-ad/step-${step}`;
            this.controller.navigate(route);
        }
    }

    showError(message: string): void {
        Modal.show({
            title: 'Ошибка',
            message: message,
            type: 'error'
        });
    }

    showSuccess(message: string): void {
        Modal.show({
            title: 'Успех',
            message: message,
            type: 'success'
        });
    }

    addEventListener(element: EventTarget, event: string, handler: EventListenerOrEventListenerObject): void {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    removeEventListeners(): void {
        this.eventListeners.forEach(({ element, event, handler }) =>
            element.removeEventListener(event, handler)
        );
        this.eventListeners = [];
    }

    cleanup(): void {
        this.removeEventListeners();
        this.parent.innerHTML = '';
        this.currentStageElement = null;
    }
}