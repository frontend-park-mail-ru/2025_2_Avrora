import { ProfileService } from '../../../utils/ProfileService.js';
import { Modal } from '../../../components/OfferCreate/Modal/Modal.js';
import { API_CONFIG } from '../../../config.js';

export class MyAdvertisements {
  constructor(state, app) {
    this.state = state;
    this.app = app;
    this.offers = [];
    this.isLoading = false;
  }

  async render() {
    const content = document.createElement("div");
    content.className = "profile__content";

    const block = document.createElement("div");
    block.className = "profile__block";

    const title = document.createElement("h1");
    title.className = "profile__title";
    title.textContent = "Мои объявления";

    block.appendChild(title);

    if (this.isLoading) {
      const loadingDiv = document.createElement("div");
      loadingDiv.className = "profile__loading";
      loadingDiv.textContent = "Загрузка объявлений...";
      block.appendChild(loadingDiv);
      content.appendChild(block);
      return content;
    }

    try {
      this.offers = await ProfileService.getMyOffers();

      if (this.offers.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "profile__empty";
        emptyMessage.textContent = "У вас пока нет объявлений";
        block.appendChild(emptyMessage);
      } else {
        title.textContent = `Мои объявления (${this.offers.length})`;

        this.offers.forEach(offerData => {
          const ad = this.createAd(offerData);
          block.appendChild(ad);
        });
      }

    } catch (error) {
      console.error('Error loading my offers:', error);

      const errorDiv = document.createElement("div");
      errorDiv.className = "profile__error";

      const errorText = document.createElement("p");
      errorText.textContent = "Не удалось загрузить объявления";
      errorDiv.appendChild(errorText);

      const retryButton = document.createElement("button");
      retryButton.className = "profile__retry-button";
      retryButton.textContent = "Попробовать снова";
      retryButton.addEventListener("click", () => {
        this.render().then(newContent => {
          content.parentNode.replaceChild(newContent, content);
        });
      });
      errorDiv.appendChild(retryButton);

      block.appendChild(errorDiv);
    }

    content.appendChild(block);
    return content;
  }

  createAd(offerData) {
    const ad = document.createElement("div");
    ad.className = "profile__ad";
    ad.dataset.offerId = offerData.id;

    const img = document.createElement("img");
    img.className = "profile__ad-image";
    img.src = offerData.image_url || `${API_CONFIG.BASE_URL}/image/default_offer.jpg`;
    img.alt = "Объявление";
    img.loading = "lazy";

    const info = document.createElement("div");
    info.className = "profile__ad-info";

    const infoTitle = document.createElement("h1");
    infoTitle.className = "profile__ad-title";

    const typeText = offerData.offer_type === 'sale' ? 'Продажа' : 'Аренда';
    const propertyText = this.getPropertyTypeText(offerData.property_type);
    const price = this.formatPrice(offerData.price);

    infoTitle.textContent = `${typeText} ${offerData.rooms}-комн. ${propertyText}, ${price}`;

    const infoText = document.createElement("span");
    infoText.className = "profile__ad-text";
    infoText.textContent = offerData.address;

    const actions = document.createElement("div");
    actions.className = "profile__ad-actions";

    const editButton = document.createElement("button");
    editButton.className = "profile__ad-action profile__ad-action--edit";
    editButton.textContent = "Редактировать";
    editButton.addEventListener("click", () => {
      this.app.router.navigate(`/edit-offer/${offerData.id}`);
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "profile__ad-action profile__ad-action--delete";
    deleteButton.textContent = "Удалить";
    deleteButton.addEventListener("click", () => {
      this.handleDeleteOffer(offerData.id);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    info.appendChild(infoTitle);
    info.appendChild(infoText);
    info.appendChild(actions);

    ad.appendChild(img);
    ad.appendChild(info);

    ad.addEventListener('click', (e) => {
      if (!e.target.closest('.profile__ad-actions')) {
        this.app.router.navigate(`/offers/${offerData.id}`);
      }
    });

    return ad;
  }

  getPropertyTypeText(propertyType) {
    const types = {
      'flat': 'кв.',
      'house': 'дом',
      'garage': 'гараж',
      'apartment': 'апартаменты',
      'studio': 'студия'
    };
    return types[propertyType] || 'недвижимость';
  }

  formatPrice(price) {
    if (!price || price === 0) return 'цена не указана';
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  }

  async handleDeleteOffer(offerId) {
    try {
      const confirmed = await Modal.confirm({
        title: 'Удаление объявления',
        message: 'Вы уверены, что хотите удалить это объявление?',
        confirmText: 'Удалить',
        cancelText: 'Отмена'
      });

      if (confirmed) {
        this.isLoading = true;

        const { API } = await import('../../../utils/API.js');
        const { API_CONFIG } = await import('../../../config.js');

        const result = await API.delete(`${API_CONFIG.ENDPOINTS.OFFERS.DELETE}${offerId}`);

        if (result.ok) {
          Modal.show({
            title: 'Успех',
            message: 'Объявление успешно удалено',
            type: 'info',
            onConfirm: () => {
              // Перезагружаем список объявлений
              this.render().then(newContent => {
                const currentContent = document.querySelector('.profile__content');
                if (currentContent && currentContent.parentNode) {
                  currentContent.parentNode.replaceChild(newContent, currentContent);
                }
              });
            }
          });
        } else {
          throw new Error(result.error || 'Не удалось удалить объявление');
        }
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      Modal.show({
        title: 'Ошибка',
        message: error.message || 'Не удалось удалить объявление',
        type: 'error'
      });
    } finally {
      this.isLoading = false;
    }
  }

  cleanup() {
  }
}