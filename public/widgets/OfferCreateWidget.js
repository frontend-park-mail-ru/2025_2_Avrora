// OfferCreateWidget.js - полностью обновленный файл
import { OfferCreateFirstStage } from '../components/OfferCreate/OfferCreateFirstStage/OfferCreateFirstStage.js';
import { OfferCreateSecondStage } from  '../components/OfferCreate/OfferCreateSecondStage/OfferCreateSecondStage.js';
import { OfferCreateThirdStage } from  '../components/OfferCreate/OfferCreateThirdStage/OfferCreateThirdStage.js';
import { OfferCreateFourthStage } from  '../components/OfferCreate/OfferCreateFourthStage/OfferCreateFourthStage.js';
import { OfferCreateFifthStage } from  '../components/OfferCreate/OfferCreateFifthStage/OfferCreateFifthStage.js';
import { OfferCreateDataManager } from '../utils/OfferCreateDataManager.js';
import { API } from '../utils/API.js';
import { API_CONFIG } from '../config.js';
import { Modal } from '../components/OfferCreate/Modal/Modal.js';

export class OfferCreateWidget {
  constructor(parent, state, app, options = {}) {
    this.parent = parent;
    this.state = state;
    this.app = app;
    this.step = options.step || 1;
    this.eventListeners = [];
    this.dataManager = new OfferCreateDataManager();
    this.isEditing = options.isEditing || false;
    this.editOfferId = null;
    this.originalOfferData = null;
    this.currentStageElement = null;
  }

  resolveStepFromLocation() {
    const path = window.location.pathname;
    if (path.includes('/step-5')) return 5;
    if (path.includes('/step-4')) return 4;
    if (path.includes('/step-3')) return 3;
    if (path.includes('/step-2')) return 2;
    return 1;
  }

  async renderWithParams(params = {}) {
    this.cleanup();

    const isNewCreation = !this.isEditing &&
                         window.location.pathname === '/create-ad' &&
                         !this.dataManager.getData().offer_type;

    if (isNewCreation) {
        this.dataManager.clear();
        console.log('Starting new offer creation, cleared data');
    }

    if (this.isEditing && params.id) {
        if (this.editOfferId !== params.id) {
            this.editOfferId = params.id;
            await this.loadOfferData(this.editOfferId);
        }
    } else if (!this.isEditing && this.editOfferId) {
        this.editOfferId = null;
        this.originalOfferData = null;
        this.dataManager.clear();
    }

    this.step = this.resolveStepFromLocation();
    await this.render();
  }

