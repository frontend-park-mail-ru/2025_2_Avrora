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
                const secondStage = new OfferCreateSecondStage(stageOptions);
                stageEl = secondStage.render();
                this.addEventListener(stageEl, 'cleanup', () => secondStage.cleanup());
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

                const validationResult = this.validateCurrentStep();
                if (!validationResult.isValid) {
                    this.showError(validationResult.message!);
                    return;
                }

                const next = Math.min(5, this.step + 1);
                this.navigateToStep(next);
            });
        }

        if (publishBtn) {
            this.addEventListener(publishBtn, 'click', async (e: Event) => {
                e.preventDefault();
                this.saveCurrentStepData();

                const validationResult = this.validateCurrentStep();
                if (!validationResult.isValid) {
                    this.showError(validationResult.message!);
                    return;
                }

                if (this.step === 5) {
                    const fifthStage = this.currentStageElement as any;
                    if (fifthStage && fifthStage.validateFormData) {
                        const fifthStageValidation = fifthStage.validateFormData();
                        if (!fifthStageValidation.isValid) {
                            this.showError(fifthStageValidation.message!);
                            return;
                        }
                    }
                }

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

            this.updateStageData(this.step, formData);
        } catch (error) {

        }
    }

    private updateStageData(step: number, formData: any): void {
        switch (step) {
            case 1:
                if (this.dataManager.updateStage1) {
                    this.dataManager.updateStage1(formData);
                } else {
                    this.mergeData(formData);
                }
                break;
            case 2:
                if (this.dataManager.updateStage2) {
                    this.dataManager.updateStage2(formData);
                } else {
                    this.mergeData(formData);
                }
                break;
            case 3:
                if (this.dataManager.updateStage3) {
                    this.dataManager.updateStage3(formData);
                } else {
                    this.mergeData(formData);
                }
                break;
            case 4:
                if (this.dataManager.updateStage4) {
                    this.dataManager.updateStage4(formData);
                } else {
                    this.mergeData(formData);
                }
                break;
            case 5:
                if (this.dataManager.updateStage5) {
                    this.dataManager.updateStage5(formData);
                } else {
                    this.mergeData(formData);
                }
                break;
            default:
                this.mergeData(formData);
                break;
        }
    }

    private mergeData(formData: any): void {
        const currentData = this.dataManager.getData();
        const updatedData = { ...currentData, ...formData };

        if (this.dataManager.updateData) {
            this.dataManager.updateData(this.step, updatedData);
        } else if (this.dataManager.setData) {
            this.dataManager.setData(updatedData);
        } else {
            this.dataManager.data = updatedData;
        }
    }

    validateCurrentStep(): { isValid: boolean; message?: string } {
        const currentData = this.dataManager.getData();

        switch (this.step) {
            case 1:
                if (!currentData.offer_type) {
                    return { isValid: false, message: 'Выберите тип объявления' };
                }
                if (!currentData.property_type) {
                    return { isValid: false, message: 'Выберите тип недвижимости' };
                }
                if (!currentData.category) {
                    return { isValid: false, message: 'Выберите вид недвижимости' };
                }
                break;

            case 2:
                if (!currentData.address) {
                    return { isValid: false, message: 'Введите адрес' };
                }

                if (currentData.complex_status === 'yes' && (!currentData.complex_name || currentData.complex_name.trim() === '')) {
                    return { isValid: false, message: 'Введите название жилищного комплекса' };
                }

                const floorValidation = this.validateFloors(currentData);
                if (!floorValidation.isValid) {
                    return floorValidation;
                }
                break;

            case 3:
                if (!currentData.rooms && currentData.rooms !== 0) {
                    return { isValid: false, message: 'Выберите количество комнат' };
                }
                if (!currentData.area) {
                    return { isValid: false, message: 'Введите общую площадь' };
                }

                const areaValidation = this.validateAreas(currentData);
                if (!areaValidation.isValid) {
                    return areaValidation;
                }
                break;

            case 4:
                if (!currentData.price) {
                    return { isValid: false, message: 'Введите цену' };
                }

                const priceValidation = this.validatePrice(currentData);
                if (!priceValidation.isValid) {
                    return priceValidation;
                }
                break;

            case 5:
                const fifthStageValidation = this.validateFifthStage(currentData);
                if (!fifthStageValidation.isValid) {
                    return fifthStageValidation;
                }
                break;
        }

        if (this.controller.validateOfferStep) {
            const controllerValidation = this.controller.validateOfferStep(this.step, currentData);
            if (!controllerValidation) {
                return { isValid: false, message: 'Ошибка валидации данных' };
            }
        }

        return { isValid: true };
    }

    private validateFifthStage(data: any): { isValid: boolean; message?: string } {
        if (!data.images || !Array.isArray(data.images)) {
            return { isValid: false, message: 'Ошибка данных изображений' };
        }

        const validImages = data.images.filter((img: any) =>
            img &&
            typeof img === 'object' &&
            img.filename &&
            typeof img.filename === 'string' &&
            img.filename.trim() !== ''
        );

        if (validImages.length === 0) {
            return { isValid: false, message: 'Необходимо загрузить минимум одну фотографию' };
        }

        if (validImages.length > 10) {
            return { isValid: false, message: 'Можно загрузить не более 10 фотографий' };
        }

        if (!data.description || data.description.trim() === '') {
            return { isValid: false, message: 'Введите описание объявления' };
        }

        if (data.description.length < 10) {
            return { isValid: false, message: 'Описание должно содержать минимум 10 символов' };
        }

        if (data.description.length > 2000) {
            return { isValid: false, message: 'Описание не должно превышать 2000 символов' };
        }

        return { isValid: true };
    }

    private validateFloors(data: any): { isValid: boolean; message?: string } {
        const floor = data.floor;
        const totalFloors = data.total_floors;

        if ((floor !== null && totalFloors === null) || (floor === null && totalFloors !== null)) {
            return { isValid: false, message: 'Заполните оба поля: этаж и количество этажей в доме' };
        }

        if (floor !== null && totalFloors !== null) {
            if (floor < 0) {
                return { isValid: false, message: 'Этаж не может быть отрицательным числом' };
            }

            if (totalFloors <= 0) {
                return { isValid: false, message: 'Общее количество этажей должно быть положительным числом' };
            }

            if (floor > totalFloors) {
                return { isValid: false, message: 'Этаж не может быть больше общего количества этажей в доме' };
            }

            if (floor === 0 && totalFloors > 0) {
                return { isValid: false, message: 'Этаж 0 обычно не используется. Используйте 1 для первого этажа.' };
            }
        }

        return { isValid: true };
    }

    private validateAreas(data: any): { isValid: boolean; message?: string } {
        const area = data.area;
        const livingArea = data.living_area;
        const kitchenArea = data.kitchen_area;

        if (area && area <= 0) {
            return { isValid: false, message: 'Общая площадь должна быть положительным числом' };
        }

        if (livingArea && livingArea <= 0) {
            return { isValid: false, message: 'Жилая площадь должна быть положительным числом' };
        }

        if (kitchenArea && kitchenArea <= 0) {
            return { isValid: false, message: 'Площадь кухни должна быть положительным числом' };
        }

        if (livingArea && area && livingArea > area) {
            return { isValid: false, message: 'Жилая площадь не может быть больше общей площади' };
        }

        if (kitchenArea && area && kitchenArea > area) {
            return { isValid: false, message: 'Площадь кухни не может быть больше общей площади' };
        }

        return { isValid: true };
    }

    private validatePrice(data: any): { isValid: boolean; message?: string } {
        const price = data.price;
        const deposit = data.deposit;
        const commission = data.commission;

        if (price && price <= 0) {
            return { isValid: false, message: 'Цена должна быть положительным числом' };
        }

        if (deposit && deposit < 0) {
            return { isValid: false, message: 'Залог не может быть отрицательным' };
        }

        if (commission && (commission < 0 || commission > 100)) {
            return { isValid: false, message: 'Комиссия должна быть в диапазоне от 0 до 100%' };
        }

        return { isValid: true };
    }

    collectFormData(formElement: HTMLElement): any {
        const formData: any = {};

        const activeButtons = formElement.querySelectorAll('.create-ad__choice-button.active');
        activeButtons.forEach(button => {
            const field = (button as HTMLElement).dataset.field;
            if (field) {
                const value = (button as HTMLElement).dataset.value;
                if (field === 'rooms') {
                    formData[field] = value !== null && value !== undefined ? parseInt(value) || null : null;
                } else {
                    formData[field] = value || null;
                }
            }
        });

        const inputs = formElement.querySelectorAll('.create-ad__input[data-field]');
        inputs.forEach(input => {
            const field = (input as HTMLElement).dataset.field;
            if (field) {
                let value = (input as HTMLInputElement).value.trim();
                if (value === '') {
                    formData[field] = null;
                } else if ((input as HTMLInputElement).type === 'number') {
                    formData[field] = parseFloat(value) || null;
                } else {
                    formData[field] = value;
                }
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
        if (!this.controller.canManageOffers()) {
            this.showError('У вас нет прав для управления объявлениями');
            return;
        }

        try {
            this.saveCurrentStepData();
            const currentData = this.dataManager.getData();

            const preparedData = this.prepareOfferData(currentData);

            const validationResult = this.controller.validateOfferData ?
                this.controller.validateOfferData(preparedData) :
                { isValid: true };

            if (!validationResult.isValid) {
                this.showError(validationResult.message! || 'Ошибка валидации данных');
                return;
            }

            const publishBtn = this.parent.querySelector('[data-action="publish"]') as HTMLButtonElement;
            const originalText = publishBtn.textContent;
            publishBtn.textContent = this.isEditing ? 'Сохранение...' : 'Публикация...';
            publishBtn.disabled = true;

            let result: any;
            if (this.isEditing) {
                result = await this.controller.updateOffer(this.editOfferId!, preparedData);
            } else {
                result = await this.controller.createOffer(preparedData);
            }

            if (result && result.ok) {
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
                let errorMessage = 'Произошла ошибка при публикации объявления';

                if (result && result.message) {
                    errorMessage = result.message;
                } else if (result && result.error) {
                    errorMessage = result.error;
                } else if (result && result.errors) {
                    errorMessage = Object.values(result.errors).join(', ');
                }

                if (this.controller.handleAPIError) {
                    this.controller.handleAPIError(result, this.isEditing);
                } else {
                    this.showError(errorMessage);
                }
            }
        } catch (error) {
            this.showError(`Сетевая ошибка: ${(error as Error).message}`);
        } finally {
            const publishBtn = this.parent.querySelector('[data-action="publish"]') as HTMLButtonElement;
            if (publishBtn) {
                publishBtn.textContent = this.isEditing ? 'Сохранить изменения' : 'Опубликовать';
                publishBtn.disabled = false;
            }
        }
    }

    private prepareOfferData(data: any): any {
        const preparedData = { ...data };

        if (preparedData.rooms !== undefined && preparedData.rooms !== null) {
            preparedData.rooms = parseInt(preparedData.rooms) || 0;
        }

        if (preparedData.floor !== undefined && preparedData.floor !== null) {
            preparedData.floor = parseInt(preparedData.floor) || null;
        }

        if (preparedData.total_floors !== undefined && preparedData.total_floors !== null) {
            preparedData.total_floors = parseInt(preparedData.total_floors) || null;
        }

        if (preparedData.area !== undefined && preparedData.area !== null) {
            preparedData.area = parseFloat(preparedData.area) || null;
        }

        if (preparedData.living_area !== undefined && preparedData.living_area !== null) {
            preparedData.living_area = parseFloat(preparedData.living_area) || null;
        }

        if (preparedData.kitchen_area !== undefined && preparedData.kitchen_area !== null) {
            preparedData.kitchen_area = parseFloat(preparedData.kitchen_area) || null;
        }

        if (preparedData.price !== undefined && preparedData.price !== null) {
            preparedData.price = parseFloat(preparedData.price) || null;
        }

        if (preparedData.deposit !== undefined && preparedData.deposit !== null) {
            preparedData.deposit = parseFloat(preparedData.deposit) || null;
        }

        if (preparedData.commission !== undefined && preparedData.commission !== null) {
            preparedData.commission = parseFloat(preparedData.commission) || null;
        }

        if (preparedData.in_housing_complex !== undefined) {
            preparedData.in_housing_complex = Boolean(preparedData.in_housing_complex);
        } else {
            preparedData.in_housing_complex = false;
        }

        if (preparedData.housing_complex !== undefined && preparedData.housing_complex !== null) {
            preparedData.housing_complex = String(preparedData.housing_complex);
        } else {
            preparedData.housing_complex = '';
        }

        if (!preparedData.title && this.shouldGenerateTitle(data)) {
            preparedData.title = this.generateTitle(data);
        }

        if (!preparedData.user_id && this.controller.user?.id) {
            preparedData.user_id = this.controller.user.id;
        }

        if (!preparedData.status) {
            preparedData.status = 'active';
        }

        if (preparedData.images && Array.isArray(preparedData.images)) {
            preparedData.image_urls = preparedData.images.map((img: any) => img.filename);
        }

        delete preparedData.images;
        delete preparedData.complex_status;
        delete preparedData.complex_name;


        return preparedData;
    }

    private shouldGenerateTitle(data: any): boolean {
        return data.property_type && data.rooms !== undefined && data.area;
    }

    private generateTitle(data: any): string {
        const propertyTypeMap: { [key: string]: string } = {
            'apartment': 'квартира',
            'house': 'дом',
            'flat': 'квартира',
            'studio': 'студия'
        };

        const offerTypeMap: { [key: string]: string } = {
            'sale': 'Продажа',
            'rent': 'Аренда'
        };

        const propertyType = propertyTypeMap[data.property_type] || 'недвижимость';
        const offerType = offerTypeMap[data.offer_type] || '';

        let title = '';

        if (offerType) {
            title += `${offerType} `;
        }

        if (data.rooms !== undefined && data.rooms !== null) {
            if (data.rooms === 0 || data.rooms === '0') {
                title += 'студия ';
            } else {
                title += `${data.rooms}-комн. `;
            }
        }
        
        title += `${propertyType}`;
        
        if (data.area) {
            title += `, ${data.area} м²`;
        }
        
        return title;
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