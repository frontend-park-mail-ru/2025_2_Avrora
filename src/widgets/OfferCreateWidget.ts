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

    private readonly MAX_INT4 = 2147483647;
    private readonly MAX_FLOOR = 500;
    private readonly MAX_TOTAL_FLOORS = 500;
    private readonly MAX_ROOMS = 100;
    private readonly MAX_AREA = 10000;
    private readonly MAX_PRICE = 1000000000000;
    private readonly MAX_DEPOSIT = 1000000000000;
    private readonly MAX_COMMISSION = 100;
    private readonly MAX_LIVING_AREA = 10000;
    private readonly MAX_KITCHEN_AREA = 10000;

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
                const thirdStage = new OfferCreateThirdStage(stageOptions);
                stageEl = thirdStage.render();
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

                if (currentData.address.length < 5) {
                    return { isValid: false, message: 'Адрес должен содержать не менее 5 символов' };
                }

                if (currentData.floor === null || currentData.floor === undefined) {
                    return { isValid: false, message: 'Введите этаж' };
                }
                if (currentData.total_floors === null || currentData.total_floors === undefined) {
                    return { isValid: false, message: 'Введите общее количество этажей' };
                }

                const floorValidation = this.validateFloors(currentData);
                if (!floorValidation.isValid) {
                    return floorValidation;
                }

                if (currentData.in_housing_complex) {
                    if (!currentData.housing_complex || currentData.housing_complex.trim() === '') {
                        return { isValid: false, message: 'Введите название жилищного комплекса' };
                    }
                }
                break;

            case 3:
                if (currentData.rooms === null || currentData.rooms === undefined) {
                    return { isValid: false, message: 'Выберите количество комнат' };
                }

                const roomsNum = Number(currentData.rooms);
                if (isNaN(roomsNum)) {
                    return { isValid: false, message: 'Количество комнат должно быть числом' };
                }

                if (roomsNum < 0) {
                    return { isValid: false, message: 'Количество комнат не может быть отрицательным' };
                }
                if (roomsNum > this.MAX_ROOMS) {
                    return { isValid: false, message: `Количество комнат не может быть больше ${this.MAX_ROOMS}` };
                }
                if (roomsNum > this.MAX_INT4) {
                    return { isValid: false, message: `Количество комнат превышает максимально допустимое значение ${this.MAX_INT4}` };
                }

                if (!currentData.area || currentData.area <= 0) {
                    return { isValid: false, message: 'Введите корректную общую площадь (больше 0)' };
                }

                const areaValidation = this.validateAreas(currentData);
                if (!areaValidation.isValid) {
                    return areaValidation;
                }
                break;

            case 4:
                if (!currentData.price || currentData.price <= 0) {
                    return { isValid: false, message: 'Введите корректную цену (больше 0)' };
                }

                const priceValidation = this.validatePrice(currentData);
                if (!priceValidation.isValid) {
                    return priceValidation;
                }

                if (currentData.offer_type === 'rent' && !currentData.rental_period) {
                    return { isValid: false, message: 'Выберите срок аренды' };
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

        const generatedTitle = this.generateTitle(data);
        if (!generatedTitle || generatedTitle.trim() === '') {
            return { isValid: false, message: 'Не удалось сгенерировать заголовок. Проверьте заполненные данные.' };
        }

        return { isValid: true };
    }

    private validateFloors(data: any): { isValid: boolean; message?: string } {
        const floor = data.floor;
        const totalFloors = data.total_floors;

        if (floor === null || floor === undefined) {
            return { isValid: false, message: 'Введите этаж' };
        }

        if (totalFloors === null || totalFloors === undefined) {
            return { isValid: false, message: 'Введите общее количество этажей' };
        }

        const floorNum = Number(floor);
        const totalFloorsNum = Number(totalFloors);

        if (isNaN(floorNum)) {
            return { isValid: false, message: 'Этаж должен быть числом' };
        }

        if (isNaN(totalFloorsNum)) {
            return { isValid: false, message: 'Общее количество этажей должно быть числом' };
        }

        if (floorNum < 1) {
            return { isValid: false, message: 'Этаж должен быть не менее 1' };
        }

        if (floorNum > this.MAX_FLOOR) {
            return { isValid: false, message: `Этаж не может быть больше ${this.MAX_FLOOR}` };
        }

        if (floorNum > this.MAX_INT4) {
            return { isValid: false, message: `Этаж превышает максимально допустимое значение ${this.MAX_INT4}` };
        }

        if (totalFloorsNum < 1) {
            return { isValid: false, message: 'Общее количество этажей должно быть не менее 1' };
        }

        if (totalFloorsNum > this.MAX_TOTAL_FLOORS) {
            return { isValid: false, message: `Общее количество этажей не может быть больше ${this.MAX_TOTAL_FLOORS}` };
        }

        if (totalFloorsNum > this.MAX_INT4) {
            return { isValid: false, message: `Общее количество этажей превышает максимально допустимое значение ${this.MAX_INT4}` };
        }

        if (floorNum > totalFloorsNum) {
            return { isValid: false, message: 'Этаж не может быть больше общего количества этажей в доме' };
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

        if (area && area > this.MAX_AREA) {
            return { isValid: false, message: `Общая площадь не может быть больше ${this.MAX_AREA} м²` };
        }

        if (livingArea && livingArea <= 0) {
            return { isValid: false, message: 'Жилая площадь должна быть положительным числом' };
        }

        if (livingArea && livingArea > this.MAX_LIVING_AREA) {
            return { isValid: false, message: `Жилая площадь не может быть больше ${this.MAX_LIVING_AREA} м²` };
        }

        if (kitchenArea && kitchenArea <= 0) {
            return { isValid: false, message: 'Площадь кухни должна быть положительным числом' };
        }

        if (kitchenArea && kitchenArea > this.MAX_KITCHEN_AREA) {
            return { isValid: false, message: `Площадь кухни не может быть больше ${this.MAX_KITCHEN_AREA} м²` };
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

        if (price && price > this.MAX_PRICE) {
            return { isValid: false, message: `Цена не может превышать ${this.formatNumber(this.MAX_PRICE)} руб.` };
        }

        if (deposit && deposit < 0) {
            return { isValid: false, message: 'Залог не может быть отрицательным' };
        }

        if (deposit && deposit > this.MAX_DEPOSIT) {
            return { isValid: false, message: `Залог не может превышать ${this.formatNumber(this.MAX_DEPOSIT)} руб.` };
        }

        if (commission && (commission < 0 || commission > this.MAX_COMMISSION)) {
            return { isValid: false, message: `Комиссия должна быть в диапазоне от 0 до ${this.MAX_COMMISSION}%` };
        }

        if (commission && commission > this.MAX_INT4) {
            return { isValid: false, message: `Комиссия превышает максимально допустимое значение ${this.MAX_INT4}` };
        }

        return { isValid: true };
    }

    private formatNumber(num: number): string {
        return num.toLocaleString('ru-RU');
    }

    collectFormData(formElement: HTMLElement): any {
        const formData: any = {};

        const activeButtons = formElement.querySelectorAll('.create-ad__choice-button.active');
        activeButtons.forEach(button => {
            const field = (button as HTMLElement).dataset.field;
            if (field) {
                const value = (button as HTMLElement).dataset.value;
                if (field === 'rooms') {
                    if (value !== null && value !== undefined) {
                        const intValue = parseInt(value);
                        formData[field] = isNaN(intValue) ? null : intValue;
                    } else {
                        formData[field] = null;
                    }
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

            if (!currentData.user_id && this.controller.user?.id) {
                currentData.user_id = this.controller.user.id;
            }

            if (!currentData.user_id) {
                this.showError('Пользователь не авторизован');
                return;
            }

            const finalValidation = this.validateAllStages(currentData);
            if (!finalValidation.isValid) {
                this.showError(finalValidation.message!);
                return;
            }

            const generatedTitle = this.generateTitle(currentData);
            if (!generatedTitle || generatedTitle.trim() === '') {
                this.showError('Не удалось сгенерировать заголовок объявления. Проверьте заполненные данные.');
                return;
            }
            currentData.title = generatedTitle;

            const preparedData = this.prepareOfferData(currentData);

            if (!preparedData.title || preparedData.title.trim() === '') {
                this.showError('Не удалось сгенерировать заголовок объявления');
                return;
            }

            if (preparedData.price <= 0) {
                this.showError('Цена должна быть больше 0');
                return;
            }

            if (preparedData.area <= 0) {
                this.showError('Площадь должна быть больше 0');
                return;
            }

            if (preparedData.floor === null || preparedData.floor === undefined) {
                this.showError('Этаж обязателен для заполнения');
                return;
            }

            if (preparedData.total_floors === null || preparedData.total_floors === undefined) {
                this.showError('Общее количество этажей обязательно для заполнения');
                return;
            }

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
                delete preparedData.id;
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

    private validateAllStages(data: any): { isValid: boolean; message?: string } {
        const stages = [
            this.validateStage1(data),
            this.validateStage2(data),
            this.validateStage3(data),
            this.validateStage4(data),
            this.validateStage5(data)
        ];

        for (const stage of stages) {
            if (!stage.isValid) {
                return stage;
            }
        }

        return { isValid: true };
    }

    private validateStage1(data: any): { isValid: boolean; message?: string } {
        if (!data.offer_type) return { isValid: false, message: 'Выберите тип объявления' };
        if (!data.property_type) return { isValid: false, message: 'Выберите тип недвижимости' };
        if (!data.category) return { isValid: false, message: 'Выберите вид недвижимости' };
        return { isValid: true };
    }

    private validateStage2(data: any): { isValid: boolean; message?: string } {
        if (!data.address) return { isValid: false, message: 'Введите адрес' };
        if (data.address.length < 5) return { isValid: false, message: 'Адрес должен содержать не менее 5 символов' };

        if (data.floor === null || data.floor === undefined) {
            return { isValid: false, message: 'Введите этаж' };
        }
        if (data.total_floors === null || data.total_floors === undefined) {
            return { isValid: false, message: 'Введите общее количество этажей' };
        }

        const floorValidation = this.validateFloors(data);
        if (!floorValidation.isValid) return floorValidation;

        if (data.in_housing_complex) {
            if (!data.housing_complex || data.housing_complex.trim() === '') {
                return { isValid: false, message: 'Введите название жилищного комплекса' };
            }
        }
        return { isValid: true };
    }

    private validateStage3(data: any): { isValid: boolean; message?: string } {
        if (data.rooms === null || data.rooms === undefined) return { isValid: false, message: 'Выберите количество комнат' };

        const roomsNum = Number(data.rooms);
        if (isNaN(roomsNum)) return { isValid: false, message: 'Количество комнат должно быть числом' };
        if (roomsNum < 0) return { isValid: false, message: 'Количество комнат не может быть отрицательным' };
        if (roomsNum > this.MAX_ROOMS) return { isValid: false, message: `Количество комнат не может быть больше ${this.MAX_ROOMS}` };
        if (roomsNum > this.MAX_INT4) return { isValid: false, message: `Количество комнат превышает максимально допустимое значение ${this.MAX_INT4}` };

        if (!data.area || data.area <= 0) return { isValid: false, message: 'Введите корректную общую площадь' };
        return this.validateAreas(data);
    }

    private validateStage4(data: any): { isValid: boolean; message?: string } {
        if (!data.price || data.price <= 0) return { isValid: false, message: 'Введите корректную цену' };
        if (data.offer_type === 'rent' && !data.rental_period) {
            return { isValid: false, message: 'Выберите срок аренды' };
        }
        return this.validatePrice(data);
    }

    private validateStage5(data: any): { isValid: boolean; message?: string } {
        return this.validateFifthStage(data);
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

        if (!preparedData.title) {
            preparedData.title = this.generateTitle(preparedData);
        }

        if (!preparedData.user_id && this.controller.user?.id) {
            preparedData.user_id = this.controller.user.id;
        }

        if (!preparedData.status) {
            preparedData.status = 'active';
        }

        if (preparedData.images && Array.isArray(preparedData.images)) {
            preparedData.image_urls = preparedData.images.map((img: any) => img.filename);
            delete preparedData.images;
        }

        delete preparedData.complex_status;
        delete preparedData.complex_name;

        return preparedData;
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

        const categoryMap: { [key: string]: string } = {
            'new': 'новостройка',
            'secondary': 'вторичка'
        };

        const propertyType = propertyTypeMap[data.property_type] || 'недвижимость';
        const offerType = offerTypeMap[data.offer_type] || '';
        const category = categoryMap[data.category] || '';

        let title = '';

        if (offerType) {
            title += `${offerType} `;
        }

        if (category) {
            title += `${category}, `;
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

        if (data.address) {
            const addressParts = data.address.split(',');
            if (addressParts.length > 1) {
                title += `, ${addressParts[0].trim()}`;
            } else {
                title += `, ${data.address}`;
            }
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