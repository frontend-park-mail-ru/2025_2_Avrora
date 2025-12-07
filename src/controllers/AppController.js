import { API } from '../utils/API.js';
import { API_CONFIG } from "../config.js";
import { EventDispatcher } from '../utils/EventDispatcher.js';

export class AppController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.router = null;
        this.api = API;
        this.isRefreshing = false;
        this.updateTimeout = null;
    }

    setRouter(router) {
        this.router = router;
    }

    get user() {
        return this.model.userModel.user;
    }

    get isAuthenticated() {
        return !!this.model.userModel.user;
    }

    updateUser(userData) {
        this.model.userModel.updateUser(userData);
    }

    async setUser(user, token = null) {
        if (!user.id && token) {
            try {
                const decoded = this.model.userModel.decodeJWT(token);
                if (decoded && decoded.user_id) {
                    user.id = decoded.user_id;
                }
            } catch (error) {
                // Игнорируем ошибки декодирования
            }
        }

        this.model.userModel.setUser(user, token);

        if (user.id) {
            try {
                await this.loadUserProfile(user.id);
            } catch (error) {
                // Игнорируем ошибки загрузки профиля
            }
        }

        this.updateUI();
        
        if (this.router) {
            this.router.navigate("/");
        }
    }

    async loadUserProfile(userId) {
        try {
            const response = await this.api.get(`${API_CONFIG.ENDPOINTS.PROFILE.GET}${userId}`);

            if (response.ok && response.data) {
                this.model.userModel.updateUser(response.data);
                this.updateUI();
            } else {
                // Если не удалось загрузить профиль, используем базовые данные
            }
        } catch (error) {
            // Игнорируем ошибки загрузки профиля
        }
    }

    async logout() {
        try {
            await this.api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {});
        } catch (err) {
            // Игнорируем ошибки выхода
        } finally {
            this.model.userModel.clearUser();
            this.model.appStateModel.setOffers([]);

            const currentPage = this.model.appStateModel.currentPage;
            if (currentPage && currentPage.cleanup) {
                currentPage.cleanup();
            }
            this.model.appStateModel.setCurrentPage(null);

            this.updateUI();

            if (this.router) {
                history.replaceState({}, "", "/login");
                this.router.loadRoute("/login");
            }
        }
    }

    navigate(path) {
        if (this.router) {
            this.router.navigate(path);
        }
    }

    async checkOfferOwnership(offerId) {
        if (!this.model.userModel.user) return false;

        try {
            const response = await this.api.get(`${API_CONFIG.ENDPOINTS.OFFERS.BY_ID}${offerId}`);

            if (response.ok && response.data) {
                const offer = response.data;
                const currentUserId = this.model.userModel.user.id;
                const offerUserId = offer.user_id || offer.UserID || offer.creator_id || offer.CreatorID;

                return currentUserId === offerUserId;
            }
            return false;
        } catch (error) {
            // Игнорируем ошибки проверки владения
            return false;
        }
    }

    async canManageOffers() {
        if (!this.model.userModel.user) {
            if (this.router) {
                this.router.navigate("/login");
            }
            return false;
        }

        if (!this.model.userModel.isProfileComplete()) {
            this.showProfileCompletionModal();
            return false;
        }

        return true;
    }

    showProfileCompletionModal() {
        this.view.modalView.showProfileCompletionModal(() => {
            if (this.router) {
                this.router.navigate("/profile/edit");
            }
        });
    }

    navigateToCreateAd() {
        if (this.model.userModel.user) {
            if (this.model.userModel.isProfileComplete()) {
                this.navigate("/create-ad");
            } else {
                this.showProfileCompletionModal();
            }
        } else {
            this.navigate("/login");
        }
    }

    updateUI() {
        if (this.view.header) {
            this.view.header.render().catch(error => {
                console.error('Ошибка при обновлении хедера:', error);
            });
        }

        const currentPage = this.model.appStateModel.currentPage;
        const isPublicPage = ['/', '/login', '/register', '/offers'].includes(window.location.pathname);

        if (currentPage && currentPage.cleanup && !this.isAuthenticated && !isPublicPage) {
            currentPage.cleanup();
            this.model.appStateModel.setCurrentPage(null);
        }

        if (currentPage && currentPage.render && this.isAuthenticated) {
            currentPage.render();
        }
    }

    setCurrentPage(page) {
        this.model.appStateModel.setCurrentPage(page);
    }

    registerPage(name, pageInstance) {
        this.model.appStateModel.registerPage(name, pageInstance);
    }

    getPage(name) {
        return this.model.appStateModel.getPage(name);
    }

    isOfferOwner(offer) {
        if (!this.model.userModel.user || !offer) return false;

        const currentUserId = this.model.userModel.user.id;
        const offerUserId = offer.user_id || offer.UserID || offer.creator_id || offer.CreatorID;

        return currentUserId === offerUserId;
    }

    isProfileComplete() {
        return this.model.userModel.isProfileComplete();
    }

    isOfferLiked(offerId) {
        return false;
    }

    getOfferImages(apiData) {
        let images = [];
        
        if (Array.isArray(apiData.images)) {
            images = apiData.images;
        } else if (apiData.image_url) {
            images = [apiData.image_url];
        } else if (apiData.ImageURL) {
            images = [apiData.ImageURL];
        } else if (Array.isArray(apiData.ImageURLs)) {
            images = apiData.ImageURLs;
        }

        if (images.length === 0) {
            images = ['../images/default_offer.jpg'];
        }

        return images;
    }

    async loadFilteredOffers(filters = {}) {
        try {
            const apiParams = {
                limit: 100,
                offset: 0,
                ...filters
            };

            apiParams._t = Date.now();

            const result = await this.api.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, apiParams);

            if (!result.ok) {
                throw new Error(result.error || `HTTP ${result.status}`);
            }

            const responseData = result.data || result;

            let offers = [];
            let meta = {};

            if (responseData.Offers && Array.isArray(responseData.Offers)) {
                offers = responseData.Offers;
                meta = responseData.Meta || {};
            } else if (responseData.offers && Array.isArray(responseData.offers)) {
                offers = responseData.offers;
                meta = responseData.meta || {};
            } else if (responseData.data && Array.isArray(responseData.data)) {
                offers = responseData.data;
                meta = responseData.meta || {};
            } else if (Array.isArray(responseData)) {
                offers = responseData;
                meta = { total: responseData.length };
            }

            return { offers, meta };
        } catch (error) {
            throw new Error(`Не удалось загрузить объявления: ${error.message}`);
        }
    }

    async loadOffers(params = {}) {
        try {
            const result = await this.api.get(API_CONFIG.ENDPOINTS.OFFERS.LIST, params);

            if (!result.ok) {
                throw new Error(result.error || `HTTP ${result.status}`);
            }

            const responseData = result.data || result;

            let offers = [];
            let meta = {};

            if (Array.isArray(responseData.Offers)) {
                offers = responseData.Offers;
                meta = responseData.Meta || {};
            } else if (Array.isArray(responseData.offers)) {
                offers = responseData.offers;
                meta = responseData.meta || {};
            } else if (Array.isArray(responseData.data)) {
                offers = responseData.data;
                meta = responseData.meta || {};
            }

            return {
                offers: offers,
                meta: {
                    total_pages: Math.ceil((meta.Total || meta.total || offers.length) / (params.limit || 8)) || 1,
                    total: meta.Total || meta.total || offers.length
                }
            };
        } catch (error) {
            throw new Error(`Не удалось загрузить объявления: ${error.message}`);
        }
    }

    async loadOffer(offerId) {
        const endpoint = `${API_CONFIG.ENDPOINTS.OFFERS.LIST}/${offerId}`;
        return await this.api.get(endpoint);
    }

    async loadSellerData(userId) {
        if (!userId) {
            return null;
        }

        try {
            const response = await this.api.get(`${API_CONFIG.ENDPOINTS.PROFILE.GET}${userId}`);
            return response.ok ? response.data : null;
        } catch (error) {
            return null;
        }
    }

    getSellerInfo(sellerData) {
        const sellerName = sellerData ?
            `${sellerData.firstName || sellerData.first_name || ''} ${sellerData.lastName || sellerData.last_name || ''}`.trim() || "Продавец" :
            "Продавец";

        const sellerPhone = sellerData ?
            (sellerData.phone || "+7 XXX XXX-XX-XX") :
            "+7 XXX XXX-XX-XX";

        const sellerAvatar = sellerData && sellerData.avatar ?
            sellerData.avatar :
            '../../images/user.png';

        return {
            name: sellerName,
            phone: sellerPhone,
            avatar: sellerAvatar
        };
    }

    validateOfferStep(step, data) {
        let errorMessage = '';

        switch (step) {
            case 1:
                if (!data.offer_type) errorMessage = 'Выберите тип объявления';
                else if (!data.property_type) errorMessage = 'Выберите тип недвижимости';
                else if (!data.category) errorMessage = 'Выберите вид недвижимости';
                break;
            case 2:
                if (!data.address || data.address.trim() === '') {
                    errorMessage = 'Укажите адрес';
                } else {
                    const floor = data.floor;
                    const totalFloors = data.total_floors;

                    if (floor !== null && totalFloors !== null) {
                        if (floor > totalFloors) {
                            errorMessage = 'Этаж не может быть больше общего количества этажей в доме';
                        } else if (floor < 0) {
                            errorMessage = 'Этаж не может быть отрицательным числом';
                        } else if (totalFloors <= 0) {
                            errorMessage = 'Общее количество этажей должно быть положительным числом';
                        }
                    }
                }
                break;
            case 3:
                if (!data.rooms && data.rooms !== 0) errorMessage = 'Укажите количество комнат';
                else if (!data.area) errorMessage = 'Укажите общую площадь';
                else if (data.area <= 0) errorMessage = 'Площадь должна быть положительным числом';
                else if (data.living_area && data.living_area > data.area) {
                    errorMessage = 'Жилая площадь не может быть больше общей площади';
                }
                else if (data.kitchen_area && data.kitchen_area > data.area) {
                    errorMessage = 'Площадь кухни не может быть больше общей площади';
                }
                break;
            case 4:
                if (!data.price) errorMessage = 'Укажите цену';
                else if (data.price <= 0) errorMessage = 'Цена должна быть положительным числом';
                else if (data.deposit && data.deposit < 0) errorMessage = 'Залог не может быть отрицательным';
                else if (data.commission && (data.commission < 0 || data.commission > 100)) {
                    errorMessage = 'Комиссия должна быть в диапазоне от 0 до 100%';
                }
                break;
            case 5:
                if (!data.description || data.description.trim() === '') {
                    errorMessage = 'Введите описание объявления';
                } else if (!data.images || data.images.length === 0) {
                    errorMessage = 'Необходимо загрузить минимум одну фотографию';
                } else if (data.images.length > 10) {
                    errorMessage = 'Можно загрузить не более 10 фотографий';
                }
                break;
        }

        if (errorMessage) {
            return false;
        }

        return true;
    }

    validateOfferData(data) {
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

        if (data.area && data.area <= 0) {
            invalidFields.push('Площадь должна быть положительным числом');
        }

        if (data.price && data.price <= 0) {
            invalidFields.push('Цена должна быть положительным числом');
        }

        if (data.rooms && data.rooms < 0) {
            invalidFields.push('Количество комнат не может быть отрицательным');
        }

        if (data.floor && data.floor < 0) {
            invalidFields.push('Этаж не может быть отрицательным');
        }

        if (data.total_floors && data.total_floors <= 0) {
            invalidFields.push('Количество этажей в доме должно быть положительным числом');
        }

        if (data.floor && data.total_floors && data.floor > data.total_floors) {
            invalidFields.push('Этаж не может быть больше общего количества этажей в доме');
        }

        if (data.living_area && data.area && data.living_area > data.area) {
            invalidFields.push('Жилая площадь не может быть больше общей площади');
        }

        if (data.kitchen_area && data.area && data.kitchen_area > data.area) {
            invalidFields.push('Площадь кухни не может быть больше общей площади');
        }

        if (data.deposit && data.deposit < 0) {
            invalidFields.push('Залог не может быть отрицательным');
        }

        if (data.commission && (data.commission < 0 || data.commission > 100)) {
            invalidFields.push('Комиссия должна быть в диапазоне от 0 до 100%');
        }

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

    async createOffer(offerData) {
        return await this.api.post(API_CONFIG.ENDPOINTS.OFFERS.CREATE, offerData);
    }

    async updateOffer(offerId, offerData) {
        return await this.api.put(`${API_CONFIG.ENDPOINTS.OFFERS.UPDATE}${offerId}`, offerData);
    }

    handleAPIError(result, isEditing = false) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            status: result.status,
            error: result.error,
            endpoint: isEditing ? 'UPDATE_OFFER' : 'CREATE_OFFER',
            user_id: this.model.userModel.user?.id
        };

        let errorMessage = result.error || 'Произошла неизвестная ошибка';

        switch (result.status) {
            case 400:
                errorMessage = result.error || 'Некорректные данные в запросе. Проверьте введенные значения.';
                break;
            case 401:
                errorMessage = 'Необходимо авторизоваться';
                this.navigate('/login');
                break;
            case 403:
                if (result.error && result.error.includes('Профиль не заполнен')) {
                    this.showProfileCompletionRequired(result.error);
                    return;
                } else {
                    errorMessage = result.error || 'Доступ запрещен. Возможно, у вас нет прав для этого действия.';
                }
                break;
            case 500:
                errorMessage = 'Внутренняя ошибка сервера. Попробуйте позже или обратитесь в поддержку.';
                break;
            default:
                errorMessage = result.error || `Произошла неизвестная ошибка (${result.status})`;
        }

        if (this.view.modalView && this.view.modalView.showError) {
            this.view.modalView.showError(errorMessage);
        } else {
            alert(errorMessage);
        }
    }

    showProfileCompletionRequired(message) {
        this.showProfileCompletionModal();
    }

    async loadOfferData(offerId, dataManager) {
        try {
            const result = await this.api.get(`${API_CONFIG.ENDPOINTS.OFFERS.LIST}/${offerId}`);

            if (result.ok && result.data) {
                dataManager.populateFromAPI(result.data);
            } else {
                throw new Error('Не удалось загрузить данные объявления');
            }
        } catch (error) {
            throw error;
        }
    }

    // Метод для очистки текущей страницы перед обновлением
    cleanupCurrentPage() {
        const currentPage = this.model.appStateModel.currentPage;
        if (currentPage && typeof currentPage.cleanup === 'function') {
            try {
                console.log('Очищаем текущую страницу перед обновлением');
                currentPage.cleanup();
            } catch (error) {
                console.error('Ошибка при очистке текущей страницы:', error);
            }
        }
    }

    // Метод для уведомления компонентов об обновлении профиля
    notifyProfileUpdate() {
        // Очищаем предыдущий таймаут
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        
        // Устанавливаем новый таймаут для debounce
        this.updateTimeout = setTimeout(() => {
            // Отправляем событие обновления профиля
            EventDispatcher.dispatchProfileUpdated(this.model.userModel.user);
            
            // Отправляем событие обновления UI
            EventDispatcher.dispatchUIUpdate();
            
            console.log('Отправлены события обновления профиля и UI');
        }, 100);
    }

    // Новый метод для обновления профиля и UI с debounce
    async refreshProfileAndUI() {
        // Предотвращаем множественные одновременные обновления
        if (this.isRefreshing) {
            console.log('Обновление уже выполняется, пропускаем');
            return;
        }
        
        this.isRefreshing = true;
        
        try {
            console.log('Начинаем обновление профиля и UI');
            
            // Загружаем актуальные данные профиля
            if (this.model.userModel.user?.id) {
                await this.loadUserProfile(this.model.userModel.user.id);
            }
            
            // Очищаем текущую страницу перед обновлением
            this.cleanupCurrentPage();
            
            // 1. Обновляем хедер
            if (this.view.header) {
                this.view.header.render().catch(error => {
                    console.error('Ошибка при обновлении хедера:', error);
                });
            }
            
            // 2. Обновляем текущую страницу
            const currentPage = this.model.appStateModel.currentPage;
            if (currentPage && currentPage.render) {
                currentPage.render();
            }
            
            // 3. Уведомляем все виджеты о необходимости обновления
            this.notifyProfileUpdate();
            
            console.log('Обновление профиля и UI завершено');
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
        } finally {
            this.isRefreshing = false;
        }
    }

    // Метод для принудительного обновления счетчика объявлений
    async refreshOffersCount() {
        try {
            // Отправляем событие обновления счетчика
            EventDispatcher.dispatchOffersCountUpdated();
        } catch (error) {
            console.error('Ошибка при обновлении счетчика объявлений:', error);
        }
    }
}
