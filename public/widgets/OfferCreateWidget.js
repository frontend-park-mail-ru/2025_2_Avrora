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

    if (this.isEditing && params.id) {
      this.editOfferId = params.id;
      await this.loadOfferData(this.editOfferId);
    }

    this.step = this.resolveStepFromLocation();
    await this.render();
  }

  async loadOfferData(offerId) {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.OFFERS.BY_ID}/${offerId}`;
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
        this.saveCurrentStepData();
        const prev = Math.max(1, this.step - 1);
        this.navigateToStep(prev);
      });
    }

    if (nextBtn) {
      this.addEventListener(nextBtn, 'click', (e) => {
        e.preventDefault();
        if (this.validateCurrentStep()) {
          this.saveCurrentStepData();
          const next = Math.min(5, this.step + 1);
          this.navigateToStep(next);
        }
      });
    }

    if (publishBtn) {
      this.addEventListener(publishBtn, 'click', async (e) => {
        e.preventDefault();
        await this.handlePublish();
      });
    }
  }

  saveCurrentStepData() {
    try {
      const currentForm = this.parent.querySelector('.create-ad');
      if (!currentForm) return;

      const formData = this.collectFormData(currentForm);
      console.log(`Saving data for step ${this.step}:`, formData);

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

  validateCurrentStep() {
    const currentData = this.dataManager.getData();
    let errorMessage = '';

    switch (this.step) {
      case 1:
        if (!currentData.offer_type) errorMessage = 'Выберите тип объявления';
        else if (!currentData.property_type) errorMessage = 'Выберите тип недвижимости';
        else if (!currentData.category) errorMessage = 'Выберите вид недвижимости';
        break;
      case 2:
        if (!currentData.address) errorMessage = 'Укажите адрес';
        break;
      case 3:
        if (!currentData.rooms && currentData.rooms !== 0) errorMessage = 'Укажите количество комнат';
        else if (!currentData.area) errorMessage = 'Укажите общую площадь';
        break;
      case 4:
        if (!currentData.price) errorMessage = 'Укажите цену';
        break;
    }

    if (errorMessage) {
      this.showError(errorMessage);
      return false;
    }

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

    const inputs = formElement.querySelectorAll('.create-ad__input');
    inputs.forEach(input => {
      const field = input.dataset.field;
      if (field && input.value !== undefined) {
        if (input.type === 'number') {
          formData[field] = input.value ? parseFloat(input.value) : null;
        } else {
          formData[field] = input.value || null;
        }
      }
    });

    const textareas = formElement.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      const field = textarea.dataset.field;
      if (field) {
        formData[field] = textarea.value || null;
      }
    });

    const selects = formElement.querySelectorAll('select');
    selects.forEach(select => {
      const field = select.dataset.field;
      if (field) {
        formData[field] = select.value || null;
      }
    });

    return formData;
  }

prepareOfferDataForAPI() {
    const rawData = this.dataManager.getData();

    const apiData = {
        offer_type: rawData.offer_type,
        property_type: rawData.property_type,
        category: rawData.category,
        address: rawData.address,
        floor: rawData.floor || 1,
        total_floors: rawData.total_floors || 1,
        rooms: parseInt(rawData.rooms) || 1,
        area: parseFloat(rawData.area) || 0,
        living_area: rawData.living_area ? parseFloat(rawData.living_area) : null,
        kitchen_area: rawData.kitchen_area ? parseFloat(rawData.kitchen_area) : null,
        price: parseInt(rawData.price) || 0,
        deposit: rawData.deposit ? parseInt(rawData.deposit) : 0,
        commission: rawData.commission ? parseInt(rawData.commission) : 0,
        description: rawData.description || '',
        rental_period: rawData.rental_period || null
    };

    if (rawData.images && rawData.images.length > 0) {
        apiData.images = rawData.images.map(img => img.filename);
    }

    Object.keys(apiData).forEach(key => {
        if (apiData[key] === null || apiData[key] === undefined) {
            delete apiData[key];
        }
    });

    console.log('Prepared data for API:', apiData);
    return apiData;
}

    handleAPIError(result) {
    switch (result.status) {
      case 400:
        this.showError(result.error || 'Некорректные данные в запросе');
        break;
      case 403:
        if (result.error && result.error.includes('Профиль не заполнен')) {
          this.showProfileCompletionRequired(result.error);
        } else {
          this.showError(result.error || 'Доступ запрещен');
        }
        break;
      case 401:
        this.showError('Необходимо авторизоваться');
        break;
      case 500:
        this.showError('Внутренняя ошибка сервера. Попробуйте позже.');
        break;
      default:
        this.showError(result.error || 'Произошла неизвестная ошибка');
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
      }
    });
  }

  validateOfferData(data) {
    const requiredFields = [
      { field: 'offer_type', name: 'Тип объявления' },
      { field: 'property_type', name: 'Тип недвижимости' },
      { field: 'category', name: 'Вид недвижимости' },
      { field: 'address', name: 'Адрес' },
      { field: 'rooms', name: 'Количество комнат' },
      { field: 'area', name: 'Общая площадь' },
      { field: 'price', name: 'Цена' }
    ];

    const missingFields = [];

    for (const { field, name } of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        missingFields.push(name);
      }
    }

    if (missingFields.length > 0) {
      return {
        isValid: false,
        message: `Заполните обязательные поля: ${missingFields.join(', ')}`
      };
    }

    if (data.area && data.area <= 0) {
      return {
        isValid: false,
        message: 'Площадь должна быть положительным числом'
      };
    }

    if (data.price && data.price <= 0) {
      return {
        isValid: false,
        message: 'Цена должна быть положительным числом'
      };
    }

    if (data.rooms && data.rooms < 0) {
      return {
        isValid: false,
        message: 'Количество комнат не может быть отрицательным'
      };
    }

    return { isValid: true };
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
      type: 'info'
    });
  }

   async handlePublish() {
    try {
      this.saveCurrentStepData();
      const offerData = this.prepareOfferDataForAPI();

      const validationResult = this.validateOfferData(offerData);
      if (!validationResult.isValid) {
        this.showError(validationResult.message);
        return;
      }

      if (!this.state.user) {
        this.showError('Для создания объявления необходимо авторизоваться');
        return;
      }

      let result;
      if (this.isEditing && this.editOfferId) {
        const endpoint = `${API_CONFIG.ENDPOINTS.OFFERS.BY_ID}/${this.editOfferId}`;
        result = await API.put(endpoint, offerData);

        if (result.ok) {
          this.showSuccess('Объявление успешно обновлено!');
          setTimeout(() => {
            if (result.data.redirect_url) {
              window.location.href = result.data.redirect_url;
            } else {
              this.app.router.navigate(`/offers/${this.editOfferId}`);
            }
          }, 2000);
        } else {
          this.handleAPIError(result);
        }
      } else {
        result = await API.post(API_CONFIG.ENDPOINTS.OFFERS.CREATE, offerData);

        if (result.ok) {
          this.showSuccess('Объявление успешно опубликовано!');
          setTimeout(() => {
            if (result.data.url) {
              window.location.href = result.data.url;
            } else {
              this.app.router.navigate('/profile/myoffers');
            }
          }, 2000);
        } else {
          this.handleAPIError(result);
        }
      }
    } catch (error) {
      console.error('Error publishing offer:', error);
      this.showError('Произошла ошибка при публикации объявления');
    }
  }


  validateOfferData(data) {
    const requiredFields = [
      { field: 'offer_type', name: 'Тип объявления' },
      { field: 'property_type', name: 'Тип недвижимости' },
      { field: 'category', name: 'Вид недвижимости' },
      { field: 'address', name: 'Адрес' },
      { field: 'rooms', name: 'Количество комнат' },
      { field: 'area', name: 'Общая площадь' },
      { field: 'price', name: 'Цена' },
      { field: 'description', name: 'Описание' }
    ];

    for (const { field, name } of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        return {
          isValid: false,
          message: `Заполните обязательное поле: "${name}"`
        };
      }
    }

    return { isValid: true };
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
      type: 'info'
    });
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
  }
}