  async loadOfferData(offerId) {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.OFFERS.LIST}/${offerId}`;
      const result = await API.get(endpoint);

      if (result.ok && result.data) {
        this.originalOfferData = result.data;
        this.dataManager.populateFromAPI(result.data);
        console.log('Loaded offer data for editing:', this.dataManager.getData());
      } else {
        console.error('Failed to load offer data:', result.error);
        this.showError('Не удалось загрузить данные объявления');
      }
    } catch (error) {
      console.error('Error loading offer data:', error);
      this.showError('Ошибка при загрузке данных объявления');
    }
  }

  async render() {
    this.cleanup();
    this.step = this.resolveStepFromLocation();

    let stageEl;
    const stageOptions = {
      state: this.state,
      app: this.app,
      dataManager: this.dataManager,
      isEditing: this.isEditing,
      editOfferId: this.editOfferId
    };

    console.log(`Rendering stage ${this.step} with data:`, this.dataManager.getData());

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

  attachEventListeners() {
    const prevBtn = this.parent.querySelector('[data-action="prev"]');
    const nextBtn = this.parent.querySelector('[data-action="next"]');
    const publishBtn = this.parent.querySelector('[data-action="publish"]');

    if (prevBtn) {
        this.addEventListener(prevBtn, 'click', (e) => {
            e.preventDefault();
            console.log('Previous button clicked, saving current step data...');
            this.saveCurrentStepData();
            const prev = Math.max(1, this.step - 1);
            console.log('Navigating to step:', prev);
            this.navigateToStep(prev);
        });
    }

    if (nextBtn) {
        this.addEventListener(nextBtn, 'click', (e) => {
            e.preventDefault();
            console.log('Next button clicked, saving current step data...');
            this.saveCurrentStepData();

            console.log('Validating step:', this.step);
            if (this.validateCurrentStep()) {
                const next = Math.min(5, this.step + 1);
                console.log('Validation passed, navigating to step:', next);
                this.navigateToStep(next);
            } else {
                console.error('Validation failed for step:', this.step);
            }
        });
    }

    if (publishBtn) {
        this.addEventListener(publishBtn, 'click', async (e) => {
            e.preventDefault();
            console.log('Publish button clicked, saving current step data...');
            this.saveCurrentStepData();
            await this.handlePublish();
        });
    }
  }

  saveCurrentStepData() {
    try {
        const currentForm = this.currentStageElement || this.parent.querySelector('.create-ad');
        if (!currentForm) {
            console.warn('No form found for saving data');
            return;
        }

        const formData = this.collectFormData(currentForm);
        console.log(`Saving data for step ${this.step}:`, formData);

        Object.keys(formData).forEach(key => {
            if (formData[key] === '' || formData[key] === undefined) {
                formData[key] = null;
            }
        });

        switch (this.step) {
            case 1:
                this.dataManager.updateStage1(formData);
                break;
            case 2:
                this.dataManager.updateStage2(formData);
                break;
            case 3:
                this.dataManager.updateStage3(formData);
                break;
            case 4:
                this.dataManager.updateStage4(formData);
                break;
            case 5:
                this.dataManager.updateStage5(formData);
                break;
        }

        console.log('DataManager after update:', this.dataManager.getData());
    } catch (error) {
        console.error('Error saving step data:', error);
    }
  }

// OfferCreateWidget.js - обновите метод validateCurrentStep
validateCurrentStep() {
    const currentData = this.dataManager.getData();
    let errorMessage = '';

    console.log('Validating step', this.step, 'with full data:', currentData);

    switch (this.step) {
        case 1:
            if (!currentData.offer_type) errorMessage = 'Выберите тип объявления';
            else if (!currentData.property_type) errorMessage = 'Выберите тип недвижимости';
            else if (!currentData.category) errorMessage = 'Выберите вид недвижимости';
            break;
        case 2:
            console.log('Validating address:', currentData.address);
            if (!currentData.address || currentData.address.trim() === '') {
                errorMessage = 'Укажите адрес';
            } else {
                // Валидация этажей
                const floor = currentData.floor;
                const totalFloors = currentData.total_floors;

                if (floor !== null && totalFloors !== null) {
                    if (floor > totalFloors) {
                        errorMessage = 'Этаж не может быть больше общего количества этажей в доме';
                    } else if (floor < 0) {
                        errorMessage = 'Этаж не может быть отрицательным числом';
                    } else if (totalFloors <= 0) {
                        errorMessage = 'Общее количество этажей должно быть положительным числом';
                    }
                }
                console.log('Address validation passed:', currentData.address);
            }
            break;
        case 3:
            if (!currentData.rooms && currentData.rooms !== 0) errorMessage = 'Укажите количество комнат';
            else if (!currentData.area) errorMessage = 'Укажите общую площадь';
            else if (currentData.area <= 0) errorMessage = 'Площадь должна быть положительным числом';
            else if (currentData.living_area && currentData.living_area > currentData.area) {
                errorMessage = 'Жилая площадь не может быть больше общей площади';
            }
            else if (currentData.kitchen_area && currentData.kitchen_area > currentData.area) {
                errorMessage = 'Площадь кухни не может быть больше общей площади';
            }
            break;
        case 4:
            if (!currentData.price) errorMessage = 'Укажите цену';
            else if (currentData.price <= 0) errorMessage = 'Цена должна быть положительным числом';
            else if (currentData.deposit && currentData.deposit < 0) errorMessage = 'Залог не может быть отрицательным';
            else if (currentData.commission && (currentData.commission < 0 || currentData.commission > 100)) {
                errorMessage = 'Комиссия должна быть в диапазоне от 0 до 100%';
            }
            break;
        case 5:
            if (!currentData.description || currentData.description.trim() === '') {
                errorMessage = 'Введите описание объявления';
            } else if (!currentData.images || currentData.images.length === 0) {
                errorMessage = 'Необходимо загрузить минимум одну фотографию';
            } else if (currentData.images.length > 10) {
                errorMessage = 'Можно загрузить не более 10 фотографий';
            }
            break;
    }

    if (errorMessage) {
        console.error('Validation failed:', errorMessage);
        this.showError(errorMessage);
        return false;
    }

    console.log('Validation passed for step', this.step);
    return true;
}
  collectFormData(formElement) {
    const formData = {};

    const activeButtons = formElement.querySelectorAll('.create-ad__choice-button.active');
    activeButtons.forEach(button => {
      const field = button.dataset.field;
      if (field) {
        formData[field] = button.dataset.value;
      }
    });

    const inputs = formElement.querySelectorAll('.create-ad__input[data-field]');
    inputs.forEach(input => {
      const field = input.dataset.field;
      if (field) {
        let value = input.value.trim();

        if (value === '') {
          formData[field] = null;
        } else if (input.type === 'number') {
          formData[field] = parseFloat(value) || null;
        } else {
          formData[field] = value;
        }
      }
    });

    const textareas = formElement.querySelectorAll('textarea[data-field]');
    textareas.forEach(textarea => {
      const field = textarea.dataset.field;
      if (field) {
        formData[field] = textarea.value.trim() || null;
      }
    });

    const selects = formElement.querySelectorAll('select[data-field]');
    selects.forEach(select => {
      const field = select.dataset.field;
      if (field) {
        formData[field] = select.value || null;
      }
    });

    return formData;
  }

  async prepareOfferDataForAPI() {
    const rawData = this.dataManager.getData();
    console.log('Raw data for API preparation:', rawData);

    if (!this.state.user || !this.state.user.id) {
        console.error('No user found for offer creation:', this.state.user);
        this.showError('Для создания объявления необходимо авторизоваться');
        return null;
    }

    // Преобразуем данные в формат, ожидаемый бэкендом
    const apiData = {
        offer_type: rawData.offer_type || 'sale',
        property_type: rawData.property_type || 'apartment',
        title: rawData.title || this.generateTitle(rawData),
        description: rawData.description || '',
        price: this.safeNumber(rawData.price, 0),
        area: this.safeNumber(rawData.area, 0),
        address: rawData.address || '',
        rooms: this.safeNumber(rawData.rooms, 1),
        floor: this.safeNumber(rawData.floor),
        total_floors: this.safeNumber(rawData.total_floors),
        living_area: this.safeNumber(rawData.living_area),
        kitchen_area: this.safeNumber(rawData.kitchen_area),
        deposit: this.safeNumber(rawData.deposit),
        commission: this.safeNumber(rawData.commission),
        rental_period: rawData.rental_period || null,
        image_urls: rawData.images ? rawData.images.map(img => img.filename || img.url) : [],
        user_id: this.state.user.id,
        status: 'active' // ВСЕГДА передаем статус 'active'
    };

    // Для Go бэкенда преобразуем числа в правильные типы
    if (apiData.deposit !== null) apiData.deposit = Math.round(apiData.deposit);
    if (apiData.commission !== null) apiData.commission = Math.round(apiData.commission);
    if (apiData.price !== null) apiData.price = Math.round(apiData.price);
    if (apiData.floor !== null) apiData.floor = Math.round(apiData.floor);
    if (apiData.total_floors !== null) apiData.total_floors = Math.round(apiData.total_floors);
    if (apiData.rooms !== null) apiData.rooms = Math.round(apiData.rooms);

    console.log('Prepared data for API:', apiData);
    return apiData;
  }

  safeNumber(value, defaultValue = null) {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  generateTitle(data) {
    const roomText = data.rooms === 0 ? 'Студия' : `${data.rooms}-комн.`;
    const propertyTypeText = data.property_type === 'apartment' ? 'квартира' :
                           data.property_type === 'house' ? 'дом' : 'гараж';
    const offerTypeText = data.offer_type === 'sale' ? 'продажа' : 'аренда';

    return `${roomText} ${propertyTypeText}, ${offerTypeText}`;
  }

// Обновите метод validateOfferData для дополнительной валидации при публикации
validateOfferData(data) {
    console.log('Validating offer data:', data);

    const requiredFields = [
        { field: 'offer_type', name: 'Тип объявления' },
        { field: 'property_type', name: 'Тип недвижимости' },
        { field: 'title', name: 'Заголовок' },
        { field: 'address', name: 'Адрес' },
        { field: 'rooms', name: 'Количество комнат' },
        { field: 'area', name: 'Общая площадь' },
        { field: 'price', name: 'Цена' },
        { field: 'user_id', name: 'ID пользователя' }
    ];

    const missingFields = [];
    const invalidFields = [];

    for (const { field, name } of requiredFields) {
        if (!data[field] && data[field] !== 0) {
            missingFields.push(name);
        }
    }

    // Проверка площади
    if (data.area && data.area <= 0) {
        invalidFields.push('Площадь должна быть положительным числом');
    }

    // Проверка цены
    if (data.price && data.price <= 0) {
        invalidFields.push('Цена должна быть положительным числом');
    }

    // Проверка комнат
    if (data.rooms && data.rooms < 0) {
        invalidFields.push('Количество комнат не может быть отрицательным');
    }

    // Проверка этажей
    if (data.floor && data.floor < 0) {
        invalidFields.push('Этаж не может быть отрицательным');
    }

    if (data.total_floors && data.total_floors <= 0) {
        invalidFields.push('Количество этажей в доме должно быть положительным числом');
    }

    if (data.floor && data.total_floors && data.floor > data.total_floors) {
        invalidFields.push('Этаж не может быть больше общего количества этажей в доме');
    }

    // Проверка площадей
    if (data.living_area && data.area && data.living_area > data.area) {
        invalidFields.push('Жилая площадь не может быть больше общей площади');
    }

    if (data.kitchen_area && data.area && data.kitchen_area > data.area) {
        invalidFields.push('Площадь кухни не может быть больше общей площади');
    }

    // Проверка залога и комиссии
    if (data.deposit && data.deposit < 0) {
        invalidFields.push('Залог не может быть отрицательным');
    }

    if (data.commission && (data.commission < 0 || data.commission > 100)) {
        invalidFields.push('Комиссия должна быть в диапазоне от 0 до 100%');
    }

    // Проверка изображений
    if (!data.image_urls || data.image_urls.length === 0) {
        invalidFields.push('Необходимо загрузить минимум одну фотографию');
    } else if (data.image_urls.length > 10) {
        invalidFields.push('Можно загрузить не более 10 фотографий');
    }

    if (missingFields.length > 0) {
        return {
            isValid: false,
            message: `Заполните обязательные поля: ${missingFields.join(', ')}`
        };
    }

    if (invalidFields.length > 0) {
        return {
            isValid: false,
            message: invalidFields.join(', ')
        };
    }

    return { isValid: true };
}

  async handlePublish() {
    console.log('=== PUBLISH DEBUG INFO ===');

    if (!this.checkUserState()) {
        return;
    }

    try {
        this.saveCurrentStepData();
        const currentData = this.dataManager.getData();
        console.log('Current data manager state:', currentData);

        const offerData = await this.prepareOfferDataForAPI();

        if (!offerData) {
            console.error('Offer data preparation failed');
            return;
        }

        console.log('Final offer data for API:', JSON.stringify(offerData, null, 2));

        const validationResult = this.validateOfferData(offerData);
        if (!validationResult.isValid) {
            this.showError(validationResult.message);
            return;
        }

        const publishBtn = this.parent.querySelector('[data-action="publish"]');
        const originalText = publishBtn.textContent;
        publishBtn.textContent = this.isEditing ? 'Сохранение...' : 'Публикация...';
        publishBtn.disabled = true;

        let result;
        const startTime = Date.now();

        if (this.isEditing) {
            console.log('Updating existing offer:', this.editOfferId);
            result = await API.put(`${API_CONFIG.ENDPOINTS.OFFERS.UPDATE}${this.editOfferId}`, offerData);
        } else {
            console.log('Creating new offer');
            result = await API.post(API_CONFIG.ENDPOINTS.OFFERS.CREATE, offerData);
        }

        const endTime = Date.now();
        console.log(`API request took ${endTime - startTime}ms`);
        console.log('API response:', result);

        if (result.ok) {
            const successMessage = this.isEditing ?
                'Объявление успешно обновлено!' :
                'Объявление успешно опубликовано!';

            console.log(successMessage);
            this.showSuccess(successMessage);

            if (!this.isEditing) {
                this.dataManager.clear();
            }

            setTimeout(() => {
                this.app.router.navigate('/profile/myoffers');
            }, 2000);
        } else {
            console.error('API Error details:', {
                status: result.status,
                error: result.error,
                url: this.isEditing ? 'UPDATE_OFFER' : 'CREATE_OFFER',
                requestData: offerData
            });

            this.handleAPIError(result);
        }
    } catch (error) {
        console.error('Network error during publish:', error);
        this.showError(`Сетевая ошибка: ${error.message}. Проверьте подключение к интернету.`);
    } finally {
        const publishBtn = this.parent.querySelector('[data-action="publish"]');
        if (publishBtn) {
            publishBtn.textContent = this.isEditing ? 'Сохранить изменения' : 'Опубликовать';
            publishBtn.disabled = false;
        }
    }
  }

  handleAPIError(result) {
    console.error('Full API error object:', result);

    const errorInfo = {
        timestamp: new Date().toISOString(),
        status: result.status,
        error: result.error,
        endpoint: this.isEditing ? 'UPDATE_OFFER' : 'CREATE_OFFER',
        user_id: this.state.user?.id
    };
    console.error('Error context:', errorInfo);

    switch (result.status) {
        case 400:
            this.showError(result.error || 'Некорректные данные в запросе. Проверьте введенные значения.');
            break;
        case 401:
            this.showError('Необходимо авторизоваться');
            this.app.router.navigate('/login');
            break;
        case 403:
            if (result.error && result.error.includes('Профиль не заполнен')) {
                this.showProfileCompletionRequired(result.error);
            } else {
                this.showError(result.error || 'Доступ запрещен. Возможно, у вас нет прав для этого действия.');
            }
            break;
        case 500:
            let errorMessage = 'Внутренняя ошибка сервера. ';

            if (result.error && result.error.includes('ошибка создания предложения')) {
                errorMessage += 'Сервер не смог обработать запрос на создание объявления. ';
            }

            errorMessage += 'Попробуйте позже или обратитесь в поддержку.';

            this.showError(errorMessage);

            setTimeout(() => {
                if (confirm('Произошла ошибка сервера. Хотите попробовать снова?')) {
                    this.handlePublish();
                }
            }, 2000);
            break;
        default:
            this.showError(result.error || `Произошла неизвестная ошибка (${result.status})`);
    }
  }

  showProfileCompletionRequired(message) {
    Modal.show({
      title: 'Профиль не заполнен',
      message: message + ' Пожалуйста, заполните профиль перед созданием объявления.',
      type: 'error',
      onConfirm: () => {
        this.app.router.navigate('/profile/edit');
      },
      onCancel: () => {
        // Ничего не делаем при отмене
      }
    });
  }

  showError(message) {
    Modal.show({
      title: 'Ошибка',
      message: message,
      type: 'error'
    });
  }

  showSuccess(message) {
    Modal.show({
      title: 'Успех',
      message: message,
      type: 'success'
    });
  }

  checkUserState() {
    const user = this.state.user;
    const token = localStorage.getItem('authToken');

    console.log('User state check:', {
        userExists: !!user,
        userId: user?.id,
        tokenExists: !!token
    });

    if (!user || !token) {
        console.warn('User not authenticated, redirecting to login');
        this.showError('Для создания объявления необходимо авторизоваться');
        this.app.router.navigate('/login');
        return false;
    }

    if (!user.id) {
        console.error('User ID is missing');
        this.showError('Ошибка авторизации: отсутствует ID пользователя');
        return false;
    }

    return true;
  }

  navigateToStep(step) {
    if (this.isEditing && this.editOfferId) {
      const route = step === 1 ? `/edit-offer/${this.editOfferId}` : `/edit-offer/${this.editOfferId}/step-${step}`;
      this.app?.router?.navigate(route);
    } else {
      const route = step === 1 ? '/create-ad' : `/create-ad/step-${step}`;
      this.app?.router?.navigate(route);
    }
  }

  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  removeEventListeners() {
    this.eventListeners.forEach(({ element, event, handler }) =>
      element.removeEventListener(event, handler)
    );
    this.eventListeners = [];
  }

  cleanup() {
    this.removeEventListeners();
    this.parent.innerHTML = '';
    this.currentStageElement = null;
  }
}